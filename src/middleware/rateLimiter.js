const rateLimit = require("express-rate-limit");

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests, please try again later",
  },
});

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    status: "fail",
    message: "تعداد تلاش‌های ورود زیاد است. ۱۵ دقیقه بعد امتحان کن.",
  },
});

const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "تعداد درخواست‌های ثبت‌نام زیاد است. ۱ ساعت بعد امتحان کن.",
  },
});

const verifyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    status: "fail",
    message: "تعداد تلاش‌های تایید زیاد است. ۱۵ دقیقه بعد امتحان کن.",
  },
});

const resendRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "تعداد ارسال مجدد کد زیاد است. ۳۰ دقیقه بعد امتحان کن.",
  },
});

const aiAnalysisRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many AI analysis requests. Please try again later.",
  },
});

const changePasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "تعداد تلاش‌های تغییر رمز زیاد است. ۱ ساعت بعد امتحان کن.",
  },
});

const walletRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "تعداد درخواست‌های کیف پول زیاد است. ۱۵ دقیقه بعد امتحان کن.",
  },
});

module.exports = {
  apiRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
  verifyRateLimiter,
  resendRateLimiter,
  aiAnalysisRateLimiter,
  changePasswordRateLimiter,
  walletRateLimiter,
};
