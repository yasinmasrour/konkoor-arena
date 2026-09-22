const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

// ==================== تنظیمات ====================
const WALLET_CONFIG = {
  currency: "IRR",
  minChargeAmount: 100000, // ۱۰,۰۰۰ تومان (به ریال)
  maxChargeAmount: 50000000, // ۵,۰۰۰,۰۰۰ تومان
  minWithdrawAmount: 500000, // ۵۰,۰۰۰ تومان
  maxWithdrawAmount: 50000000, // ۵,۰۰۰,۰۰۰ تومان
};

// ==================== تنظیمات تراکنش ====================
const TRANSACTION_TYPES = {
  CHARGE: "CHARGE",
  PURCHASE: "PURCHASE",
  REFUND: "REFUND",
  WITHDRAW: "WITHDRAW",
  REWARD: "REWARD",
  ADMIN_ADJUST: "ADMIN_ADJUST",
};

const TRANSACTION_DIRECTIONS = {
  IN: "IN",
  OUT: "OUT",
};

const TRANSACTION_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

const WITHDRAW_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

// ==================== ساخت کیف پول ====================
const getOrCreateWallet = async (userId, tx = prisma) => {
  let wallet = await tx.wallet.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
        },
      },
    },
  });

  if (!wallet) {
    wallet = await tx.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: WALLET_CONFIG.currency,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
    });
  }

  return wallet;
};

// ==================== گرفتن موجودی ====================
const getBalance = async (userId) => {
  const wallet = await getOrCreateWallet(userId);
  return {
    balance: wallet.balance,
    currency: wallet.currency,
    isActive: wallet.isActive,
  };
};

// ==================== گرفتن تراکنش‌ها ====================
const getTransactions = async (
  userId,
  { page = 1, limit = 20, type, direction } = {},
) => {
  const wallet = await getOrCreateWallet(userId);

  const where = {
    walletId: wallet.id,
    ...(type ? { type } : {}),
    ...(direction ? { direction } : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==================== افزودن تراکنش (هسته) ====================
/**
 * این تابع هسته‌ی همه‌ی عملیات کیف پوله.
 * موجودی رو آپدیت می‌کنه + یه رکورد تراکنش ثبت می‌کنه.
 */
const _applyTransaction = async ({
  tx,
  userId,
  type,
  direction,
  amount,
  description = "",
  referenceId = null,
  referenceType = null,
  metadata = null,
  status = TRANSACTION_STATUS.SUCCESS,
}) => {
  if (amount <= 0 || !Number.isInteger(amount)) {
    throw new AppError("مبلغ باید یک عدد صحیح مثبت باشد", 400);
  }

  // گرفتن کیف پول
  let wallet = await tx.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await tx.wallet.create({
      data: { userId, balance: 0, currency: WALLET_CONFIG.currency },
    });
  }

  if (!wallet.isActive) {
    throw new AppError("کیف پول غیرفعال است", 403);
  }

  const balanceBefore = wallet.balance;
  const isIncoming = direction === TRANSACTION_DIRECTIONS.IN;
  const balanceAfter = isIncoming
    ? balanceBefore + amount
    : balanceBefore - amount;

  // 🔹 چک موجودی برای برداشت
  if (!isIncoming && balanceAfter < 0) {
    throw new AppError("موجودی کیف پول کافی نیست", 400);
  }

  // آپدیت موجودی (فقط اگه status = SUCCESS)
  if (status === TRANSACTION_STATUS.SUCCESS) {
    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: balanceAfter },
    });
  }

  // ثبت تراکنش
  const transaction = await tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      userId,
      type,
      direction,
      amount,
      balanceBefore,
      balanceAfter:
        status === TRANSACTION_STATUS.SUCCESS ? balanceAfter : balanceBefore,
      status,
      description,
      referenceId,
      referenceType,
      metadata,
    },
  });

  return transaction;
};

// ==================== شارژ کیف پول ====================
const chargeWallet = async ({
  userId,
  amount,
  description = "شارژ کیف پول",
  referenceId = null,
  referenceType = "PAYMENT",
  metadata = null,
  tx: externalTx = null, // 🆕
}) => {
  if (amount < WALLET_CONFIG.minChargeAmount) {
    throw new AppError(
      `حداقل مبلغ شارژ ${WALLET_CONFIG.minChargeAmount / 10} تومان است`,
      400,
    );
  }
  if (amount > WALLET_CONFIG.maxChargeAmount) {
    throw new AppError(
      `حداکثر مبلغ شارژ ${WALLET_CONFIG.maxChargeAmount / 10} تومان است`,
      400,
    );
  }

  const run = (tx) =>
    _applyTransaction({
      tx,
      userId,
      type: TRANSACTION_TYPES.CHARGE,
      direction: TRANSACTION_DIRECTIONS.IN,
      amount,
      description,
      referenceId,
      referenceType,
      metadata,
    });

  if (externalTx) return run(externalTx);
  return prisma.$transaction(run);
};

// ==================== واریز جایزه ====================
const rewardWallet = async ({
  userId,
  amount,
  description = "جایزه",
  referenceId = null,
  referenceType = "ARENA_REWARD",
  metadata = null,
  tx: externalTx = null, // 🆕
}) => {
  if (amount <= 0) {
    throw new AppError("مبلغ جایزه باید مثبت باشد", 400);
  }

  const run = (tx) =>
    _applyTransaction({
      tx,
      userId,
      type: TRANSACTION_TYPES.REWARD,
      direction: TRANSACTION_DIRECTIONS.IN,
      amount,
      description,
      referenceId,
      referenceType,
      metadata,
    });

  if (externalTx) return run(externalTx);
  return prisma.$transaction(run);
};

// ==================== خرید از کیف پول ====================
const purchaseWithWallet = async ({
  userId,
  amount,
  description = "خرید",
  referenceId = null,
  referenceType = null,
  metadata = null,
  tx: externalTx = null, // 🆕
}) => {
  if (amount <= 0) {
    throw new AppError("مبلغ خرید باید مثبت باشد", 400);
  }

  const run = (tx) =>
    _applyTransaction({
      tx,
      userId,
      type: TRANSACTION_TYPES.PURCHASE,
      direction: TRANSACTION_DIRECTIONS.OUT,
      amount,
      description,
      referenceId,
      referenceType,
      metadata,
    });

  if (externalTx) return run(externalTx);
  return prisma.$transaction(run);
};

// ==================== تنظیم دستی توسط ادمین ====================
const adminAdjustWallet = async ({
  userId,
  amount,
  direction,
  description,
  adminId,
  metadata = null,
}) => {
  if (amount <= 0) {
    throw new AppError("مبلغ باید مثبت باشد", 400);
  }
  if (!["IN", "OUT"].includes(direction)) {
    throw new AppError("جهت نامعتبر است", 400);
  }

  return prisma.$transaction(async (tx) => {
    return _applyTransaction({
      tx,
      userId,
      type: TRANSACTION_TYPES.ADMIN_ADJUST,
      direction,
      amount,
      description: description || `تنظیم دستی توسط ادمین`,
      referenceId: adminId,
      referenceType: "ADMIN",
      metadata,
    });
  });
};

// ==================== درخواست برداشت ====================
const createWithdrawRequest = async ({
  userId,
  amount,
  cardNumber,
  cardHolderName,
  bankName = null,
  iban = null,
  shebaNumber = null,
}) => {
  if (amount < WALLET_CONFIG.minWithdrawAmount) {
    throw new AppError(
      `حداقل مبلغ برداشت ${WALLET_CONFIG.minWithdrawAmount / 10} تومان است`,
      400,
    );
  }
  if (amount > WALLET_CONFIG.maxWithdrawAmount) {
    throw new AppError(
      `حداکثر مبلغ برداشت ${WALLET_CONFIG.maxWithdrawAmount / 10} تومان است`,
      400,
    );
  }

  if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))) {
    throw new AppError("شماره کارت باید ۱۶ رقم باشد", 400);
  }

  return prisma.$transaction(async (tx) => {
    const transaction = await _applyTransaction({
      tx,
      userId,
      type: TRANSACTION_TYPES.WITHDRAW,
      direction: TRANSACTION_DIRECTIONS.OUT,
      amount,
      description: "درخواست برداشت",
      referenceType: "WITHDRAW_REQUEST",
      status: TRANSACTION_STATUS.SUCCESS,
    });

    const request = await tx.withdrawRequest.create({
      data: {
        userId,
        walletId: (await tx.wallet.findUnique({ where: { userId } })).id,
        amount,
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardHolderName,
        bankName,
        iban,
        shebaNumber,
        status: WITHDRAW_STATUS.PENDING,
      },
    });

    await tx.walletTransaction.update({
      where: { id: transaction.id },
      data: { referenceId: request.id },
    });

    return request;
  });
};

// ==================== لیست درخواست‌های برداشت کاربر ====================
const getMyWithdrawRequests = async (userId) => {
  return prisma.withdrawRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

// ==================== لیست درخواست‌های برداشت (ادمین) ====================
const getAllWithdrawRequests = async ({
  status,
  page = 1,
  limit = 20,
} = {}) => {
  const where = status ? { status } : {};
  const [requests, total] = await Promise.all([
    prisma.withdrawRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.withdrawRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ==================== تایید درخواست برداشت (ادمین) ====================
const approveWithdrawRequest = async ({ requestId, adminId, note = "" }) => {
  return prisma.$transaction(async (tx) => {
    const request = await tx.withdrawRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new AppError("درخواست پیدا نشد", 404);
    if (request.status !== WITHDRAW_STATUS.PENDING) {
      throw new AppError("این درخواست قبلاً بررسی شده است", 400);
    }

    return tx.withdrawRequest.update({
      where: { id: requestId },
      data: {
        status: WITHDRAW_STATUS.APPROVED,
        reviewedById: adminId,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    });
  });
};

// ==================== رد درخواست برداشت (ادمین) ====================
const rejectWithdrawRequest = async ({ requestId, adminId, note = "" }) => {
  return prisma.$transaction(async (tx) => {
    const request = await tx.withdrawRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new AppError("درخواست پیدا نشد", 404);
    if (request.status !== WITHDRAW_STATUS.PENDING) {
      throw new AppError("این درخواست قبلاً بررسی شده است", 400);
    }

    await _applyTransaction({
      tx,
      userId: request.userId,
      type: TRANSACTION_TYPES.REFUND,
      direction: TRANSACTION_DIRECTIONS.IN,
      amount: request.amount,
      description: `بازگشت وجه به دلیل رد درخواست برداشت`,
      referenceId: request.id,
      referenceType: "WITHDRAW_REQUEST",
    });

    return tx.withdrawRequest.update({
      where: { id: requestId },
      data: {
        status: WITHDRAW_STATUS.REJECTED,
        reviewedById: adminId,
        reviewedAt: new Date(),
        reviewNote: note,
      },
    });
  });
};

// ==================== تکمیل درخواست برداشت (ادمین) ====================
const completeWithdrawRequest = async ({ requestId, trackingCode }) => {
  return prisma.$transaction(async (tx) => {
    const request = await tx.withdrawRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new AppError("درخواست پیدا نشد", 404);
    if (request.status !== WITHDRAW_STATUS.APPROVED) {
      throw new AppError("فقط درخواست‌های تایید شده می‌توانند تکمیل شوند", 400);
    }

    return tx.withdrawRequest.update({
      where: { id: requestId },
      data: {
        status: WITHDRAW_STATUS.COMPLETED,
        trackingCode,
        paidAt: new Date(),
      },
    });
  });
};

// ==================== Export ====================
module.exports = {
  WALLET_CONFIG,
  TRANSACTION_TYPES,
  TRANSACTION_DIRECTIONS,
  TRANSACTION_STATUS,
  WITHDRAW_STATUS,

  getOrCreateWallet,
  getBalance,
  getTransactions,

  chargeWallet,
  rewardWallet,
  purchaseWithWallet,
  adminAdjustWallet,

  createWithdrawRequest,
  getMyWithdrawRequests,
  getAllWithdrawRequests,
  approveWithdrawRequest,
  rejectWithdrawRequest,
  completeWithdrawRequest,
};
