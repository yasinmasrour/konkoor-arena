const express = require("express");
const protect = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

router.use(protect);

// 🔹 لیست اعلان‌ها
router.get("/", notificationController.getMyNotifications);

// 🔹 تعداد خوانده‌نشده‌ها
router.get("/unread-count", notificationController.getUnreadCount);

// 🔹 خواندن همه
router.patch("/read-all", notificationController.markAllAsRead);

// 🔹 خواندن یه اعلان
router.patch("/:id/read", notificationController.markAsRead);

// 🔹 حذف یه اعلان
router.delete("/:id", notificationController.deleteNotification);

// 🔹 حذف همه خونده‌شده‌ها
router.delete("/read/clear", notificationController.deleteReadNotifications);

module.exports = router;
