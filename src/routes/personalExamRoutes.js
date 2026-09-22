const express = require("express");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const personalExamController = require("../controllers/personalExamController");
const {
  submitPersonalExamAnswerSchema,
  listPlansSchema,
} = require("../validations/studyPlanValidation");

const router = express.Router();

// 🔹 همه مسیرها نیاز به احراز هویت دارن
router.use(protect);

// ==================== 🔹 آزمون‌های من ====================
router.get(
  "/me",
  validate(listPlansSchema, "query"),
  personalExamController.getMyExams,
);

// ==================== 🔹 شروع ====================
router.post("/:id/start", personalExamController.startExam);

// ==================== 🔹 سوال فعلی ====================
router.get("/:id/current", personalExamController.getCurrentQuestion);

// ==================== 🔹 ثبت پاسخ ====================
router.post(
  "/:id/answer",
  validate(submitPersonalExamAnswerSchema),
  personalExamController.submitAnswer,
);

// ==================== 🔹 پایان ====================
router.post("/:id/submit", personalExamController.submitExam);

// ==================== 🔹 نتیجه ====================
router.get("/:id/result", personalExamController.getExamResult);

// ==================== 🔹 لغو ====================
router.post("/:id/abandon", personalExamController.abandonExam);

module.exports = router;
