const crypto = require("crypto");
const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const arenaMatchService = require("./arenaMatchService");
const arenaMatchmakingSocketService = require("../socket/arenaMatchmakingSocketService");

const INVITE_TTL_MINUTES = 5;
const CODE_LENGTH = 6;

// تولید کد ۶ کاراکتری (بدون حروف گیج‌کننده مثل O/0 و I/1)
const generateCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return code;
};

// ==================== ساخت دعوت ====================
const createInvite = async (userId, leagueId) => {
  if (!userId || !leagueId) {
    throw new AppError("User and league are required", 400);
  }

  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, grade: true, major: true },
    });

    if (!user) throw new AppError("User not found", 404);
    if (!user.grade || !user.major) {
      throw new AppError("اول پروفایلت رو تکمیل کن", 400);
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

    // 🆕 چک رشته
    if (
      league.compatibleMajors.length > 0 &&
      !league.compatibleMajors.includes(user.major)
    ) {
      throw new AppError("این لیگ برای رشته‌ی شما نیست", 400);
    }

    // 🆕 چک پایه
    if (league.grade !== user.grade) {
      throw new AppError("این لیگ برای پایه‌ی شما نیست", 400);
    }

    // چک نبرد فعال
    const activeMatch = await tx.arenaMatch.findFirst({
      where: {
        status: { in: ["waiting", "playing"] },
        players: { some: { userId } },
      },
      select: { id: true },
    });

    if (activeMatch) {
      throw new AppError("الان توی یه نبرد فعالی، اول تمومش کن", 409);
    }

    // لغو invite قدیمی (چون فقط یدونه همزمان)
    await tx.arenaInvite.updateMany({
      where: { inviterId: userId, status: "pending" },
      data: { status: "cancelled" },
    });

    // ساخت کد یونیک
    let code;
    let attempts = 0;
    while (attempts < 5) {
      code = generateCode();
      const existing = await tx.arenaInvite.findUnique({
        where: { code },
        select: { id: true },
      });
      if (!existing) break;
      attempts += 1;
    }

    if (!code) {
      throw new AppError("خطا در ساخت کد دعوت، دوباره تلاش کن", 500);
    }

    const expiresAt = new Date(now.getTime() + INVITE_TTL_MINUTES * 60 * 1000);

    const invite = await tx.arenaInvite.create({
      data: {
        code,
        inviterId: userId,
        leagueId,
        status: "pending",
        expiresAt,
      },
      include: {
        league: {
          select: { id: true, title: true, lesson: true, grade: true },
        },
      },
    });

    return {
      invite,
      expiresInSeconds: INVITE_TTL_MINUTES * 60,
    };
  });
};

// ==================== گرفتن اطلاعات کد ====================
const getInviteByCode = async (code) => {
  const invite = await prisma.arenaInvite.findUnique({
    where: { code },
    include: {
      inviter: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          grade: true,
          major: true,
        },
      },
      league: {
        select: { id: true, title: true, lesson: true, grade: true },
      },
    },
  });

  if (!invite) throw new AppError("کد دعوت پیدا نشد", 404);

  if (invite.status !== "pending") {
    throw new AppError("این کد دیگه معتبر نیست", 400);
  }

  if (invite.expiresAt < new Date()) {
    throw new AppError("این کد منقضی شده", 400);
  }

  return invite;
};

// ==================== پذیرش دعوت ====================
const acceptInvite = async (code, userId) => {
  const result = await prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${`arena:invite:${code}`}))
      `;

      const invite = await tx.arenaInvite.findUnique({
        where: { code },
        include: {
          inviter: {
            select: { id: true, grade: true, major: true },
          },
          league: true,
        },
      });

      if (!invite) throw new AppError("کد دعوت پیدا نشد", 404);

      if (invite.status !== "pending") {
        throw new AppError("این کد قبلاً استفاده شده یا لغو شده", 400);
      }

      if (invite.expiresAt < new Date()) {
        throw new AppError("این کد منقضی شده", 400);
      }

      if (invite.inviterId === userId) {
        throw new AppError("نمی‌تونی دعوت خودت رو قبول کنی", 400);
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, grade: true, major: true },
      });

      if (!user) throw new AppError("User not found", 404);
      if (!user.grade || !user.major) {
        throw new AppError("اول پروفایلت رو تکمیل کن", 400);
      }

      // چک پایه
      if (invite.league.grade !== user.grade) {
        throw new AppError("این لیگ برای پایه‌ی شما نیست", 400);
      }

      // 🆕 چک رشته
      if (
        invite.league.compatibleMajors.length > 0 &&
        !invite.league.compatibleMajors.includes(user.major)
      ) {
        throw new AppError("این لیگ برای رشته‌ی شما نیست", 400);
      }

      // چک نبرد فعال برای هر دو
      const activeMatch = await tx.arenaMatch.findFirst({
        where: {
          status: { in: ["waiting", "playing"] },
          players: {
            some: { userId: { in: [invite.inviterId, userId] } },
          },
        },
        select: { id: true },
      });

      if (activeMatch) {
        throw new AppError("یکی از بازیکن‌ها توی نبرد فعاله", 409);
      }

      // ساخت match friendly
      const match = await arenaMatchService.createArenaMatchTx(
        tx,
        invite.inviterId,
        userId,
        invite.leagueId,
        { isFriendly: true },
      );

      // آپدیت invite
      await tx.arenaInvite.update({
        where: { id: invite.id },
        data: {
          status: "used",
          usedById: userId,
          usedAt: new Date(),
        },
      });

      return match;
    },
    {
      isolationLevel: "Serializable",
      maxWait: 5000,
      timeout: 15000,
    },
  );

  arenaMatchmakingSocketService.notifyMatchFound(result);

  return result;
};

// ==================== لغو دعوت ====================
const cancelInvite = async (userId, code) => {
  const invite = await prisma.arenaInvite.findUnique({
    where: { code },
  });

  if (!invite) throw new AppError("کد دعوت پیدا نشد", 404);
  if (invite.inviterId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  if (invite.status !== "pending") {
    return { success: true, alreadyDone: true };
  }

  await prisma.arenaInvite.update({
    where: { id: invite.id },
    data: { status: "cancelled" },
  });

  return { success: true, alreadyDone: false };
};

// ==================== دعوت فعال من ====================
const getMyActiveInvite = async (userId) => {
  const invite = await prisma.arenaInvite.findFirst({
    where: {
      inviterId: userId,
      status: "pending",
      expiresAt: { gt: new Date() },
    },
    include: {
      league: {
        select: { id: true, title: true, lesson: true, grade: true },
      },
    },
  });

  if (!invite) return { invite: null, expiresInSeconds: 0 };

  const expiresInSeconds = Math.max(
    0,
    Math.floor((invite.expiresAt.getTime() - Date.now()) / 1000),
  );

  return { invite, expiresInSeconds };
};

// ==================== cleanup ====================
const cleanupExpiredInvites = async () => {
  return await prisma.arenaInvite.updateMany({
    where: {
      status: "pending",
      expiresAt: { lt: new Date() },
    },
    data: { status: "expired" },
  });
};

module.exports = {
  createInvite,
  getInviteByCode,
  acceptInvite,
  cancelInvite,
  getMyActiveInvite,
  cleanupExpiredInvites,
};
