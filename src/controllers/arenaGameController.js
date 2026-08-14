const arenaGameEngine = require("../arena/arenaGameEngine");
const asyncHandler = require("../utils/asyncHandler");

const startMatch = asyncHandler(async (req, res) => {
  const result = await arenaGameEngine.startMatch(req.params.id);

  res.status(200).json({
    message: "Arena match started successfully",
    ...result,
  });
});

const submitAnswer = asyncHandler(async (req, res) => {
  const result = await arenaGameEngine.submitAnswer({
    matchId: req.params.id,
    matchQuestionId: req.params.questionId,
    playerId: req.user.id,
    selectedAnswer: req.body.selectedAnswer,
  });

  res.status(200).json(result);
});

const timeoutQuestion = asyncHandler(async (req, res) => {
  const result = await arenaGameEngine.handleQuestionTimeout(
    req.params.id,
    req.params.questionId,
  );

  res.status(200).json(result);
});

module.exports = {
  startMatch,
  submitAnswer,
  timeoutQuestion,
};
