const express = require("express");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const studyPlanController = require("../controllers/studyPlanController");
const { listPlansSchema } = require("../validations/studyPlanValidation");

const router = express.Router();

// 🔹 همه مسیرها نیاز به احراز هویت دارن
router.use(protect);

// ==================== 🔹 برنامه‌های من ====================
router.get(
  "/me",
  validate(listPlansSchema, "query"),
  studyPlanController.getMyPlans,
);

router.get("/:id", studyPlanController.getMyPlan);

// ==================== 🔹 تیک تسک ====================
router.patch("/:id/tasks/:taskId/toggle", studyPlanController.toggleTask);

module.exports = router;
