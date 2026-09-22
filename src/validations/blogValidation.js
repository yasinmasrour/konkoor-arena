const { z } = require("zod");
const {
  BLOG_CATEGORIES,
  BLOG_STATUS,
  BLOG_REACTION_TYPE,
  BLOG_LIMITS,
} = require("../constants/blog");

const VALID_CATEGORIES = Object.keys(BLOG_CATEGORIES);
const VALID_STATUSES = Object.values(BLOG_STATUS);
const VALID_REACTIONS = Object.values(BLOG_REACTION_TYPE);

// ==================== 🔹 ساخت مقاله ====================
const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(BLOG_LIMITS.MIN_TITLE)
    .max(BLOG_LIMITS.MAX_TITLE),
  excerpt: z
    .string()
    .trim()
    .max(BLOG_LIMITS.MAX_EXCERPT)
    .optional()
    .nullable()
    .or(z.literal("")),
  content: z
    .string()
    .min(1, "متن مقاله الزامی است")
    .max(BLOG_LIMITS.MAX_CONTENT),
  coverImage: z
    .string()
    .trim()
    .max(BLOG_LIMITS.MAX_COVER_URL)
    .optional()
    .nullable()
    .or(z.literal("")),
  category: z.enum(VALID_CATEGORIES, {
    errorMap: () => ({ message: "دسته‌بندی نامعتبر است" }),
  }),
  tags: z
    .array(z.string().trim().min(1).max(BLOG_LIMITS.MAX_TAG_LENGTH))
    .max(BLOG_LIMITS.MAX_TAGS)
    .default([]),
});

// ==================== 🔹 ویرایش ====================
const updatePostSchema = createPostSchema.partial();

// ==================== 🔹 لیست ====================
const listPostsSchema = z.object({
  category: z.enum(VALID_CATEGORIES).optional(),
  tag: z.string().trim().optional(),
  search: z.string().trim().optional(),
  featured: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(BLOG_LIMITS.MAX_PAGE_SIZE)
    .default(BLOG_LIMITS.DEFAULT_PAGE_SIZE),
});

// ==================== 🔹 لیست ادمین ====================
const adminListPostsSchema = listPostsSchema.extend({
  status: z.enum(VALID_STATUSES).optional(),
  authorId: z.string().trim().optional(),
});

// ==================== 🔹 تایید/رد ====================
const reviewPostSchema = z.object({
  note: z
    .string()
    .trim()
    .max(BLOG_LIMITS.MAX_REVIEW_NOTE)
    .optional()
    .or(z.literal("")),
});

// ==================== 🔹 واکنش ====================
const reactPostSchema = z.object({
  type: z.enum(VALID_REACTIONS, {
    errorMap: () => ({ message: "نوع واکنش نامعتبر است" }),
  }),
});

// ==================== 🔹 کامنت ====================
const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(BLOG_LIMITS.MIN_COMMENT)
    .max(BLOG_LIMITS.MAX_COMMENT),
});

const updateCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(BLOG_LIMITS.MIN_COMMENT)
    .max(BLOG_LIMITS.MAX_COMMENT),
});

// ==================== 🔹 کامنت ادمین ====================
const adminListCommentsSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "deleted"]).optional(),
  postId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  createPostSchema,
  updatePostSchema,
  listPostsSchema,
  adminListPostsSchema,
  reviewPostSchema,
  reactPostSchema,
  createCommentSchema,
  updateCommentSchema,
  adminListCommentsSchema,
  VALID_CATEGORIES,
  VALID_STATUSES,
};
