const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { SUBSCRIPTION_STATUS } = require("../constants/subscription");
const { getPlanPricing } = require("../utils/planHelper");
const achievementService = require("./achievementService");

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

const getPlanPricingById = async (planId) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new AppError("Subscription plan not found", 404);
  }

  const pricing = getPlanPricing(plan);
  return { plan, pricing };
};

const getSubscriptionPlans = async () => {
  const plans = await prisma.subscriptionPlan.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ order: "asc" }, { price: "asc" }],
  });

  return plans.map((plan) => {
    const pricing = getPlanPricing(plan);
    return {
      ...plan,
      ...pricing,
    };
  });
};

const getSubscriptionPlanById = async (id) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });

  if (!plan) {
    throw new AppError("Subscription plan not found", 404);
  }

  const pricing = getPlanPricing(plan);
  return {
    ...plan,
    ...pricing,
  };
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

// ==================== چک FIRST_SUBSCRIPTION ====================
const checkFirstSubscriptionAchievement = async (userId) => {
  try {
    const stats = await achievementService.getUserStats(userId);

    if (stats.hasSubscription) return;

    await achievementService.updateUserStats(userId, {
      hasSubscription: true,
      membershipStart: new Date(),
    });

    const newlyUnlocked =
      await achievementService.checkAndUnlockAchievements(userId);

    if (newlyUnlocked.length > 0) {
      console.log(
        `🏆 User ${userId} unlocked ${newlyUnlocked.length} achievements:`,
        newlyUnlocked.map((ua) => ua.tier?.title),
      );
    }
  } catch (err) {
    console.error("checkFirstSubscriptionAchievement error:", err);
  }
};

// ==================== createSubscription ====================
const createSubscription = async ({
  userId,
  planId,
  startDate = new Date(),
}) => {
  const plan = await getSubscriptionPlanById(planId);

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + plan.durationDays);

  const subscription = await prisma.$transaction(async (tx) => {
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

  await checkFirstSubscriptionAchievement(userId);

  return subscription;
};

const getAdminPlans = async () => {
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return plans.map((plan) => {
    const pricing = getPlanPricing(plan);
    return {
      ...plan,
      ...pricing,
    };
  });
};

// ==================== محاسبه‌ی مبلغ واقعی پرداختی ====================
const getActualPaidAmount = async (tx, subscription) => {
  const payment = await tx.payment.findFirst({
    where: {
      subscriptionId: subscription.id,
      status: "paid",
    },
    orderBy: { paidAt: "desc" },
    select: { amount: true, discountAmount: true },
  });

  if (payment?.amount) {
    return payment.amount;
  }

  const fallbackPayment = await tx.payment.findFirst({
    where: {
      userId: subscription.userId,
      planId: subscription.planId,
      status: "paid",
      type: "subscription",
    },
    orderBy: { createdAt: "desc" },
    select: { amount: true },
  });

  if (fallbackPayment?.amount) {
    return fallbackPayment.amount;
  }

  return subscription.plan?.price ?? 0;
};

// ==================== 🆕 Refund اشتراک قدیمی ====================
/**
 * بازگشت وجه اشتراک قدیمی.
 *
 * 🆕 قانون جدید:
 * فقط اگه اشتراک جدید **گرون‌تر** از اشتراک فعلی باشه، refund انجام میشه.
 * (یعنی کاربر داره به یه پلن بالاتر ارتقا میده)
 *
 * @param {object} tx - تراکنش Prisma
 * @param {object} oldSubscription - اشتراک فعال قبلی (با plan)
 * @param {object} newPlan - پلن جدید که کاربر داره میخره (با price)
 * @returns {Promise<{refundAmount, remainingDays, actualPaidAmount} | null>}
 */
const refundOldSubscription = async (tx, oldSubscription, newPlan) => {
  if (
    !oldSubscription ||
    oldSubscription.status !== SUBSCRIPTION_STATUS.ACTIVE
  ) {
    return null;
  }

  // 🆕 قانون: فقط اگه اشتراک جدید گرون‌تر باشه
  const oldPlanPrice = oldSubscription.plan?.price ?? 0;
  const newPlanPrice = newPlan?.price ?? 0;

  if (newPlanPrice <= oldPlanPrice) {
    return null; // اشتراک جدید بهتر/گرون‌تر نیست → refund نمیشه
  }

  const now = new Date();
  const endDate = new Date(oldSubscription.endDate);
  const startDate = new Date(oldSubscription.startDate);

  if (endDate <= now) return null;

  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const remainingDays = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (totalDays <= 0 || remainingDays <= 0) return null;

  // 🆕 استفاده از مبلغ واقعی پرداختی (نه قیمت اصلی)
  const actualPaidAmount = await getActualPaidAmount(tx, oldSubscription);

  if (actualPaidAmount <= 0) return null;

  // 🆕 refund نسبی بر اساس مبلغ واقعی
  const refundAmount = Math.floor(
    (remainingDays / totalDays) * actualPaidAmount,
  );

  if (refundAmount <= 0) return null;

  // 🔹 گرفتن یا ساخت کیف پول
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
          actualPaidAmount,
          originalPlanPrice: oldSubscription.plan?.price ?? 0,
          newPlanId: newPlan?.id ?? null,
          newPlanPrice: newPlanPrice,
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
          actualPaidAmount,
          originalPlanPrice: oldSubscription.plan?.price ?? 0,
          newPlanId: newPlan?.id ?? null,
          newPlanPrice: newPlanPrice,
        },
      },
    });
  }

  await tx.subscription.update({
    where: { id: oldSubscription.id },
    data: {
      status: SUBSCRIPTION_STATUS.CANCELLED,
      cancelledAt: now,
      cancelReason: "replaced_by_new_subscription",
    },
  });

  return { refundAmount, remainingDays, actualPaidAmount };
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
  getPlanPricingById,
  checkFirstSubscriptionAchievement,
  getActualPaidAmount,
};
