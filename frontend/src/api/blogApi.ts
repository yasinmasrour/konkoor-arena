import api from "./axios";

// ==================== Types ====================
export type BlogCategory =
  | "general"
  | "educational"
  | "motivation"
  | "news"
  | "analysis"
  | "interview";

export type BlogStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "archived";

export type BlogCommentStatus = "pending" | "approved" | "rejected" | "deleted";

export type BlogReactionType = "like" | "dislike";

export interface BlogAuthor {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  // 🆕 SEO
  seoTitle: string | null;
  seoDescription: string | null;
  coverImageAlt: string | null;
  category: BlogCategory;
  tags: string[];
  status: BlogStatus;
  isFeatured: boolean;
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  readingTime?: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: BlogAuthor;
  reviewedBy?: BlogAuthor | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
  myReaction?: BlogReactionType | null;
  commentsCount?: number;
}

export interface BlogComment {
  id: string;
  content: string;
  status: BlogCommentStatus;
  createdAt: string;
  parentId?: string | null;
  author: BlogAuthor;
  repliesCount?: number;
  isOwner: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PostsListResponse {
  posts: BlogPost[];
  pagination: Pagination;
}

export interface CommentsListResponse {
  comments: BlogComment[];
  pagination: Pagination;
}

export interface RepliesListResponse {
  replies: BlogComment[];
  pagination: Pagination;
}

export interface ReactionResponse {
  likesCount: number;
  dislikesCount: number;
  myReaction: BlogReactionType | null;
}

// 🆕 Sidebar
export interface BlogSidebarData {
  categories: Array<{ key: BlogCategory; label: string; count: number }>;
  popularTags: Array<{ tag: string; count: number }>;
  popularPosts: Array<{
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    viewsCount: number;
    likesCount?: number;
    publishedAt: string | null;
    category: BlogCategory;
  }>;
  recentPosts: Array<{
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    viewsCount: number;
    publishedAt: string | null;
    category: BlogCategory;
  }>;
  totalPosts: number;
}

// 🆕 TOC
export interface TocHeading {
  level: number;
  text: string;
  id: string;
}

export interface PostTocResponse {
  headings: TocHeading[];
}

// 🆕 Related
export interface RelatedPostsResponse {
  relatedPosts: BlogPost[];
}

// 🆕 Neighbors
export interface PostNeighborsResponse {
  prevPost: { title: string; slug: string; coverImage: string } | null;
  nextPost: { title: string; slug: string; coverImage: string } | null;
}

// ==================== API Functions ====================

// 🔹 لیست منتشرشده‌ها (عمومی)
export const getPublishedPosts = async (params?: {
  category?: BlogCategory;
  tag?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}): Promise<PostsListResponse> => {
  const response = await api.get("/blog/posts", { params });
  return response.data;
};

// 🔹 جزئیات مقاله
export const getPostBySlug = async (
  slug: string,
): Promise<{ post: BlogPost }> => {
  const response = await api.get(`/blog/posts/${slug}`);
  return response.data;
};

// 🔹 دسته‌بندی‌ها
export const getCategories = async (): Promise<{
  categories: Array<{ key: BlogCategory; label: string }>;
}> => {
  const response = await api.get("/blog/categories");
  return response.data;
};

// 🔹 تگ‌ها
export const getTags = async (): Promise<{ tags: string[] }> => {
  const response = await api.get("/blog/tags");
  return response.data;
};

// 🆕 Sidebar
export const getBlogSidebar = async (): Promise<BlogSidebarData> => {
  const response = await api.get("/blog/sidebar");
  return response.data;
};

// 🆕 TOC
export const getPostToc = async (slug: string): Promise<PostTocResponse> => {
  const response = await api.get(`/blog/posts/${slug}/toc`);
  return response.data;
};

// 🆕 Related
export const getRelatedPosts = async (
  slug: string,
  limit = 4,
): Promise<RelatedPostsResponse> => {
  const response = await api.get(`/blog/posts/${slug}/related`, {
    params: { limit },
  });
  return response.data;
};

// 🆕 Neighbors
export const getPostNeighbors = async (
  slug: string,
): Promise<PostNeighborsResponse> => {
  const response = await api.get(`/blog/posts/${slug}/neighbors`);
  return response.data;
};

// 🔹 واکنش
export const reactToPost = async (
  postId: string,
  type: BlogReactionType,
): Promise<ReactionResponse> => {
  const response = await api.post(`/blog/posts/${postId}/react`, { type });
  return response.data;
};

// 🔹 کامنت‌ها
export const getPostComments = async (
  postId: string,
  params?: { page?: number; limit?: number },
): Promise<CommentsListResponse> => {
  const response = await api.get(`/blog/posts/${postId}/comments`, { params });
  return response.data;
};

export const getCommentReplies = async (
  commentId: string,
  params?: { page?: number; limit?: number },
): Promise<RepliesListResponse> => {
  const response = await api.get(`/blog/comments/${commentId}/replies`, {
    params,
  });
  return response.data;
};

export const createComment = async (
  postId: string,
  content: string,
): Promise<{ message: string; comment: BlogComment }> => {
  const response = await api.post(`/blog/posts/${postId}/comments`, {
    content,
  });
  return response.data;
};

export const createReply = async (
  commentId: string,
  content: string,
): Promise<{ message: string; reply: BlogComment }> => {
  const response = await api.post(`/blog/comments/${commentId}/reply`, {
    content,
  });
  return response.data;
};

export const updateComment = async (
  commentId: string,
  content: string,
): Promise<{ message: string; comment: BlogComment }> => {
  const response = await api.patch(`/blog/comments/${commentId}`, { content });
  return response.data;
};

export const deleteComment = async (
  commentId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/blog/comments/${commentId}`);
  return response.data;
};

// 🔹 نویسنده
export const getMyPosts = async (params?: {
  status?: BlogStatus;
  page?: number;
  limit?: number;
}): Promise<PostsListResponse> => {
  const response = await api.get("/blog/my-posts", { params });
  return response.data;
};

export const createPost = async (data: {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  coverImageAlt?: string;
  category: BlogCategory;
  tags?: string[];
}): Promise<{ message: string; post: BlogPost }> => {
  const response = await api.post("/blog/posts", data);
  return response.data;
};

export const updatePost = async (
  postId: string,
  data: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    seoTitle: string;
    seoDescription: string;
    coverImageAlt: string;
    category: BlogCategory;
    tags: string[];
  }>,
): Promise<{ message: string; post: BlogPost }> => {
  const response = await api.patch(`/blog/posts/${postId}`, data);
  return response.data;
};

export const submitForReview = async (
  postId: string,
): Promise<{ message: string; post: BlogPost }> => {
  const response = await api.post(`/blog/posts/${postId}/submit`);
  return response.data;
};

export const deleteMyPost = async (
  postId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/blog/posts/${postId}`);
  return response.data;
};

// ==================== ادمین ====================

export const adminListPosts = async (params?: {
  status?: BlogStatus;
  category?: BlogCategory;
  authorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PostsListResponse> => {
  const response = await api.get("/admin/blog/posts", { params });
  return response.data;
};

export const adminCreatePost = async (data: {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  coverImageAlt?: string;
  category: BlogCategory;
  tags?: string[];
}): Promise<{ message: string; post: BlogPost }> => {
  const response = await api.post("/admin/blog/posts", data);
  return response.data;
};

export const adminUpdatePost = async (
  postId: string,
  data: Partial<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string;
    seoTitle: string;
    seoDescription: string;
    coverImageAlt: string;
    category: BlogCategory;
    tags: string[];
  }>,
): Promise<{ message: string; post: BlogPost }> => {
  const response = await api.patch(`/admin/blog/posts/${postId}`, data);
  return response.data;
};

export const adminDeletePost = async (
  postId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/blog/posts/${postId}`);
  return response.data;
};

export const adminApprovePost = async (
  postId: string,
  note?: string,
): Promise<{ message: string; post: BlogPost }> => {
  const response = await api.patch(`/admin/blog/posts/${postId}/approve`, {
    note: note || "",
  });
  return response.data;
};

export const adminRejectPost = async (
  postId: string,
  note?: string,
): Promise<{ message: string; post: BlogPost }> => {
  const response = await api.patch(`/admin/blog/posts/${postId}/reject`, {
    note: note || "",
  });
  return response.data;
};

export const adminToggleFeatured = async (
  postId: string,
): Promise<{ message: string; post: BlogPost }> => {
  const response = await api.patch(`/admin/blog/posts/${postId}/feature`);
  return response.data;
};

export const adminListComments = async (params?: {
  status?: BlogCommentStatus;
  postId?: string;
  page?: number;
  limit?: number;
}): Promise<CommentsListResponse> => {
  const response = await api.get("/admin/blog/comments", { params });
  return response.data;
};

export const adminApproveComment = async (
  commentId: string,
  note?: string,
): Promise<{ message: string; comment: BlogComment }> => {
  const response = await api.patch(
    `/admin/blog/comments/${commentId}/approve`,
    { note: note || "" },
  );
  return response.data;
};

export const adminRejectComment = async (
  commentId: string,
  note?: string,
): Promise<{ message: string; comment: BlogComment }> => {
  const response = await api.patch(`/admin/blog/comments/${commentId}/reject`, {
    note: note || "",
  });
  return response.data;
};

export const adminDeleteComment = async (
  commentId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/blog/comments/${commentId}`);
  return response.data;
};

// ==================== Helpers ====================

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  general: "عمومی",
  educational: "آموزشی",
  motivation: "انگیزشی",
  news: "اخبار",
  analysis: "تحلیل",
  interview: "مصاحبه",
};

export const STATUS_LABELS: Record<BlogStatus, string> = {
  draft: "پیش‌نویس",
  pending: "در انتظار تایید",
  published: "منتشرشده",
  rejected: "رد شده",
  archived: "آرشیو",
};

export const STATUS_COLORS: Record<BlogStatus, { bg: string; text: string }> = {
  draft: { bg: "bg-gray-500/10", text: "text-gray-500 dark:text-gray-400" },
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  published: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  rejected: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  archived: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
};

export const formatBlogDate = (date: string): string => {
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

export const formatReadingTime = (minutes?: number): string => {
  if (!minutes || minutes < 1) return "۱ دقیقه مطالعه";
  return `${minutes.toLocaleString("fa-IR")} دقیقه مطالعه`;
};
