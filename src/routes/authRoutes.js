const express = require("express");
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const protect = require("../middleware/authMiddleware");
const {
  loginRateLimiter,
  registerRateLimiter,
  forgotPasswordRateLimiter,
  setupSecurityRateLimiter,

  // SMS / OTP rate limiters are temporarily disabled.
  // verifyRateLimiter,
  // resendRateLimiter,
} = require("../middleware/rateLimiter");

const {
  registerSchema,
  loginSchema,
  setupSecuritySchema,
  forgotPasswordLookupSchema,
  resetPasswordWithQuestionSchema,
  resetPasswordWithRecoveryCodeSchema,

  // SMS / OTP validation schemas are temporarily disabled.
  // verificationSchema,
  // resendSchema,
} = require("../validations/authValidation");

const router = express.Router();

// ============================================================
// CAPTCHA
// ============================================================

router.get("/captcha", authController.captcha);

// ============================================================
// REGISTER
// ============================================================

router.post(
  "/register",
  registerRateLimiter,
  validate(registerSchema),
  authController.register,
);

/*
 * ============================================================
 * SMS / OTP REGISTRATION VERIFICATION — DISABLED
 * ============================================================
 *
 * This endpoint is intentionally kept commented out.
 *
router.post(
  "/register/verify",
  verifyRateLimiter,
  validate(verificationSchema),
  authController.verifyRegistration,
);
 * ============================================================
 */

// ============================================================
// LOGIN
// ============================================================

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  authController.login,
);

/*
 * ============================================================
 * SMS / OTP LOGIN VERIFICATION — DISABLED
 * ============================================================
 *
 * This endpoint is intentionally kept commented out.
 *
router.post(
  "/login/verify",
  verifyRateLimiter,
  validate(verificationSchema),
  authController.verifyLogin,
);
 * ============================================================
 */

/*
 * ============================================================
 * SMS / OTP RESEND — DISABLED
 * ============================================================
 *
 * This endpoint is intentionally kept commented out.
 *
router.post(
  "/verification/resend",
  resendRateLimiter,
  validate(resendSchema),
  authController.resendCode,
);
 * ============================================================
 */

// ============================================================
// 🆕 FORGOT PASSWORD
// ============================================================

// مرحله ۱: دریافت سوال امنیتی
router.post(
  "/forgot-password/lookup",
  forgotPasswordRateLimiter,
  validate(forgotPasswordLookupSchema),
  authController.forgotPasswordLookup,
);

// مرحله ۲: تغییر رمز با جواب سوال
router.post(
  "/forgot-password/answer",
  forgotPasswordRateLimiter,
  validate(resetPasswordWithQuestionSchema),
  authController.resetPasswordWithQuestion,
);

// مرحله ۲ (جایگزین): تغییر رمز با کد بازیابی
router.post(
  "/forgot-password/code",
  forgotPasswordRateLimiter,
  validate(resetPasswordWithRecoveryCodeSchema),
  authController.resetPasswordWithRecoveryCode,
);

// ============================================================
// 🆕 SECURITY RECOVERY SETUP (authenticated)
// ============================================================

router.post(
  "/security/setup",
  protect,
  setupSecurityRateLimiter,
  validate(setupSecuritySchema),
  authController.setupSecurity,
);

router.get("/security/status", protect, authController.getRecoveryStatus);

// ============================================================
// CURRENT USER
// ============================================================

router.get("/me", protect, (req, res) =>
  res.status(200).json({
    user: req.user,
  }),
);

module.exports = router;
