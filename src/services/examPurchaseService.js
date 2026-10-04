const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { EXAM_PURCHASE_PRICE } = require("../constants/features");
const {
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  PAYMENT_GATEWAY,
} = require("../constants/payment");
const walletService = require("./walletService");
const paymentService = require("./paymentService");

const buildMerchantOrderId = (prefix = "EXM") =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * ساخت پرداخت برای خرید تکی آزمون
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

  const alreadyHas = await prisma.examPurchase.findFirst({
    where: { userId, examId, status: "paid" },
  });
  if (alreadyHas) {
    throw new AppError("شما این آزمون را قبلاً خریداری کرده‌اید", 409);
  }

  const price = exam.price || EXAM_PURCHASE_PRICE;

  // ==================== 🅰️ زرین‌پال ====================
  if (gateway === PAYMENT_GATEWAY.ZARINPAL) {
    return paymentService.createZarinPalExamPurchasePayment({
      userId,
      examId,
    });
  }

  // ==================== 🅱️ کیف پول ====================
  if (gateway === PAYMENT_GATEWAY.WALLET) {
    return prisma.$transaction(async (tx) => {
      await walletService.purchaseWithWallet({
        userId,
        amount: price,
        description: `خرید آزمون ${exam.title}`,
        referenceType: "EXAM_PURCHASE",
        metadata: { examId: exam.id, examTitle: exam.title },
        tx,
      });

      const purchase = await tx.examPurchase.create({
        data: {
          userId,
          examId,
          amount: price,
          status: "paid",
          purchasedAt: new Date(),
        },
      });

      const payment = await tx.payment.create({
        data: {
          userId,
          type: PAYMENT_TYPE.EXAM_PURCHASE,
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

      await tx.examPurchase.update({
        where: { id: purchase.id },
        data: { paymentId: payment.id },
      });

      return { purchase, payment, exam };
    });
  }

  throw new AppError("درگاه پرداخت پشتیبانی نمی‌شود", 400);
}

module.exports = {
  createExamPurchase,
};
