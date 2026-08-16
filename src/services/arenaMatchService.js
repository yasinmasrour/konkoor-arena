const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const createArenaMatch = async (userId1, userId2, leagueId) => {
  if (userId1 === userId2) {
    throw new AppError("Players must be different", 400);
  }

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

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: [userId1, userId2],
      },
    },

    select: {
      id: true,
    },
  });

  if (users.length !== 2) {
    throw new AppError("One or both players not found", 404);
  }

  const questions = await prisma.question.findMany({
    where: {
      status: "published",
    },

    select: {
      id: true,
    },
  });

  if (questions.length < 5) {
    throw new AppError(
      `Not enough published questions available for ${lesson}`,
      400,
    );
  }

  const shuffledQuestions = questions
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  const match = await prisma.arenaMatch.create({
    data: {
      leagueId,

      status: "waiting",

      players: {
        create: [
          {
            userId: userId1,
            lives: 3,
          },
          {
            userId: userId2,
            lives: 3,
          },
        ],
      },

      questions: {
        create: shuffledQuestions.map((question, index) => ({
          questionId: question.id,
          order: index + 1,
          timeLimit: 60,
        })),
      },
    },

    include: {
      players: true,

      questions: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return match;
};

const getArenaMatchById = async (matchId) => {
  const match = await prisma.arenaMatch.findUnique({
    where: {
      id: matchId,
    },

    include: {
      league: {
        select: {
          id: true,
          title: true,
          lesson: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      },

      players: {
        select: {
          id: true,
          userId: true,
          lives: true,
        },
      },

      questions: {
        select: {
          id: true,
          order: true,
          timeLimit: true,
        },

        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!match) {
    throw new AppError("Arena match not found", 404);
  }

  return match;
};

const startArenaQuestion = async (matchId, matchQuestionId) => {
  const matchQuestion = await prisma.arenaMatchQuestion.findUnique({
    where: {
      id: matchQuestionId,
    },

    include: {
      match: true,
    },
  });

  if (!matchQuestion) {
    throw new AppError("Match question not found", 404);
  }

  if (matchQuestion.matchId !== matchId) {
    throw new AppError("Match question does not belong to this match", 400);
  }

  if (matchQuestion.match.status !== "playing") {
    throw new AppError("Match is not playing", 400);
  }

  if (matchQuestion.status !== "pending") {
    throw new AppError("Question has already started or finished", 400);
  }

  const startedAt = new Date();

  const updatedQuestion = await prisma.arenaMatchQuestion.update({
    where: {
      id: matchQuestionId,
    },

    data: {
      status: "active",
      startedAt,
    },

    select: {
      id: true,
      matchId: true,
      questionId: true,
      order: true,
      timeLimit: true,
      status: true,
      startedAt: true,
      finishedAt: true,
      winnerId: true,

      question: {
        select: {
          id: true,
          questionText: true,
          questionImage: true,
          options: true,
          correctAnswer: true,
        },
      },
    },
  });

  return updatedQuestion;
};

const startArenaMatch = async (matchId) => {
  return await prisma.$transaction(async (tx) => {
    const match = await tx.arenaMatch.findUnique({
      where: {
        id: matchId,
      },

      include: {
        players: true,

        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!match) {
      throw new AppError("Arena match not found", 404);
    }

    if (match.status !== "waiting") {
      throw new AppError("Arena match cannot be started", 400);
    }

    if (match.players.length !== 2) {
      throw new AppError("Arena match requires exactly two players", 400);
    }

    if (match.questions.length !== 5) {
      throw new AppError("Arena match must have exactly five questions", 400);
    }

    const now = new Date();

    const updatedMatch = await tx.arenaMatch.update({
      where: {
        id: matchId,
      },

      data: {
        status: "playing",
        startedAt: now,
      },
    });

    return {
      match: updatedMatch,
    };
  });
};

const submitArenaAnswer = async ({
  matchId,
  matchQuestionId,
  playerId,
  selectedAnswer,
}) => {
  return await prisma.$transaction(async (tx) => {

    const matchQuestion = await tx.arenaMatchQuestion.findUnique({
      where: {
        id: matchQuestionId,
      },

      include: {
        match: {
          include: {
            players: true,
          },
        },

        question: {
          select: {
            id: true,
            correctAnswer: true,
          },
        },
      },
    });

    if (!matchQuestion) {
      throw new AppError("Match question not found", 404);
    }

    if (matchQuestion.matchId !== matchId) {
      throw new AppError("Match question does not belong to this match", 400);
    }

    if (matchQuestion.status !== "active") {
      throw new AppError("Question is not active", 400);
    }

    const match = matchQuestion.match;

    if (match.status !== "playing") {
      throw new AppError("Match is not playing", 400);
    }

    const player = match.players.find((item) => item.userId === playerId);

    if (!player) {
      throw new AppError("Player is not part of this match", 403);
    }

    const existingAnswer = await tx.arenaAnswer.findUnique({
      where: {
        matchQuestionId_playerId: {
          matchQuestionId,
          playerId,
        },
      },
    });

    if (existingAnswer) {
      throw new AppError("You have already answered this question", 400);
    }

    if (player.status !== "playing") {
      throw new AppError("Player is not active", 400);
    }

    const now = new Date();

    if (!matchQuestion.startedAt) {
      throw new AppError("Question has not started", 400);
    }

    const elapsedMs = now.getTime() - matchQuestion.startedAt.getTime();

    const timeLimitMs = matchQuestion.timeLimit * 1000;

    if (elapsedMs >= timeLimitMs) {
      throw new AppError("Question time has expired", 400);
    }

    const isCorrect = selectedAnswer === matchQuestion.question.correctAnswer;

    const responseTimeMs = elapsedMs;

    const answer = await tx.arenaAnswer.create({
      data: {
        matchQuestionId,
        playerId,
        selectedAnswer,
        isCorrect,
        answeredAt: now,
        responseTimeMs,
      },
    });

    const opponent = match.players.find((item) => item.userId !== playerId);

    if (!opponent) {
      throw new AppError("Opponent not found", 400);
    }

    // ==========================================
    // CORRECT ANSWER
    // ==========================================

    if (isCorrect) {

      const opponentAnswer = await tx.arenaAnswer.findUnique({
        where: {
          matchQuestionId_playerId: {
            matchQuestionId,
            playerId: opponent.userId,
          },
        },
      });

      let opponentLives = opponent.lives;

      if (!opponentAnswer) {
        opponentLives = Math.max(opponent.lives - 1, 0);

        await tx.arenaMatchPlayer.update({
          where: {
            id: opponent.id,
          },

          data: {
            lives: opponentLives,
          },
        });
      }

      await tx.arenaMatchQuestion.update({
        where: {
          id: matchQuestionId,
        },

        data: {
          status: "finished",
          finishedAt: now,
          winnerId: playerId,
        },
      });

      const matchResult = await finishArenaMatch(tx, match.id);

      return {
        answer,
        result: "correct",
        questionFinished: true,
        playerLives: player.lives,
        opponentLives,
        match: matchResult,
      };
    }

    // ==========================================
    // WRONG ANSWER
    // ==========================================

    const playerLives = Math.max(player.lives - 1, 0);

    await tx.arenaMatchPlayer.update({
      where: {
        id: player.id,
      },

      data: {
        status: "locked",
        lives: playerLives,
      },
    });

    // ==========================================
    // CHECK OPPONENT ANSWER
    // ==========================================

    const opponentAnswer = await tx.arenaAnswer.findUnique({
      where: {
        matchQuestionId_playerId: {
          matchQuestionId,
          playerId: opponent.userId,
        },
      },
    });

    // ==========================================
    // ONLY CURRENT PLAYER ANSWERED WRONG
    // ==========================================

    if (!opponentAnswer) {
      return {
        answer,
        result: "wrong",
        questionFinished: false,
        playerLives,
        opponentLives: opponent.lives,
        match: null,
      };
    }

    // ==========================================
    // BOTH PLAYERS ANSWERED WRONG
    // ==========================================
    await tx.arenaMatchPlayer.update({
      where: {
        id: opponent.id,
      },

      data: {
        status: "locked",
      },
    });

    await tx.arenaMatchQuestion.update({
      where: {
        id: matchQuestionId,
      },

      data: {
        status: "finished",
        finishedAt: now,
      },
    });

    const matchResult = await finishArenaMatch(tx, match.id);

    return {
      answer,
      result: "wrong",
      questionFinished: true,
      playerLives,
      opponentLives: opponent.lives,
      match: matchResult,
    };

    // ==========================================
    // FINISH QUESTION
    // ==========================================

    await tx.arenaMatchQuestion.update({
      where: {
        id: matchQuestionId,
      },

      data: {
        status: "finished",
        finishedAt: now,
      },
    });

    return {
      answer,
      result: "wrong",
      questionFinished: true,
      playerLives,
      opponentLives,
      match: matchResult,
    };
  });
};

const finishArenaMatch = async (tx, matchId) => {
  const players = await tx.arenaMatchPlayer.findMany({
    where: {
      matchId,
    },
  });

  if (players.length !== 2) {
    throw new AppError("Arena match must have exactly two players", 400);
  }

  const [player1, player2] = players;

  let winnerId = null;

  if (player1.lives <= 0 && player2.lives <= 0) {
    await tx.arenaMatchPlayer.updateMany({
      where: {
        matchId,
      },
      data: {
        status: "draw",
        isWinner: false,
      },
    });
  } else if (player1.lives <= 0) {
    winnerId = player2.userId;

    await tx.arenaMatchPlayer.update({
      where: {
        id: player1.id,
      },
      data: {
        status: "eliminated",
        isWinner: false,
      },
    });

    await tx.arenaMatchPlayer.update({
      where: {
        id: player2.id,
      },
      data: {
        status: "winner",
        isWinner: true,
      },
    });
  } else if (player2.lives <= 0) {
    winnerId = player1.userId;

    await tx.arenaMatchPlayer.update({
      where: {
        id: player2.id,
      },
      data: {
        status: "eliminated",
        isWinner: false,
      },
    });

    await tx.arenaMatchPlayer.update({
      where: {
        id: player1.id,
      },
      data: {
        status: "winner",
        isWinner: true,
      },
    });
  }

  if (!winnerId && player1.lives > 0 && player2.lives > 0) {
    return {
      finished: false,
      winnerId: null,
      isDraw: false,
    };
  }

  await tx.arenaMatch.update({
    where: {
      id: matchId,
    },
    data: {
      status: "finished",
      winnerId,
      finishedAt: new Date(),
    },
  });

  return {
    finished: true,
    winnerId,
    isDraw: !winnerId,
  };
};

const finishArenaQuestionByTimeout = async (matchId, matchQuestionId) => {
  return await prisma.$transaction(async (tx) => {
    const matchQuestion = await tx.arenaMatchQuestion.findUnique({
      where: {
        id: matchQuestionId,
      },

      include: {
        match: {
          include: {
            players: true,
          },
        },

        answers: true,
      },
    });

    if (!matchQuestion) {
      throw new AppError("Match question not found", 404);
    }

    if (matchQuestion.matchId !== matchId) {
      throw new AppError("Match question does not belong to this match", 400);
    }

    if (matchQuestion.status !== "active") {
      throw new AppError("Question is not active", 400);
    }

    if (!matchQuestion.startedAt) {
      throw new AppError("Question has not started", 400);
    }

    if (matchQuestion.match.status !== "playing") {
      throw new AppError("Match is not playing", 400);
    }

    const now = new Date();

    const elapsedMs = now.getTime() - matchQuestion.startedAt.getTime();

    const timeLimitMs = matchQuestion.timeLimit * 1000;

    if (elapsedMs < timeLimitMs) {
      throw new AppError("Question time has not expired", 400);
    }

    const players = matchQuestion.match.players;

    if (players.length !== 2) {
      throw new AppError("Invalid number of players", 400);
    }

    const answeredPlayerIds = new Set(
      matchQuestion.answers.map((answer) => answer.playerId),
    );

    const playersToLoseLife = [];

    for (const player of players) {
      if (!answeredPlayerIds.has(player.userId)) {
        playersToLoseLife.push(player);
      }
    }

    for (const player of playersToLoseLife) {
      await tx.arenaMatchPlayer.update({
        where: {
          id: player.id,
        },

        data: {
          lives: Math.max(player.lives - 1, 0),
          status: "playing",
        },
      });
    }

    await tx.arenaMatchQuestion.update({
      where: {
        id: matchQuestionId,
      },

      data: {
        status: "finished",
        finishedAt: now,
      },
    });

    const matchResult = await finishArenaMatch(tx, matchQuestion.match.id);

    return {
      questionFinished: true,
      result: "timeout",
      playersWhoLostLife: playersToLoseLife.map((player) => ({
        playerId: player.userId,
        lives: Math.max(player.lives - 1, 0),
      })),
      match: matchResult,
    };
  });
};

const startNextArenaQuestion = async (matchId) => {
  return await prisma.$transaction(async (tx) => {
    const match = await tx.arenaMatch.findUnique({
      where: {
        id: matchId,
      },

      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!match) {
      throw new AppError("Match not found", 404);
    }

    if (match.status !== "playing") {
      throw new AppError("Match is not playing", 400);
    }

    const nextQuestion = match.questions.find(
      (question) => question.status === "pending",
    );

    if (!nextQuestion) {
      await tx.arenaMatch.update({
        where: {
          id: matchId,
        },

        data: {
          status: "finished",
          finishedAt: new Date(),
        },
      });

      return {
        matchFinished: true,
        question: null,
      };
    }

    const startedAt = new Date();

    await tx.arenaMatchPlayer.updateMany({
      where: {
        matchId,
        lives: {
          gt: 0,
        },
      },

      data: {
        status: "playing",
      },
    });

    const startedQuestion = await tx.arenaMatchQuestion.update({
      where: {
        id: nextQuestion.id,
      },

      data: {
        status: "active",
        startedAt,
      },

      select: {
        id: true,
        matchId: true,
        questionId: true,
        order: true,
        timeLimit: true,
        status: true,
        startedAt: true,
        finishedAt: true,
        winnerId: true,

        question: {
          select: {
            id: true,
            questionText: true,
            questionImage: true,
            options: true,
            correctAnswer: true,
          },
        },
      },
    });

    return {
      matchFinished: false,
      question: startedQuestion,
    };
  });
};

module.exports = {
  createArenaMatch,
  getArenaMatchById,
  startArenaQuestion,
  startArenaMatch,
  finishArenaMatch,
  submitArenaAnswer,
  finishArenaQuestionByTimeout,
  startNextArenaQuestion,
};
