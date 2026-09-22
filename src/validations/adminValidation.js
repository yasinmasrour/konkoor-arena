const { z } = require("zod");

// ==================== فیلتر لیست کاربران ====================
const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  role: z
    .enum(["ADMIN", "COUNSELOR", "QUESTION_DESIGNER", "STUDENT"])
    .optional(),
  sort: z
    .enum(["createdAt", "updatedAt", "firstName", "lastName"])
    .default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// ==================== تغییر نقش کاربر ====================
const changeRoleSchema = z.object({
  role: z.enum(["ADMIN", "COUNSELOR", "QUESTION_DESIGNER", "STUDENT"], {
    errorMap: () => ({ message: "نقش نامعتبر است" }),
  }),
});

// ==================== شارژ دستی کیف پول ====================
const adminChargeWalletSchema = z.object({
  userId: z.string().min(1, "userId الزامی است"),
  amount: z
    .number()
    .int("مبلغ باید عدد صحیح باشد")
    .positive("مبلغ باید مثبت باشد"),
  description: z.string().trim().max(255).optional().or(z.literal("")),
});

module.exports = {
  listUsersQuerySchema,
  changeRoleSchema,
  adminChargeWalletSchema,
};
