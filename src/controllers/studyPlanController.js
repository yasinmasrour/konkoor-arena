const studyPlanService = require("../services/studyPlanService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== 🔹 برنامه‌های من ====================
const getMyPlans = asyncHandler(async (req, res) => {
  const result = await studyPlanService.getMyPlans({
    studentId: req.user.id,
    status: req.query.status,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

// ==================== 🔹 جزئیات برنامه ====================
const getMyPlan = asyncHandler(async (req, res) => {
  const plan = await studyPlanService.getPlanById(req.params.id);

  // 🔹 چک دسترسی
  if (plan.studentId !== req.user.id) {
    throw new (require("../utils/appError"))("دسترسی مجاز نیست", 403);
  }

  res.status(200).json({ plan });
});

// ==================== 🔹 تیک/برداشتن تسک ====================
const toggleTask = asyncHandler(async (req, res) => {
  const task = await studyPlanService.toggleTask({
    planId: req.params.id,
    taskId: req.params.taskId,
    studentId: req.user.id,
  });
  res.status(200).json({
    message: task.isCompleted ? "تسک انجام شد" : "تیک برداشته شد",
    task,
  });
});

module.exports = {
  getMyPlans,
  getMyPlan,
  toggleTask,
};
