const arenaMatchService = require("../services/arenaMatchService");
const arenaTimerManager = require("./arenaTimerManager");

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
  const result = await arenaMatchService.submitArenaAnswer({
    matchId,
    matchQuestionId,
    playerId,
    selectedAnswer,
  });

  if (result.questionFinished && result.match?.status !== "finished") {
    arenaTimerManager.cancelQuestionTimer(matchId, matchQuestionId);

    const nextQuestion =
      await arenaMatchService.startNextArenaQuestion(matchId);

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

  const question = result.question;

  arenaTimerManager.startQuestionTimer({
    matchId,
    matchQuestionId: question.id,
    timeLimit: question.timeLimit,

    onTimeout: async () => {
      await handleQuestionTimeout(matchId, question.id);
    },
  });

  return result;
};

module.exports = {
  startMatch,
  submitAnswer,
  handleQuestionTimeout,
};
