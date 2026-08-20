const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const createPlayerRating = async (leagueId, userId) => {
  const league = await prisma.arenaLeague.findUnique({
    where: {
      id: leagueId,
    },
  });

  if (!league) {
    throw new AppError("Arena league not found", 404);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const existingRating = await prisma.arenaRating.findUnique({
    where: {
      leagueId_userId: {
        leagueId,
        userId,
      },
    },
  });

  if (existingRating) {
    return existingRating;
  }

  return await prisma.arenaRating.create({
    data: {
      leagueId,
      userId,
      rating: 0,
    },
  });
};

const getPlayerRating = async (leagueId, userId) => {
  return await prisma.arenaRating.findUnique({
    where: {
      leagueId_userId: {
        leagueId,
        userId,
      },
    },
  });
};

const getOrCreatePlayerRating = async (leagueId, userId) => {
  const rating = await getPlayerRating(leagueId, userId);

  if (rating) {
    return rating;
  }

  return await createPlayerRating(leagueId, userId);
};

module.exports = {
  createPlayerRating,
  getPlayerRating,
  getOrCreatePlayerRating,
};