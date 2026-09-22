const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const arenaMatchService = require("./arenaMatchService");
const arenaMatchmakingSocketService = require("../socket/arenaMatchmakingSocketService");

const INITIAL_RATING_RANGE = 100;
const RATING_RANGE_INCREMENT = 100;
const MAX_RATING_RANGE = 1000;
const QUEUE_TTL_MS = 60 * 1000;

const getLeagueLockKey = (leagueId) => `arena:matchmaking:${leagueId}`;

// ==================== پاک‌سازی صف‌های قدیمی ====================
const cleanupStaleQueues = async (leagueId = null, db = prisma) => {
  const cutoff = new Date(Date.now() - QUEUE_TTL_MS);

  return (
    await db.arenaQueue.updateMany({
      where: {
        status: "waiting",
        joinedAt: { lt: cutoff },
        ...(leagueId ? { leagueId } : {}),
      },
      data: { status: "cancelled" },
    })
  ).count;
};

// ==================== پیدا کردن حریف ====================
const getMatchmakingCandidate = async (tx, userId, leagueId, rating, grade) => {
  const entries = await tx.arenaQueue.findMany({
    where: {
      leagueId,
      status: "waiting",
      userId: { not: userId },
      grade,
    },
    orderBy: { joinedAt: "asc" },
  });

  const now = Date.now();
  const candidates = entries.filter((entry) => {
    const waitingSeconds = Math.max(
      0,
      Math.floor((now - entry.joinedAt.getTime()) / 1000),
    );
    const ratingRange = Math.min(
      INITIAL_RATING_RANGE +
        Math.floor(waitingSeconds / 10) * RATING_RANGE_INCREMENT,
      MAX_RATING_RANGE,
    );

    return Math.abs(entry.rating - rating) <= ratingRange;
  });

  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
};

// ==================== ورود به صف ====================
const joinQueue = async (userId, leagueId) => {
  if (!userId || !leagueId) {
    throw new AppError("User and league are required", 400);
  }

  const result = await prisma.$transaction(
    async (tx) => {
      // قفل به‌ازای هر لیگ
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${getLeagueLockKey(leagueId)}))
      `;

      // 🆕 کاربر رو با grade/major بگیر
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, grade: true, major: true },
      });

      if (!user) throw new AppError("User not found", 404);

      // 🆕 چک پروفایل
      if (!user.grade || !user.major) {
        throw new AppError(
          "برای شرکت در آرنا، اول پروفایلت رو تکمیل کن (پایه و رشته)",
          400,
        );
      }

      const league = await tx.arenaLeague.findUnique({
        where: { id: leagueId },
      });

      if (!league) throw new AppError("League not found", 404);

      const now = new Date();
      if (
        league.status !== "active" ||
        now < league.startDate ||
        now > league.endDate
      ) {
        throw new AppError("League is not active", 400);
      }

      // 🆕 چک هم‌خوانی پایه با لیگ
      if (league.grade !== user.grade) {
        throw new AppError("این لیگ برای پایه‌ی شما نیست", 400);
      }

      // 🆕 چک رشته — اگه compatibleMajors خالی نیست، رشته‌ی کاربر باید توش باشه
      if (
        league.compatibleMajors.length > 0 &&
        !league.compatibleMajors.includes(user.major)
      ) {
        throw new AppError("این لیگ برای رشته‌ی شما نیست", 400);
      }

      await cleanupStaleQueues(leagueId, tx);

      const existingMatch = await tx.arenaMatch.findFirst({
        where: {
          status: { in: ["waiting", "playing"] },
          players: { some: { userId } },
        },
        select: { id: true },
      });

      if (existingMatch) {
        throw new AppError("Player already has an active match", 409);
      }

      const rating = await tx.arenaRating.upsert({
        where: { leagueId_userId: { leagueId, userId } },
        update: {},
        create: { leagueId, userId, rating: 0 },
      });

      const existingQueue = await tx.arenaQueue.findUnique({
        where: { userId_leagueId: { userId, leagueId } },
      });

      if (existingQueue?.status === "waiting") {
        return {
          matched: false,
          queueId: existingQueue.id,
          match: null,
          alreadyQueued: true,
        };
      }

      // 🆕 پیدا کردن حریف با grade/major
      const opponent = await getMatchmakingCandidate(
        tx,
        userId,
        leagueId,
        rating.rating,
        user.grade,
      );

      if (!opponent) {
        // 🆕 ذخیره با grade/major
        const queueData = {
          userId,
          leagueId,
          rating: rating.rating,
          grade: user.grade,
          status: "waiting",
          joinedAt: now,
        };

        const queue = existingQueue
          ? await tx.arenaQueue.update({
              where: { id: existingQueue.id },
              data: queueData,
            })
          : await tx.arenaQueue.create({
              data: queueData,
            });

        return {
          matched: false,
          queueId: queue.id,
          match: null,
          alreadyQueued: false,
        };
      }

      // ادعای حریف
      const claimedOpponent = await tx.arenaQueue.updateMany({
        where: {
          id: opponent.id,
          status: "waiting",
          userId: { not: userId },
        },
        data: { status: "matched" },
      });

      if (claimedOpponent.count !== 1) {
        return null;
      }

      // ثبت خودم
      const currentQueueData = {
        userId,
        leagueId,
        rating: rating.rating,
        grade: user.grade,
        // major: user.major,
        status: "matched",
        joinedAt: now,
      };

      const currentQueue = existingQueue
        ? await tx.arenaQueue.update({
            where: { id: existingQueue.id },
            data: currentQueueData,
          })
        : await tx.arenaQueue.create({
            data: currentQueueData,
          });

      try {
        const match = await arenaMatchService.createArenaMatchTx(
          tx,
          userId,
          opponent.userId,
          leagueId,
        );

        await tx.arenaQueue.updateMany({
          where: {
            leagueId,
            userId: { in: [userId, opponent.userId] },
            status: "matched",
          },
          data: { status: "completed" },
        });

        return {
          matched: true,
          queueId: null,
          match,
          alreadyQueued: false,
          opponentQueueId: currentQueue.id,
        };
      } catch (error) {
        throw error;
      }
    },
    {
      isolationLevel: "Serializable",
      maxWait: 5000,
      timeout: 15000,
    },
  );

  if (!result) {
    throw new AppError(
      "Opponent is no longer available. Please try again.",
      409,
    );
  }

  if (result.match) {
    arenaMatchmakingSocketService.notifyMatchFound(result.match);
  }

  return result;
};

// ==================== خروج از صف ====================
const leaveQueue = async (userId, leagueId) => {
  const queue = await prisma.arenaQueue.findUnique({
    where: { userId_leagueId: { userId, leagueId } },
  });

  if (!queue || queue.status !== "waiting") {
    return { success: true, alreadyLeft: true };
  }

  await prisma.arenaQueue.update({
    where: { id: queue.id },
    data: { status: "cancelled" },
  });

  return { success: true, alreadyLeft: false };
};

// ==================== وضعیت صف ====================
const getQueueStatus = async (userId, leagueId) => {
  await cleanupStaleQueues(leagueId);

  const queue = await prisma.arenaQueue.findUnique({
    where: { userId_leagueId: { userId, leagueId } },
  });

  if (!queue) return { inQueue: false, queue: null };

  return {
    inQueue: queue.status === "waiting",
    queue: {
      id: queue.id,
      status: queue.status,
      rating: queue.rating,
      grade: queue.grade,
      joinedAt: queue.joinedAt,
    },
  };
};

module.exports = {
  joinQueue,
  leaveQueue,
  getQueueStatus,
  cleanupStaleQueues,
};
