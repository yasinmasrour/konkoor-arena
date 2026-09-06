const express = require("express");
const ROLES = require("../constants/roles");

const questionController = require("../controllers/questionController");
const questionImportController = require("../controllers/questionImportController");
const multer = require("multer");
const { QUESTION_IMPORT_LIMITS } = require("../constants/questionImport");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const validate = require("../middleware/validationMiddleware");
const AppError = require("../utils/appError");

const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: QUESTION_IMPORT_LIMITS.MAX_FILE_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    const extension = file.originalname.toLowerCase().split(".").pop();
    if (!["csv", "xlsx", "xls"].includes(extension)) {
      cb(new AppError("Only CSV, XLSX, and XLS files are supported", 400));
      return;
    }
    cb(null, true);
  },
});

const handleImportUpload = (req, res, next) => {
  importUpload.single("file")(req, res, (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(new AppError("The uploaded file is too large. Maximum size is 5 MB", 400));
        return;
      }
      next(error instanceof AppError ? error : new AppError("Could not process the uploaded file", 400));
      return;
    }
    next();
  });
};

const requireImportFile = (req, res, next) => {
  if (!req.file) {
    throw new AppError("A CSV or Excel file is required", 400);
  }
  next();
};

const {
  createQuestionSchema,
  updateQuestionSchema,
  questionStatusSchema,
  bulkQuestionStatusSchema,
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

/**
 * @swagger
 * /questions/import/preview:
 *   post:
 *     summary: Preview and validate a CSV or Excel question import
 *     tags:
 *       - Questions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import preview with row validation results
 *       400:
 *         description: Invalid file or spreadsheet structure
 *       403:
 *         description: Forbidden
 */
router.post(
  "/import/preview",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.QUESTION_DESIGNER),
  handleImportUpload,
  requireImportFile,
  questionImportController.previewImport,
);

/**
 * @swagger
 * /questions/import:
 *   post:
 *     summary: Import validated questions as drafts
 *     tags:
 *       - Questions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Questions imported as drafts
 *       400:
 *         description: Import blocked because the file contains invalid rows
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Duplicate question code detected
 */
router.post(
  "/import",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.QUESTION_DESIGNER),
  handleImportUpload,
  requireImportFile,
  questionImportController.importQuestions,
);

router.get(
  "/analytics",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.QUESTION_DESIGNER),
  questionController.getQuestionAnalytics,
);

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
  "/export",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.QUESTION_DESIGNER),
  questionController.exportQuestions,
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR, ROLES.QUESTION_DESIGNER),
  questionController.getQuestions,
);

/**
 * @swagger
 * /questions/{id}/submit-review:
 *   post:
 *     summary: Submit a draft question for review
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
 *         description: Question submitted for review
 *       400:
 *         description: Invalid question status
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Question not found
 */
router.post(
  "/:id/submit-review",
  authMiddleware,
  roleMiddleware(ROLES.QUESTION_DESIGNER, ROLES.ADMIN),
  questionController.submitQuestionForReview,
);

/**
 * @swagger
 * /questions/{id}/duplicate:
 *   post:
 *     summary: Duplicate a question as a new draft
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
 *       201:
 *         description: Question duplicated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Question not found
 */
router.post(
  "/:id/duplicate",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.QUESTION_DESIGNER),
  questionController.duplicateQuestion,
);

/**
 * @swagger
 * /questions/{id}/status:
 *   patch:
 *     summary: Change question status
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, review, published, archived]
 *     responses:
 *       200:
 *         description: Question status updated
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Question not found
 */
router.patch(
  "/bulk-status",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(bulkQuestionStatusSchema),
  questionController.bulkSetQuestionStatus,
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(questionStatusSchema),
  questionController.setQuestionStatus,
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
