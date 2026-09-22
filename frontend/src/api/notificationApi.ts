import api from "./axios";

// ==================== Types ====================
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  icon: string | null;
  isRead: boolean;
  readAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  onlyUnread?: boolean;
  type?: string;
}

// ==================== API Functions ====================

// 🔹 لیست اعلان‌ها
export const getMyNotifications = async (
  params: GetNotificationsParams = {},
): Promise<NotificationsResponse> => {
  const response = await api.get("/notifications", { params });
  return response.data;
};

// 🔹 تعداد خوانده‌نشده‌ها
export const getUnreadCount = async (): Promise<{ unreadCount: number }> => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

// 🔹 خواندن یه اعلان
export const markAsRead = async (
  id: string,
): Promise<{ notification: Notification }> => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

// 🔹 خواندن همه
export const markAllAsRead = async (): Promise<{
  count: number;
  message: string;
}> => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};

// 🔹 حذف یه اعلان
export const deleteNotification = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

// 🔹 حذف همه خونده‌شده‌ها
export const deleteReadNotifications = async (): Promise<{
  count: number;
  message: string;
}> => {
  const response = await api.delete("/notifications/read/clear");
  return response.data;
};
