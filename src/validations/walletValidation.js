const { z } = require("zod");

// ==================== درخواست برداشت ====================
const withdrawRequestSchema = z.object({
  amount: z
    .number()
    .int("مبلغ باید عدد صحیح باشد")
    .positive("مبلغ باید مثبت باشد"),
  cardNumber: z
    .string()
    .trim()
    .regex(/^\d{16}$/, "شماره کارت باید ۱۶ رقم باشد"),
  cardHolderName: z.string().trim().min(3, "نام صاحب کارت الزامی است").max(100),
  bankName: z.string().trim().max(100).optional().or(z.literal("")),
  iban: z.string().trim().max(50).optional().or(z.literal("")),
  shebaNumber: z
    .string()
    .trim()
    .regex(/^IR\d{24}$/, "شبا باید با IR شروع شود و ۲۴ رقم داشته باشد")
    .optional()
    .or(z.literal("")),
});

// ==================== تنظیم دستی ادمین ====================
const adminAdjustSchema = z.object({
  userId: z.string().min(1, "userId الزامی است"),
  amount: z
    .number()
    .int("مبلغ باید عدد صحیح باشد")
    .positive("مبلغ باید مثبت باشد"),
  direction: z.enum(["IN", "OUT"], {
    errorMap: () => ({ message: "direction باید IN یا OUT باشد" }),
  }),
  description: z.string().trim().max(255).optional().or(z.literal("")),
});

// ==================== تکمیل برداشت ====================
const completeWithdrawSchema = z.object({
  trackingCode: z.string().trim().min(4, "کد پیگیری الزامی است").max(100),
});

// ==================== رد برداشت ====================
const rejectWithdrawSchema = z.object({
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

module.exports = {
  withdrawRequestSchema,
  adminAdjustSchema,
  completeWithdrawSchema,
  rejectWithdrawSchema,
};
