const { z } = require("zod");

const phoneSchema = z
  .string()
  .trim()
  .regex(/^09\d{9}$/, "شماره همراه باید به شکل 09xxxxxxxxx باشد");

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

const loginSchema = z.object({
  identifier: z.string().min(3, "شناسه ورود الزامی است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
  captchaToken: z.string().min(1, "کپچا الزامی است"),
  captchaAnswer: z.string().min(1, "پاسخ کپچا الزامی است"),
});

const verificationSchema = z.object({
  phoneNumber: phoneSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "کد تایید باید ۶ رقمی باشد"),
});

const resendSchema = z.object({
  phoneNumber: phoneSchema,
  purpose: z.enum(["PHONE_LOGIN", "PHONE_REGISTRATION"]),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "رمز فعلی الزامی است"),
    newPassword: z
      .string()
      .min(8, "رمز جدید باید حداقل ۸ کاراکتر باشد")
      .max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "تکرار رمز مطابقت ندارد",
    path: ["confirmPassword"],
  });

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(100).optional(),
  lastName: z.string().trim().min(2).max(100).optional(),
  email: z
    .string()
    .trim()
    .email("ایمیل معتبر نیست")
    .optional()
    .or(z.literal("")),
  birthDate: z.string().optional(),
  major: z.string().trim().optional(),
  grade: z.string().trim().optional(),
  nationalId: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد")
    .optional()
    .or(z.literal("")),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().trim().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  verificationSchema,
  resendSchema,
  changePasswordSchema,
  updateProfileSchema,
  phoneSchema,
};
