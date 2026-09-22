const soloService = require("../services/soloService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== 🔹 لیست سطحها ====================
const getLevels = asyncHandler(async (req, res) => {
  const levels = soloService.getLevels();
  res.status(200).json({ levels });
});

// ==================== 🔹 شروع بازی ====================
const startSolo = asyncHandler(async (req, res) => {
  const { leagueId, level } = req.body;
  const solo = await soloService.startSolo({
    userId: req.user.id,
    leagueId,
    level,
  });

  // 🔹 سوال اول (sanitize توی Service انجام شده)
  const firstQuestion = solo.questions[0];

  res.status(201).json({
    message: "بازی انفرادی شروع شد",
    solo: {
      id: solo.id,
      level: solo.level,
      status: solo.status,
      correctAnswers: solo.correctAnswers,
      wrongAnswers: solo.wrongAnswers,
      timeouts: solo.timeouts,
      livesRemaining: solo.livesRemaining,
      totalQuestions: solo.questions.length,
      startedAt: solo.startedAt,
      league: {
        id: solo.league.id,
        title: solo.league.title,
        lesson: solo.league.lesson,
      },
    },
    currentQuestion: firstQuestion
      ? {
          order: firstQuestion.order,
          timeLimit: firstQuestion.timeLimit,
          question: firstQuestion.question,
        }
      : null,
  });
});

// ==================== 🔹 وضعیت بازی ====================
const getSoloStatus = asyncHandler(async (req, res) => {
  const result = await soloService.getSoloStatus({
    soloMatchId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json(result);
});

// ==================== 🔹 ثبت پاسخ ====================
const answerSolo = asyncHandler(async (req, res) => {
  const { order, selectedAnswer, timeSpentMs } = req.body;
  const result = await soloService.answerSolo({
    soloMatchId: req.params.id,
    userId: req.user.id,
    order,
    selectedAnswer,
    timeSpentMs,
  });
  res.status(200).json(result);
});

// ==================== 🔹 انصراف ====================
const abandonSolo = asyncHandler(async (req, res) => {
  const result = await soloService.abandonSolo({
    soloMatchId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json({
    message: "بازی لغو شد",
    solo: result,
  });
});

// ==================== 🔹 تاریخچه ====================
const getSoloHistory = asyncHandler(async (req, res) => {
  const result = await soloService.getSoloHistory({
    userId: req.user.id,
    status: req.query.status,
    level: req.query.level,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

// ==================== 🔹 آمار ====================
const getSoloStats = asyncHandler(async (req, res) => {
  const stats = await soloService.getSoloStats(req.user.id);
  res.status(200).json({ stats });
});

module.exports = {
  getLevels,
  startSolo,
  getSoloStatus,
  answerSolo,
  abandonSolo,
  getSoloHistory,
  getSoloStats,
};
