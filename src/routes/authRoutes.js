const express = require("express");
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const protect = require("../middleware/authMiddleware");
const {
  loginRateLimiter,
  registerRateLimiter,
  verifyRateLimiter,
  resendRateLimiter,
} = require("../middleware/rateLimiter");
const {
  registerSchema,
  loginSchema,
  verificationSchema,
  resendSchema,
} = require("../validations/authValidation");

const router = express.Router();

router.get("/captcha", authController.captcha);

router.post(
  "/register",
  registerRateLimiter,
  validate(registerSchema),
  authController.register,
);
router.post(
  "/register/verify",
  verifyRateLimiter,
  validate(verificationSchema),
  authController.verifyRegistration,
);

router.post(
  "/login",
  loginRateLimiter,
  validate(loginSchema),
  authController.login,
);
router.post(
  "/login/verify",
  verifyRateLimiter,
  validate(verificationSchema),
  authController.verifyLogin,
);

router.post(
  "/verification/resend",
  resendRateLimiter,
  validate(resendSchema),
  authController.resendCode,
);

router.get("/me", protect, (req, res) =>
  res.status(200).json({ user: req.user }),
);

module.exports = router;
