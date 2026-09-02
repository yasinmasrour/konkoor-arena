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

const calculateExpectedScore = (rating, opponentRating) => {
  return 1 / (1 + 10 ** ((opponentRating - rating) / 400));
};

const calculateNewRating = ({
  rating,
  opponentRating,
  score,
  kFactor = 32,
}) => {
  const expectedScore = calculateExpectedScore(rating, opponentRating);

  return Math.max(0, Math.round(rating + kFactor * (score - expectedScore)));
};

const updateRatingsAfterMatch = async (matchId) => {
  return await prisma.$transaction(async (tx) => {
    const match = await tx.arenaMatch.findUnique({
      where: {
        id: matchId,
      },

      include: {
        players: {
          select: {
            userId: true,
            isWinner: true,
            status: true,
          },
        },
      },
    });

    if (!match) {
      throw new AppError("Arena match not found", 404);
    }

    if (match.status !== "finished") {
      throw new AppError("Arena match is not finished", 400);
    }

    if (match.players.length !== 2) {
      throw new AppError("Arena match must have exactly two players", 400);
    }

    const ratingGate = await tx.arenaMatch.updateMany({
      where: { id: matchId, ratingUpdated: false },
      data: { ratingUpdated: true, ratingUpdatedAt: new Date() },
    });

    if (ratingGate.count === 0) {
      return { alreadyUpdated: true };
    }

    const player1 = match.players[0];
    const player2 = match.players[1];

    const rating1 = await tx.arenaRating.findUnique({
      where: {
        leagueId_userId: {
          leagueId: match.leagueId,
          userId: player1.userId,
        },
      },
    });

    const rating2 = await tx.arenaRating.findUnique({
      where: {
        leagueId_userId: {
          leagueId: match.leagueId,
          userId: player2.userId,
        },
      },
    });

    if (!rating1 || !rating2) {
      throw new AppError("Player rating not found for this league", 400);
    }

    let score1;
    let score2;

    if (match.winnerId) {
      if (match.winnerId === player1.userId) {
        score1 = 1;
        score2 = 0;
      } else if (match.winnerId === player2.userId) {
        score1 = 0;
        score2 = 1;
      } else {
        throw new AppError("Match winner does not belong to this match", 400);
      }
    } else {
      score1 = 0.5;
      score2 = 0.5;
    }

    const newRating1 = calculateNewRating({
      rating: rating1.rating,
      opponentRating: rating2.rating,
      score: score1,
    });

    const newRating2 = calculateNewRating({
      rating: rating2.rating,
      opponentRating: rating1.rating,
      score: score2,
    });

    const isDraw = !match.winnerId;

    const updatedRating1 = await tx.arenaRating.update({
      where: {
        id: rating1.id,
      },

      data: {
        rating: newRating1,
        matchesPlayed: {
          increment: 1,
        },
        wins: {
          increment: score1 === 1 ? 1 : 0,
        },
        losses: {
          increment: score1 === 0 ? 1 : 0,
        },
        draws: {
          increment: isDraw ? 1 : 0,
        },
      },
    });

    const updatedRating2 = await tx.arenaRating.update({
      where: {
        id: rating2.id,
      },

      data: {
        rating: newRating2,
        matchesPlayed: {
          increment: 1,
        },
        wins: {
          increment: score2 === 1 ? 1 : 0,
        },
        losses: {
          increment: score2 === 0 ? 1 : 0,
        },
        draws: {
          increment: isDraw ? 1 : 0,
        },
      },
    });

    return {
      player1: updatedRating1,
      player2: updatedRating2,
    };
  });
};

const ensurePlayerRatings = async (leagueId, userIds) => {
  return await prisma.$transaction(async (tx) => {
    const ratings = [];

    for (const userId of userIds) {
      const rating = await tx.arenaRating.upsert({
        where: {
          leagueId_userId: {
            leagueId,
            userId,
          },
        },

        update: {},

        create: {
          leagueId,
          userId,
          rating: 0,
        },
      });

      ratings.push(rating);
    }

    return ratings;
  });
};

const updateRatingsAfterMatchTx = async (tx, match) => {
  if (match.status !== "finished" || match.ratingUpdated) {
    return null;
  }

  const [player1, player2] = match.players;

  const ratingGate = await tx.arenaMatch.updateMany({
    where: { id: match.id, ratingUpdated: false },
    data: { ratingUpdated: true, ratingUpdatedAt: new Date() },
  });

  if (ratingGate.count === 0) {
    return { alreadyUpdated: true };
  }

  const rating1 = await tx.arenaRating.findUnique({
    where: {
      leagueId_userId: {
        leagueId: match.leagueId,
        userId: player1.userId,
      },
    },
  });

  const rating2 = await tx.arenaRating.findUnique({
    where: {
      leagueId_userId: {
        leagueId: match.leagueId,
        userId: player2.userId,
      },
    },
  });

  if (!rating1 || !rating2) {
    throw new AppError("Player rating not found for this league", 400);
  }

  let score1;
  let score2;

  if (match.winnerId) {
    if (match.winnerId === player1.userId) {
      score1 = 1;
      score2 = 0;
    } else if (match.winnerId === player2.userId) {
      score1 = 0;
      score2 = 1;
    } else {
      throw new AppError("Match winner does not belong to this match", 400);
    }
  } else {
    score1 = 0.5;
    score2 = 0.5;
  }

  const newRating1 = calculateNewRating({
    rating: rating1.rating,
    opponentRating: rating2.rating,
    score: score1,
  });

  const newRating2 = calculateNewRating({
    rating: rating2.rating,
    opponentRating: rating1.rating,
    score: score2,
  });

  const isDraw = !match.winnerId;

  const updatedRating1 = await tx.arenaRating.update({
    where: {
      id: rating1.id,
    },

    data: {
      rating: newRating1,

      matchesPlayed: {
        increment: 1,
      },

      wins: {
        increment: score1 === 1 ? 1 : 0,
      },

      losses: {
        increment: score1 === 0 ? 1 : 0,
      },

      draws: {
        increment: isDraw ? 1 : 0,
      },
    },
  });

  const updatedRating2 = await tx.arenaRating.update({
    where: {
      id: rating2.id,
    },

    data: {
      rating: newRating2,

      matchesPlayed: {
        increment: 1,
      },

      wins: {
        increment: score2 === 1 ? 1 : 0,
      },

      losses: {
        increment: score2 === 0 ? 1 : 0,
      },

      draws: {
        increment: isDraw ? 1 : 0,
      },
    },
  });

  await tx.arenaRatingHistory.createMany({
    data: [
      {
        leagueId: match.leagueId,
        userId: rating1.userId,
        matchId: match.id,

        oldRating: rating1.rating,
        newRating: newRating1,
        change: newRating1 - rating1.rating,
      },

      {
        leagueId: match.leagueId,
        userId: rating2.userId,
        matchId: match.id,

        oldRating: rating2.rating,
        newRating: newRating2,
        change: newRating2 - rating2.rating,
      },
    ],
  });

  return {
    player1: updatedRating1,
    player2: updatedRating2,
  };
};

module.exports = {
  createPlayerRating,
  getPlayerRating,
  getOrCreatePlayerRating,
  calculateExpectedScore,
  calculateNewRating,
  updateRatingsAfterMatch,
  ensurePlayerRatings,
  updateRatingsAfterMatchTx,
};
