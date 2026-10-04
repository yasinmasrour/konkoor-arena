import api from "../api/axios";

// ============================================================
// TYPES
// ============================================================

export type UserRole =
  | "ADMIN"
  | "QUESTION_DESIGNER"
  | "COUNSELOR"
  | "STUDENT";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string | null;
  email: string | null;
  role: UserRole;
  phoneVerifiedAt?: string | null;
  birthDate?: string | null;
  major?: string | null;
  grade?: string | null;
  nationalId?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  features: string[];
  examPurchases: string[];
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// ============================================================
// CAPTCHA
// ============================================================

export const getCaptcha = async () =>
  (
    await api.get("/auth/captcha")
  ).data as {
    token: string;
    question: string;
  };

// ============================================================
// REGISTER
// ============================================================

export const registerUser = async (data: {
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  email?: string;
  password: string;
}) =>
  (
    await api.post("/auth/register", data)
  ).data as AuthResponse;

/*
 * ============================================================
 * SMS / OTP REGISTRATION VERIFICATION — DISABLED
 * ============================================================
 *
 * این تابع فعلاً از جریان فعال ثبت‌نام خارج شده است.
 * کد اصلی حفظ شده تا در صورت نیاز بتوان SMS/OTP را
 * دوباره فعال کرد.
 *
export const verifyRegistration = async (
  phoneNumber: string,
  code: string,
) =>
  (
    await api.post("/auth/register/verify", {
      phoneNumber,
      code,
    })
  ).data as AuthResponse;
 */

// ============================================================
// LOGIN
// ============================================================

export const loginUser = async (data: {
  identifier: string;
  password: string;
  captchaToken: string;
  captchaAnswer: string;
}) =>
  (
    await api.post("/auth/login", data)
  ).data as AuthResponse;

/*
 * ============================================================
 * SMS / OTP LOGIN VERIFICATION — DISABLED
 * ============================================================
 *
 * این تابع فعلاً از جریان فعال ورود خارج شده است.
 * کد اصلی حفظ شده تا در صورت نیاز بتوان SMS/OTP را
 * دوباره فعال کرد.
 *
export const verifyLogin = async (
  phoneNumber: string,
  code: string,
) =>
  (
    await api.post("/auth/login/verify", {
      phoneNumber,
      code,
    })
  ).data as AuthResponse;
 */

/*
 * ============================================================
 * SMS / OTP RESEND — DISABLED
 * ============================================================
 *
 * این تابع فعلاً استفاده نمی‌شود.
 * کد اصلی حفظ شده تا در صورت نیاز بتوان ارسال مجدد
 * کد را دوباره فعال کرد.
 *
export const resendVerificationCode = async (
  phoneNumber: string,
  purpose: "PHONE_REGISTRATION" | "PHONE_LOGIN",
) =>
  (
    await api.post("/auth/verification/resend", {
      phoneNumber,
      purpose,
    })
  ).data;
 */

// ============================================================
// 🆕 SECURITY RECOVERY — TYPES
// ============================================================

export interface SecurityQuestionOption {
  key: string;
  text: string;
}

export interface SetupSecurityResponse {
  message: string;
  recoveryCode: string;
  question: string;
  questionText: string;
}

export interface RecoveryStatus {
  isSetup: boolean;
  setupAt: string | null;
  question: string | null;
  questionText: string | null;
}

// ============================================================
// 🆕 SECURITY RECOVERY — SETUP (authenticated)
// ============================================================

/**
 * تنظیم سوال امنیتی و دریافت کد بازیابی
 * ⚠️ کد بازیابی فقط یک‌بار برگردانده می‌شود
 */
export const setupSecurity = async (data: {
  question: string;
  answer: string;
}) =>
  (
    await api.post("/auth/security/setup", data)
  ).data as SetupSecurityResponse;

/**
 * وضعیت تنظیم بازیابی
 */
export const getRecoveryStatus = async () =>
  (await api.get("/auth/security/status")).data as RecoveryStatus;

// ============================================================
// 🆕 FORGOT PASSWORD
// ============================================================

/**
 * مرحله ۱: دریافت سوال امنیتی
 */
export const forgotPasswordLookup = async (identifier: string) =>
  (
    await api.post("/auth/forgot-password/lookup", { identifier })
  ).data as {
    question: string;
    questionText: string;
  };

/**
 * مرحله ۲: تغییر رمز با جواب سوال امنیتی
 */
export const resetPasswordWithQuestion = async (data: {
  identifier: string;
  answer: string;
  newPassword: string;
}) =>
  (
    await api.post("/auth/forgot-password/answer", data)
  ).data as { message: string };

/**
 * مرحله ۲ (جایگزین): تغییر رمز با کد بازیابی
 */
export const resetPasswordWithRecoveryCode = async (data: {
  identifier: string;
  code: string;
  newPassword: string;
}) =>
  (
    await api.post("/auth/forgot-password/code", data)
  ).data as { message: string };

// ============================================================
// NOTES
// ============================================================
//
// فعال:
// - getCaptcha
// - registerUser
// - loginUser
// - setupSecurity
// - getRecoveryStatus
// - forgotPasswordLookup
// - resetPasswordWithQuestion
// - resetPasswordWithRecoveryCode
//
// غیرفعال:
// - verifyRegistration
// - verifyLogin
// - resendVerificationCode
//
// SMS/OTP حذف نشده و کدهای آن عمداً در کامنت نگه داشته شده‌اند.
// ============================================================