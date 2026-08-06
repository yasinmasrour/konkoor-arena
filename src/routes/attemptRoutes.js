const express = require("express");

const attemptController = require("../controllers/attemptController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const router = express.Router();

const validate = require("../middleware/validationMiddleware");
const { submitAnswerSchema } = require("../validations/attemptValidation");

/**
 * @swagger
 * /attempts/start/{examId}:
 *   post:
 *     summary: Start an exam attempt
 *     tags:
 *       - Attempts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: examId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Attempt started successfully
 */
router.post(
  "/start/:examId",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  attemptController.startAttempt,
);

/**
 * @swagger
 * /attempts/{attemptId}/questions:
 *   get:
 *     summary: Get attempt questions
 *     tags:
 *       - Attempts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of attempt questions
 */
router.get(
  "/:attemptId/questions",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  attemptController.getAttemptQuestions,
);

/**
 * @swagger
 * /attempts/{attemptId}/answers:
 *   post:
 *     summary: Submit answer for a question
 *     tags:
 *       - Attempts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - selectedAnswer
 *             properties:
 *               questionId:
 *                 type: string
 *               selectedAnswer:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 3
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 */
router.post(
  "/:attemptId/answers",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  attemptController.submitAnswer,
);

/**
 * @swagger
 * /attempts/{id}/submit:
 *   post:
 *     summary: Submit completed attempt
 *     tags:
 *       - Attempts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attempt submitted successfully
 */
router.post(
  "/:id/submit",
  authMiddleware,
  validate(submitAnswerSchema),
  attemptController.submitAttempt,
);

/**
 * @swagger
 * /attempts/{id}/result:
 *   get:
 *     summary: Get attempt result
 *     tags:
 *       - Attempts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attempt result
 */
router.get("/:id/result", authMiddleware, attemptController.getAttemptResult);

/**
 * @swagger
 * /attempts/my:
 *   get:
 *     summary: Get my attempts
 *     tags:
 *       - Attempts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's attempts
 */
router.get("/my", authMiddleware, attemptController.getMyAttempts);

/**
 * @swagger
 * /attempts/{id}/review:
 *   get:
 *     summary: Review attempt answers
 *     tags:
 *       - Attempts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attempt review data
 */
router.get("/:id/review", authMiddleware, attemptController.getAttemptReview);
module.exports = router;
