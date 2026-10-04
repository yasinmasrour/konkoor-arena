const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const {
  SECURITY_QUESTIONS,
  SECURITY_QUESTIONS_KEYS,
} = require("../constants/securityQuestions");

// ============================================================
// CONSTANTS
// ============================================================

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // ۳۰ دقیقه
const RECOVERY_CODE_LENGTH = 12;

// ============================================================
// HELPERS
// ============================================================

/**
 * نرمال‌سازی جواب سوال امنیتی:
 * - lowercase
 * - trim
 * - تبدیل ی/ک عربی به فارسی
 * - حذف فاصله‌های اضافی
 */
const normalizeAnswer = (answer) => {
  if (!answer) return "";
  return String(answer)
    .trim()
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ");
};

/**
 * تولید کد بازیابی ۱۲ کاراکتری
 * فرمت: XXXX-XXXX-XXXX (با خط تیره برای خوانایی)
 * حذف کاراکترهای گیج‌کننده: O, 0, I, 1, L
 */
const generateRecoveryCode = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < RECOVERY_CODE_LENGTH; i++) {
    code += chars[crypto.randomInt(0, chars.length)];
  }
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
};

/**
 * پاک کردن خط تیره و فاصله از کد بازیابی (برای مقایسه)
 */
const normalizeRecoveryCode = (code) => {
  if (!code) return "";
  return String(code).toUpperCase().replace(/[^A-Z0-9]/g, "");
};

// ============================================================
// SETUP SECURITY RECOVERY
// ============================================================

/**
 * تنظیم سوال امنیتی و تولید کد بازیابی
 * کد بازیابی فقط یک‌بار به کاربر نمایش داده میشه.
 */
const setupSecurityRecovery = async (userId, question, answer) => {
  if (!SECURITY_QUESTIONS_KEYS.includes(question)) {
    throw new AppError("سوال امنیتی نامعتبر است.", 400);
  }

  const normalized = normalizeAnswer(answer);
  if (normalized.length < 2) {
    throw new AppError("جواب سوال امنیتی باید حداقل ۲ کاراکتر باشد.", 400);
  }

  const answerHash = await bcrypt.hash(normalized, 12);
  const recoveryCode = generateRecoveryCode();
  const recoveryCodeHash = await bcrypt.hash(
    normalizeRecoveryCode(recoveryCode),
    12,
  );

  await prisma.user.update({
    where: { id: userId },
    data: {
      securityQuestion: question,
      securityAnswerHash: answerHash,
      recoveryCodeHash,
      recoverySetupDone: true,
      recoverySetupAt: new Date(),
      passwordResetAttempts: 0,
      passwordResetLockedUntil: null,
    },
  });

  return {
    recoveryCode,
    question,
    questionText: SECURITY_QUESTIONS[question],
  };
};

// ============================================================
// GET SECURITY QUESTION
// ============================================================

/**
 * دریافت سوال امنیتی کاربر (برای صفحه فراموشی رمز)
 * بدون افشای اینکه کاربر وجود داره یا نه.
 */
const getSecurityQuestionForUser = async (identifier) => {
  if (!identifier || typeof identifier !== "string") {
    throw new AppError("شناسه ورود الزامی است.", 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { phoneNumber: identifier },
        { email: identifier },
        { username: identifier },
      ],
    },
    select: {
      id: true,
      securityQuestion: true,
      recoverySetupDone: true,
      passwordResetLockedUntil: true,
    },
  });

  if (!user) {
    throw new AppError(
      "اطلاعات بازیابی برای این کاربر تنظیم نشده است.",
      404,
    );
  }

  if (!user.recoverySetupDone || !user.securityQuestion) {
    throw new AppError(
      "برای این حساب، اطلاعات بازیابی تنظیم نشده است. لطفاً با پشتیبانی تماس بگیرید.",
      400,
    );
  }

  if (
    user.passwordResetLockedUntil &&
    user.passwordResetLockedUntil > new Date()
  ) {
    const minutes = Math.ceil(
      (user.passwordResetLockedUntil.getTime() - Date.now()) / 60000,
    );
    throw new AppError(
      `حساب شما به‌دلیل تلاش‌های ناموفق موقتاً قفل شده است. لطفاً ${minutes} دقیقه دیگر تلاش کنید.`,
      429,
    );
  }

  return {
    question: user.securityQuestion,
    questionText: SECURITY_QUESTIONS[user.securityQuestion],
  };
};

// ============================================================
// RESET WITH SECURITY QUESTION
// ============================================================

const resetPasswordWithQuestion = async (identifier, answer, newPassword) => {
  if (!newPassword || newPassword.length < 6 || newPassword.length > 72) {
    throw new AppError("رمز عبور باید بین ۶ تا ۷۲ کاراکتر باشد.", 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { phoneNumber: identifier },
        { email: identifier },
        { username: identifier },
      ],
    },
  });

  if (!user) {
    throw new AppError("اطلاعات بازیابی نامعتبر است.", 400);
  }

  if (
    user.passwordResetLockedUntil &&
    user.passwordResetLockedUntil > new Date()
  ) {
    const minutes = Math.ceil(
      (user.passwordResetLockedUntil.getTime() - Date.now()) / 60000,
    );
    throw new AppError(
      `حساب شما موقتاً قفل شده است. لطفاً ${minutes} دقیقه دیگر تلاش کنید.`,
      429,
    );
  }

  if (!user.securityAnswerHash || !user.recoverySetupDone) {
    throw new AppError("بازیابی رمز برای این حساب تنظیم نشده است.", 400);
  }

  const normalized = normalizeAnswer(answer);
  const valid = await bcrypt.compare(normalized, user.securityAnswerHash);

  if (!valid) {
    const attempts = user.passwordResetAttempts + 1;
    const shouldLock = attempts >= MAX_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetAttempts: shouldLock ? 0 : attempts,
        passwordResetLockedUntil: shouldLock
          ? new Date(Date.now() + LOCK_DURATION_MS)
          : null,
      },
    });

    if (shouldLock) {
      throw new AppError(
        "تعداد تلاش‌های ناموفق زیاد بود. حساب شما به‌مدت ۳۰ دقیقه قفل شد.",
        429,
      );
    }

    throw new AppError(
      `جواب سوال امنیتی اشتباه است. ${MAX_ATTEMPTS - attempts} تلاش دیگر باقی مانده.`,
      400,
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetAttempts: 0,
      passwordResetLockedUntil: null,
    },
  });

  return { success: true };
};

// ============================================================
// RESET WITH RECOVERY CODE
// ============================================================

const resetPasswordWithRecoveryCode = async (
  identifier,
  code,
  newPassword,
) => {
  if (!newPassword || newPassword.length < 6 || newPassword.length > 72) {
    throw new AppError("رمز عبور باید بین ۶ تا ۷۲ کاراکتر باشد.", 400);
  }

  const normalizedCode = normalizeRecoveryCode(code);
  if (normalizedCode.length !== RECOVERY_CODE_LENGTH) {
    throw new AppError("کد بازیابی نامعتبر است.", 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { phoneNumber: identifier },
        { email: identifier },
        { username: identifier },
      ],
    },
  });

  if (!user) {
    throw new AppError("اطلاعات بازیابی نامعتبر است.", 400);
  }

  if (
    user.passwordResetLockedUntil &&
    user.passwordResetLockedUntil > new Date()
  ) {
    const minutes = Math.ceil(
      (user.passwordResetLockedUntil.getTime() - Date.now()) / 60000,
    );
    throw new AppError(
      `حساب شما موقتاً قفل شده است. لطفاً ${minutes} دقیقه دیگر تلاش کنید.`,
      429,
    );
  }

  if (!user.recoveryCodeHash || !user.recoverySetupDone) {
    throw new AppError("کد بازیابی برای این حساب تنظیم نشده است.", 400);
  }

  const valid = await bcrypt.compare(normalizedCode, user.recoveryCodeHash);

  if (!valid) {
    const attempts = user.passwordResetAttempts + 1;
    const shouldLock = attempts >= MAX_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetAttempts: shouldLock ? 0 : attempts,
        passwordResetLockedUntil: shouldLock
          ? new Date(Date.now() + LOCK_DURATION_MS)
          : null,
      },
    });

    if (shouldLock) {
      throw new AppError(
        "تعداد تلاش‌های ناموفق زیاد بود. حساب شما به مدت ۳۰ دقیقه قفل شد.",
        429,
      );
    }

    throw new AppError(
      `کد بازیابی اشتباه است. ${MAX_ATTEMPTS - attempts} تلاش دیگر باقی مانده.`,
      400,
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      passwordResetAttempts: 0,
      passwordResetLockedUntil: null,
    },
  });

  return { success: true };
};

// ============================================================
// STATUS
// ============================================================

const getRecoveryStatus = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      recoverySetupDone: true,
      recoverySetupAt: true,
      securityQuestion: true,
    },
  });

  if (!user) {
    throw new AppError("کاربر یافت نشد.", 404);
  }

  return {
    isSetup: user.recoverySetupDone,
    setupAt: user.recoverySetupAt,
    question: user.securityQuestion,
    questionText: user.securityQuestion
      ? SECURITY_QUESTIONS[user.securityQuestion]
      : null,
  };
};

module.exports = {
  setupSecurityRecovery,
  getSecurityQuestionForUser,
  resetPasswordWithQuestion,
  resetPasswordWithRecoveryCode,
  getRecoveryStatus,
  SECURITY_QUESTIONS,
};