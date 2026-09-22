const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const adminBlogController = require("../controllers/adminBlogController");
const {
  createPostSchema,
  updatePostSchema,
  adminListPostsSchema,
  reviewPostSchema,
  adminListCommentsSchema,
} = require("../validations/blogValidation");

const router = express.Router();

// 🔹 همه مسیرها نیاز به ADMIN دارن
router.use(protect);
router.use(allowRoles("ADMIN"));

// ==================== 🔹 مقالات ====================

router.get(
  "/posts",
  validate(adminListPostsSchema, "query"),
  adminBlogController.adminListPosts,
);

router.post(
  "/posts",
  validate(createPostSchema),
  adminBlogController.adminCreatePost,
);

router.patch(
  "/posts/:id",
  validate(updatePostSchema),
  adminBlogController.adminUpdatePost,
);

router.delete("/posts/:id", adminBlogController.adminDeletePost);

router.patch(
  "/posts/:id/approve",
  validate(reviewPostSchema),
  adminBlogController.approvePost,
);

router.patch(
  "/posts/:id/reject",
  validate(reviewPostSchema),
  adminBlogController.rejectPost,
);

router.patch("/posts/:id/feature", adminBlogController.toggleFeatured);

// ==================== 🔹 کامنت‌ها ====================

router.get(
  "/comments",
  validate(adminListCommentsSchema, "query"),
  adminBlogController.adminListComments,
);

router.patch(
  "/comments/:id/approve",
  validate(reviewPostSchema),
  adminBlogController.approveComment,
);

router.patch(
  "/comments/:id/reject",
  validate(reviewPostSchema),
  adminBlogController.rejectComment,
);

router.delete("/comments/:id", adminBlogController.adminDeleteComment);

module.exports = router;
