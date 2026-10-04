const { z } = require("zod");
const {
  SECURITY_QUESTIONS_KEYS,
} = require("../constants/securityQuestions");

// ============================================================
// PHONE
// ============================================================

const phoneSchema = z
  .string()
  .trim()
  .regex(/^09\d{9}$/, "شماره موبایل معتبر نیست");

// ============================================================
// REGISTER
// ============================================================

const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(100),

  lastName: z.string().trim().min(2).max(100),

  username: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "نام کاربری فقط می‌تواند شامل حروف، اعداد و _ باشد",
    ),

  phoneNumber: phoneSchema,

  password: z.string().min(6).max(72),
});

// ============================================================
// LOGIN
// ============================================================

const loginSchema = z.object({
  identifier: z.string().min(3, "شناسه ورود الزامی است"),

  password: z.string().min(1, "رمز عبور الزامی است"),

  // CAPTCHA همچنان فعال است.
  captchaToken: z.string().min(1, "کپچا الزامی است"),

  captchaAnswer: z.string().min(1, "پاسخ کپچا الزامی است"),
});

// ============================================================
// SMS / OTP VERIFICATION — TEMPORARILY DISABLED
// ============================================================
// این schema فعلاً از جریان فعال احراز هویت خارج شده است.
// تعریف کامل آن حفظ شده تا در صورت نیاز بتوانیم SMS/OTP
// را دوباره فعال کنیم.

/*
const verificationSchema = z.object({
  phoneNumber: phoneSchema,

  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "کد تایید باید ۶ رقمی باشد"),
});
*/

// ============================================================
// SMS / OTP RESEND — TEMPORARILY DISABLED
// ============================================================
// این schema نیز فعلاً استفاده نمی‌شود.

/*
const resendSchema = z.object({
  phoneNumber: phoneSchema,

  purpose: z.enum([
    "PHONE_LOGIN",
    "PHONE_REGISTRATION",
  ]),
});
*/

// ============================================================
// 🆕 SECURITY RECOVERY SETUP
// ============================================================

const setupSecuritySchema = z.object({
  question: z.enum(SECURITY_QUESTIONS_KEYS, {
    errorMap: () => ({ message: "سوال امنیتی نامعتبر است" }),
  }),

  answer: z
    .string()
    .trim()
    .min(2, "جواب سوال باید حداقل ۲ کاراکتر باشد")
    .max(200, "جواب سوال خیلی طولانی است"),
});

// ============================================================
// 🆕 FORGOT PASSWORD — STEP 1 (دریافت سوال)
// ============================================================

const forgotPasswordLookupSchema = z.object({
  identifier: z.string().min(3, "شناسه ورود الزامی است"),
});

// ============================================================
// 🆕 FORGOT PASSWORD — STEP 2 (پاسخ سوال)
// ============================================================

const resetPasswordWithQuestionSchema = z.object({
  identifier: z.string().min(3, "شناسه ورود الزامی است"),

  answer: z
    .string()
    .trim()
    .min(2, "جواب سوال الزامی است")
    .max(200, "جواب سوال خیلی طولانی است"),

  newPassword: z
    .string()
    .min(6, "رمز جدید باید حداقل ۶ کاراکتر باشد")
    .max(72, "رمز جدید خیلی طولانی است"),
});

// ============================================================
// 🆕 FORGOT PASSWORD — با کد بازیابی
// ============================================================

const resetPasswordWithRecoveryCodeSchema = z.object({
  identifier: z.string().min(3, "شناسه ورود الزامی است"),

  code: z
    .string()
    .trim()
    .min(8, "کد بازیابی نامعتبر است")
    .max(20, "کد بازیابی نامعتبر است"),

  newPassword: z
    .string()
    .min(6, "رمز جدید باید حداقل ۶ کاراکتر باشد")
    .max(72, "رمز جدید خیلی طولانی است"),
});

// ============================================================
// CHANGE PASSWORD
// ============================================================

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),

  newPassword: z.string().min(6).max(72),
});

// ============================================================
// UPDATE PROFILE
// ============================================================

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(100).optional(),

  lastName: z.string().trim().min(2).max(100).optional(),

  username: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "نام کاربری فقط می‌تواند شامل حروف، اعداد و _ باشد",
    )
    .optional(),

  email: z
    .string()
    .trim()
    .email("ایمیل معتبر نیست")
    .optional()
    .or(z.literal("")),

  birthDate: z.string().trim().optional().or(z.literal("")),

  major: z
    .enum(["math", "experimental", "humanities"])
    .optional()
    .or(z.literal("")),

  grade: z.string().trim().optional().or(z.literal("")),

  nationalId: z.string().trim().optional().or(z.literal("")),

  address: z.string().trim().optional().or(z.literal("")),

  city: z.string().trim().optional().or(z.literal("")),

  province: z.string().trim().optional().or(z.literal("")),
});

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  phoneSchema,

  registerSchema,
  loginSchema,

  // 🆕
  setupSecuritySchema,
  forgotPasswordLookupSchema,
  resetPasswordWithQuestionSchema,
  resetPasswordWithRecoveryCodeSchema,

  changePasswordSchema,
  updateProfileSchema,

  // ==========================================================
  // SMS / OTP — TEMPORARILY DISABLED
  // ==========================================================
  //
  // این موارد عمداً از export خارج شده‌اند.
  // در صورت فعال‌سازی مجدد SMS/OTP می‌توان آنها را
  // از بخش کامنت خارج کرد.
  //
  // verificationSchema,
  // resendSchema,
};