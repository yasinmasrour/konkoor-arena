const express = require("express");

const attemptController = require("../controllers/attemptController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");


const router = express.Router();


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
    attemptController.submitAttempt
);

module.exports = router;