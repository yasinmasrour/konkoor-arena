const express = require("express");

const subscriptionController = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");
const ROLES = require("../constants/roles");
const {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
} = require("../validations/subscriptionValidation");

const router = express.Router();

/**
 * @swagger
 * /subscription-plans:
 *   get:
 *     summary: Get available subscription plans
 *     tags:
 *       - Subscriptions
 *     responses:
 *       200:
 *         description: Subscription plans retrieved successfully
 */
router.get("/", subscriptionController.getPlans);

/**
 * @swagger
 * /subscription-plans/{id}:
 *   get:
 *     summary: Get a subscription plan by ID
 *     tags:
 *       - Subscriptions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription plan retrieved successfully
 *       404:
 *         description: Subscription plan not found
 */
router.get("/:id", subscriptionController.getPlanById);

/**
 * @swagger
 * /subscription-plans:
 *   post:
 *     summary: Create a subscription plan
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(createSubscriptionPlanSchema),
  subscriptionController.createPlan,
);

/**
 * @swagger
 * /subscription-plans/{id}:
 *   put:
 *     summary: Update a subscription plan
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(updateSubscriptionPlanSchema),
  subscriptionController.updatePlan,
);

/**
 * @swagger
 * /subscription-plans/{id}:
 *   delete:
 *     summary: Delete a subscription plan without subscription history
 *     tags:
 *       - Subscriptions
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  subscriptionController.deletePlan,
);

module.exports = router;
