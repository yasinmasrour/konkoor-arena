const express = require("express");
const contactController = require("../controllers/contactController");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const {
  listContactMessagesQuerySchema,
  updateContactMessageSchema,
} = require("../validations/contactValidation");

const router = express.Router();

router.use(protect);
router.use(allowRoles("ADMIN"));

// لیست پیام‌ها
router.get(
  "/",
  validate(listContactMessagesQuerySchema, "query"),
  contactController.listContactMessages,
);

// آمار (برای badge)
router.get("/stats", contactController.getContactStats);

// جزئیات یک پیام
router.get("/:id", contactController.getContactMessageById);

// آپدیت وضعیت/یادداشت
router.patch(
  "/:id",
  validate(updateContactMessageSchema),
  contactController.updateContactMessage,
);

// حذف
router.delete("/:id", contactController.deleteContactMessage);

module.exports = router;
