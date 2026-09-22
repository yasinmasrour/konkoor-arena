const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const arenaRatingService = require("./arenaRatingService");

const runArenaTransaction = async (callback) => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await prisma.$transaction(callback, {
        isolationLevel: "Serializable",
        maxWait: 5000,
        timeout: 10000,
      });
    } catch (error) {
      // PostgreSQL can abort one of two truly simultaneous Arena actions
      // under Serializable isolation. Retrying makes the action naturally
      // converge on the committed match/question state.
      if (error?.code !== "P2034" || attempt === 3) {
        throw error;
      }
    }
  }
};

const normalizeLesson = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\u200c\u200d\s]+/g, "");

const getLessonAliases = (lesson) => {
  const normalized = normalizeLesson(lesson);

  const groups = [
    ["mathematics", "math", "ریاضی"],
    ["physics", "فیزیک"],
    ["chemistry", "شیمی"],
    ["biology", "زیست", "زیست‌شناسی"],
  ];

  for (const group of groups) {
    if (group.some((item) => normalizeLesson(item) === normalized)) {
      return new Set(group.map(normalizeLesson));
    }
  }

  return new Set([normalized]);
};

const selectArenaQuestions = async (tx, lesson) => {
  const publishedQuestions = await tx.question.findMany({
    where: {
      status: "published",
      isArena: true,
    },
    select: { id: true, lesson: true },
  });

  const aliases = getLessonAliases(lesson);
  const lessonQuestions = publishedQuestions.filter((question) =>
    aliases.has(normalizeLesson(question.lesson)),
  );

  const pool =
    lessonQuestions.length >= 5 ? lessonQuestions : publishedQuestions;

  if (pool.length < 5) {
    throw new AppError(
      `Not enough published Arena questions available. Required: 5, available: ${pool.length}.`,
      400,
    );
  }

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 5).map((question) => question.id);
};

const createArenaMatchTx = async (
  tx,
  userId1,
  userId2,
  leagueId,
  { isFriendly = false } = {},
) => {
  if (userId1 === userId2) {
    throw new AppError("Players must be different", 400);
  }

  const [league, users] = await Promise.all([
    tx.arenaLeague.findUnique({ where: { id: leagueId } }),
    tx.user.findMany({
      where: { id: { in: [userId1, userId2] } },
      select: { id: true },
    }),
  ]);

  if (!league) throw new AppError("League not found", 404);

  const now = new Date();
  if (
    league.status !== "active" ||
    now < league.startDate ||
    now > league.endDate
  ) {
    throw new AppError("League is not active", 400);
  }

  if (users.length !== 2) {
    throw new AppError("One or both players not found", 404);
  }

  const activeMatch = await tx.arenaMatch.findFirst({
    where: {
      status: { in: ["waiting", "playing"] },
      players: { some: { userId: { in: [userId1, userId2] } } },
    },
    select: { id: true, players: { select: { userId: true } } },
  });

  if (activeMatch) {
    const playerAlreadyMatched = activeMatch.players.some(
      (player) => player.userId === userId1,
    );
    throw new AppError(
      playerAlreadyMatched
        ? "Player already has an active match"
        : "Opponent already has an active match",
      400,
    );
  }

  const questionIds = await selectArenaQuestions(tx, league.lesson);

  await arenaRatingService.ensurePlayerRatingsTx(tx, leagueId, [
    userId1,
    userId2,
  ]);

  return tx.arenaMatch.create({
    data: {
      leagueId,
      status: "waiting",
      isFriendly, // 🆕
      players: {
        create: [
          { userId: userId1, lives: 3 },
          { userId: userId2, lives: 3 },
        ],
      },
      questions: {
        create: questionIds.map((questionId, index) => ({
          questionId,
          order: index + 1,
          timeLimit: 60,
        })),
      },
    },
    include: {
      players: true,
      questions: { orderBy: { order: "asc" } },
    },
  });
};

const createArenaMatch = async (userId1, userId2, leagueId) =>
  runArenaTransaction((tx) =>
    createArenaMatchTx(tx, userId1, userId2, leagueId),
  );

const getArenaMatchById = async (matchId, userId) => {
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

          startedAt: true,

          status: true,

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
    throw new AppError("Arena match not found", 404);
  }

  const isPlayer = match.players.some((player) => player.userId === userId);

  if (!isPlayer) {
    throw new AppError("Forbidden", 403);
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
    id: match.id,

    status: match.status,

    winnerId: match.winnerId,

    startedAt: match.startedAt,

    finishedAt: match.finishedAt,

    league: match.league,

    players: match.players.map((player) => ({
      userId: player.userId,

      firstName: player.user.firstName,

      lastName: player.user.lastName,

      lives: player.lives,

      status: player.status,

      isWinner: player.isWinner,
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
  return await runArenaTransaction(async (tx) => {
    const matchQuestion = await tx.arenaMatchQuestion.findUnique({
      where: { id: matchQuestionId },
      include: {
        match: { include: { players: true } },
        question: { select: { id: true, correctAnswer: true } },
        answers: true,
      },
    });

    if (!matchQuestion) throw new AppError("Match question not found", 404);
    if (matchQuestion.matchId !== matchId) {
      throw new AppError("Match question does not belong to this match", 400);
    }
    if (matchQuestion.status !== "active") {
      throw new AppError("Question is not active", 400);
    }

    const match = matchQuestion.match;
    if (match.status !== "playing")
      throw new AppError("Match is not playing", 400);

    const player = match.players.find((item) => item.userId === playerId);
    if (!player) throw new AppError("Player is not part of this match", 403);
    if (player.status !== "playing")
      throw new AppError("Player is not active", 400);

    if (matchQuestion.answers.some((answer) => answer.playerId === playerId)) {
      throw new AppError("You have already answered this question", 400);
    }

    if (!matchQuestion.startedAt)
      throw new AppError("Question has not started", 400);

    const now = new Date();
    const elapsedMs = now.getTime() - matchQuestion.startedAt.getTime();
    if (elapsedMs >= matchQuestion.timeLimit * 1000) {
      throw new AppError("Question time has expired", 400);
    }

    const isCorrect = selectedAnswer === matchQuestion.question.correctAnswer;
    const answer = await tx.arenaAnswer.create({
      data: {
        matchQuestionId,
        playerId,
        selectedAnswer,
        isCorrect,
        answeredAt: now,
        responseTimeMs: elapsedMs,
      },
    });

    const opponent = match.players.find((item) => item.userId !== playerId);
    if (!opponent) throw new AppError("Opponent not found", 400);

    const opponentAnswer = matchQuestion.answers.find(
      (item) => item.playerId === opponent.userId,
    );

    if (!isCorrect) {
      // A wrong answer locks the player. The life is deducted only when the
      // question is resolved: either the opponent answers correctly, or both
      // players have answered incorrectly.
      await tx.arenaMatchPlayer.update({
        where: { id: player.id },
        data: { status: "locked" },
      });

      if (!opponentAnswer) {
        return {
          answer,
          result: "wrong",
          questionFinished: false,
          playerLives: player.lives,
          opponentLives: opponent.lives,
          match: null,
        };
      }

      // At this point the opponent can only have answered incorrectly. A
      // correct opponent answer would already have atomically finished the
      // question before this request reached this branch.
      const finishedGate = await tx.arenaMatchQuestion.updateMany({
        where: { id: matchQuestionId, status: "active" },
        data: { status: "finished", finishedAt: now },
      });

      if (finishedGate.count === 0) {
        throw new AppError("Question is no longer active", 409);
      }

      const playerLives = Math.max(player.lives - 1, 0);
      const opponentLives = Math.max(opponent.lives - 1, 0);

      await tx.arenaMatchPlayer.update({
        where: { id: player.id },
        data: {
          lives: playerLives,
          status: playerLives > 0 ? "playing" : "eliminated",
        },
      });

      await tx.arenaMatchPlayer.update({
        where: { id: opponent.id },
        data: {
          lives: opponentLives,
          status: opponentLives > 0 ? "playing" : "eliminated",
        },
      });

      const matchResult = await finishArenaMatch(tx, match.id);
      return {
        answer,
        result: "wrong",
        questionFinished: true,
        playerLives,
        opponentLives,
        match: matchResult,
      };
    }

    // The first correct answer atomically claims the active question.
    const finishedGate = await tx.arenaMatchQuestion.updateMany({
      where: { id: matchQuestionId, status: "active" },
      data: {
        status: "finished",
        finishedAt: now,
        winnerId: playerId,
      },
    });

    if (finishedGate.count === 0) {
      throw new AppError("Question is no longer active", 409);
    }

    // A correct answer costs the opponent one life whether they had not
    // answered yet or had already answered incorrectly. The only case where
    // no life is deducted is impossible here for a correct opponent answer,
    // because the first correct answer atomically finishes the question.
    let opponentLives = opponent.lives;
    if (!opponentAnswer || !opponentAnswer.isCorrect) {
      opponentLives = Math.max(opponent.lives - 1, 0);
      await tx.arenaMatchPlayer.update({
        where: { id: opponent.id },
        data: {
          lives: opponentLives,
          status: opponentLives > 0 ? "locked" : "eliminated",
        },
      });
    }

    const matchResult = await finishArenaMatch(tx, match.id);

    return {
      answer,
      result: "correct",
      questionFinished: true,
      playerLives: player.lives,
      opponentLives,
      match: matchResult,
    };
  });
};

const finishArenaMatch = async (tx, matchId, { forceFinish = false } = {}) => {
  const match = await tx.arenaMatch.findUnique({
    where: { id: matchId },
    include: {
      players: true,
      questions: { select: { status: true, winnerId: true } },
    },
  });

  if (!match) throw new AppError("Arena match not found", 404);

  if (match.status === "finished") {
    return {
      finished: true,
      winnerId: match.winnerId,
      isDraw: !match.winnerId,
      alreadyFinished: true,
      rating: null,
    };
  }

  if (match.players.length !== 2) {
    throw new AppError("Arena match must have exactly two players", 400);
  }

  const [player1, player2] = match.players;
  let winnerId = null;

  if (player1.lives <= 0 && player2.lives <= 0) {
    // Draw.
  } else if (player1.lives <= 0) {
    winnerId = player2.userId;
  } else if (player2.lives <= 0) {
    winnerId = player1.userId;
  } else if (forceFinish) {
    // After all five questions: remaining lives are the primary score.
    // Question wins break a tie. If both are still equal, it is a draw.
    if (player1.lives > player2.lives) {
      winnerId = player1.userId;
    } else if (player2.lives > player1.lives) {
      winnerId = player2.userId;
    } else {
      const wins1 = match.questions.filter(
        (q) => q.winnerId === player1.userId,
      ).length;
      const wins2 = match.questions.filter(
        (q) => q.winnerId === player2.userId,
      ).length;
      if (wins1 > wins2) winnerId = player1.userId;
      else if (wins2 > wins1) winnerId = player2.userId;
    }
  }

  if (!winnerId && player1.lives > 0 && player2.lives > 0 && !forceFinish) {
    return { finished: false, winnerId: null, isDraw: false, rating: null };
  }

  const finishedAt = new Date();
  const finishedGate = await tx.arenaMatch.updateMany({
    where: { id: matchId, status: "playing" },
    data: { status: "finished", winnerId, finishedAt },
  });

  if (finishedGate.count === 0) {
    const currentMatch = await tx.arenaMatch.findUnique({
      where: { id: matchId },
    });
    return {
      finished: currentMatch?.status === "finished",
      winnerId: currentMatch?.winnerId ?? null,
      isDraw: !currentMatch?.winnerId,
      alreadyFinished: true,
      rating: null,
    };
  }

  if (!winnerId) {
    await tx.arenaMatchPlayer.updateMany({
      where: { matchId },
      data: { status: "draw", isWinner: false },
    });
  } else {
    await tx.arenaMatchPlayer.update({
      where: { id: player1.id },
      data: {
        status: player1.userId === winnerId ? "winner" : "eliminated",
        isWinner: player1.userId === winnerId,
      },
    });
    await tx.arenaMatchPlayer.update({
      where: { id: player2.id },
      data: {
        status: player2.userId === winnerId ? "winner" : "eliminated",
        isWinner: player2.userId === winnerId,
      },
    });
  }

  const finishedMatch = await tx.arenaMatch.findUnique({
    where: { id: matchId },
    include: { players: true },
  });

  const rating = await arenaRatingService.updateRatingsAfterMatchTx(
    tx,
    finishedMatch,
  );

  return { finished: true, winnerId, isDraw: !winnerId, rating };
};

const finishArenaQuestionByTimeout = async (matchId, matchQuestionId) => {
  return await runArenaTransaction(async (tx) => {
    const matchQuestion = await tx.arenaMatchQuestion.findUnique({
      where: { id: matchQuestionId },
      include: {
        match: { include: { players: true } },
        answers: true,
      },
    });

    if (!matchQuestion) throw new AppError("Match question not found", 404);
    if (matchQuestion.matchId !== matchId) {
      throw new AppError("Match question does not belong to this match", 400);
    }
    if (matchQuestion.status !== "active") {
      throw new AppError("Question is not active", 409);
    }
    if (!matchQuestion.startedAt)
      throw new AppError("Question has not started", 400);
    if (matchQuestion.match.status !== "playing") {
      throw new AppError("Match is not playing", 400);
    }

    const now = new Date();
    const elapsedMs = now.getTime() - matchQuestion.startedAt.getTime();
    if (elapsedMs < matchQuestion.timeLimit * 1000) {
      throw new AppError("Question time has not expired", 400);
    }

    if (matchQuestion.match.players.length !== 2) {
      throw new AppError("Invalid number of players", 400);
    }

    // Claim the active question before mutating lives so a duplicate timeout
    // callback can never deduct lives twice.
    const finishedGate = await tx.arenaMatchQuestion.updateMany({
      where: { id: matchQuestionId, status: "active" },
      data: { status: "finished", finishedAt: now },
    });

    if (finishedGate.count === 0) {
      throw new AppError("Question is no longer active", 409);
    }

    // 🆕 FIXED: هر بازیکنی که جواب درست نداده (اشتباه، تایم‌اوت، یا جواب نداده)
    // باید یه جان کم کنه. منطق قبلی فقط کسی که جواب نداده رو penalize می‌کرد
    // و کسی که جواب اشتباه داده بود، نادیده گرفته می‌شد (سناریو ۴).
    const playersWhoLostLife = [];

    for (const player of matchQuestion.match.players) {
      const answer = matchQuestion.answers.find(
        (item) => item.playerId === player.userId,
      );

      // اگه جواب درست داده → معاف
      if (answer?.isCorrect === true) continue;

      // در غیر این صورت (اشتباه، تایم‌اوت، یا جواب نداده) → یه جان کم کن
      const lives = Math.max(player.lives - 1, 0);
      await tx.arenaMatchPlayer.update({
        where: { id: player.id },
        data: {
          lives,
          status: lives > 0 ? "playing" : "eliminated",
        },
      });
      playersWhoLostLife.push({ playerId: player.userId, lives });
    }

    const matchResult = await finishArenaMatch(tx, matchQuestion.match.id);

    return {
      questionFinished: true,
      result: "timeout",
      playersWhoLostLife,
      match: matchResult,
    };
  });
};

const startNextArenaQuestion = async (matchId) => {
  return await runArenaTransaction(async (tx) => {
    const match = await tx.arenaMatch.findUnique({
      where: { id: matchId },
      include: { questions: { orderBy: { order: "asc" } } },
    });

    if (!match) throw new AppError("Match not found", 404);

    if (match.status !== "playing") {
      return {
        matchFinished: match.status === "finished",
        question: null,
        match:
          match.status === "finished"
            ? {
                finished: true,
                winnerId: match.winnerId,
                isDraw: !match.winnerId,
                alreadyFinished: true,
                rating: null,
              }
            : null,
      };
    }

    const nextQuestion = match.questions.find((q) => q.status === "pending");

    if (!nextQuestion) {
      const matchResult = await finishArenaMatch(tx, matchId, {
        forceFinish: true,
      });
      return { matchFinished: true, question: null, match: matchResult };
    }

    const startedAt = new Date();

    await tx.arenaMatchPlayer.updateMany({
      where: { matchId, lives: { gt: 0 } },
      data: { status: "playing" },
    });

    const startedQuestion = await tx.arenaMatchQuestion.update({
      where: { id: nextQuestion.id },
      data: { status: "active", startedAt },
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

    return { matchFinished: false, question: startedQuestion, match: null };
  });
};

module.exports = {
  createArenaMatch,
  createArenaMatchTx,
  getArenaMatchById,
  startArenaMatch,
  finishArenaMatch,
  submitArenaAnswer,
  finishArenaQuestionByTimeout,
  startNextArenaQuestion,
};
