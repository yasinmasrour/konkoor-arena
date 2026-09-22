const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const {
  NOTIFICATION_TYPES,
  NOTIFICATION_ICONS,
} = require("../constants/notification");

// ==================== ساخت اعلان ====================
/**
 * ساخت یه اعلان جدید
 */
const createNotification = async ({
  userId,
  type,
  title,
  message,
  link = null,
  icon = null,
  metadata = null,
}) => {
  if (!userId || !type || !title || !message) {
    throw new AppError("userId, type, title و message الزامی هستند", 400);
  }

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      icon: icon || NOTIFICATION_ICONS[type] || "bell",
      metadata,
    },
  });
};

// ==================== ساخت چند اعلان همزمان ====================
const createManyNotifications = async (notifications) => {
  if (!notifications.length) return { count: 0 };

  const data = notifications.map((n) => ({
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link || null,
    icon: n.icon || NOTIFICATION_ICONS[n.type] || "bell",
    metadata: n.metadata || null,
  }));

  return prisma.notification.createMany({ data });
};

// ==================== لیست اعلان‌های کاربر ====================
const getUserNotifications = async (
  userId,
  { page = 1, limit = 20, onlyUnread = false, type } = {},
) => {
  const where = {
    userId,
    ...(onlyUnread ? { isRead: false } : {}),
    ...(type ? { type } : {}),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId, isRead: false },
    }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==================== تعداد خوانده‌نشده‌ها ====================
const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { unreadCount: count };
};

// ==================== خواندن یه اعلان ====================
const markAsRead = async ({ notificationId, userId }) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new AppError("اعلان پیدا نشد", 404);
  }

  if (notification.isRead) {
    return notification;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

// ==================== خواندن همه اعلان‌ها ====================
const markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return { count: result.count };
};

// ==================== حذف یه اعلان ====================
const deleteNotification = async ({ notificationId, userId }) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    throw new AppError("اعلان پیدا نشد", 404);
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return { success: true };
};

// ==================== حذف همه اعلان‌های خونده‌شده ====================
const deleteReadNotifications = async (userId) => {
  const result = await prisma.notification.deleteMany({
    where: { userId, isRead: true },
  });

  return { count: result.count };
};

// ==================== Helper: ساخت اعلان برای چند کاربر ====================
const notifyManyUsers = async ({
  userIds,
  type,
  title,
  message,
  link = null,
  metadata = null,
}) => {
  if (!userIds.length) return { count: 0 };

  const notifications = userIds.map((userId) => ({
    userId,
    type,
    title,
    message,
    link,
    metadata,
  }));

  return createManyNotifications(notifications);
};

module.exports = {
  createNotification,
  createManyNotifications,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  notifyManyUsers,
};
