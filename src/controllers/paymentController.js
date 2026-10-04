const paymentService = require("../services/paymentService");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

// ==================== خرید اشتراک ====================
const createSubscriptionPayment = asyncHandler(async (req, res) => {
  const { planId, gateway, referralCode } = req.body;

  if (!planId) throw new AppError("planId الزامی است", 400);

  const result = await paymentService.createSubscriptionPayment({
    userId: req.user.id,
    planId,
    gateway: gateway || "wallet",
    referralCode: referralCode || null,
  });

  res.status(201).json({
    message: result.subscription
      ? "اشتراک با موفقیت فعال شد"
      : "پرداخت ایجاد شد. لطفاً به درگاه هدایت شوید.",
    payment: result.payment,
    subscription: result.subscription,
    ...(result.paymentUrl && {
      paymentUrl: result.paymentUrl,
    }),
    ...(result.payment?.discountAmount > 0 && {
      discount: {
        amount: result.payment.discountAmount,
        finalAmount: result.payment.amount,
      },
    }),
  });
});

// ==================== شارژ کیف پول ====================
const createWalletChargePayment = asyncHandler(async (req, res) => {
  const { amount, gateway } = req.body;

  if (!amount) throw new AppError("amount الزامی است", 400);

  const result = await paymentService.createWalletChargePayment({
    userId: req.user.id,
    amount: Number(amount),
    gateway: gateway || "wallet",
  });

  res.status(201).json({
    message:
      result.payment.status === "paid"
        ? "کیف پول با موفقیت شارژ شد"
        : "پرداخت ایجاد شد. لطفاً به درگاه هدایت شوید.",
    payment: result.payment,
    ...(result.paymentUrl && {
      paymentUrl: result.paymentUrl,
    }),
  });
});

// ==================== لیست پرداخت‌ها ====================
const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getMyPayments(req.user.id);
  res.status(200).json({ payments });
});

const getMyPaymentById = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentByIdForUser({
    paymentId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json({ payment });
});

module.exports = {
  createSubscriptionPayment,
  createWalletChargePayment,
  getMyPayments,
  getMyPaymentById,
};