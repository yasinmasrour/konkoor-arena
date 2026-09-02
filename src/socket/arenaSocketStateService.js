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
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
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
          question: {
            select: {
              id: true,
              questionText: true,
              questionImage: true,
              options: true,
            },
          },
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
    winnerId: match.winnerId,
    startedAt: match.startedAt,
    finishedAt: match.finishedAt,

    players: match.players.map((player) => ({
      userId: player.userId,
      lives: player.lives,
      status: player.status,
      isWinner: player.isWinner,
      firstName: player.user.firstName,
      lastName: player.user.lastName,
    })),

    currentQuestion: currentQuestion
      ? {
          matchQuestionId: currentQuestion.id,
          questionId: currentQuestion.questionId,
          order: currentQuestion.order,
          timeLimit: currentQuestion.timeLimit,
          startedAt: currentQuestion.startedAt,
          status: currentQuestion.status,
          remainingTime,
          question: currentQuestion.question,
        }
      : null,
  };
};

module.exports = {
  getMatchState,
};
