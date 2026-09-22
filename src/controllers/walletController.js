const walletService = require("../services/walletService");
const paymentService = require("../services/paymentService");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

// ==================== موجودی ====================
const getBalance = asyncHandler(async (req, res) => {
  const balance = await walletService.getBalance(req.user.id);
  res.status(200).json(balance);
});

// ==================== تراکنش‌ها ====================
const getTransactions = asyncHandler(async (req, res) => {
  const { page, limit, type, direction } = req.query;
  const result = await walletService.getTransactions(req.user.id, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
    type,
    direction,
  });
  res.status(200).json(result);
});

// ==================== 🆕 ایجاد پرداخت شارژ ====================
const createChargePayment = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError("مبلغ شارژ الزامی است", 400);
  }

  const payment = await paymentService.createWalletChargePayment({
    userId: req.user.id,
    amount: Number(amount),
    gateway: "mock",
  });

  res.status(201).json({
    message: "پرداخت ایجاد شد. لطفاً به درگاه هدایت شوید.",
    payment,
  });
});

// ==================== 🆕 تأیید شارژ ====================
const verifyChargePayment = asyncHandler(async (req, res) => {
  const { paymentId, success = true } = req.body;

  if (!paymentId) {
    throw new AppError("paymentId الزامی است", 400);
  }

  const result = await paymentService.verifyPayment({
    paymentId,
    success,
  });

  res.status(200).json({
    message: success ? "کیف پول با موفقیت شارژ شد" : "پرداخت ناموفق بود",
    payment: result.payment,
  });
});

// ==================== درخواست برداشت ====================
const createWithdrawRequest = asyncHandler(async (req, res) => {
  const { amount, cardNumber, cardHolderName, bankName, iban, shebaNumber } =
    req.body;

  if (!amount || !cardNumber || !cardHolderName) {
    throw new AppError("مبلغ، شماره کارت و نام صاحب کارت الزامی است", 400);
  }

  const request = await walletService.createWithdrawRequest({
    userId: req.user.id,
    amount: Number(amount),
    cardNumber,
    cardHolderName,
    bankName,
    iban,
    shebaNumber,
  });

  res.status(201).json({
    message: "درخواست برداشت با موفقیت ثبت شد",
    request,
  });
});

// ==================== لیست درخواست‌های من ====================
const getMyWithdrawRequests = asyncHandler(async (req, res) => {
  const requests = await walletService.getMyWithdrawRequests(req.user.id);
  res.status(200).json({ requests });
});

// ==================== ادمین: لیست درخواست‌ها ====================
const getAllWithdrawRequests = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await walletService.getAllWithdrawRequests({
    status,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });
  res.status(200).json(result);
});

// ==================== ادمین: تایید ====================
const approveWithdrawRequest = asyncHandler(async (req, res) => {
  const request = await walletService.approveWithdrawRequest({
    requestId: req.params.id,
    adminId: req.user.id,
    note: req.body.note || "",
  });
  res.status(200).json({
    message: "درخواست برداشت تایید شد",
    request,
  });
});

// ==================== ادمین: رد ====================
const rejectWithdrawRequest = asyncHandler(async (req, res) => {
  const request = await walletService.rejectWithdrawRequest({
    requestId: req.params.id,
    adminId: req.user.id,
    note: req.body.note || "",
  });
  res.status(200).json({
    message: "درخواست برداشت رد شد و مبلغ به کیف پول کاربر برگشت",
    request,
  });
});

// ==================== ادمین: تکمیل ====================
const completeWithdrawRequest = asyncHandler(async (req, res) => {
  const { trackingCode } = req.body;
  if (!trackingCode) {
    throw new AppError("کد پیگیری واریز الزامی است", 400);
  }

  const request = await walletService.completeWithdrawRequest({
    requestId: req.params.id,
    trackingCode,
  });
  res.status(200).json({
    message: "درخواست برداشت تکمیل شد",
    request,
  });
});

// ==================== ادمین: تنظیم دستی ====================
const adminAdjustWallet = asyncHandler(async (req, res) => {
  const { userId, amount, direction, description } = req.body;

  if (!userId || !amount || !direction) {
    throw new AppError("userId، amount و direction الزامی هستند", 400);
  }

  const transaction = await walletService.adminAdjustWallet({
    userId,
    amount: Number(amount),
    direction,
    description,
    adminId: req.user.id,
  });

  res.status(200).json({
    message: "کیف پول با موفقیت تنظیم شد",
    transaction,
  });
});

module.exports = {
  getBalance,
  getTransactions,
  createChargePayment, // 🆕
  verifyChargePayment, // 🆕
  createWithdrawRequest,
  getMyWithdrawRequests,
  getAllWithdrawRequests,
  approveWithdrawRequest,
  rejectWithdrawRequest,
  completeWithdrawRequest,
  adminAdjustWallet,
};
