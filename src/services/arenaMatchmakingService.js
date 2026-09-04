const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const arenaMatchService = require("./arenaMatchService");
const arenaMatchmakingSocketService = require("../socket/arenaMatchmakingSocketService");

const INITIAL_RATING_RANGE = 100;
const RATING_RANGE_INCREMENT = 100;
const MAX_RATING_RANGE = 1000;
const QUEUE_TTL_MS = 60 * 1000;

const findOpponent = async (userId, leagueId, rating) => {
  const cutoff = new Date(Date.now() - QUEUE_TTL_MS);

  const queueEntries = await prisma.arenaQueue.findMany({
    where: {
      leagueId,
      status: "waiting",
      joinedAt: {
        gte: cutoff,
      },
      userId: {
        not: userId,
      },
    },

    orderBy: {
      joinedAt: "asc",
    },
  });

  if (queueEntries.length === 0) {
    return null;
  }

  const waitingTimeMs = Date.now();

  const candidates = queueEntries.filter((entry) => {
    const waitingSeconds = Math.floor(
      (waitingTimeMs - entry.joinedAt.getTime()) / 1000,
    );

    let ratingRange = INITIAL_RATING_RANGE;

    ratingRange += Math.floor(waitingSeconds / 10) * RATING_RANGE_INCREMENT;

    ratingRange = Math.min(ratingRange, MAX_RATING_RANGE);

    return Math.abs(entry.rating - rating) <= ratingRange;
  });

  if (candidates.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);

  return candidates[randomIndex];
};

const cleanupStaleQueues = async (leagueId = null) => {
  const cutoff = new Date(Date.now() - QUEUE_TTL_MS);

  const result = await prisma.arenaQueue.updateMany({
    where: {
      status: "waiting",
      joinedAt: {
        lt: cutoff,
      },
      ...(leagueId ? { leagueId } : {}),
    },
    data: {
      status: "cancelled",
    },
  });

  return result.count;
};

const joinQueue = async (userId, leagueId) => {
  const league = await prisma.arenaLeague.findUnique({
    where: {
      id: leagueId,
    },
  });

  if (!league) {
    throw new AppError("League not found", 404);
  }

  const now = new Date();

  if (
    league.status !== "active" ||
    now < league.startDate ||
    now > league.endDate
  ) {
    throw new AppError("League is not active", 400);
  }

  const existingMatch = await prisma.arenaMatch.findFirst({
    where: {
      status: {
        in: ["waiting", "playing"],
      },

      players: {
        some: {
          userId,
        },
      },
    },
  });

  if (existingMatch) {
    throw new AppError("Player already has an active match", 400);
  }

  const rating = await prisma.arenaRating.findUnique({
    where: {
      leagueId_userId: {
        leagueId,
        userId,
      },
    },
  });

  if (!rating) {
    await prisma.arenaRating.create({
      data: {
        leagueId,
        userId,
        rating: 0,
      },
    });
  }

  const playerRating = rating?.rating ?? 0;

  const existingQueue = await prisma.arenaQueue.findUnique({
    where: {
      userId_leagueId: {
        userId,
        leagueId,
      },
    },
  });

  if (existingQueue?.status === "waiting") {
    throw new AppError("Player is already in matchmaking queue", 400);
  }

  await cleanupStaleQueues(leagueId);

  const opponent = await findOpponent(userId, leagueId, playerRating);

  if (!opponent) {
    const queue = existingQueue
      ? await prisma.arenaQueue.update({
          where: {
            id: existingQueue.id,
          },

          data: {
            rating: playerRating,
            status: "waiting",
            joinedAt: now,
          },
        })
      : await prisma.arenaQueue.create({
          data: {
            userId,
            leagueId,
            rating: playerRating,
            status: "waiting",
            joinedAt: now,
          },
        });

    return {
      matched: false,
      queueId: queue.id,
      match: null,
    };
  }

  const match = await prisma.$transaction(async (tx) => {
    const currentQueue = await tx.arenaQueue.findUnique({
      where: {
        id: opponent.id,
      },
    });

    if (!currentQueue || currentQueue.status !== "waiting") {
      return null;
    }

    const updatedOpponent = await tx.arenaQueue.updateMany({
      where: {
        id: opponent.id,
        status: "waiting",
      },

      data: {
        status: "matched",
      },
    });

    if (updatedOpponent.count !== 1) {
      return null;
    }

    if (existingQueue) {
      await tx.arenaQueue.upsert({
        where: {
          userId_leagueId: {
            userId,
            leagueId,
          },
        },

        update: {
          rating: playerRating,
          status: "matched",
          joinedAt: now,
        },

        create: {
          userId,
          leagueId,
          rating: playerRating,
          status: "matched",
          joinedAt: now,
        },
      });
    } else {
      await tx.arenaQueue.create({
        data: {
          userId,
          leagueId,
          rating: playerRating,
          status: "matched",
          joinedAt: now,
        },
      });
    }

    return true;
  });

  if (!match) {
    throw new AppError(
      "Opponent is no longer available. Please try again.",
      409,
    );
  }

  let arenaMatch;

  try {
    arenaMatch = await arenaMatchService.createArenaMatch(
      userId,
      opponent.userId,
      leagueId,
    );
  } catch (error) {
    await prisma.arenaQueue.updateMany({
      where: {
        leagueId,
        userId: {
          in: [userId, opponent.userId],
        },
        status: "matched",
      },

      data: {
        status: "waiting",
        joinedAt: new Date(),
      },
    });

    throw error;
  }

  await prisma.arenaQueue.updateMany({
    where: {
      leagueId,
      userId: {
        in: [userId, opponent.userId],
      },
      status: "matched",
    },

    data: {
      status: "completed",
    },
  });

  arenaMatchmakingSocketService.notifyMatchFound(arenaMatch);

  return {
    matched: true,
    queueId: null,
    match: arenaMatch,
  };
};

const leaveQueue = async (userId, leagueId) => {
  const queue = await prisma.arenaQueue.findUnique({
    where: {
      userId_leagueId: {
        userId,
        leagueId,
      },
    },
  });

  if (!queue) {
    throw new AppError("Player is not in matchmaking queue", 404);
  }

  if (queue.status !== "waiting") {
    throw new AppError("Player is not waiting in matchmaking queue", 400);
  }

  await prisma.arenaQueue.update({
    where: {
      id: queue.id,
    },

    data: {
      status: "cancelled",
    },
  });

  return {
    success: true,
  };
};

const getQueueStatus = async (userId, leagueId) => {
  const queue = await prisma.arenaQueue.findUnique({
    where: {
      userId_leagueId: {
        userId,
        leagueId,
      },
    },
  });

  if (!queue) {
    return {
      inQueue: false,
      queue: null,
    };
  }

  return {
    inQueue: queue.status === "waiting",
    queue: {
      id: queue.id,
      status: queue.status,
      rating: queue.rating,
      joinedAt: queue.joinedAt,
    },
  };
};

module.exports = {
  joinQueue,
  leaveQueue,
  getQueueStatus,
  cleanupStaleQueues,
};
