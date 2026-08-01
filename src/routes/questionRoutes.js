const express = require("express");
const ROLES = require("../constants/roles");

const {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
} = require("../controllers/questionController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware(
    ROLES.ADMIN,
    ROLES.COUNSELOR,
    ROLES.QUESTION_DESIGNER
    ),
    createQuestion
);

router.get(
    "/",
    authMiddleware,
    getQuestions
);

router.get(
    "/:id",
    authMiddleware,
    getQuestionById
);

router.patch(
    "/:id",
    authMiddleware,
    roleMiddleware(
    ROLES.ADMIN,
    ROLES.COUNSELOR,
    ROLES.QUESTION_DESIGNER
    ),
    updateQuestion
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(ROLES.ADMIN),
    deleteQuestion
);

module.exports = router;