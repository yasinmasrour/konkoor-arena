const prisma = require("../config/prisma");

const updateLeagueStatuses = async () => {
  const now = new Date();

  const leagues = await prisma.arenaLeague.findMany({
    where: {
      status: {
        in: ["upcoming", "active"],
      },
    },
  });

  for (const league of leagues) {
    if (
      league.status === "upcoming" &&
      now >= league.startDate &&
      now <= league.endDate
    ) {
      await prisma.arenaLeague.update({
        where: {
          id: league.id,
        },

        data: {
          status: "active",
        },
      });
    }

    if (league.status === "active" && now > league.endDate) {
      await prisma.arenaLeague.update({
        where: {
          id: league.id,
        },

        data: {
          status: "finished",
        },
      });
    }
  }
};

module.exports = {
  updateLeagueStatuses,
};
