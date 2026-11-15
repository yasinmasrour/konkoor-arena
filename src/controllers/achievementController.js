const achievementService = require("../services/achievementService");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

// ==================== GET /api/achievements ====================
/**
 * همه‌ی خانواده‌های دستاورد + tierهاشون + وضعیت کاربر.
 * برای صفحه‌ی «دستاوردهای من».
 */
const getMyAchievements = asyncHandler(async (req, res) => {
  const data = await achievementService.getMyAchievements(req.user.id);

  res.json({
    families: data.families,
    stats: data.stats,
  });
});

// ==================== GET /api/achievements/new ====================
/**
 * دستاوردهای جدید (unlock شده ولی دیده نشده).
 * برای نمایش toast بعد از unlock.
 */
const getNewAchievements = asyncHandler(async (req, res) => {
  const achievements = await achievementService.getNewAchievements(req.user.id);

  res.json({ achievements });
});

// ==================== POST /api/achievements/mark-seen ====================
/**
 * همه‌ی دستاوردهای دیده‌نشده رو «دیده‌شده» کن.
 */
const markAllSeen = asyncHandler(async (req, res) => {
  await achievementService.markAllSeen(req.user.id);

  res.json({ ok: true });
});

// ==================== GET /api/achievements/stats ====================
/**
 * فقط آمار کاربر (بدون دستاوردها).
 * برای نمایش توی پروفایل و Dashboard.
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await achievementService.getUserStats(req.user.id);

  res.json({ stats });
});

// ==================== GET /api/achievements/leaderboard ====================
/**
 * رتبه‌بندی کاربران بر اساس امتیاز.
 * (اختیاری)
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const leaderboard = await achievementService.getLeaderboard(limit);

  res.json({ leaderboard });
});

module.exports = {
  getMyAchievements,
  getNewAchievements,
  markAllSeen,
  getStats,
  getLeaderboard,
};
