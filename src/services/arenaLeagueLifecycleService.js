const prisma = require("../config/prisma");
const arenaLeagueFinalizationService = require("./arenaLeagueFinalizationService");
const achievementService = require("./achievementService");

// ==================== 🆕 آپدیت آمار برنده‌ی رتبه‌ی اول ====================
/**
 * بعد از finalize شدن یه لیگ، اگه کاربر رتبه‌ی اول داشته باشه،
 * arenaFirstRank رو زیاد می‌کنه.
 */
const incrementArenaFirstRank = async (leagueId) => {
  try {
    // پیدا کردن رتبه‌ی اول از standings
    const firstPlace = await prisma.arenaLeagueStanding.findFirst({
      where: { leagueId, rank: 1 },
      select: { userId: true },
    });

    if (!firstPlace) return;

    // آپدیت آمار
    await achievementService.updateUserStats(firstPlace.userId, {
      arenaFirstRank: { increment: 1 },
    });

    // چک و unlock دستاوردها
    const newlyUnlocked = await achievementService.checkAndUnlockAchievements(
      firstPlace.userId,
    );

    if (newlyUnlocked.length > 0) {
      console.log(
        `🏆 User ${firstPlace.userId} unlocked ${newlyUnlocked.length} achievements:`,
        newlyUnlocked.map((ua) => ua.tier?.title),
      );
    }
  } catch (err) {
    console.error("incrementArenaFirstRank error:", err);
  }
};

// ==================== updateLeagueStatuses ====================
const updateLeagueStatuses = async () => {
  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const activatedLeagues = [];
    const finishedLeagues = [];

    // ۱. upcoming → active
    const upcomingLeagues = await tx.arenaLeague.findMany({
      where: {
        status: "upcoming",
        startDate: { lte: now },
        endDate: { gt: now },
      },
    });

    for (const league of upcomingLeagues) {
      const updatedLeague = await tx.arenaLeague.update({
        where: { id: league.id },
        data: { status: "active" },
      });

      activatedLeagues.push(updatedLeague);
    }

    // ۲. active → finished + finalize
    const activeLeagues = await tx.arenaLeague.findMany({
      where: {
        status: "active",
        endDate: { lte: now },
      },
    });

    for (const league of activeLeagues) {
      const updatedLeague = await tx.arenaLeague.update({
        where: { id: league.id },
        data: { status: "finished" },
      });

      // Final standings must be created in the same transaction as the
      // status change so the finalization never sees the old "active" state.
      await arenaLeagueFinalizationService.finalizeLeagueTx(tx, league.id);

      finishedLeagues.push(updatedLeague);
    }

    return {
      activatedLeagues,
      finishedLeagues,
    };
  });

  // 🆕 بعد از تراکنش: آپدیت arenaFirstRank برای هر لیگ تموم‌شده
  for (const league of result.finishedLeagues) {
    await incrementArenaFirstRank(league.id);
  }

  return result;
};

module.exports = {
  updateLeagueStatuses,
  incrementArenaFirstRank,
};
