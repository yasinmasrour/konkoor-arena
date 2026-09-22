const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const {
  getRewardForRank,
  isEligibleForReward,
} = require("../constants/arenaReward");
const notificationService = require("./notificationService");
const { NOTIFICATION_TYPES } = require("../constants/notification");

// ==================== ساخت standings ====================
const buildStandings = (ratings, leagueId) => {
  return ratings.map((player, index) => ({
    leagueId,
    userId: player.userId,
    finalRating: player.rating,
    rank: index + 1,
    wins: player.wins,
    losses: player.losses,
    draws: player.draws,
  }));
};

// ==================== پرداخت جایزه‌ها (داخل transaction) ====================
const distributeRewardsTx = async (tx, leagueId, standings) => {
  const results = [];

  for (const standing of standings) {
    // 🔹 چک واجد شرایط بودن
    if (!isEligibleForReward(standing)) {
      results.push({
        userId: standing.userId,
        rank: standing.rank,
        amount: 0,
        reason: "not_eligible",
      });
      continue;
    }

    // 🔹 گرفتن مبلغ جایزه
    const amount = getRewardForRank(standing.rank);

    if (amount <= 0) {
      results.push({
        userId: standing.userId,
        rank: standing.rank,
        amount: 0,
        reason: "no_reward_for_rank",
      });
      continue;
    }

    // 🔹 چک که قبلاً پرداخت نشده باشه
    const existingReward = await tx.walletTransaction.findFirst({
      where: {
        userId: standing.userId,
        referenceId: leagueId,
        referenceType: "ARENA_REWARD",
        type: "REWARD",
      },
    });

    if (existingReward) {
      results.push({
        userId: standing.userId,
        rank: standing.rank,
        amount: existingReward.amount,
        reason: "already_paid",
      });
      continue;
    }

    // 🔹 واریز به کیف پول
    try {
      // گرفتن یا ساخت کیف پول
      let wallet = await tx.wallet.findUnique({
        where: { userId: standing.userId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: standing.userId,
            balance: 0,
            currency: "IRR",
          },
        });
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;

      // آپدیت موجودی
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      // ثبت تراکنش
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          userId: standing.userId,
          type: "REWARD",
          direction: "IN",
          amount,
          balanceBefore,
          balanceAfter,
          status: "SUCCESS",
          description: `جایزه لیگ آرنا - رتبه ${standing.rank}`,
          referenceId: leagueId,
          referenceType: "ARENA_REWARD",
          metadata: {
            leagueId,
            rank: standing.rank,
            finalRating: standing.finalRating,
          },
        },
      });

      await tx.notification.create({
        data: {
          userId: standing.userId,
          type: NOTIFICATION_TYPES.ARENA_REWARD,
          title: "🏆 جایزه گرفتی!",
          message: `جایزه رتبه ${standing.rank} لیگ به مبلغ ${(amount / 10).toLocaleString("fa-IR")} تومان به کیف پولت اضافه شد.`,
          link: "/wallet",
          icon: "trophy",
          metadata: {
            leagueId,
            rank: standing.rank,
            amount,
          },
        },
      });

      results.push({
        userId: standing.userId,
        rank: standing.rank,
        amount,
        reason: "paid",
      });
    } catch (error) {
      results.push({
        userId: standing.userId,
        rank: standing.rank,
        amount: 0,
        reason: "error",
        error: error.message,
      });
    }
  }

  return results;
};

// ==================== نهایی‌سازی داخل transaction (استفاده‌شده در Job) ====================
const finalizeLeagueTx = async (tx, leagueId) => {
  // 🔹 چک standings قبلی
  const existingStandings = await tx.arenaLeagueStanding.findMany({
    where: { leagueId },
  });

  let standings;

  if (existingStandings.length > 0) {
    standings = existingStandings;
  } else {
    // 🔹 گرفتن rating ها
    const ratings = await tx.arenaRating.findMany({
      where: { leagueId },
      orderBy: [{ rating: "desc" }, { wins: "desc" }],
    });

    if (ratings.length === 0) {
      return { standings: [], rewards: [] };
    }

    // 🔹 ساخت standings
    standings = buildStandings(ratings, leagueId);

    await tx.arenaLeagueStanding.createMany({
      data: standings,
    });
  }

  // 🔹 چک که جایزه‌ها قبلاً پرداخت نشده باشن
  const league = await tx.arenaLeague.findUnique({
    where: { id: leagueId },
    select: { rewardsDistributedAt: true },
  });

  if (league?.rewardsDistributedAt) {
    // جایزه‌ها قبلاً پرداخت شده
    return { standings, rewards: [] };
  }

  // 🔹 پرداخت جایزه‌ها
  const rewards = await distributeRewardsTx(tx, leagueId, standings);

  // 🔹 ثبت که جایزه‌ها پرداخت شده
  await tx.arenaLeague.update({
    where: { id: leagueId },
    data: { rewardsDistributedAt: new Date() },
  });

  return { standings, rewards };
};

// ==================== نهایی‌سازی مستقل (بدون transaction خارجی) ====================
const finalizeLeague = async (leagueId) => {
  return await prisma.$transaction(async (tx) => {
    const league = await tx.arenaLeague.findUnique({
      where: { id: leagueId },
    });

    if (!league) {
      throw new AppError("Arena league not found", 404);
    }

    if (league.status !== "finished") {
      throw new AppError("Only finished leagues can be finalized", 400);
    }

    return finalizeLeagueTx(tx, leagueId);
  });
};

// ==================== گرفتن جایزه‌های یه لیگ ====================
const getLeagueRewards = async (leagueId) => {
  const transactions = await prisma.walletTransaction.findMany({
    where: {
      referenceId: leagueId,
      referenceType: "ARENA_REWARD",
      type: "REWARD",
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: {
      amount: "desc",
    },
  });

  return transactions.map((t) => ({
    userId: t.userId,
    firstName: t.user.firstName,
    lastName: t.user.lastName,
    rank: t.metadata?.rank,
    amount: t.amount,
    paidAt: t.createdAt,
  }));
};

module.exports = {
  finalizeLeague,
  finalizeLeagueTx,
  getLeagueRewards,
};
