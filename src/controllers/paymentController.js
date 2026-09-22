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
    referralCode: referralCode || null, // 🆕
  });

  res.status(201).json({
    message: result.subscription
      ? "اشتراک با موفقیت فعال شد"
      : "پرداخت ایجاد شد. لطفاً به درگاه هدایت شوید.",
    payment: result.payment,
    subscription: result.subscription,
    // 🆕 اگه Referral اعمال شده، تخفیف رو هم برگردون
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

  const payment = await paymentService.createWalletChargePayment({
    userId: req.user.id,
    amount: Number(amount),
    gateway: gateway || "mock",
  });

  res.status(201).json({
    message: "پرداخت ایجاد شد. لطفاً به درگاه هدایت شوید.",
    payment,
    paymentUrl: `https://mock-gateway.test/pay/${payment.merchantOrderId}`,
  });
});

// ==================== تایید پرداخت (Mock) ====================
const verifyPayment = asyncHandler(async (req, res) => {
  const { success = true } = req.body;

  const result = await paymentService.verifyPayment({
    paymentId: req.params.id,
    success: Boolean(success),
  });

  res.status(200).json({
    message: result.subscription
      ? "پرداخت تایید شد و اشتراک فعال شد"
      : "پرداخت تایید شد",
    payment: result.payment,
    subscription: result.subscription,
  });
});

// ==================== لیست پرداختها ====================
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
  verifyPayment,
  getMyPayments,
  getMyPaymentById,
};