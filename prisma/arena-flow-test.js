require("dotenv").config();

const prisma = require("../src/config/prisma");

const arenaMatchService = require("../src/services/arenaMatchService");
const arenaRatingService = require("../src/services/arenaRatingService");
const arenaRankingService = require("../src/services/arenaRankingService");

const runArenaFlowTest = async () => {
  try {
    console.log("=== ARENA FLOW TEST START ===");

    /*
      1) گرفتن دو کاربر تستی
    */

    const users = await prisma.user.findMany({
      take: 2,
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (users.length !== 2) {
      throw new Error("Need at least two users in database");
    }

    const player1 = users[0];
    const player2 = users[1];

    console.log("Players:");
    console.log(player1);
    console.log(player2);

    /*
      2) ساخت League تستی
    */

    const league = await prisma.arenaLeague.create({
      data: {
        title: "Arena Test League",

        lesson: "Mathematics",

        startDate: new Date(Date.now() - 1000 * 60),

        endDate: new Date(Date.now() + 1000 * 60 * 60),

        status: "active",
      },
    });

    console.log("League created:", league.id);

    /*
      3) ساخت Rating اولیه
    */

    await arenaRatingService.ensurePlayerRatings(league.id, [
      player1.id,
      player2.id,
    ]);

    console.log("Ratings created");

    /*
      4) ساخت Match
    */

    const match = await arenaMatchService.createArenaMatch(
      player1.id,
      player2.id,
      league.id,
    );

    console.log("Match created:", match.id);

    /*
      5) شروع Match
    */

    await arenaMatchService.startArenaMatch(match.id);

    console.log("Match started");

    /*
      6) شبیه سازی پایان Match
      بازیکن اول برنده شود
    */

    await prisma.arenaMatchPlayer.update({
      where: {
        matchId_userId: {
          matchId: match.id,
          userId: player2.id,
        },
      },

      data: {
        lives: 0,
      },
    });

    const result = await prisma.$transaction(async (tx) => {
      return await arenaMatchService.finishArenaMatch(tx, match.id);
    });

    console.log("Match finished:", result);

    /*
      7) بررسی Rating
    */

    const ratings = await prisma.arenaRating.findMany({
      where: {
        leagueId: league.id,
      },
    });

    console.log("Ratings:", ratings);

    const ratingHistory = await prisma.arenaRatingHistory.findMany({
      where: {
        matchId: match.id,
      },
    });

    console.log("Rating History:", ratingHistory);

    /*
      8) بررسی Ranking
    */

    const ranking = await arenaRankingService.getLeagueRanking(league.id);

    console.log("Ranking:", ranking);

    console.log("=== ARENA FLOW TEST FINISHED ===");
  } catch (error) {
    console.error("TEST FAILED:", error);
  } finally {
    await prisma.$disconnect();
  }
};

runArenaFlowTest();
