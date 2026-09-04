const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { SUBSCRIPTION_STATUS } = require("../constants/subscription");

const expireSubscriptions = async (tx = prisma) => {
  await tx.subscription.updateMany({
    where: {
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: {
        lte: new Date(),
      },
    },
    data: {
      status: SUBSCRIPTION_STATUS.EXPIRED,
    },
  });
};

const getSubscriptionPlans = async () => {
  return prisma.subscriptionPlan.findMany({
    orderBy: [
      { durationDays: "asc" },
      { price: "asc" },
      { createdAt: "asc" },
    ],
  });
};

const getSubscriptionPlanById = async (id) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });

  if (!plan) {
    throw new AppError("Subscription plan not found", 404);
  }

  return plan;
};

const createSubscriptionPlan = async (data) => {
  return prisma.subscriptionPlan.create({
    data,
  });
};

const updateSubscriptionPlan = async (id, data) => {
  await getSubscriptionPlanById(id);

  return prisma.subscriptionPlan.update({
    where: { id },
    data,
  });
};

const deleteSubscriptionPlan = async (id) => {
  await getSubscriptionPlanById(id);

  const subscriptionCount = await prisma.subscription.count({
    where: { planId: id },
  });

  if (subscriptionCount > 0) {
    throw new AppError(
      "Subscription plan cannot be deleted because it has subscription history",
      409,
    );
  }

  await prisma.subscriptionPlan.delete({
    where: { id },
  });
};

const getCurrentSubscription = async (userId) => {
  await expireSubscriptions();

  return prisma.subscription.findFirst({
    where: {
      userId,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: {
        gt: new Date(),
      },
    },
    include: {
      plan: true,
    },
    orderBy: {
      endDate: "desc",
    },
  });
};

const getSubscriptionHistory = async (userId) => {
  await expireSubscriptions();

  return prisma.subscription.findMany({
    where: { userId },
    include: {
      plan: true,
    },
    orderBy: {
      startDate: "desc",
    },
  });
};

// Kept as a service-level primitive for the payment module that will be added later.
const createSubscription = async ({ userId, planId, startDate = new Date() }) => {
  const plan = await getSubscriptionPlanById(planId);

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + plan.durationDays);

  return prisma.$transaction(async (tx) => {
    await expireSubscriptions(tx);

    const activeSubscription = await tx.subscription.findFirst({
      where: {
        userId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        endDate: {
          gt: start,
        },
      },
      orderBy: {
        endDate: "desc",
      },
    });

    if (activeSubscription) {
      throw new AppError("User already has an active subscription", 409);
    }

    return tx.subscription.create({
      data: {
        userId,
        planId,
        startDate: start,
        endDate: end,
        status: SUBSCRIPTION_STATUS.ACTIVE,
      },
      include: {
        plan: true,
      },
    });
  });
};

module.exports = {
  getSubscriptionPlans,
  getSubscriptionPlanById,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getCurrentSubscription,
  getSubscriptionHistory,
  createSubscription,
  expireSubscriptions,
};
