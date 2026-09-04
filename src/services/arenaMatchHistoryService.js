const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const getMyMatchHistory = async (userId) => {
  const matches = await prisma.arenaMatchPlayer.findMany({
    where: {
      userId,
      match: {
        status: "finished",
      },
    },

    orderBy: {
      match: {
        finishedAt: "desc",
      },
    },

    include: {
      match: {
        include: {
          league: {
            select: {
              id: true,
              title: true,
            },
          },

          players: {
            where: {
              userId: {
                not: userId,
              },
            },

            select: {
              userId: true,

              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },

          ratingHistory: {
            where: {
              userId,
            },

            select: {
              change: true,
            },
          },
        },
      },
    },
  });

  return {
    matches: matches.map((playerMatch) => {
      const match = playerMatch.match;

      const ratingChange = match.ratingHistory[0]?.change ?? 0;

      let result = "draw";

      if (match.winnerId) {
        result = match.winnerId === userId ? "win" : "loss";
      }

      const opponent = match.players[0];

      return {
        matchId: match.id,

        league: match.league,

        opponent: opponent
          ? {
              id: opponent.userId,
              firstName: opponent.user.firstName,
              lastName: opponent.user.lastName,
            }
          : null,

        result,

        ratingChange,

        playedAt: match.finishedAt,
      };
    }),
  };
};


const getMatchSummary = async (matchId, userId) => {
  const match = await prisma.arenaMatch.findUnique({
    where: { id: matchId },
    include: {
      league: { select: { id: true, title: true } },
      players: {
        select: {
          userId: true,
          lives: true,
          isWinner: true,
          user: { select: { firstName: true, lastName: true } },
        },
      },
      questions: {
        orderBy: { order: "asc" },
        select: {
          order: true,
          winnerId: true,
          question: {
            select: {
              questionText: true,
              options: true,
              correctAnswer: true,
            },
          },
          answers: {
            select: {
              playerId: true,
              isCorrect: true,
              responseTimeMs: true,
              selectedAnswer: true,
            },
          },
        },
      },
      ratingHistory: {
        where: { userId },
        select: { oldRating: true, newRating: true, change: true },
      },
    },
  });

  if (!match) throw new AppError("Arena match not found", 404);
  if (!match.players.some((player) => player.userId === userId)) {
    throw new AppError("Forbidden", 403);
  }
  if (match.status !== "finished") {
    throw new AppError("Arena match is not finished", 400);
  }

  const player = match.players.find((item) => item.userId === userId);
  const opponent = match.players.find((item) => item.userId !== userId);
  const ownAnswers = match.questions
    .map((question) => question.answers.find((answer) => answer.playerId === userId))
    .filter(Boolean);
  const opponentAnswers = opponent
    ? match.questions
        .map((question) => question.answers.find((answer) => answer.playerId === opponent.userId))
        .filter(Boolean)
    : [];
  const correct = ownAnswers.filter((answer) => answer.isCorrect).length;
  const wrong = ownAnswers.filter((answer) => !answer.isCorrect).length;
  const timeout = match.questions.length - ownAnswers.length;
  const responseTimes = ownAnswers
    .map((answer) => answer.responseTimeMs)
    .filter((value) => Number.isInteger(value) && value >= 0);
  const averageResponseTimeMs = responseTimes.length
    ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length)
    : null;

  const rating = match.ratingHistory[0] ?? null;
  const result = match.winnerId ? (match.winnerId === userId ? "win" : "loss") : "draw";
  const opponentId = opponent?.userId ?? null;
  const questionPerformance = match.questions.map((question) => {
    const ownAnswer = question.answers.find((answer) => answer.playerId === userId) ?? null;
    const opponentAnswer = opponentId
      ? question.answers.find((answer) => answer.playerId === opponentId) ?? null
      : null;

    return {
      order: question.order,
      questionText: question.question.questionText,
      options: question.question.options,
      correctAnswer: question.question.correctAnswer,
      winnerId: question.winnerId,
      ownAnswer: ownAnswer
        ? {
            selectedAnswer: ownAnswer.selectedAnswer,
            isCorrect: ownAnswer.isCorrect,
            responseTimeMs: ownAnswer.responseTimeMs,
          }
        : null,
      opponentAnswer: opponentAnswer
        ? {
            selectedAnswer: opponentAnswer.selectedAnswer,
            isCorrect: opponentAnswer.isCorrect,
            responseTimeMs: opponentAnswer.responseTimeMs,
          }
        : null,
    };
  });

  return {
    matchId: match.id,
    league: match.league,
    result,
    winnerId: match.winnerId,
    playedAt: match.finishedAt,
    player: {
      userId,
      firstName: player.user.firstName,
      lastName: player.user.lastName,
      lives: player.lives,
    },
    opponent: opponent
      ? {
          userId: opponent.userId,
          firstName: opponent.user.firstName,
          lastName: opponent.user.lastName,
          lives: opponent.lives,
        }
      : null,
    stats: {
      totalQuestions: match.questions.length,
      correct,
      wrong,
      timeout,
      averageResponseTimeMs,
      opponent: {
        correct: opponentAnswers.filter((answer) => answer.isCorrect).length,
        wrong: opponentAnswers.filter((answer) => !answer.isCorrect).length,
        timeout: match.questions.length - opponentAnswers.length,
        averageResponseTimeMs: (() => {
          const times = opponentAnswers
            .map((answer) => answer.responseTimeMs)
            .filter((value) => Number.isInteger(value) && value >= 0);
          return times.length
            ? Math.round(times.reduce((sum, value) => sum + value, 0) / times.length)
            : null;
        })(),
      },
      roundsWon: match.questions.filter((question) => question.winnerId === userId).length,
      opponentRoundsWon: opponentId
        ? match.questions.filter((question) => question.winnerId === opponentId).length
        : 0,
    },
    rating: rating
      ? { oldRating: rating.oldRating, newRating: rating.newRating, change: rating.change }
      : null,
    questionPerformance,
  };
};

module.exports = {
  getMyMatchHistory,
  getMatchSummary,
};
