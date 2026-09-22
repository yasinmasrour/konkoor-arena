const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const adminCommentController = require("../controllers/adminCommentController");
const {
  adminListCommentsSchema,
  reviewCommentSchema,
} = require("../validations/commentValidation");

const router = express.Router();

// 🔹 همهی مسیرها نیاز به ADMIN دارن
router.use(protect);
router.use(allowRoles("ADMIN"));

// ==================== 🔹 لیست ====================
router.get(
  "/",
  validate(adminListCommentsSchema, "query"),
  adminCommentController.listComments,
);

// ==================== 🔹 تایید/رد ====================
router.patch(
  "/:id/approve",
  validate(reviewCommentSchema),
  adminCommentController.approveComment,
);

router.patch(
  "/:id/reject",
  validate(reviewCommentSchema),
  adminCommentController.rejectComment,
);

// ==================== 🔹 حذف ====================
router.delete("/:id", adminCommentController.deleteComment);

module.exports = router;
