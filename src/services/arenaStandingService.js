const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const getLeagueStandings = async (leagueId) => {
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
    throw new AppError("Arena league not found", 404);
  }

  if (league.status !== "finished") {
    throw new AppError(
      "League standings are available after finishing league",
      400,
    );
  }

  const standings = await prisma.arenaLeagueStanding.findMany({
    where: {
      leagueId,
    },

    orderBy: {
      rank: "asc",
    },

    select: {
      rank: true,
      userId: true,

      finalRating: true,

      wins: true,
      losses: true,
      draws: true,

      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return {
    league,

    standings: standings.map((item) => ({
      rank: item.rank,

      userId: item.userId,

      firstName: item.user.firstName,

      lastName: item.user.lastName,

      finalRating: item.finalRating,

      wins: item.wins,

      losses: item.losses,

      draws: item.draws,
    })),
  };
};

module.exports = {
  getLeagueStandings,
};
