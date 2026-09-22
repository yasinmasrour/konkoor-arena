const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const counselorPlanController = require("../controllers/counselorPlanController");
const {
  createStudyPlanSchema,
  updateStudyPlanSchema,
  addTaskSchema,
  updateTaskSchema,
  createPersonalExamSchema,
  listPlansSchema,
} = require("../validations/studyPlanValidation");

const router = express.Router();

// 🔹 همه مسیرها نیاز به COUNSELOR یا ADMIN دارن
router.use(protect);
router.use(allowRoles("COUNSELOR", "ADMIN"));

// ==================== 🔹 لیست و ساخت ====================
router.get(
  "/",
  validate(listPlansSchema, "query"),
  counselorPlanController.listPlans,
);

router.post(
  "/",
  validate(createStudyPlanSchema),
  counselorPlanController.createPlan,
);

// ==================== 🔹 جزئیات ====================
router.get("/:id", counselorPlanController.getPlan);

router.patch(
  "/:id",
  validate(updateStudyPlanSchema),
  counselorPlanController.updatePlan,
);

router.delete("/:id", counselorPlanController.deletePlan);

// ==================== 🔹 تسک‌ها ====================
router.post(
  "/:id/tasks",
  validate(addTaskSchema),
  counselorPlanController.addTask,
);

router.patch(
  "/:id/tasks/:taskId",
  validate(updateTaskSchema),
  counselorPlanController.updateTask,
);

router.delete("/:id/tasks/:taskId", counselorPlanController.deleteTask);

// ==================== 🔹 آزمون شخصی ====================
router.post(
  "/:id/exam",
  validate(createPersonalExamSchema),
  counselorPlanController.createPersonalExam,
);

router.get("/:id/exam", counselorPlanController.getPersonalExam);

router.delete("/:id/exam", counselorPlanController.deletePersonalExam);

// ==================== 🔹 نتیجه آزمون ====================
router.get("/:id/exam/result/:examId", counselorPlanController.getExamResult);

module.exports = router;
