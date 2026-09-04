const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { PAYMENT_STATUS, PAYMENT_GATEWAY } = require("../constants/payment");
const { SUBSCRIPTION_STATUS } = require("../constants/subscription");
const subscriptionService = require("./subscriptionService");

const buildMerchantOrderId = () => `SUB-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const createPayment = async ({ userId, planId }) => {
  return prisma.$transaction(async (tx) => {
    await subscriptionService.expireSubscriptions?.(tx);

    const plan = await tx.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new AppError("Subscription plan not found", 404);

    const activeSubscription = await tx.subscription.findFirst({
      where: {
        userId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        endDate: { gt: new Date() },
      },
      select: { id: true },
    });

    if (activeSubscription) {
      throw new AppError("User already has an active subscription", 409);
    }

    const existingPending = await tx.payment.findFirst({
      where: {
        userId,
        planId,
        status: PAYMENT_STATUS.PENDING,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingPending) return existingPending;

    return tx.payment.create({
      data: {
        userId,
        planId,
        amount: plan.price,
        status: PAYMENT_STATUS.PENDING,
        gateway: PAYMENT_GATEWAY.PENDING,
        merchantOrderId: buildMerchantOrderId(),
      },
      include: {
        plan: true,
      },
    });
  });
};

const getMyPayments = async (userId) => prisma.payment.findMany({
  where: { userId },
  include: { plan: true },
  orderBy: { createdAt: "desc" },
});

const getPaymentByIdForUser = async ({ paymentId, userId }) => {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId },
    include: { plan: true },
  });

  if (!payment) throw new AppError("Payment not found", 404);
  return payment;
};

const getPaymentById = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { plan: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
  if (!payment) throw new AppError("Payment not found", 404);
  return payment;
};

module.exports = {
  createPayment,
  getMyPayments,
  getPaymentByIdForUser,
  getPaymentById,
};
