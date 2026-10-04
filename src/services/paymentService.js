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
const { getPlanPricing } = require("../utils/planHelper");
const zarinpalService = require("./zarinpalService");
const { zarinpalCallbackUrl } = require("../config/env");

const buildMerchantOrderId = (prefix = "PAY") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// ============================================================
// 🆕 Helper: ساخت paymentUrl از authority
// ============================================================
const buildZarinPalPaymentUrl = (authority, sandbox) => {
  const base = sandbox
    ? "https://sandbox.zarinpal.com/pg/StartPay"
    : "https://www.zarinpal.com/pg/StartPay";
  return `${base}/${authority}`;
};

// ============================================================
// 🆕 Helper: درخواست از زرین‌پال + ذخیره authority
// ============================================================
const requestZarinPalAndSaveAuthority = async ({
  paymentId,
  amount,
  description,
  mobile,
  email,
}) => {
  const zarinpalResult = await zarinpalService.requestPayment({
    amount,
    callbackUrl: zarinpalCallbackUrl,
    description,
    mobile: mobile || undefined,
    email: email || undefined,
  });

  await prisma.payment.update({
    where: { id: paymentId },
    data: { authority: zarinpalResult.authority },
  });

  return zarinpalResult;
};

// ============================================================
// اشتراک — زرین‌پال
// ============================================================
const createZarinPalSubscriptionPayment = async ({
  userId,
  planId,
  referralCode = null,
}) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) throw new AppError("پلن اشتراک پیدا نشد", 404);

  const pricing = getPlanPricing(plan);

  let discount = 0;
  let pendingReferral = null;

  if (referralCode) {
    const discountInfo = await referralService.calculateDiscount(
      userId,
      referralCode,
      pricing.finalPrice,
    );

    discount = discountInfo.discount;

    pendingReferral = await referralService.createPendingReferral({
      refereeId: userId,
      code: discountInfo.code,
      discount,
    });
  }

  const finalAmount = Math.max(0, pricing.finalPrice - discount);

  if (finalAmount <= 0) {
    if (pendingReferral) {
      await prisma.referral.update({
        where: { id: pendingReferral.id },
        data: { status: "cancelled" },
      });
    }

    throw new AppError("مبلغ نهایی برای پرداخت با درگاه نامعتبر است", 400);
  }

  const existingPending = await prisma.payment.findFirst({
    where: {
      userId,
      planId,
      gateway: PAYMENT_GATEWAY.ZARINPAL,
      status: PAYMENT_STATUS.PENDING,
      type: PAYMENT_TYPE.SUBSCRIPTION,
    },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });

  if (existingPending?.authority) {
    return {
      payment: existingPending,
      subscription: null,
      paymentUrl: buildZarinPalPaymentUrl(existingPending.authority),
    };
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      planId,
      type: PAYMENT_TYPE.SUBSCRIPTION,
      amount: finalAmount,
      discountAmount: pricing.discountAmount + discount,
      status: PAYMENT_STATUS.PENDING,
      gateway: PAYMENT_GATEWAY.ZARINPAL,
      merchantOrderId: buildMerchantOrderId("ZP-SUB"),
      metadata: {
        planTitle: plan.title,
        originalPrice: plan.price,
        planDiscountPercent: pricing.discountPercent,
        planDiscountAmount: pricing.discountAmount,
        referralDiscount: discount,
      },
      ...(pendingReferral && { referralId: pendingReferral.id }),
    },
    include: { plan: true },
  });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneNumber: true, email: true },
    });

    const zarinpalResult = await requestZarinPalAndSaveAuthority({
      paymentId: payment.id,
      amount: payment.amount,
      description: `خرید اشتراک ${plan.title}`,
      mobile: user?.phoneNumber,
      email: user?.email,
    });

    const updatedPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: { plan: true },
    });

    return {
      payment: updatedPayment,
      subscription: null,
      paymentUrl: zarinpalResult.paymentUrl,
    };
  } catch (error) {
    if (pendingReferral) {
      await prisma.referral.update({
        where: { id: pendingReferral.id },
        data: { status: "cancelled" },
      });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PAYMENT_STATUS.FAILED },
    });

    throw error;
  }
};

// ============================================================
// اشتراک — wallet
// ============================================================
const createWalletSubscriptionPayment = async ({
  userId,
  planId,
  referralCode = null,
}) => {
  return prisma.$transaction(async (tx) => {
    await subscriptionService.expireSubscriptions?.(tx);

    const plan = await tx.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new AppError("پلن اشتراک پیدا نشد", 404);

    const pricing = getPlanPricing(plan);

    const activeSubscription = await tx.subscription.findFirst({
      where: {
        userId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        endDate: { gt: new Date() },
      },
      include: { plan: true },
    });

    let discount = 0;
    let pendingReferral = null;

    if (referralCode) {
      const discountInfo = await referralService.calculateDiscount(
        userId,
        referralCode,
        pricing.finalPrice,
      );
      discount = discountInfo.discount;

      pendingReferral = await referralService.createPendingReferral({
        refereeId: userId,
        code: discountInfo.code,
        discount,
      });
    }

    const finalAmount = Math.max(0, pricing.finalPrice - discount);

    let refundInfo = null;
    if (activeSubscription) {
      refundInfo = await subscriptionService.refundOldSubscription(
        tx,
        activeSubscription,
      );
    }

    await walletService.purchaseWithWallet({
      userId,
      amount: finalAmount,
      description: `خرید اشتراک ${plan.title}`,
      referenceType: "SUBSCRIPTION",
      metadata: {
        planId: plan.id,
        planTitle: plan.title,
        originalPrice: plan.price,
        planDiscountPercent: pricing.discountPercent,
        planDiscountAmount: pricing.discountAmount,
        referralDiscount: discount,
        refundAmount: refundInfo?.refundAmount || 0,
        referralId: pendingReferral?.id || null,
      },
      tx,
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
        discountAmount: pricing.discountAmount + discount,
        status: PAYMENT_STATUS.PAID,
        gateway: PAYMENT_GATEWAY.WALLET,
        merchantOrderId: buildMerchantOrderId("WAL"),
        transactionId: `WALLET-${Date.now()}`,
        paidAt: new Date(),
        subscriptionId: subscription.id,
        metadata: {
          planTitle: plan.title,
          originalPrice: plan.price,
          planDiscountPercent: pricing.discountPercent,
          planDiscountAmount: pricing.discountAmount,
          referralDiscount: discount,
        },
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
  });
};

// ============================================================
// اشتراک — انتخاب درگاه
// ============================================================
const createSubscriptionPayment = async ({
  userId,
  planId,
  gateway = PAYMENT_GATEWAY.WALLET,
  referralCode = null,
}) => {
  if (gateway === PAYMENT_GATEWAY.ZARINPAL) {
    return createZarinPalSubscriptionPayment({
      userId,
      planId,
      referralCode,
    });
  }

  return createWalletSubscriptionPayment({
    userId,
    planId,
    referralCode,
  });
};

// ============================================================
// 🆕 شارژ کیف پول — زرین‌پال
// ============================================================
const createZarinPalWalletChargePayment = async ({ userId, amount }) => {
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

  // اگه پرداخت pending قبلی هست، همون رو برگردون
  const existingPending = await prisma.payment.findFirst({
    where: {
      userId,
      type: PAYMENT_TYPE.WALLET_CHARGE,
      gateway: PAYMENT_GATEWAY.ZARINPAL,
      status: PAYMENT_STATUS.PENDING,
      amount,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingPending?.authority) {
    return {
      payment: existingPending,
      paymentUrl: buildZarinPalPaymentUrl(existingPending.authority),
    };
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      type: PAYMENT_TYPE.WALLET_CHARGE,
      amount,
      status: PAYMENT_STATUS.PENDING,
      gateway: PAYMENT_GATEWAY.ZARINPAL,
      merchantOrderId: buildMerchantOrderId("ZP-WCH"),
    },
  });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneNumber: true, email: true },
    });

    const zarinpalResult = await requestZarinPalAndSaveAuthority({
      paymentId: payment.id,
      amount: payment.amount,
      description: `شارژ کیف پول گریفین`,
      mobile: user?.phoneNumber,
      email: user?.email,
    });

    const updatedPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
    });

    return {
      payment: updatedPayment,
      paymentUrl: zarinpalResult.paymentUrl,
    };
  } catch (error) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PAYMENT_STATUS.FAILED },
    });
    throw error;
  }
};

// ============================================================
// 🆕 شارژ کیف پول — انتخاب درگاه
// ============================================================
const createWalletChargePayment = async ({
  userId,
  amount,
  gateway = PAYMENT_GATEWAY.ZARINPAL,
}) => {
  if (gateway === PAYMENT_GATEWAY.ZARINPAL) {
    return createZarinPalWalletChargePayment({ userId, amount });
  }

  // اگه future: gateways دیگه، اینجا اضافه کن
  throw new AppError("درگاه پرداخت پشتیبانی نمی‌شود", 400);
};

// ============================================================
// 🆕 خرید آزمون — زرین‌پال
// ============================================================
const createZarinPalExamPurchasePayment = async ({ userId, examId }) => {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, title: true, price: true, status: true },
  });

  if (!exam) throw new AppError("آزمون پیدا نشد", 404);
  if (exam.status !== "published") {
    throw new AppError("این آزمون قابل خرید نیست", 400);
  }

  const alreadyHas = await prisma.examPurchase.findFirst({
    where: { userId, examId, status: "paid" },
  });
  if (alreadyHas) {
    throw new AppError("شما این آزمون را قبلاً خریداری کرده‌اید", 409);
  }

  const price = exam.price || 3000000;

  const existingPending = await prisma.payment.findFirst({
    where: {
      userId,
      examId,
      type: PAYMENT_TYPE.EXAM_PURCHASE,
      gateway: PAYMENT_GATEWAY.ZARINPAL,
      status: PAYMENT_STATUS.PENDING,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingPending?.authority) {
    return {
      payment: existingPending,
      purchase: null,
      exam,
      paymentUrl: buildZarinPalPaymentUrl(existingPending.authority),
    };
  }

  const purchase = await prisma.examPurchase.create({
    data: {
      userId,
      examId,
      amount: price,
      status: "pending",
    },
  });

  const payment = await prisma.payment.create({
    data: {
      userId,
      type: PAYMENT_TYPE.EXAM_PURCHASE,
      examId,
      amount: price,
      status: PAYMENT_STATUS.PENDING,
      gateway: PAYMENT_GATEWAY.ZARINPAL,
      merchantOrderId: buildMerchantOrderId("ZP-EXM"),
      metadata: {
        examTitle: exam.title,
        purchaseId: purchase.id,
      },
    },
  });

  await prisma.examPurchase.update({
    where: { id: purchase.id },
    data: { paymentId: payment.id },
  });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneNumber: true, email: true },
    });

    const zarinpalResult = await requestZarinPalAndSaveAuthority({
      paymentId: payment.id,
      amount: payment.amount,
      description: `خرید آزمون ${exam.title}`,
      mobile: user?.phoneNumber,
      email: user?.email,
    });

    const updatedPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
    });

    return {
      payment: updatedPayment,
      purchase,
      exam,
      paymentUrl: zarinpalResult.paymentUrl,
    };
  } catch (error) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: PAYMENT_STATUS.FAILED },
      }),
      prisma.examPurchase.update({
        where: { id: purchase.id },
        data: { status: "failed" },
      }),
    ]);
    throw error;
  }
};

// ============================================================
// پرداخت ناموفق
// ============================================================
const failPayment = async ({ paymentId }) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { referral: true },
    });

    if (!payment) throw new AppError("پرداخت پیدا نشد", 404);
    if (payment.status !== PAYMENT_STATUS.PENDING) return payment;

    if (payment.referral && payment.referral.status === "pending") {
      await tx.referral.update({
        where: { id: payment.referral.id },
        data: { status: "cancelled" },
      });
    }

    // 🆕 اگه خرید آزمون بود، examPurchase هم fail کن
    if (payment.type === PAYMENT_TYPE.EXAM_PURCHASE) {
      await tx.examPurchase.updateMany({
        where: { paymentId, status: "pending" },
        data: { status: "failed" },
      });
    }

    return tx.payment.update({
      where: { id: paymentId },
      data: { status: PAYMENT_STATUS.FAILED },
    });
  });
};

// ============================================================
// لغو پرداخت
// ============================================================
const cancelPayment = async ({ paymentId }) => {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { referral: true },
    });

    if (!payment) throw new AppError("پرداخت پیدا نشد", 404);
    if (payment.status !== PAYMENT_STATUS.PENDING) return payment;

    if (payment.referral && payment.referral.status === "pending") {
      await tx.referral.update({
        where: { id: payment.referral.id },
        data: { status: "cancelled" },
      });
    }

    if (payment.type === PAYMENT_TYPE.EXAM_PURCHASE) {
      await tx.examPurchase.updateMany({
        where: { paymentId, status: "pending" },
        data: { status: "failed" },
      });
    }

    return tx.payment.update({
      where: { id: paymentId },
      data: { status: PAYMENT_STATUS.CANCELLED },
    });
  });
};

// ============================================================
// 🆕 نهایی‌سازی پرداخت زرین‌پال
// ============================================================
const finalizeZarinPalPayment = async ({ paymentId, transactionId }) => {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { plan: true, referral: true },
    });

    if (!payment) throw new AppError("پرداخت پیدا نشد", 404);

    if (payment.status === PAYMENT_STATUS.PAID) {
      return {
        payment,
        subscription: null,
        referralToComplete: null,
      };
    }

    if (payment.status !== PAYMENT_STATUS.PENDING) {
      throw new AppError("این پرداخت دیگر قابل نهایی‌سازی نیست", 400);
    }

    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PAYMENT_STATUS.PAID,
        paidAt: new Date(),
        transactionId: transactionId || `ZARINPAL-${Date.now()}`,
      },
    });

    // ==================== 🅰️ اشتراک ====================
    if (payment.type === PAYMENT_TYPE.SUBSCRIPTION && payment.plan) {
      const plan = payment.plan;

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
          message: `اشتراک ${plan.title} با موفقیت فعال شد.`,
          link: "/dashboard?section=subscription",
          icon: "crown",
          metadata: {
            planId: plan.id,
            subscriptionId: subscription.id,
          },
        },
      });

      await tx.payment.update({
        where: { id: paymentId },
        data: { subscriptionId: subscription.id },
      });

      return {
        payment: { ...updatedPayment, subscriptionId: subscription.id },
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
        tx,
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

    // ==================== 🅾️ خرید تکی آزمون ====================
    if (payment.type === PAYMENT_TYPE.EXAM_PURCHASE) {
      await tx.examPurchase.updateMany({
        where: { paymentId, status: "pending" },
        data: {
          status: "paid",
          purchasedAt: new Date(),
        },
      });

      const examTitle = payment.metadata?.examTitle || "آزمون";

      await tx.notification.create({
        data: {
          userId: payment.userId,
          type: "EXAM_PURCHASE",
          title: "آزمون خریداری شد",
          message: `آزمون ${examTitle} با موفقیت خریداری شد.`,
          link: "/tests",
          icon: "file-question",
          metadata: { examId: payment.examId, paymentId: payment.id },
        },
      });
    }

    return {
      payment: updatedPayment,
      subscription: null,
      referralToComplete: null,
    };
  });

  if (result.referralToComplete) {
    try {
      await referralService.completeReferral(
        result.referralToComplete,
        result.payment.id,
      );
    } catch (error) {
      console.error("[PaymentService] completeReferral failed:", error.message);
    }
  }

  return {
    payment: result.payment,
    subscription: result.subscription,
  };
};

// ============================================================
// بقیه توابع
// ============================================================
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

const getPaymentByAuthority = async (authority) => {
  if (!authority) return null;

  return prisma.payment.findUnique({
    where: { authority },
    include: { plan: true, referral: true },
  });
};

module.exports = {
  createSubscriptionPayment,
  createWalletChargePayment,
  createZarinPalExamPurchasePayment, // 🆕

  getPaymentByAuthority,
  cancelPayment,
  failPayment,
  finalizeZarinPalPayment,

  getMyPayments,
  getPaymentByIdForUser,
  getPaymentById,
};