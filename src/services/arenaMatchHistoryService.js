const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const getMyMatchHistory = async (userId) => {
  const matches = await prisma.arenaMatchPlayer.findMany({
    where: {
      userId,
      match: {
        status: "finished",
      },
    },

    orderBy: {
      match: {
        finishedAt: "desc",
      },
    },

    include: {
      match: {
        include: {
          league: {
            select: {
              id: true,
              title: true,
            },
          },

          players: {
            where: {
              userId: {
                not: userId,
              },
            },

            select: {
              userId: true,

              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },

          ratingHistory: {
            where: {
              userId,
            },

            select: {
              change: true,
            },
          },
        },
      },
    },
  });

  return {
    matches: matches.map((playerMatch) => {
      const match = playerMatch.match;

      const ratingChange = match.ratingHistory[0]?.change ?? 0;

      let result = "draw";

      if (match.winnerId) {
        result = match.winnerId === userId ? "win" : "loss";
      }

      const opponent = match.players[0];

      return {
        matchId: match.id,

        league: match.league,

        opponent: opponent
          ? {
              id: opponent.userId,
              firstName: opponent.user.firstName,
              lastName: opponent.user.lastName,
            }
          : null,

        result,

        ratingChange,

        playedAt: match.finishedAt,
      };
    }),
  };
};

module.exports = {
  getMyMatchHistory,
};
