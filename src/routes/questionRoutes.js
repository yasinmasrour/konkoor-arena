const express = require("express");
const ROLES = require("../constants/roles");

const questionController = require("../controllers/questionController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const validate = require("../middleware/validationMiddleware");
const {
  createQuestionSchema,
  updateQuestionSchema,
} = require("../validations/questionValidation");

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     tags:
 *       - Questions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - lesson
 *               - grade
 *               - major
 *               - chapter
 *               - questionText
 *               - options
 *               - correctAnswer
 *             properties:
 *               code:
 *                 type: string
 *                 example: MATH-001
 *               lesson:
 *                 type: string
 *                 example: Mathematics
 *               grade:
 *                 type: string
 *                 example: "12"
 *               major:
 *                 type: string
 *                 example: math
 *               chapter:
 *                 type: string
 *                 example: Functions
 *               questionText:
 *                 type: string
 *                 example: What is 2 + 2?
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "1"
 *                   - "2"
 *                   - "3"
 *                   - "4"
 *               correctAnswer:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Question created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR, ROLES.QUESTION_DESIGNER),
  validate(createQuestionSchema),
  questionController.createQuestion,
);

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     tags:
 *       - Questions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: function
 *       - in: query
 *         name: lesson
 *         schema:
 *           type: string
 *         example: Mathematics
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *         example: "12"
 *       - in: query
 *         name: major
 *         schema:
 *           type: string
 *         example: math
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         example: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         example: desc
 *     responses:
 *       200:
 *         description: List of questions
 */
router.get(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR, ROLES.QUESTION_DESIGNER),
  questionController.getQuestions,
);

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     summary: Get question by ID
 *     tags:
 *       - Questions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question found
 *       404:
 *         description: Question not found
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR, ROLES.QUESTION_DESIGNER),
  questionController.getQuestionById,
);

/**
 * @swagger
 * /questions/{id}:
 *   patch:
 *     summary: Update question
 *     tags:
 *       - Questions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Question updated
 *       404:
 *         description: Question not found
 */
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR, ROLES.QUESTION_DESIGNER),
  validate(updateQuestionSchema),
  questionController.updateQuestion,
);

/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     summary: Delete question
 *     tags:
 *       - Questions
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
 *         description: Question deleted
 *       404:
 *         description: Question not found
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  questionController.deleteQuestion,
);

module.exports = router;
