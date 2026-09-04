const express = require("express");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const { createPaymentSchema } = require("../validations/paymentValidation");

const router = express.Router();

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Initialize a subscription payment
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId]
 *             properties:
 *               planId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment initialized successfully
 *       409:
 *         description: User already has an active subscription
 */
router.post("/", authMiddleware, validate(createPaymentSchema), paymentController.createPayment);

/**
 * @swagger
 * /payments/me:
 *   get:
 *     summary: Get the current user's payment history
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 */
router.get("/me", authMiddleware, paymentController.getMyPayments);

/**
 * @swagger
 * /payments/me/{id}:
 *   get:
 *     summary: Get one of the current user's payments
 *     tags:
 *       - Payments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/me/:id", authMiddleware, paymentController.getMyPaymentById);

module.exports = router;
