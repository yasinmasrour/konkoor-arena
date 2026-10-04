const express = require("express");
const protect = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.use(protect);

// 🔹 خرید اشتراک
router.post("/subscription", paymentController.createSubscriptionPayment);

// 🔹 شارژ کیف پول
router.post("/wallet-charge", paymentController.createWalletChargePayment);

// 🔹 لیست پرداخت‌ها
router.get("/my", paymentController.getMyPayments);
router.get("/:id", paymentController.getMyPaymentById);

module.exports = router;
