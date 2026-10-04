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

router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  validate(createExamSchema),
  controller.createExam,
);

router.get("/", authMiddleware, controller.getExams);

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

router.post(
  "/:id/duplicate",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  controller.duplicateExam,
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  controller.changeExamStatus,
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  validate(updateExamSchema),
  controller.updateExam,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  controller.deleteExam,
);

module.exports = router;
