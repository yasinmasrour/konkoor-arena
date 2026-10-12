const rateLimit = require("express-rate-limit");

// ============================================================
// GENERAL API RATE LIMITER
// ============================================================

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
});

// ============================================================
// LOGIN RATE LIMITER
// ============================================================

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "error",
    message: "Too many login attempts, please try again later.",
  },
});

// ============================================================
// REGISTER RATE LIMITER
// ============================================================

const registerRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "error",
    message: "Too many registration attempts, please try again later.",
  },
});

/*
 * ============================================================
 * SMS / OTP VERIFICATION RATE LIMITER — DISABLED
 * ============================================================
 *
 * این Rate Limiter مربوط به endpoint تأیید کد SMS است.
 * فعلاً endpoint مربوطه نیز غیرفعال شده است.
 *
const verifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "error",
    message: "Too many verification attempts, please try again later.",
  },
});
*/

/*
 * ============================================================
 * SMS / OTP RESEND RATE LIMITER — DISABLED
 * ============================================================
 *
 * این Rate Limiter مربوط به ارسال مجدد کد SMS است.
 *
const resendRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "error",
    message: "Too many verification code requests, please try again later.",
  },
});
*/

// ============================================================
// AI ANALYSIS RATE LIMITER
// ============================================================

const aiAnalysisRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "error",
    message: "Too many AI analysis requests, please try again later.",
  },
});

// ============================================================
// CHANGE PASSWORD RATE LIMITER
// ============================================================

const changePasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "error",
    message: "Too many password change attempts, please try again later.",
  },
});

// ============================================================
// WALLET RATE LIMITER
// ============================================================

const walletRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "error",
    message: "Too many wallet requests, please try again later.",
  },
});

// ============================================================
// 🆕 FORGOT PASSWORD RATE LIMITER
// ============================================================

const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "error",
    message: "Too many password reset attempts, please try again later.",
  },
});

// ============================================================
// 🆕 SECURITY SETUP RATE LIMITER
// ============================================================

const setupSecurityRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "error",
    message: "Too many security setup attempts, please try again later.",
  },
});

// ============================================================
// 🆕 CONTACT MESSAGE RATE LIMITER
// ============================================================

const contactRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // ۲۴ ساعت
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "error",
    message:
      "شما در ۲۴ ساعت گذشته حداکثر ۳ پیام ارسال کرده‌اید. لطفاً بعداً تلاش کنید.",
  },
});

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  apiRateLimiter,
  loginRateLimiter,
  registerRateLimiter,

  // SMS / OTP rate limiters are temporarily disabled.
  // They are intentionally kept above in comments so they
  // can be restored later.
  //
  // verifyRateLimiter,
  // resendRateLimiter,

  aiAnalysisRateLimiter,
  changePasswordRateLimiter,
  walletRateLimiter,

  // 🆕
  forgotPasswordRateLimiter,
  setupSecurityRateLimiter,
  contactRateLimiter,
};