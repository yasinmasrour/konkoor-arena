const express = require("express");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const referralController = require("../controllers/referralController");
const {
  validateCodeSchema,
  calculateDiscountSchema,
  historyQuerySchema,
} = require("../validations/referralValidation");

const router = express.Router();

// 🔹 همهی مسیرها نیاز به احراز هویت دارن
router.use(protect);

// ==================== 🔹 اطلاعات من ====================
router.get("/me", referralController.getMyReferralInfo);

// ==================== 🔹 اعتبارسنجی کد ====================
router.post(
  "/validate",
  validate(validateCodeSchema),
  referralController.validateCode,
);

// ==================== 🔹 محاسبه تخفیف ====================
router.post(
  "/calculate-discount",
  validate(calculateDiscountSchema),
  referralController.calculateDiscount,
);

// ==================== 🔹 تاریخچه ====================
router.get(
  "/history",
  validate(historyQuerySchema, "query"),
  referralController.getReferralHistory,
);

module.exports = router;
