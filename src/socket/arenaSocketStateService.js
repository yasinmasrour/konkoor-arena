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

  let remainingTime = null;

  if (currentQuestion?.startedAt) {
    const elapsedSeconds = Math.floor(
      (Date.now() - currentQuestion.startedAt.getTime()) / 1000,
    );

    remainingTime = Math.max(currentQuestion.timeLimit - elapsedSeconds, 0);
  }

  return {
    matchId: match.id,
    status: match.status,
    startedAt: match.startedAt,
    finishedAt: match.finishedAt,

    players: match.players,

    currentQuestion: currentQuestion
      ? {
          ...currentQuestion,
          remainingTime,
        }
      : null,
  };
};

module.exports = {
  getMatchState,
};
