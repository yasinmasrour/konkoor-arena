const express = require("express");
const contactController = require("../controllers/contactController");
const validate = require("../middleware/validate");
const optionalAuth = require("../middleware/optionalAuthMiddleware");
const { contactRateLimiter } = require("../middleware/rateLimiter");
const {
  createContactMessageSchema,
} = require("../validations/contactValidation");

const router = express.Router();

// POST /contact — عمومی (مهمان یا لاگین‌شده) + rate limit
router.post(
  "/",
  contactRateLimiter,
  optionalAuth,
  validate(createContactMessageSchema),
  contactController.createContactMessage,
);

module.exports = router;