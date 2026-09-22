const strategyService = require("../services/strategyService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== 🔹 لیست برنامه‌های منتشرشده ====================
const getPublishedPlans = asyncHandler(async (req, res) => {
  const result = await strategyService.getPublishedPlans({
    grade: req.query.grade,
    major: req.query.major,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

// ==================== 🔹 جزئیات یه برنامه ====================
const getPublishedPlanById = asyncHandler(async (req, res) => {
  const plan = await strategyService.getPublishedPlanById(req.params.id);
  res.status(200).json({ plan });
});

// ==================== 🔹 بهترین برنامه برای کاربر ====================
const getBestPlanForMe = asyncHandler(async (req, res) => {
  const result = await strategyService.getBestPlanForUser(req.user.id);
  res.status(200).json(result);
});

module.exports = {
  getPublishedPlans,
  getPublishedPlanById,
  getBestPlanForMe,
};
