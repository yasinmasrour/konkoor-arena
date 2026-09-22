import api from "./axios";

// ==================== Types ====================
export type CommentStatus = "pending" | "approved" | "rejected" | "deleted";
export type ReactionType = "like" | "dislike";

export interface CommentAuthor {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  isAdmin: boolean;
}

export interface CommentItem {
  id: string;
  content: string;
  rating: number | null;
  likes: number;
  dislikes: number;
  status: CommentStatus;
  createdAt: string;
  parentId?: string | null;
  author: CommentAuthor;
  repliesCount: number;
  myReaction: ReactionType | null;
  isOwner: boolean;
  exam?: {
    id: string;
    title: string;
    examDate: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CommentsListResponse {
  comments: CommentItem[];
  pagination: Pagination;
}

export interface RepliesListResponse {
  replies: CommentItem[];
  pagination: Pagination;
}

export interface CommentStats {
  averageRating: number | null;
  ratingsCount: number;
  totalComments: number;
}

export interface ReactionResponse {
  likes: number;
  dislikes: number;
  myReaction: ReactionType | null;
}

// ==================== API Functions ====================

// 🔹 لیست کامنتهای یه آزمون (عمومی)
export const getExamComments = async (
  examId: string,
  params?: { page?: number; limit?: number },
): Promise<CommentsListResponse> => {
  const response = await api.get(`/exams/${examId}/comments`, { params });
  return response.data;
};

// 🔹 آمار امتیاز
export const getExamCommentStats = async (
  examId: string,
): Promise<CommentStats> => {
  const response = await api.get(`/exams/${examId}/comments/stats`);
  return response.data;
};

// 🔹 لیست پاسخهای یه کامنت
export const getCommentReplies = async (
  commentId: string,
  params?: { page?: number; limit?: number },
): Promise<RepliesListResponse> => {
  const response = await api.get(`/comments/${commentId}/replies`, { params });
  return response.data;
};

// 🔹 کامنتهای من
export const getMyComments = async (params?: {
  page?: number;
  limit?: number;
}): Promise<CommentsListResponse> => {
  const response = await api.get(`/comments/me`, { params });
  return response.data;
};

// 🔹 ثبت کامنت ریشه
export const createComment = async (
  examId: string,
  data: { content: string; rating?: number | null },
): Promise<{ message: string; comment: CommentItem }> => {
  const response = await api.post(`/exams/${examId}/comments`, data);
  return response.data;
};

// 🔹 ثبت پاسخ
export const createReply = async (
  commentId: string,
  data: { content: string },
): Promise<{ message: string; reply: CommentItem }> => {
  const response = await api.post(`/comments/${commentId}/reply`, data);
  return response.data;
};

// 🔹 ویرایش
export const updateComment = async (
  commentId: string,
  data: { content: string; rating?: number | null },
): Promise<{ message: string; comment: CommentItem }> => {
  const response = await api.patch(`/comments/${commentId}`, data);
  return response.data;
};

// 🔹 حذف
export const deleteComment = async (
  commentId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

// 🔹 واکنش
export const reactToComment = async (
  commentId: string,
  type: ReactionType,
): Promise<ReactionResponse> => {
  const response = await api.post(`/comments/${commentId}/react`, { type });
  return response.data;
};

// 🔹 برداشتن واکنش
export const removeReaction = async (
  commentId: string,
): Promise<ReactionResponse> => {
  const response = await api.delete(`/comments/${commentId}/react`);
  return response.data;
};

// ==================== ادمین ====================

// 🔹 لیست ادمین
export const adminListComments = async (params?: {
  status?: CommentStatus;
  examId?: string;
  page?: number;
  limit?: number;
}): Promise<CommentsListResponse> => {
  const response = await api.get(`/admin/comments`, { params });
  return response.data;
};

// 🔹 تایید
export const adminApproveComment = async (
  commentId: string,
  note?: string,
): Promise<{ message: string; comment: CommentItem }> => {
  const response = await api.patch(`/admin/comments/${commentId}/approve`, {
    note: note || "",
  });
  return response.data;
};

// 🔹 رد
export const adminRejectComment = async (
  commentId: string,
  note?: string,
): Promise<{ message: string; comment: CommentItem }> => {
  const response = await api.patch(`/admin/comments/${commentId}/reject`, {
    note: note || "",
  });
  return response.data;
};

// 🔹 حذف ادمین
export const adminDeleteComment = async (
  commentId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/comments/${commentId}`);
  return response.data;
};

// ==================== Helpers ====================

// 🔹 فرمت تاریخ نسبی
export const formatCommentDate = (date: string): string => {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "همین الان";
  if (minutes < 60) return `${minutes.toLocaleString("fa-IR")} دقیقه پیش`;
  if (hours < 24) return `${hours.toLocaleString("fa-IR")} ساعت پیش`;
  if (days < 7) return `${days.toLocaleString("fa-IR")} روز پیش`;

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(target);
};

// 🔹 لیبل وضعیت
export const getCommentStatusLabel = (status: CommentStatus): string => {
  if (status === "pending") return "در انتظار تایید";
  if (status === "approved") return "تایید شده";
  if (status === "rejected") return "رد شده";
  if (status === "deleted") return "حذف شده";
  return status;
};
