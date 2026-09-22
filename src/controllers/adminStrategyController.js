const strategyService = require("../services/strategyService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== 🔹 لیست همه (ادمین) ====================
const listPlans = asyncHandler(async (req, res) => {
  const result = await strategyService.listPlansForAdmin({
    grade: req.query.grade,
    major: req.query.major,
    isPublished: req.query.isPublished,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

// ==================== 🔹 جزئیات ====================
const getPlan = asyncHandler(async (req, res) => {
  const plan = await strategyService.getPlanById(req.params.id);
  res.status(200).json({ plan });
});

// ==================== 🔹 ساخت ====================
const createPlan = asyncHandler(async (req, res) => {
  const plan = await strategyService.createPlan({
    adminId: req.user.id,
    data: req.body,
  });
  res.status(201).json({
    message: plan.isPublished
      ? "برنامه راهبردی ساخته و منتشر شد"
      : "برنامه راهبردی ساخته شد",
    plan,
  });
});

// ==================== 🔹 ویرایش ====================
const updatePlan = asyncHandler(async (req, res) => {
  const plan = await strategyService.updatePlan({
    planId: req.params.id,
    data: req.body,
  });
  res.status(200).json({
    message: "برنامه راهبردی ویرایش شد",
    plan,
  });
});

// ==================== 🔹 حذف ====================
const deletePlan = asyncHandler(async (req, res) => {
  await strategyService.deletePlan(req.params.id);
  res.status(200).json({ message: "برنامه راهبردی حذف شد" });
});

// ==================== 🔹 انتشار ====================
const publishPlan = asyncHandler(async (req, res) => {
  const plan = await strategyService.publishPlan(req.params.id);
  res.status(200).json({
    message: "برنامه راهبردی منتشر شد",
    plan,
  });
});

// ==================== 🔹 لغو انتشار ====================
const unpublishPlan = asyncHandler(async (req, res) => {
  const plan = await strategyService.unpublishPlan(req.params.id);
  res.status(200).json({
    message: "انتشار برنامه راهبردی لغو شد",
    plan,
  });
});

module.exports = {
  listPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  publishPlan,
  unpublishPlan,
};
