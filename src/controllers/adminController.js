const adminService = require("../services/adminService");
const subscriptionService = require("../services/subscriptionService");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

// ==================== لیست کاربران ====================
const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: req.query.search,
    role: req.query.role,
    sort: req.query.sort || "createdAt",
    order: req.query.order || "desc",
  });
  res.status(200).json(result);
});

// ==================== جزئیات کاربر ====================
const getUserDetails = asyncHandler(async (req, res) => {
  const user = await adminService.getUserDetails(req.params.id);
  res.status(200).json({ user });
});

// ==================== تغییر نقش ====================
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role) throw new AppError("role الزامی است", 400);

  const user = await adminService.changeUserRole({
    userId: req.params.id,
    roleName: role,
    adminId: req.user.id,
  });

  res.status(200).json({
    message: "نقش کاربر با موفقیت تغییر کرد",
    user,
  });
});

// ==================== حذف کاربر ====================
const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser({
    userId: req.params.id,
    adminId: req.user.id,
  });

  res.status(200).json({
    message: "کاربر با موفقیت حذف شد",
  });
});

// ==================== آمار کلی ====================
const getGlobalStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getGlobalStats();
  res.status(200).json(stats);
});

// ==================== شارژ دستی کیف پول ====================
const adminChargeWallet = asyncHandler(async (req, res) => {
  const { userId, amount, description } = req.body;

  if (!userId || !amount) {
    throw new AppError("userId و amount الزامی هستند", 400);
  }

  const result = await adminService.adminChargeWallet({
    userId,
    amount: Number(amount),
    description,
    adminId: req.user.id,
  });

  res.status(200).json({
    message: `کیف پول ${result.user.firstName} ${result.user.lastName} با موفقیت شارژ شد`,
    ...result,
  });
});

// ==================== 🔹 لیست همه پلنها ====================
const getSubscriptionPlans = asyncHandler(async (req, res) => {
  const plans = await subscriptionService.getAdminPlans();
  res.status(200).json({ plans });
});

// ==================== 🔹 ساخت پلن ====================
const createSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await subscriptionService.createSubscriptionPlan(req.body);
  res.status(201).json({
    message: "پلن ساخته شد",
    plan,
  });
});

// ==================== 🔹 ویرایش پلن ====================
const updateSubscriptionPlan = asyncHandler(async (req, res) => {
  const plan = await subscriptionService.updateSubscriptionPlan(
    req.params.id,
    req.body,
  );
  res.status(200).json({
    message: "پلن ویرایش شد",
    plan,
  });
});

// ==================== 🔹 حذف پلن ====================
const deleteSubscriptionPlan = asyncHandler(async (req, res) => {
  await subscriptionService.deleteSubscriptionPlan(req.params.id);
  res.status(200).json({ message: "پلن حذف شد" });
});

module.exports = {
  listUsers,
  getUserDetails,
  changeUserRole,
  deleteUser,
  getGlobalStats,
  adminChargeWallet,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
};
