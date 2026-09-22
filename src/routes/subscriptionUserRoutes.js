const express = require("express");

const subscriptionController = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authMiddleware, subscriptionController.getMySubscription);

router.get(
  "/me/history",
  authMiddleware,
  subscriptionController.getMySubscriptionHistory,
);

// 🆕 خرید اشتراک
router.post(
  "/purchase",
  authMiddleware,
  subscriptionController.purchaseSubscription,
);

// 🆕 تأیید پرداخت
router.post(
  "/purchase/verify",
  authMiddleware,
  subscriptionController.verifySubscriptionPayment,
);

module.exports = router;
