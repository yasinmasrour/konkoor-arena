const prisma = require("../config/prisma");

const getMatchState = async (matchId) => {
  const match = await prisma.arenaMatch.findUnique({
    where: {
      id: matchId,
    },

    include: {
      players: {
        select: {
          userId: true,
          lives: true,
          status: true,
          isWinner: true,
        },
      },

      questions: {
        where: {
          status: "active",
        },

        orderBy: {
          order: "asc",
        },

        take: 1,

        select: {
          id: true,
          questionId: true,
          order: true,
          timeLimit: true,
          status: true,
          startedAt: true,
        },
      },
    },
  });

  if (!match) {
    throw new Error("Match not found");
  }

  const currentQuestion = match.questions[0] || null;

  return {
    matchId: match.id,
    status: match.status,
    startedAt: match.startedAt,
    finishedAt: match.finishedAt,

    players: match.players,

    currentQuestion,
  };
};

module.exports = {
  getMatchState,
};
