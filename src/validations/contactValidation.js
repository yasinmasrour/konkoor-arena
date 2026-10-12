const { z } = require("zod");

// ==================== ارسال پیام تماس ====================
const createContactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(100, "نام حداکثر ۱۰۰ کاراکتر"),

  email: z
    .string()
    .trim()
    .email("ایمیل نامعتبر است")
    .max(150, "ایمیل حداکثر ۱۵۰ کاراکتر"),

  phone: z
    .string()
    .trim()
    .max(20, "شماره تماس حداکثر ۲۰ کاراکتر")
    .optional()
    .or(z.literal("")),

  subject: z
    .string()
    .trim()
    .min(3, "موضوع باید حداقل ۳ کاراکتر باشد")
    .max(200, "موضوع حداکثر ۲۰۰ کاراکتر"),

  message: z
    .string()
    .trim()
    .min(10, "پیام باید حداقل ۱۰ کاراکتر باشد")
    .max(5000, "پیام حداکثر ۵۰۰۰ کاراکتر"),
});

// ==================== فیلتر لیست پیام‌ها (ادمین) ====================
const listContactMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]).optional(),
  search: z.string().trim().optional(),
  sort: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

// ==================== آپدیت وضعیت (ادمین) ====================
const updateContactMessageSchema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED", "ARCHIVED"]).optional(),
  adminNote: z.string().trim().max(1000).optional().or(z.literal("")),
});

module.exports = {
  createContactMessageSchema,
  listContactMessagesQuerySchema,
  updateContactMessageSchema,
};
