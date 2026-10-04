const { z } = require("zod");

// ==================== 🔹 خرید اشتراک ====================
const createPaymentSchema = z.object({
  planId: z.string().trim().min(1, "planId الزامی است"),
  gateway: z.enum(["WALLET", "ZARINPAL", "wallet", "zarinpal"]).optional(),
  referralCode: z
    .string()
    .trim()
    .min(4, "کد دعوت باید حداقل ۴ کاراکتر باشد")
    .max(20, "کد دعوت باید حداکثر ۲۰ کاراکتر باشد")
    .regex(/^[A-Za-z0-9]+$/, "کد دعوت فقط می‌تواند شامل حروف و اعداد باشد")
    .optional()
    .nullable(),
});

// ==================== 🔹 شارژ کیف پول ====================
const createWalletChargeSchema = z.object({
  amount: z
    .number()
    .int("مبلغ باید عدد صحیح باشد")
    .positive("مبلغ باید مثبت باشد"),
  gateway: z.enum(["ZARINPAL", "zarinpal"]).optional(),
});

module.exports = {
  createPaymentSchema,
  createWalletChargeSchema,
};
