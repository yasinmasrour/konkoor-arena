const express = require("express");

const attemptController = require("../controllers/attemptController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const router = express.Router();

const validate = require("../middleware/validationMiddleware");
const { submitAnswerSchema } = require("../validations/attemptValidation");

router.post(
  "/start/:examId",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  attemptController.startAttempt,
);

router.get(
  "/:attemptId/questions",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  attemptController.getAttemptQuestions,
);

router.post(
  "/:attemptId/answers",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  attemptController.submitAnswer,
);

router.post(
  "/:id/submit",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  attemptController.submitAttempt,
);

router.get(
  "/:id/result",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  attemptController.getAttemptResult,
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  attemptController.getMyAttempts,
);

router.get(
  "/:id/review",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  attemptController.getAttemptReview,
);

router.post(
  "/:id/flag",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  attemptController.toggleFlag,
);

module.exports = router;
