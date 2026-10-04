const examPurchaseService = require("../services/examPurchaseService");
const asyncHandler = require("../utils/asyncHandler");

const createExamPurchase = asyncHandler(async (req, res) => {
  const { gateway } = req.body;
  const result = await examPurchaseService.createExamPurchase({
    userId: req.user.id,
    examId: req.params.examId,
    gateway: gateway || "wallet",
  });

  res.status(201).json({
    message:
      result.purchase?.status === "paid"
        ? "آزمون با موفقیت خریداری شد"
        : "پرداخت ایجاد شد. لطفاً به درگاه هدایت شوید.",
    purchase: result.purchase,
    payment: result.payment,
    ...(result.paymentUrl && { paymentUrl: result.paymentUrl }),
  });
});

module.exports = {
  createExamPurchase,
};
