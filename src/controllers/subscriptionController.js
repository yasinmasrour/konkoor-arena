const subscriptionService = require("../services/subscriptionService");
const asyncHandler = require("../utils/asyncHandler");

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
  const subscription = await subscriptionService.getCurrentSubscription(req.user.id);

  res.status(200).json({
    subscription,
  });
});

const getMySubscriptionHistory = asyncHandler(async (req, res) => {
  const subscriptions = await subscriptionService.getSubscriptionHistory(req.user.id);

  res.status(200).json({
    subscriptions,
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
};
