const dashboardService = require("../services/dashboardService");
const contactService = require("../services/contactService");
const asyncHandler = require("../utils/asyncHandler");

/**
 * GET /dashboard/student-home
 * آمار صفحه اول داشبورد دانش‌آموز
 */
const getStudentHome = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStudentHomeData(req.user.id);
  res.status(200).json(data);
});

/**
 * GET /dashboard/admin-badges
 * فقط ادمین — آمار badgeها برای سایدبار
 */
const getAdminBadges = asyncHandler(async (req, res) => {
  const contactStats = await contactService.getContactStats();
  res.status(200).json({
    contactMessages: contactStats.newCount,
  });
});

module.exports = {
  getStudentHome,
  getAdminBadges,
};
