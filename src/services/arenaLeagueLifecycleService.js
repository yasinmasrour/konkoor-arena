const prisma = require("../config/prisma");
const arenaLeagueFinalizationService = require("./arenaLeagueFinalizationService");

const updateLeagueStatuses = async () => {
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    const activatedLeagues = [];
    const finishedLeagues = [];

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
};

module.exports = {
  updateLeagueStatuses,
};
