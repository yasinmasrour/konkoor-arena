const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const finalizeLeague = async (tx, leagueId) => {
  return await prisma.$transaction(async (tx) => {
    const league = await tx.arenaLeague.findUnique({
      where: {
        id: leagueId,
      },
    });

    if (!league) {
      throw new AppError("Arena league not found", 404);
    }

    if (league.status !== "finished") {
      throw new AppError("Only finished leagues can be finalized", 400);
    }

    const existingStandings = await tx.arenaLeagueStanding.findMany({
      where: {
        leagueId,
      },
    });

    if (existingStandings.length > 0) {
      return existingStandings;
    }

    const ratings = await tx.arenaRating.findMany({
      where: {
        leagueId,
      },

      orderBy: [
        {
          rating: "desc",
        },
        {
          wins: "desc",
        },
      ],

      select: {
        userId: true,
        rating: true,
        wins: true,
        losses: true,
        draws: true,
      },
    });

    if (ratings.length === 0) {
      return [];
    }

    const standings = ratings.map((player, index) => ({
      leagueId,

      userId: player.userId,

      finalRating: player.rating,

      rank: index + 1,

      wins: player.wins,

      losses: player.losses,

      draws: player.draws,
    }));

    await tx.arenaLeagueStanding.createMany({
      data: standings,
    });

    return standings;
  });
};

const finalizeLeagueTx = async (tx, leagueId) => {
  const existingStandings = await tx.arenaLeagueStanding.findMany({
    where: {
      leagueId,
    },
  });

  if (existingStandings.length > 0) {
    return existingStandings;
  }

  const ratings = await tx.arenaRating.findMany({
    where: {
      leagueId,
    },

    orderBy: [
      {
        rating: "desc",
      },
      {
        wins: "desc",
      },
    ],
  });

  const standings = ratings.map((player, index) => ({
    leagueId,
    userId: player.userId,
    finalRating: player.rating,
    rank: index + 1,
    wins: player.wins,
    losses: player.losses,
    draws: player.draws,
  }));

  await tx.arenaLeagueStanding.createMany({
    data: standings,
  });

  return standings;
};

module.exports = {
  finalizeLeague,
  finalizeLeagueTx,
};
