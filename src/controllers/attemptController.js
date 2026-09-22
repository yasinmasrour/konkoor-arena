const attemptService = require("../services/attemptService");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const startAttempt = asyncHandler(async (req, res) => {
  const result = await attemptService.startAttempt(
    req.user.id,
    req.params.examId,
    req.user.role, // 🆕
  );

  res.status(201).json({
    message: "Attempt started successfully",
    result,
  });
});

const getAttemptQuestions = asyncHandler(async (req, res) => {
  const result = await attemptService.getAttemptQuestions(
    req.params.attemptId,
    req.user.id,
    req.user.role, // 🆕
  );

  res.status(200).json(result);
});

const submitAnswer = asyncHandler(async (req, res) => {
  const { questionId, selectedAnswer } = req.body;

  if (!questionId) {
    throw new AppError("questionId الزامی است", 400);
  }
  if (
    selectedAnswer !== null &&
    selectedAnswer !== undefined &&
    (typeof selectedAnswer !== "number" || selectedAnswer < 0)
  ) {
    throw new AppError(
      "selectedAnswer must be a non-negative number or null",
      400,
    );
  }

  const answer = await attemptService.submitAnswer(
    req.params.attemptId,
    req.user.id,
    { questionId, selectedAnswer },
    req.user.role, // 🆕
  );

  res.status(200).json({
    message: "Answer submitted successfully",
    answer,
  });
});

const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await attemptService.submitAttempt(
    req.params.id,
    req.user.id,
  );

  res.status(200).json({
    message: "Attempt submitted successfully",
    attempt,
  });
});

const getAttemptResult = asyncHandler(async (req, res) => {
  const result = await attemptService.getAttemptResult(
    req.params.id,
    req.user.id,
  );

  res.status(200).json(result);
});

const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await attemptService.getMyAttempts(req.user.id);

  res.status(200).json({
    attempts,
  });
});

const getAttemptReview = asyncHandler(async (req, res) => {
  const review = await attemptService.getAttemptReview(
    req.params.id,
    req.user.id,
  );

  res.status(200).json(review);
});

const toggleFlag = asyncHandler(async (req, res) => {
  const { questionId } = req.body;

  if (!questionId) {
    throw new AppError("questionId الزامی است", 400);
  }

  const answer = await attemptService.toggleFlag(
    req.params.id,
    req.user.id,
    questionId,
    req.user.role, // 🆕
  );

  res.status(200).json({
    message: answer.isFlagged ? "سوال علامت‌گذاری شد" : "علامت برداشته شد",
    isFlagged: answer.isFlagged,
  });
});

module.exports = {
  startAttempt,
  getAttemptQuestions,
  submitAnswer,
  submitAttempt,
  getAttemptResult,
  getMyAttempts,
  getAttemptReview,
  toggleFlag,
};
