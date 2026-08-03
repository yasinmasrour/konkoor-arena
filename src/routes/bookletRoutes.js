const express = require("express");

const bookletController = require("../controllers/bookletController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const ROLES = require("../constants/roles");

const router = express.Router();

const validate = require("../middleware/validationMiddleware");
const {
  createBookletSchema,
  updateBookletSchema,
} = require("../validations/bookletValidation");

router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  validate(createBookletSchema),
  bookletController.createBooklet,
);

router.get("/", authMiddleware, bookletController.getBooklets);

router.get("/:id", authMiddleware, bookletController.getBookletById);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  validate(updateBookletSchema),
  bookletController.updateBooklet,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  bookletController.deleteBooklet,
);

module.exports = router;
