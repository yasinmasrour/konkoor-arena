const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const arenaMatchService = require("./arenaMatchService");
const arenaRatingService = require("./arenaRatingService");
const arenaMatchmakingSocketService = require("../socket/arenaMatchmakingSocketService");

const INITIAL_RATING_RANGE = 100;
const RATING_RANGE_INCREMENT = 100;
const MAX_RATING_RANGE = 1000;
const QUEUE_TTL_MS = 60 * 1000;

const getLeagueLockKey = (leagueId) => `arena:matchmaking:${leagueId}`;

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

const getMatchmakingCandidate = async (tx, userId, leagueId, rating) => {
  const entries = await tx.arenaQueue.findMany({
    where: {
      leagueId,
      status: "waiting",
      userId: { not: userId },
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

const joinQueue = async (userId, leagueId) => {
  if (!userId || !leagueId) {
    throw new AppError("User and league are required", 400);
  }

  const result = await prisma.$transaction(
    async (tx) => {
      // Serialize matchmaking decisions per league. This prevents two players
      // joining simultaneously from both claiming the same opponent.
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${getLeagueLockKey(leagueId)}))
      `;

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

      const opponent = await getMatchmakingCandidate(
        tx,
        userId,
        leagueId,
        rating.rating,
      );

      if (!opponent) {
        const queue = existingQueue
          ? await tx.arenaQueue.update({
              where: { id: existingQueue.id },
              data: {
                rating: rating.rating,
                status: "waiting",
                joinedAt: now,
              },
            })
          : await tx.arenaQueue.create({
              data: {
                userId,
                leagueId,
                rating: rating.rating,
                status: "waiting",
                joinedAt: now,
              },
            });

        return {
          matched: false,
          queueId: queue.id,
          match: null,
          alreadyQueued: false,
        };
      }

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

      const currentQueue = existingQueue
        ? await tx.arenaQueue.update({
            where: { id: existingQueue.id },
            data: {
              rating: rating.rating,
              status: "matched",
              joinedAt: now,
            },
          })
        : await tx.arenaQueue.create({
            data: {
              userId,
              leagueId,
              rating: rating.rating,
              status: "matched",
              joinedAt: now,
            },
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
        // The outer transaction will roll back both queue claims and the match
        // if match creation fails. No stale "matched" state can survive.
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
