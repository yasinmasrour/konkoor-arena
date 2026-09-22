const designerService = require("../services/designerService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== آمار ====================
const getStats = asyncHandler(async (req, res) => {
  const stats = await designerService.getDesignerStats(req.user.id);
  res.status(200).json(stats);
});

// ==================== لیست سوالات ====================
const listQuestions = asyncHandler(async (req, res) => {
  const result = await designerService.listDesignerQuestions({
    userId: req.user.id,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    status: req.query.status,
    lesson: req.query.lesson,
    difficulty: req.query.difficulty,
  });
  res.status(200).json(result);
});

module.exports = { getStats, listQuestions };
