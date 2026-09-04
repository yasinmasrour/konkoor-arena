const paymentService = require("../services/paymentService");
const asyncHandler = require("../utils/asyncHandler");

const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment({
    userId: req.user.id,
    planId: req.body.planId,
  });

  res.status(201).json({
    message: "Payment initialized successfully",
    payment,
  });
});

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

module.exports = { createPayment, getMyPayments, getMyPaymentById };
