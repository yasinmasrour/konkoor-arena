const express = require("express");

const subscriptionController = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /subscriptions/me:
 *   get:
 *     summary: Get the current user's active subscription
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current subscription retrieved successfully
 */
router.get("/me", authMiddleware, subscriptionController.getMySubscription);

/**
 * @swagger
 * /subscriptions/me/history:
 *   get:
 *     summary: Get the current user's subscription history
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription history retrieved successfully
 */
router.get(
  "/me/history",
  authMiddleware,
  subscriptionController.getMySubscriptionHistory,
);

module.exports = router;
