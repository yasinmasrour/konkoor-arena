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
  const result = await questionService.getQuestions(req.query);

  res.status(200).json(result);
});

const getQuestionById = asyncHandler(async (req, res) => {
  const question = await questionService.getQuestionById(req.params.id);

  res.status(200).json({
    question,
  });
});

const updateQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.updateQuestion(
    req.params.id,
    req.body,
  );

  res.status(200).json({
    message: "Question updated successfully",

    question,
  });
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
  deleteQuestion,
};
