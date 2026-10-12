const express = require("express");
const protect = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const blogController = require("../controllers/blogController");
const {
  createPostSchema,
  updatePostSchema,
  listPostsSchema,
  reactPostSchema,
  createCommentSchema,
  updateCommentSchema,
} = require("../validations/blogValidation");

const router = express.Router();

// ==================== 🔹 عمومی ====================

router.get(
  "/posts",
  validate(listPostsSchema, "query"),
  blogController.getPublishedPosts,
);

router.get("/categories", blogController.getCategories);
router.get("/tags", blogController.getTags);

// 🆕 Sidebar
router.get("/sidebar", blogController.getBlogSidebar);

// 🆕 TOC / Related / Neighbors (قبل از /posts/:slug)
router.get("/posts/:slug/toc", blogController.getPostToc);
router.get("/posts/:slug/related", blogController.getRelatedPosts);
router.get("/posts/:slug/neighbors", blogController.getPostNeighbors);

// جزئیات مقاله (آخر)
router.get("/posts/:slug", optionalAuth, blogController.getPostBySlug);

// ==================== 🔹 کامنت‌ها (عمومی) ====================

router.get("/posts/:id/comments", optionalAuth, blogController.getPostComments);
router.get(
  "/comments/:id/replies",
  optionalAuth,
  blogController.getCommentReplies,
);

// ==================== 🔹 نیاز به احراز هویت ====================

router.use(protect);

router.post(
  "/posts/:id/react",
  validate(reactPostSchema),
  blogController.reactToPost,
);

router.post(
  "/posts/:id/comments",
  validate(createCommentSchema),
  blogController.createComment,
);

router.post(
  "/comments/:id/reply",
  validate(createCommentSchema),
  blogController.createReply,
);

router.patch(
  "/comments/:id",
  validate(updateCommentSchema),
  blogController.updateComment,
);

router.delete("/comments/:id", blogController.deleteComment);

// ==================== 🔹 نویسنده ====================

router.get(
  "/my-posts",
  allowRoles("ADMIN", "COUNSELOR"),
  blogController.getMyPosts,
);

router.post(
  "/posts",
  allowRoles("ADMIN", "COUNSELOR"),
  validate(createPostSchema),
  blogController.createPost,
);

router.patch(
  "/posts/:id",
  allowRoles("ADMIN", "COUNSELOR"),
  validate(updatePostSchema),
  blogController.updatePost,
);

router.post(
  "/posts/:id/submit",
  allowRoles("ADMIN", "COUNSELOR"),
  blogController.submitForReview,
);

router.delete(
  "/posts/:id",
  allowRoles("ADMIN", "COUNSELOR"),
  blogController.deleteMyPost,
);

module.exports = router;