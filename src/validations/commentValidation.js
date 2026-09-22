const { z } = require("zod");
const { COMMENT_LIMITS } = require("../constants/comment");

// ==================== 🔹 ثبت کامنت ریشه ====================
const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(
      COMMENT_LIMITS.MIN_CONTENT_LENGTH,
      `کامنت باید حداقل ${COMMENT_LIMITS.MIN_CONTENT_LENGTH} کاراکتر باشد`,
    )
    .max(
      COMMENT_LIMITS.MAX_CONTENT_LENGTH,
      `کامنت باید حداکثر ${COMMENT_LIMITS.MAX_CONTENT_LENGTH} کاراکتر باشد`,
    ),
  rating: z
    .number()
    .int("امتیاز باید عدد صحیح باشد")
    .min(COMMENT_LIMITS.MIN_RATING, `امتیاز حداقل ${COMMENT_LIMITS.MIN_RATING} است`)
    .max(COMMENT_LIMITS.MAX_RATING, `امتیاز حداکثر ${COMMENT_LIMITS.MAX_RATING} است`)
    .optional()
    .nullable(),
});

// ==================== 🔹 ثبت پاسخ ====================
const createReplySchema = z.object({
  content: z
    .string()
    .trim()
    .min(
      COMMENT_LIMITS.MIN_CONTENT_LENGTH,
      `پاسخ باید حداقل ${COMMENT_LIMITS.MIN_CONTENT_LENGTH} کاراکتر باشد`,
    )
    .max(
      COMMENT_LIMITS.MAX_CONTENT_LENGTH,
      `پاسخ باید حداکثر ${COMMENT_LIMITS.MAX_CONTENT_LENGTH} کاراکتر باشد`,
    ),
});

// ==================== 🔹 ویرایش ====================
const updateCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(COMMENT_LIMITS.MIN_CONTENT_LENGTH)
    .max(COMMENT_LIMITS.MAX_CONTENT_LENGTH),
  rating: z
    .number()
    .int()
    .min(COMMENT_LIMITS.MIN_RATING)
    .max(COMMENT_LIMITS.MAX_RATING)
    .optional()
    .nullable(),
});

// ==================== 🔹 واکنش ====================
const reactSchema = z.object({
  type: z.enum(["like", "dislike"], {
    errorMap: () => ({ message: "نوع واکنش باید like یا dislike باشد" }),
  }),
});

// ==================== 🔹 لیست (pagination) ====================
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(COMMENT_LIMITS.MAX_PAGE_SIZE)
    .default(COMMENT_LIMITS.DEFAULT_PAGE_SIZE),
});

// ==================== 🔹 لیست ادمین ====================
const adminListCommentsSchema = z.object({
  status: z
    .enum(["pending", "approved", "rejected", "deleted"])
    .optional(),
  examId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(COMMENT_LIMITS.MAX_PAGE_SIZE)
    .default(COMMENT_LIMITS.DEFAULT_PAGE_SIZE),
});

// ==================== 🔹 تایید/رد ====================
const reviewCommentSchema = z.object({
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

module.exports = {
  createCommentSchema,
  createReplySchema,
  updateCommentSchema,
  reactSchema,
  paginationSchema,
  adminListCommentsSchema,
  reviewCommentSchema,
};