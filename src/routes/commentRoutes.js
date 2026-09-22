const express = require("express");
const protect = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware"); // 🆕
const validate = require("../middleware/validate");
const commentController = require("../controllers/commentController");
const {
  createCommentSchema,
  createReplySchema,
  updateCommentSchema,
  reactSchema,
  paginationSchema,
} = require("../validations/commentValidation");

const router = express.Router();

// ==================== 🔹 عمومی (بدون احراز هویت — با optionalAuth) ====================
router.get(
  "/exams/:examId/comments",
  optionalAuth,
  validate(paginationSchema, "query"),
  commentController.getExamComments,
);

router.get(
  "/exams/:examId/comments/stats",
  commentController.getExamCommentStats,
);

router.get(
  "/comments/:id/replies",
  optionalAuth,
  validate(paginationSchema, "query"),
  commentController.getCommentReplies,
);

// ==================== 🔹 نیاز به احراز هویت ====================
router.use(protect);

router.get(
  "/comments/me",
  validate(paginationSchema, "query"),
  commentController.getMyComments,
);

router.get(
  "/exams/:examId/comments/me",
  validate(paginationSchema, "query"),
  commentController.getMyComments,
);

router.post(
  "/exams/:examId/comments",
  validate(createCommentSchema),
  commentController.createComment,
);

router.post(
  "/comments/:id/reply",
  validate(createReplySchema),
  commentController.createReply,
);

router.patch(
  "/comments/:id",
  validate(updateCommentSchema),
  commentController.updateComment,
);

router.delete("/comments/:id", commentController.deleteComment);

router.post(
  "/comments/:id/react",
  validate(reactSchema),
  commentController.reactToComment,
);

router.delete("/comments/:id/react", commentController.removeReaction);

module.exports = router;