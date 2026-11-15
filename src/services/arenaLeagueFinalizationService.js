const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const {
  getRewardForRank,
  isEligibleForReward,
} = require("../constants/arenaReward");
const notificationService = require("./notificationService");
const { NOTIFICATION_TYPES } = require("../constants/notification");
const achievementService = require("./achievementService");

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
    if (!isEligibleForReward(standing)) {
      results.push({
        userId: standing.userId,
        rank: standing.rank,
        amount: 0,
        reason: "not_eligible",
      });
      continue;
    }

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

    try {
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

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

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

// ==================== نهایی‌سازی داخل transaction ====================
const finalizeLeagueTx = async (tx, leagueId) => {
  const existingStandings = await tx.arenaLeagueStanding.findMany({
    where: { leagueId },
  });

  let standings;

  if (existingStandings.length > 0) {
    standings = existingStandings;
  } else {
    const ratings = await tx.arenaRating.findMany({
      where: { leagueId },
      orderBy: [{ rating: "desc" }, { wins: "desc" }],
    });

    if (ratings.length === 0) {
      return { standings: [], rewards: [] };
    }

    standings = buildStandings(ratings, leagueId);

    await tx.arenaLeagueStanding.createMany({
      data: standings,
    });
  }

  const league = await tx.arenaLeague.findUnique({
    where: { id: leagueId },
    select: { rewardsDistributedAt: true },
  });

  if (league?.rewardsDistributedAt) {
    return { standings, rewards: [] };
  }

  const rewards = await distributeRewardsTx(tx, leagueId, standings);

  await tx.arenaLeague.update({
    where: { id: leagueId },
    data: { rewardsDistributedAt: new Date() },
  });

  return { standings, rewards };
};

// ==================== 🆕 آپدیت آمار برنده‌ی رتبه‌ی اول ====================
/**
 * بعد از finalize شدن یه لیگ، اگه کاربر رتبه‌ی اول داشته باشه،
 * arenaFirstRank رو زیاد می‌کنه.
 */
const incrementArenaFirstRank = async (userId) => {
  try {
    await achievementService.updateUserStats(userId, {
      arenaFirstRank: { increment: 1 },
    });

    const newlyUnlocked =
      await achievementService.checkAndUnlockAchievements(userId);

    if (newlyUnlocked.length > 0) {
      console.log(
        `🏆 User ${userId} unlocked ${newlyUnlocked.length} achievements:`,
        newlyUnlocked.map((ua) => ua.tier?.title),
      );
    }
  } catch (err) {
    console.error("incrementArenaFirstRank error:", err);
  }
};

// ==================== نهایی‌سازی مستقل (بدون transaction خارجی) ====================
const finalizeLeague = async (leagueId) => {
  const result = await prisma.$transaction(async (tx) => {
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

  // 🆕 بعد از تراکنش: آپدیت arenaFirstRank
  if (result.standings && result.standings.length > 0) {
    const firstPlace = result.standings.find((s) => s.rank === 1);

    if (firstPlace) {
      await incrementArenaFirstRank(firstPlace.userId);
    }
  }

  return result;
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
  incrementArenaFirstRank,
};
