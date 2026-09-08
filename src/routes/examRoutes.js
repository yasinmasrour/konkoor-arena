const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const ROLES = require("../constants/roles");

const controller = require("../controllers/examController");

const validate = require("../middleware/validationMiddleware");
const {
  createExamSchema,
  updateExamSchema,
} = require("../validations/examValidation");

/**
 * @swagger
 * /exams:
 *   post:
 *     summary: Create a new exam
 *     tags:
 *       - Exams
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - examDate
 *               - startTime
 *               - bookletIds
 *             properties:
 *               title:
 *                 type: string
 *                 example: Final Mathematics Exam
 *               examDate:
 *                 type: string
 *                 format: date-time
 *               startTime:
 *                 type: string
 *                 example: "08:00"
 *               endTime:
 *                 type: string
 *                 example: "10:30"
 *               bookletIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "cm123abc"
 *                   - "cm456def"
 *     responses:
 *       201:
 *         description: Exam created successfully
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  validate(createExamSchema),
  controller.createExam,
);

/**
 * @swagger
 * /exams:
 *   get:
 *     summary: Get all exams
 *     tags:
 *       - Exams
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: lesson
 *         schema:
 *           type: string
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *       - in: query
 *         name: major
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of exams
 */
router.get("/", authMiddleware, controller.getExams);

/**
 * @swagger
 * /exams/{id}:
 *   get:
 *     summary: Get exam by ID
 *     tags:
 *       - Exams
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: exam details
 *       404:
 *         description: exam not found
 */
router.post(
  "/:id/booklets",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  controller.addBookletsToExam,
);

router.delete(
  "/:id/booklets/:bookletId",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  controller.removeBookletFromExam,
);

router.patch(
  "/:id/booklets/order",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  controller.updateBookletOrder,
);

router.get("/:id", authMiddleware, controller.getExamById);

/**
 * @swagger
 * /exams/{id}:
 *   patch:
 *     summary: Update exam
 *     tags:
 *       - Exams
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
 *         description: exam updated
 *       404:
 *         description: exam not found
 */
router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  validate(updateExamSchema),
  controller.updateExam,
);

/**
 * @swagger
 * /exams/{id}:
 *   delete:
 *     summary: Delete exam
 *     tags:
 *       - Exams
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
 *         description: exam deleted
 *       404:
 *         description: exam not found
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  controller.deleteExam,
);

module.exports = router;
