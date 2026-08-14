const arenaMatchService = require("../services/arenaMatchService");
const asyncHandler = require("../utils/asyncHandler");

const createMatch = asyncHandler(async (req, res) => {
  const match = await arenaMatchService.createArenaMatch(
    req.user.id,
    req.body.opponentId,
    req.body.leagueId,
  );

  res.status(201).json({
    message: "Arena match created successfully",
    match,
  });
});

const getMatchById = asyncHandler(async (req, res) => {
  const match = await arenaMatchService.getArenaMatchById(req.params.id);

  res.status(200).json({
    match,
  });
});

const startArenaMatch = asyncHandler(async (req, res) => {
  const result = await arenaMatchService.startArenaMatch(
    req.params.id,
  );

  res.status(200).json({
    message: "Arena match started successfully",
    ...result,
  });
});

const startQuestion = asyncHandler(async (req, res) => {
  const question = await arenaMatchService.startArenaQuestion(
    req.params.id,
    req.params.questionId,
  );

  res.status(200).json({
    message: "Arena question started successfully",
    question,
  });
});

const submitAnswer = asyncHandler(async (req, res) => {
  const result = await arenaMatchService.submitArenaAnswer({
    matchId: req.params.id,
    matchQuestionId: req.body.matchQuestionId,
    playerId: req.user.id,
    selectedAnswer: req.body.selectedAnswer,
  });

  res.status(200).json({
    message: "Answer submitted successfully",
    ...result,
  });
});

const finishQuestionByTimeout = asyncHandler(async (req, res) => {
  const result =
    await arenaMatchService.finishArenaQuestionByTimeout(
      req.params.id,
      req.params.questionId,
    );

  res.status(200).json({
    message: "Arena question finished by timeout",
    ...result,
  });
});

module.exports = {
  createMatch,
  getMatchById,
  startArenaMatch,
  startQuestion,
  submitAnswer,
  finishQuestionByTimeout,
};
