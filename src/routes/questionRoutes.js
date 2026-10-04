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
const { questionReviewDecisionSchema } = require("../validations/questionReviewValidation");

router.post(
  "/import/preview",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.QUESTION_DESIGNER),
  handleImportUpload,
  requireImportFile,
  questionImportController.previewImport,
);

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

router.get(
  "/review",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  questionController.getReviewQueue,
);

router.get(
  "/review/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  questionController.getQuestionReviewDetails,
);

router.post(
  "/review/:id/decision",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(questionReviewDecisionSchema),
  questionController.reviewQuestion,
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR, ROLES.QUESTION_DESIGNER),
  validate(createQuestionSchema),
  questionController.createQuestion,
);

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

router.post(
  "/:id/submit-review",
  authMiddleware,
  roleMiddleware(ROLES.QUESTION_DESIGNER, ROLES.ADMIN),
  questionController.submitQuestionForReview,
);

router.post(
  "/:id/duplicate",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.QUESTION_DESIGNER),
  questionController.duplicateQuestion,
);

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

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR, ROLES.QUESTION_DESIGNER),
  questionController.getQuestionById,
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR, ROLES.QUESTION_DESIGNER),
  validate(updateQuestionSchema),
  questionController.updateQuestion,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  questionController.deleteQuestion,
);

module.exports = router;
