const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const getLeagueRanking = async (leagueId) => {
  const league = await prisma.arenaLeague.findUnique({
    where: {
      id: leagueId,
    },

    select: {
      id: true,
      title: true,
      lesson: true,
      status: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!league) {
    throw new AppError("League not found", 404);
  }

  const ratings = await prisma.arenaRating.findMany({
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
      {
        updatedAt: "asc",
      },
    ],

    select: {
      userId: true,
      rating: true,
      matchesPlayed: true,
      wins: true,
      losses: true,
      draws: true,

      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return {
    league,

    rankings: ratings.map((item, index) => ({
      rank: index + 1,

      userId: item.userId,

      firstName: item.user.firstName,
      lastName: item.user.lastName,

      rating: item.rating,

      matchesPlayed: item.matchesPlayed,
      wins: item.wins,
      losses: item.losses,
      draws: item.draws,
    })),
  };
};

const getTopLeaguePlayers = async (leagueId, limit = 10) => {
  const ranking = await getLeagueRanking(leagueId);

  return {
    league: ranking.league,

    rankings: ranking.rankings.slice(0, limit),
  };
};

const getPlayerLeagueRanking = async (leagueId, userId) => {
  const ranking = await getLeagueRanking(leagueId);

  const player = ranking.rankings.find((item) => item.userId === userId);

  if (!player) {
    throw new AppError("Player has no rating in this league", 404);
  }

  return {
    league: ranking.league,
    ranking: player,
  };
};

module.exports = {
  getLeagueRanking,
  getTopLeaguePlayers,
  getPlayerLeagueRanking,
};
