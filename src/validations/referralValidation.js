const { z } = require("zod");

// ==================== 🔹 اعتبارسنجی کد ====================
const validateCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, "کد دعوت باید حداقل ۴ کاراکتر باشد")
    .max(20, "کد دعوت باید حداکثر ۲۰ کاراکتر باشد")
    .regex(/^[A-Za-z0-9]+$/, "کد دعوت فقط میتواند شامل حروف و اعداد باشد"),
});

// ==================== 🔹 محاسبه تخفیف ====================
const calculateDiscountSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4)
    .max(20)
    .regex(/^[A-Za-z0-9]+$/),
  amount: z
    .number()
    .int("مبلغ باید عدد صحیح باشد")
    .positive("مبلغ باید مثبت باشد"),
});

// ==================== 🔹 تاریخچه ====================
const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  validateCodeSchema,
  calculateDiscountSchema,
  historyQuerySchema,
};