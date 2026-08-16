const arenaMatchService = require("../services/arenaMatchService");
const arenaTimerManager = require("./arenaTimerManager");
const arenaSocketEvents = require("../socket/arenaSocketEvents");

const startMatch = async (matchId) => {
  const match = await arenaMatchService.getArenaMatchById(matchId);

  if (match.status !== "waiting") {
    throw new Error("Match cannot be started");
  }

  const players = match.players;

  if (players.length !== 2) {
    throw new Error("Match requires exactly two players");
  }

  await arenaMatchService.startArenaMatch(matchId);

  const question = await startQuestionWithTimer(matchId);

  return {
    matchId,
    question,
  };
};

const submitAnswer = async ({
  matchId,
  matchQuestionId,
  playerId,
  selectedAnswer,
}) => {
  const result =
    await arenaMatchService.submitArenaAnswer({
      matchId,
      matchQuestionId,
      playerId,
      selectedAnswer,
    });

  // Answer ثبت شده؛ Timer این سؤال دیگر نباید اجرا شود.
  arenaTimerManager.cancelQuestionTimer(
    matchId,
    matchQuestionId,
  );

  // نتیجه پاسخ را بلافاصله برای بازیکنان ارسال کن.
  emitAnswerResult({
    matchId,
    result,
    playerId,
  });

  // اگر سؤال تمام شده ولی Match تمام نشده،
  // سؤال بعدی را شروع کن.
  if (
    result.questionFinished &&
    !result.match?.finished
  ) {
    const nextQuestion =
      await arenaMatchService.startNextArenaQuestion(
        matchId,
      );

    if (
      !nextQuestion.matchFinished &&
      nextQuestion.question
    ) {
      const payload =
        buildArenaQuestionPayload({
          matchQuestion: nextQuestion.question,
          question: nextQuestion.question.question,
        });

      emitQuestionStarted({
        matchId,
        question: payload,
      });

      startTimerForQuestion({
        matchId,
        question: nextQuestion.question,
      });
    }

    return {
      ...result,
      nextQuestion,
    };
  }

  return result;
};

const handleQuestionTimeout = async (matchId, matchQuestionId) => {
  const result = await arenaMatchService.finishArenaQuestionByTimeout(
    matchId,
    matchQuestionId,
  );

  if (result.match?.status === "finished") {
    return result;
  }

  const nextQuestion = await arenaMatchService.startNextArenaQuestion(matchId);

  return {
    ...result,
    nextQuestion,
  };
};

const startQuestionWithTimer = async (matchId) => {
  const result = await arenaMatchService.startNextArenaQuestion(matchId);

  if (result.matchFinished || !result.question) {
    return result;
  }

  const payload = buildArenaQuestionPayload({
    matchQuestion: result.question,
    question: result.question.question,
  });

  emitQuestionStarted({
    matchId,
    question: payload,
  });

  startTimerForQuestion({
    matchId,
    question: result.question,
  });

  return result;
};

const startTimerForQuestion = ({ matchId, question }) => {
  arenaTimerManager.startQuestionTimer({
    matchId,
    matchQuestionId: question.id,
    timeLimit: question.timeLimit,

    onTimeout: async () => {
      await handleQuestionTimeout(matchId, question.id);
    },
  });
};

const emitQuestionStarted = ({ matchId, question }) => {
  arenaSocketEvents.emit("question-started", {
    matchId,
    question,
  });
};

const sanitizeArenaQuestion = (question) => {
  return {
    id: question.id,
    questionText: question.questionText,
    questionImage: question.questionImage,
    options: question.options,
  };
};

const buildArenaQuestionPayload = ({ matchQuestion, question }) => {
  return {
    matchQuestionId: matchQuestion.id,
    questionId: question.id,
    order: matchQuestion.order,
    timeLimit: matchQuestion.timeLimit,
    startedAt: matchQuestion.startedAt,

    question: {
      id: question.id,
      questionText: question.questionText,
      questionImage: question.questionImage,
      options: question.options,
    },
  };
};

const buildArenaAnswerResultPayload = ({
  result,
  playerId,
}) => {
  return {
    playerId,

    result: result.result,

    isCorrect: result.answer.isCorrect,

    selectedAnswer: result.answer.selectedAnswer,

    responseTimeMs: result.answer.responseTimeMs,

    questionFinished: result.questionFinished,

    playerLives: result.playerLives ?? null,

    opponentLives: result.opponentLives ?? null,

    match: result.match
      ? {
          finished: result.match.finished,
          winnerId: result.match.winnerId,
          isDraw: result.match.isDraw,
        }
      : null,
  };
};

const emitAnswerResult = ({ matchId, result, playerId }) => {
  const payload = buildArenaAnswerResultPayload({
    result,
    playerId,
  });

  arenaSocketEvents.emit("answer-result", {
    matchId,
    result: payload,
  });
};

module.exports = {
  startMatch,
  submitAnswer,
  handleQuestionTimeout,
  emitQuestionStarted,
  sanitizeArenaQuestion,
  buildArenaQuestionPayload,
  buildArenaAnswerResultPayload,
  emitAnswerResult,
  startTimerForQuestion,
};
