const express = require("express");
const controller = require("../controllers/bookletController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const validate = require("../middleware/validationMiddleware");
const {
  createBookletSchema,
  updateBookletSchema,
  bookletStatusSchema,
  addBookletQuestionsSchema,
  reorderBookletQuestionsSchema,
} = require("../validations/bookletValidation");

const router = express.Router();
const contentAccess = roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR);

router.post("/", authMiddleware, contentAccess, validate(createBookletSchema), controller.createBooklet);
router.get("/", authMiddleware, contentAccess, controller.getBooklets);
router.get("/:id", authMiddleware, contentAccess, controller.getBookletById);
router.patch("/:id", authMiddleware, contentAccess, validate(updateBookletSchema), controller.updateBooklet);
router.patch("/:id/status", authMiddleware, contentAccess, validate(bookletStatusSchema), controller.setStatus);
router.post("/:id/questions", authMiddleware, contentAccess, validate(addBookletQuestionsSchema), controller.addQuestions);
router.delete("/:id/questions/:questionId", authMiddleware, contentAccess, controller.removeQuestion);
router.put("/:id/questions/reorder", authMiddleware, contentAccess, validate(reorderBookletQuestionsSchema), controller.reorderQuestions);
router.post("/:id/duplicate", authMiddleware, contentAccess, controller.duplicateBooklet);
router.delete("/:id", authMiddleware, roleMiddleware(ROLES.ADMIN), controller.deleteBooklet);

module.exports = router;
