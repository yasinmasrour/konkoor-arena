const subscriptionService = require("../services/subscriptionService");
const paymentService = require("../services/paymentService");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const getPlans = asyncHandler(async (req, res) => {
  const plans = await subscriptionService.getSubscriptionPlans();

  res.status(200).json({ plans });
});

const getPlanById = asyncHandler(async (req, res) => {
  const plan = await subscriptionService.getSubscriptionPlanById(req.params.id);

  res.status(200).json({ plan });
});

const createPlan = asyncHandler(async (req, res) => {
  const plan = await subscriptionService.createSubscriptionPlan(req.body);

  res.status(201).json({
    message: "Subscription plan created successfully",
    plan,
  });
});

const updatePlan = asyncHandler(async (req, res) => {
  const plan = await subscriptionService.updateSubscriptionPlan(
    req.params.id,
    req.body,
  );

  res.status(200).json({
    message: "Subscription plan updated successfully",
    plan,
  });
});

const deletePlan = asyncHandler(async (req, res) => {
  await subscriptionService.deleteSubscriptionPlan(req.params.id);

  res.status(200).json({
    message: "Subscription plan deleted successfully",
  });
});

const getMySubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getCurrentSubscription(
    req.user.id,
  );

  res.status(200).json({
    subscription,
  });
});

const getMySubscriptionHistory = asyncHandler(async (req, res) => {
  const subscriptions = await subscriptionService.getSubscriptionHistory(
    req.user.id,
  );

  res.status(200).json({
    subscriptions,
  });
});

// 🆕 خرید اشتراک
const purchaseSubscription = asyncHandler(async (req, res) => {
  const { planId, gateway = "wallet", referralCode } = req.body;

  if (!planId) {
    throw new AppError("planId الزامی است", 400);
  }

  const result = await paymentService.createSubscriptionPayment({
    userId: req.user.id,
    planId,
    gateway,
    referralCode,
  });

  res.status(201).json({
    message:
      result.payment.status === "paid"
        ? "اشتراک با موفقیت خریداری شد"
        : "پرداخت ایجاد شد. لطفاً به درگاه هدایت شوید.",
    payment: result.payment,
    subscription: result.subscription,
    ...(result.paymentUrl && {
      paymentUrl: result.paymentUrl,
    }),
    refundInfo: result.refundInfo || null,
  });
});

// 🆕 تأیید پرداخت اشتراک
const verifySubscriptionPayment = asyncHandler(async (req, res) => {
  const { paymentId, success = true } = req.body;

  if (!paymentId) {
    throw new AppError("paymentId الزامی است", 400);
  }

  const result = await paymentService.verifyPayment({
    paymentId,
    success,
  });

  res.status(200).json({
    message: success ? "پرداخت با موفقیت تأیید شد" : "پرداخت ناموفق بود",
    payment: result.payment,
    subscription: result.subscription,
  });
});

module.exports = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getMySubscription,
  getMySubscriptionHistory,
  purchaseSubscription, // 🆕
  verifySubscriptionPayment, // 🆕
};
