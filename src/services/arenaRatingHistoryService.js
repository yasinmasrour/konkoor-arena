const prisma = require("../config/prisma");

const getMyRatingHistory = async (userId, leagueId) => {
  const history = await prisma.arenaRatingHistory.findMany({
    where: {
      userId,
      ...(leagueId ? { leagueId } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: {
      oldRating: true,
      newRating: true,
      change: true,
      createdAt: true,
      league: { select: { id: true, title: true } },
      matchId: true,
    },
  });

  return {
    history: history.map((item, index) => ({
      index: index + 1,
      matchId: item.matchId,
      league: item.league,
      oldRating: item.oldRating,
      newRating: item.newRating,
      change: item.change,
      createdAt: item.createdAt,
    })),
  };
};

module.exports = { getMyRatingHistory };
