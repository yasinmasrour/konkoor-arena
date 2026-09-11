const express = require("express");
const authController = require("../controllers/authController");
const validate = require("../middleware/validate");
const protect = require("../middleware/authMiddleware");
const { authRateLimiter } = require("../middleware/rateLimiter");
const { registerSchema, loginSchema, verificationSchema } = require("../validations/authValidation");

const router = express.Router();

router.get("/captcha", authController.captcha);
router.post("/register", authRateLimiter, validate(registerSchema), authController.register);
router.post("/register/verify", authRateLimiter, validate(verificationSchema), authController.verifyRegistration);
router.post("/login", authRateLimiter, validate(loginSchema), authController.login);
router.post("/login/verify", authRateLimiter, validate(verificationSchema), authController.verifyLogin);
router.post("/verification/resend", authRateLimiter, authController.resendCode);

router.get("/me", protect, (req, res) => res.status(200).json({ user: req.user }));

module.exports = router;
