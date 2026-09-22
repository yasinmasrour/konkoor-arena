const studyPlanService = require("../services/studyPlanService");
const personalExamService = require("../services/personalExamService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== 🔹 لیست برنامه‌ها ====================
const listPlans = asyncHandler(async (req, res) => {
  const result = await studyPlanService.listPlans({
    status: req.query.status,
    studentId: req.query.studentId,
    examId: req.query.examId,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

// ==================== 🔹 جزئیات برنامه ====================
const getPlan = asyncHandler(async (req, res) => {
  const plan = await studyPlanService.getPlanById(req.params.id);
  res.status(200).json({ plan });
});

// ==================== 🔹 ساخت برنامه ====================
const createPlan = asyncHandler(async (req, res) => {
  const plan = await studyPlanService.createPlan({
    counselorId: req.user.id,
    data: req.body,
  });
  res.status(201).json({
    message: "برنامه مطالعاتی ساخته شد",
    plan,
  });
});

// ==================== 🔹 ویرایش برنامه ====================
const updatePlan = asyncHandler(async (req, res) => {
  const plan = await studyPlanService.updatePlan({
    planId: req.params.id,
    data: req.body,
  });
  res.status(200).json({
    message: "برنامه ویرایش شد",
    plan,
  });
});

// ==================== 🔹 حذف برنامه ====================
const deletePlan = asyncHandler(async (req, res) => {
  await studyPlanService.deletePlan(req.params.id);
  res.status(200).json({ message: "برنامه حذف شد" });
});

// ==================== 🔹 تسک‌ها ====================
const addTask = asyncHandler(async (req, res) => {
  const task = await studyPlanService.addTask({
    planId: req.params.id,
    data: req.body,
  });
  res.status(201).json({
    message: "تسک اضافه شد",
    task,
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await studyPlanService.updateTask({
    planId: req.params.id,
    taskId: req.params.taskId,
    data: req.body,
  });
  res.status(200).json({
    message: "تسک ویرایش شد",
    task,
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  await studyPlanService.deleteTask({
    planId: req.params.id,
    taskId: req.params.taskId,
  });
  res.status(200).json({ message: "تسک حذف شد" });
});

// ==================== 🔹 آزمون شخصی ====================
const createPersonalExam = asyncHandler(async (req, res) => {
  const exam = await studyPlanService.createPersonalExam({
    planId: req.params.id,
    data: req.body,
  });
  res.status(201).json({
    message: "آزمون شخصی ساخته شد",
    exam,
  });
});

const getPersonalExam = asyncHandler(async (req, res) => {
  const exam = await studyPlanService.getPersonalExam(req.params.id);
  res.status(200).json({ exam });
});

const deletePersonalExam = asyncHandler(async (req, res) => {
  await studyPlanService.deletePersonalExam(req.params.id);
  res.status(200).json({ message: "آزمون شخصی حذف شد" });
});

// ==================== 🔹 نتیجه آزمون (برای مشاور) ====================
const getExamResult = asyncHandler(async (req, res) => {
  const result = await personalExamService.getExamResult({
    personalExamId: req.params.examId,
    userId: req.user.id,
    userRole: req.user.role,
  });
  res.status(200).json(result);
});

module.exports = {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  addTask,
  updateTask,
  deleteTask,
  createPersonalExam,
  getPersonalExam,
  deletePersonalExam,
  getExamResult,
};
