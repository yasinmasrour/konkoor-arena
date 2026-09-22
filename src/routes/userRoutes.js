const express = require("express");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const userController = require("../controllers/userController");
const { changePasswordRateLimiter } = require("../middleware/rateLimiter");
const {
  changePasswordSchema,
  updateProfileSchema,
} = require("../validations/authValidation");

const router = express.Router();

router.get("/me", protect, userController.getProfile);

router.patch(
  "/me",
  protect,
  validate(updateProfileSchema),
  userController.updateProfile,
);

router.post(
  "/me/change-password",
  protect,
  changePasswordRateLimiter,
  validate(changePasswordSchema),
  userController.changePassword,
);

module.exports = router;
