const questionService = require("../services/questionService");
const asyncHandler = require("../utils/asyncHandler");

const createQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.createQuestion({
    ...req.body,
    createdBy: req.user.id,
  });

  res.status(201).json({
    message: "Question created successfully",
    question,
  });
});

const getQuestions = asyncHandler(async (req, res) => {
  const result = await questionService.getQuestions(req.query, req.user);

  res.status(200).json(result);
});

const getQuestionById = asyncHandler(async (req, res) => {
  const question = await questionService.getQuestionById(req.params.id, req.user);

  res.status(200).json({
    question,
  });
});

const updateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.updateQuestion(
    req.params.id,
    req.body,
    req.user,
  );

  res.status(200).json({
    message: "Question updated successfully",

    question,
  });
});

const submitQuestionForReview = asyncHandler(async (req, res) => {
  const question = await questionService.submitQuestionForReview(
    req.params.id,
    req.user,
  );

  res.status(200).json({
    message: "Question submitted for review",
    question,
  });
});

const setQuestionStatus = asyncHandler(async (req, res) => {
  const question = await questionService.setQuestionStatus(
    req.params.id,
    req.body.status,
    req.user,
  );

  res.status(200).json({
    message: "Question status updated successfully",
    question,
  });
});

const duplicateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.duplicateQuestion(
    req.params.id,
    req.user,
  );

  res.status(201).json({
    message: "Question duplicated successfully",
    question,
  });
});

const bulkSetQuestionStatus = asyncHandler(async (req, res) => {
  const questions = await questionService.bulkSetQuestionStatus(
    req.body.ids,
    req.body.status,
    req.user,
  );

  res.status(200).json({
    message: "Question statuses updated successfully",
    questions,
  });
});


const exportQuestions = asyncHandler(async (req, res) => {
  const result = await questionService.exportQuestions(req.query, req.user);
  res.status(200);
  res.setHeader("Content-Type", result.format === "xlsx"
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
  res.setHeader("X-Exported-Count", String(result.count));
  res.send(result.buffer);
});


const getQuestionAnalytics = asyncHandler(async (req, res) => {
  const analytics = await questionService.getQuestionAnalytics(req.user);
  res.status(200).json({ analytics });
});

const deleteQuestion = asyncHandler(async (req, res) => {
  await questionService.deleteQuestion(req.params.id);

  res.status(200).json({
    message: "Question deleted successfully",
  });
});

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  submitQuestionForReview,
  setQuestionStatus,
  duplicateQuestion,
  bulkSetQuestionStatus,
  deleteQuestion,
  exportQuestions,
  getQuestionAnalytics,
};
