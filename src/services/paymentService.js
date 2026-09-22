const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const {
  PAYMENT_STATUS,
  PAYMENT_GATEWAY,
  PAYMENT_TYPE,
} = require("../constants/payment");
const { SUBSCRIPTION_STATUS } = require("../constants/subscription");
const subscriptionService = require("./subscriptionService");
const walletService = require("./walletService");
const notificationService = require("./notificationService");
const { NOTIFICATION_TYPES } = require("../constants/notification");
const referralService = require("./referralService");

const buildMerchantOrderId = (prefix = "PAY") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// ==================== 🔹 ساخت پرداخت اشتراک ====================
const createSubscriptionPayment = async ({
  userId,
  planId,
  gateway = PAYMENT_GATEWAY.WALLET,
  referralCode = null,
}) => {
  return prisma.$transaction(async (tx) => {
    await subscriptionService.expireSubscriptions?.(tx);

    const plan = await tx.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new AppError("پلن اشتراک پیدا نشد", 404);

    // 🆕 اشتراک فعال قبلی رو بگیر (اگه هست)
    const activeSubscription = await tx.subscription.findFirst({
      where: {
        userId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        endDate: { gt: new Date() },
      },
      include: { plan: true },
    });

    // ==================== محاسبه تخفیف Referral ====================
    let discount = 0;
    let pendingReferral = null;

    if (referralCode) {
      const discountInfo = await referralService.calculateDiscount(
        userId,
        referralCode,
        plan.price,
      );
      discount = discountInfo.discount;

      pendingReferral = await referralService.createPendingReferral({
        refereeId: userId,
        code: discountInfo.code,
        discount,
      });
    }

    const finalAmount = Math.max(0, plan.price - discount);
    // ================================================================

    // ==================== 🅰️ پرداخت با کیف پول ====================
    if (gateway === PAYMENT_GATEWAY.WALLET) {
      // 🆕 اگه اشتراک فعال داره، اول refund قدیمی
      let refundInfo = null;
      if (activeSubscription) {
        refundInfo = await subscriptionService.refundOldSubscription(
          tx,
          activeSubscription,
        );
      }

      // حالا از کیف پول کم کن
      await walletService.purchaseWithWallet({
        userId,
        amount: finalAmount,
        description: `خرید اشتراک ${plan.title}`,
        referenceType: "SUBSCRIPTION",
        metadata: {
          planId: plan.id,
          planTitle: plan.title,
          discount,
          refundAmount: refundInfo?.refundAmount || 0,
          referralId: pendingReferral?.id || null,
        },
        tx, // 🆕
      });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.durationDays);

      const subscription = await tx.subscription.create({
        data: {
          userId,
          planId: plan.id,
          startDate,
          endDate,
          status: SUBSCRIPTION_STATUS.ACTIVE,
        },
      });

      const payment = await tx.payment.create({
        data: {
          userId,
          planId: plan.id,
          type: PAYMENT_TYPE.SUBSCRIPTION,
          amount: finalAmount,
          discountAmount: discount,
          status: PAYMENT_STATUS.PAID,
          gateway: PAYMENT_GATEWAY.WALLET,
          merchantOrderId: buildMerchantOrderId("WAL"),
          transactionId: `WALLET-${Date.now()}`,
          paidAt: new Date(),
          subscriptionId: subscription.id,
          metadata: { planTitle: plan.title },
          ...(pendingReferral && { referralId: pendingReferral.id }),
        },
        include: { plan: true },
      });

      return {
        payment,
        subscription,
        pendingReferral,
        refundInfo,
      };
    }

    // ==================== 🅱️ پرداخت با درگاه (MOCK) ====================
    const existingPending = await tx.payment.findFirst({
      where: {
        userId,
        planId,
        status: PAYMENT_STATUS.PENDING,
        type: PAYMENT_TYPE.SUBSCRIPTION,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingPending)
      return {
        payment: existingPending,
        subscription: null,
        pendingReferral: null,
        refundInfo: null,
      };

    const payment = await tx.payment.create({
      data: {
        userId,
        planId,
        type: PAYMENT_TYPE.SUBSCRIPTION,
        amount: finalAmount,
        discountAmount: discount,
        status: PAYMENT_STATUS.PENDING,
        gateway: PAYMENT_GATEWAY.MOCK,
        merchantOrderId: buildMerchantOrderId("SUB"),
        ...(pendingReferral && { referralId: pendingReferral.id }),
      },
      include: { plan: true },
    });

    return {
      payment,
      subscription: null,
      pendingReferral,
      refundInfo: null,
    };
  });
};

// ==================== 🔹 تأیید پرداخت ====================
const verifyPayment = async ({ paymentId, success = true }) => {
  // 🔹 مرحله ۱: آپدیت Payment + Subscription توی تراکنش
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { plan: true, referral: true },
    });

    if (!payment) throw new AppError("پرداخت پیدا نشد", 404);
    if (payment.status !== PAYMENT_STATUS.PENDING) {
      throw new AppError("این پرداخت قبلاً بررسی شده است", 400);
    }

    // 🆕 اگه پرداخت fail شد
    if (!success) {
      if (payment.referral && payment.referral.status === "pending") {
        await tx.referral.update({
          where: { id: payment.referral.id },
          data: { status: "cancelled" },
        });
      }

      const failed = await tx.payment.update({
        where: { id: paymentId },
        data: { status: PAYMENT_STATUS.FAILED },
      });

      return { payment: failed, subscription: null, referralToComplete: null };
    }

    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PAYMENT_STATUS.PAID,
        paidAt: new Date(),
        transactionId: `MOCK-${Date.now()}`,
      },
    });

    // ==================== 🅰️ اشتراک ====================
    if (payment.type === PAYMENT_TYPE.SUBSCRIPTION && payment.plan) {
      const plan = payment.plan;

      // 🆕 اگه اشتراک فعال داره، refund قدیمی
      const activeSubscription = await tx.subscription.findFirst({
        where: {
          userId: payment.userId,
          status: SUBSCRIPTION_STATUS.ACTIVE,
          endDate: { gt: new Date() },
        },
        include: { plan: true },
      });

      if (activeSubscription) {
        await subscriptionService.refundOldSubscription(tx, activeSubscription);
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.durationDays);

      const subscription = await tx.subscription.create({
        data: {
          userId: payment.userId,
          planId: plan.id,
          startDate,
          endDate,
          status: SUBSCRIPTION_STATUS.ACTIVE,
        },
      });

      await tx.notification.create({
        data: {
          userId: payment.userId,
          type: NOTIFICATION_TYPES.SUBSCRIPTION_ACTIVATED,
          title: "اشتراک فعال شد",
          message: `اشتراک ${payment.plan?.title || ""} با موفقیت فعال شد.`,
          link: "/dashboard?section=subscription",
          icon: "crown",
          metadata: {
            planId: payment.planId,
            subscriptionId: subscription.id,
          },
        },
      });

      await tx.payment.update({
        where: { id: paymentId },
        data: { subscriptionId: subscription.id },
      });

      return {
        payment: updatedPayment,
        subscription,
        referralToComplete:
          payment.referral && payment.referral.status === "pending"
            ? payment.referral.id
            : null,
      };
    }

    // ==================== 🅱️ شارژ کیف پول ====================
    if (payment.type === PAYMENT_TYPE.WALLET_CHARGE) {
      await walletService.chargeWallet({
        userId: payment.userId,
        amount: payment.amount,
        description: "شارژ کیف پول",
        referenceId: payment.id,
        referenceType: "PAYMENT",
        tx, // 🆕
      });

      await tx.notification.create({
        data: {
          userId: payment.userId,
          type: NOTIFICATION_TYPES.WALLET_CHARGE,
          title: "کیف پول شارژ شد",
          message: `${(payment.amount / 10).toLocaleString("fa-IR")} تومان به کیف پولت اضافه شد.`,
          link: "/dashboard?section=wallet",
          icon: "wallet",
          metadata: { amount: payment.amount, paymentId: payment.id },
        },
      });
    }

    return {
      payment: updatedPayment,
      subscription: null,
      referralToComplete: null,
    };
  });

  // 🔹 مرحله ۲: بعد از commit، completeReferral
  if (success && result.referralToComplete) {
    try {
      await referralService.completeReferral(
        result.referralToComplete,
        result.payment.id,
      );
    } catch (error) {
      console.error(
        "❌ [PaymentService] completeReferral failed:",
        error.message,
      );
    }
  }

  return {
    payment: result.payment,
    subscription: result.subscription,
  };
};

// ==================== 🔹 بقیه توابع ====================
const createWalletChargePayment = async ({
  userId,
  amount,
  gateway = PAYMENT_GATEWAY.MOCK,
}) => {
  if (amount < walletService.WALLET_CONFIG.minChargeAmount) {
    throw new AppError(
      `حداقل مبلغ شارژ ${walletService.WALLET_CONFIG.minChargeAmount / 10} تومان است`,
      400,
    );
  }
  if (amount > walletService.WALLET_CONFIG.maxChargeAmount) {
    throw new AppError(
      `حداکثر مبلغ شارژ ${walletService.WALLET_CONFIG.maxChargeAmount / 10} تومان است`,
      400,
    );
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      type: PAYMENT_TYPE.WALLET_CHARGE,
      amount,
      status: PAYMENT_STATUS.PENDING,
      gateway,
      merchantOrderId: buildMerchantOrderId("WCH"),
    },
  });

  return payment;
};

const getMyPayments = async (userId) =>
  prisma.payment.findMany({
    where: { userId },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

const getPaymentByIdForUser = async ({ paymentId, userId }) => {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId },
    include: { plan: true },
  });

  if (!payment) throw new AppError("پرداخت پیدا نشد", 404);
  return payment;
};

const getPaymentById = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      plan: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });
  if (!payment) throw new AppError("پرداخت پیدا نشد", 404);
  return payment;
};

module.exports = {
  createSubscriptionPayment,
  createWalletChargePayment,
  verifyPayment,
  getMyPayments,
  getPaymentByIdForUser,
  getPaymentById,
};
