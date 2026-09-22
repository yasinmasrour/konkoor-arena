const express = require("express");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const strategyController = require("../controllers/strategyController");
const {
  listStrategyPlansSchema,
} = require("../validations/strategyValidation");

const router = express.Router();

// ==================== 🔹 عمومی ====================
router.get(
  "/",
  validate(listStrategyPlansSchema, "query"),
  strategyController.getPublishedPlans,
);

// ==================== 🔹 نیاز به احراز هویت (قبل از :id) ====================
router.get("/me/best", protect, strategyController.getBestPlanForMe);

// ==================== 🔹 داینامیک (آخر) ====================
router.get("/:id", strategyController.getPublishedPlanById);

module.exports = router;
