const express = require("express");

const attemptController = require("../controllers/attemptController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const router = express.Router();

const validate = require("../middleware/validationMiddleware");
const {submitAnswerSchema} = require("../validations/attemptValidation");

router.post(
    "/start/:examId",
    authMiddleware,
    roleMiddleware(ROLES.STUDENT),
    attemptController.startAttempt
);

router.get(
    "/:attemptId/questions",
    authMiddleware,
    roleMiddleware(ROLES.STUDENT),
    attemptController.getAttemptQuestions
);

router.post(
    "/:attemptId/answers",
    authMiddleware,
    roleMiddleware(ROLES.STUDENT),
    attemptController.submitAnswer
);

router.post(
    "/:id/submit",
    authMiddleware,
    validate(submitAnswerSchema),
    attemptController.submitAttempt
);

router.get(
    "/:id/result",
    authMiddleware,
    attemptController.getAttemptResult
);

router.get(
    "/my",
    authMiddleware,
    attemptController.getMyAttempts
);

router.get(
    "/:id/review",
    authMiddleware,
    attemptController.getAttemptReview
);

module.exports = router;