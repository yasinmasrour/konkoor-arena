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
    where: {
      isActive: true,
    },
    orderBy: [{ order: "asc" }, { price: "asc" }],
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

const createSubscription = async ({
  userId,
  planId,
  startDate = new Date(),
}) => {
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

const getAdminPlans = async () => {
  return prisma.subscriptionPlan.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
};

// ==================== 🆕 Refund اشتراک قدیمی ====================
/**
 * محاسبه و بازگشت باقی‌مونده اشتراک قدیمی به کیف پول
 * @param {object} tx - تراکنش Prisma
 * @param {object} oldSubscription - اشتراک فعال قبلی (با plan)
 * @returns {Promise<{ refundAmount: number, remainingDays: number } | null>}
 */
const refundOldSubscription = async (tx, oldSubscription) => {
  if (
    !oldSubscription ||
    oldSubscription.status !== SUBSCRIPTION_STATUS.ACTIVE
  ) {
    return null;
  }

  const now = new Date();
  const endDate = new Date(oldSubscription.endDate);
  const startDate = new Date(oldSubscription.startDate);

  // اگه منقضی شده
  if (endDate <= now) return null;

  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const remainingDays = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (totalDays <= 0 || remainingDays <= 0) return null;

  // محاسبه refund نسبی
  const planPrice = oldSubscription.plan?.price ?? 0;
  const refundAmount = Math.floor((remainingDays / totalDays) * planPrice);

  if (refundAmount <= 0) return null;

  // 🔹 گرفتن کیف پول کاربر
  let wallet = await tx.wallet.findUnique({
    where: { userId: oldSubscription.userId },
  });

  if (!wallet) {
    wallet = await tx.wallet.create({
      data: {
        userId: oldSubscription.userId,
        balance: refundAmount,
        currency: "IRR",
      },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId: oldSubscription.userId,
        type: "REFUND",
        direction: "IN",
        amount: refundAmount,
        balanceBefore: 0,
        balanceAfter: refundAmount,
        status: "SUCCESS",
        description: `بازگشت وجه اشتراک ${oldSubscription.plan?.title || ""} (${remainingDays} روز باقی‌مانده)`,
        referenceId: oldSubscription.id,
        referenceType: "SUBSCRIPTION_REFUND",
        metadata: {
          oldSubscriptionId: oldSubscription.id,
          oldPlanId: oldSubscription.planId,
          remainingDays,
          totalDays,
        },
      },
    });
  } else {
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + refundAmount;

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: balanceAfter },
    });

    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId: oldSubscription.userId,
        type: "REFUND",
        direction: "IN",
        amount: refundAmount,
        balanceBefore,
        balanceAfter,
        status: "SUCCESS",
        description: `بازگشت وجه اشتراک ${oldSubscription.plan?.title || ""} (${remainingDays} روز باقی‌مانده)`,
        referenceId: oldSubscription.id,
        referenceType: "SUBSCRIPTION_REFUND",
        metadata: {
          oldSubscriptionId: oldSubscription.id,
          oldPlanId: oldSubscription.planId,
          remainingDays,
          totalDays,
        },
      },
    });
  }

  // 🔹 اشتراک قدیمی → cancelled
  await tx.subscription.update({
    where: { id: oldSubscription.id },
    data: {
      status: SUBSCRIPTION_STATUS.CANCELLED,
      cancelledAt: now,
      cancelReason: "replaced_by_new_subscription",
    },
  });

  return { refundAmount, remainingDays };
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
  getAdminPlans,
  refundOldSubscription,
};
