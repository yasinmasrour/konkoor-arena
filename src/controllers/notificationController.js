const notificationService = require("../services/notificationService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== لیست اعلان‌ها ====================
const getMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit, onlyUnread, type } = req.query;

  const result = await notificationService.getUserNotifications(req.user.id, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    onlyUnread: onlyUnread === "true",
    type,
  });

  res.status(200).json(result);
});

// ==================== تعداد خوانده‌نشده‌ها ====================
const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user.id);
  res.status(200).json(result);
});

// ==================== خواندن یه اعلان ====================
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead({
    notificationId: req.params.id,
    userId: req.user.id,
  });

  res.status(200).json({
    message: "اعلان خوانده شد",
    notification,
  });
});

// ==================== خواندن همه ====================
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  res.status(200).json({
    message: `${result.count} اعلان خوانده شد`,
    count: result.count,
  });
});

// ==================== حذف یه اعلان ====================
const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification({
    notificationId: req.params.id,
    userId: req.user.id,
  });

  res.status(200).json({ message: "اعلان حذف شد" });
});

// ==================== حذف همه خونده‌شده‌ها ====================
const deleteReadNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteReadNotifications(req.user.id);
  res.status(200).json({
    message: `${result.count} اعلان حذف شد`,
    count: result.count,
  });
});

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
};
