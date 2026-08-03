const express = require("express");
const ROLES = require("../constants/roles");

const questionController = require("../controllers/questionController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const validate = require("../middleware/validationMiddleware");
const {
  createQuestionSchema,
  updateQuestionSchema
} = require("../validations/questionValidation");

router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR, ROLES.QUESTION_DESIGNER),
  validate(createQuestionSchema),
  questionController.createQuestion,
);

router.get("/", authMiddleware, questionController.getQuestions);

router.get("/:id", authMiddleware, questionController.getQuestionById);

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
