const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const getArenaProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,

      arenaMatchPlayers: {
        select: {
          isWinner: true,

          status: true,

          match: {
            select: {
              status: true,
              winnerId: true,
            },
          },
        },
      },

      arenaRatings: {
        select: {
          rating: true,
          wins: true,
          losses: true,
          draws: true,

          league: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  let totalMatches = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let totalDraws = 0;

  user.arenaMatchPlayers.forEach((player) => {
    const match = player.match;

    if (match.status !== "finished") {
      return;
    }

    totalMatches++;

    if (!match.winnerId) {
      totalDraws++;
      return;
    }

    if (match.winnerId === userId) {
      totalWins++;
    } else {
      totalLosses++;
    }
  });

  const leagues = user.arenaRatings.map((rating) => ({
    leagueId: rating.league.id,

    title: rating.league.title,

    status: rating.league.status,

    rating: rating.rating,

    wins: rating.wins,

    losses: rating.losses,

    draws: rating.draws,
  }));

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    },

    statistics: {
      totalMatches,
      wins: totalWins,
      losses: totalLosses,
      draws: totalDraws,
    },

    leagues,
  };
};

module.exports = {
  getArenaProfile,
};
