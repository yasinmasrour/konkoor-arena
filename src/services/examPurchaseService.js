const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { EXAM_PURCHASE_PRICE } = require("../constants/features");
const {
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  PAYMENT_GATEWAY,
} = require("../constants/payment");
const walletService = require("./walletService");
const { hasExamAccess } = require("../utils/accessHelper");

const buildMerchantOrderId = (prefix = "EXM") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * ساخت پرداخت برای خرید تکی آزمون
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.examId
 * @param {string} [params.gateway]
 * @returns {Promise<object>}
 */
async function createExamPurchase({ userId, examId, gateway = "wallet" }) {
  // 🔹 چک آزمون
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true, title: true, price: true, status: true },
  });

  if (!exam) throw new AppError("آزمون پیدا نشد", 404);
  if (exam.status !== "published") {
    throw new AppError("این آزمون قابل خرید نیست", 400);
  }

  // 🔹 چک دسترسی قبلی
  const alreadyHas = await prisma.examPurchase.findFirst({
    where: {
      userId,
      examId,
      status: "paid",
    },
  });
  if (alreadyHas) {
    throw new AppError("شما این آزمون را قبلاً خریداری کرده‌اید", 409);
  }

  const price = exam.price || EXAM_PURCHASE_PRICE;

  // 🔹 پرداخت با کیف پول
  if (gateway === PAYMENT_GATEWAY.WALLET) {
    return prisma.$transaction(async (tx) => {
      await walletService.purchaseWithWallet({
        userId,
        amount: price,
        description: `خرید آزمون ${exam.title}`,
        referenceType: "EXAM_PURCHASE",
        metadata: { examId: exam.id, examTitle: exam.title },
      });

      // 🔹 ساخت ExamPurchase
      const purchase = await tx.examPurchase.create({
        data: {
          userId,
          examId,
          amount: price,
          status: "paid",
          purchasedAt: new Date(),
        },
      });

      // 🔹 ساخت Payment (برای audit)
      const payment = await tx.payment.create({
        data: {
          userId,
          type: PAYMENT_TYPE.EXAM_PURCHASE || "exam_purchase",
          examId,
          amount: price,
          status: PAYMENT_STATUS.PAID,
          gateway: PAYMENT_GATEWAY.WALLET,
          merchantOrderId: buildMerchantOrderId("EXM"),
          transactionId: `WALLET-${Date.now()}`,
          paidAt: new Date(),
          metadata: { examTitle: exam.title },
        },
      });

      // 🔹 اتصال Payment به ExamPurchase
      await tx.examPurchase.update({
        where: { id: purchase.id },
        data: { paymentId: payment.id },
      });

      return { purchase, payment, exam };
    });
  }

  // 🔹 پرداخت با درگاه (mock)
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
      type: "exam_purchase",
      examId,
      amount: price,
      status: PAYMENT_STATUS.PENDING,
      gateway: PAYMENT_GATEWAY.MOCK,
      merchantOrderId: buildMerchantOrderId("EXM"),
      metadata: { examTitle: exam.title, purchaseId: purchase.id },
    },
  });

  await prisma.examPurchase.update({
    where: { id: purchase.id },
    data: { paymentId: payment.id },
  });

  return { purchase, payment, exam };
}

/**
 * تکمیل خرید تکی (بعد از تأیید پرداخت)
 * @param {string} paymentId
 */
async function completeExamPurchase(paymentId) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { id: true, examId: true, metadata: true },
  });

  if (!payment || !payment.examId) return;

  await prisma.examPurchase.updateMany({
    where: {
      paymentId,
      status: "pending",
    },
    data: {
      status: "paid",
      purchasedAt: new Date(),
    },
  });
}

/**
 * لغو خرید تکی (اگه پرداخت fail شد)
 * @param {string} paymentId
 */
async function cancelExamPurchase(paymentId) {
  await prisma.examPurchase.updateMany({
    where: {
      paymentId,
      status: "pending",
    },
    data: { status: "failed" },
  });
}

module.exports = {
  createExamPurchase,
  completeExamPurchase,
  cancelExamPurchase,
};
