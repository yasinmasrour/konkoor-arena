const personalExamService = require("../services/personalExamService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== 🔹 آزمون‌های من ====================
const getMyExams = asyncHandler(async (req, res) => {
  const result = await personalExamService.getMyExams({
    studentId: req.user.id,
    status: req.query.status,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

// ==================== 🔹 شروع آزمون ====================
const startExam = asyncHandler(async (req, res) => {
  const result = await personalExamService.startExam({
    personalExamId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json(result);
});

// ==================== 🔹 سوال فعلی ====================
const getCurrentQuestion = asyncHandler(async (req, res) => {
  const order = Number(req.query.order);
  if (!order) {
    throw new (require("../utils/appError"))("order الزامی است", 400);
  }

  const question = await personalExamService.getCurrentQuestion({
    personalExamId: req.params.id,
    userId: req.user.id,
    order,
  });
  res.status(200).json({ question });
});

// ==================== 🔹 ثبت پاسخ ====================
const submitAnswer = asyncHandler(async (req, res) => {
  const result = await personalExamService.submitAnswer({
    personalExamId: req.params.id,
    userId: req.user.id,
    questionId: req.body.questionId,
    selectedAnswer: req.body.selectedAnswer,
    timeSpentMs: req.body.timeSpentMs,
  });
  res.status(200).json(result);
});

// ==================== 🔹 پایان آزمون ====================
const submitExam = asyncHandler(async (req, res) => {
  const result = await personalExamService.submitExam({
    personalExamId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json({
    message: "آزمون تموم شد",
    ...result,
  });
});

// ==================== 🔹 نتیجه آزمون ====================
const getExamResult = asyncHandler(async (req, res) => {
  const result = await personalExamService.getExamResult({
    personalExamId: req.params.id,
    userId: req.user.id,
    userRole: req.user.role,
  });
  res.status(200).json(result);
});

// ==================== 🔹 لغو آزمون ====================
const abandonExam = asyncHandler(async (req, res) => {
  await personalExamService.abandonExam({
    personalExamId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json({ message: "آزمون لغو شد" });
});

module.exports = {
  getMyExams,
  startExam,
  getCurrentQuestion,
  submitAnswer,
  submitExam,
  getExamResult,
  abandonExam,
};
