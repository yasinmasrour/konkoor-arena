const blogService = require("../services/blogService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== 🔹 مقالات ====================

const adminListPosts = asyncHandler(async (req, res) => {
  const result = await blogService.adminListPosts({
    status: req.query.status,
    category: req.query.category,
    authorId: req.query.authorId,
    search: req.query.search,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

const adminCreatePost = asyncHandler(async (req, res) => {
  const post = await blogService.createPost({
    userId: req.user.id,
    data: req.body,
  });
  res.status(201).json({
    message:
      post.status === "published" ? "مقاله ساخته و منتشر شد" : "مقاله ساخته شد",
    post,
  });
});

const adminUpdatePost = asyncHandler(async (req, res) => {
  const post = await blogService.updatePost({
    postId: req.params.id,
    userId: req.user.id,
    data: req.body,
    isAdmin: true,
  });
  res.status(200).json({
    message: "مقاله ویرایش شد",
    post,
  });
});

const adminDeletePost = asyncHandler(async (req, res) => {
  await blogService.adminDeletePost({ postId: req.params.id });
  res.status(200).json({ message: "مقاله حذف شد" });
});

// ==================== 🔹 تایید/رد ====================

const approvePost = asyncHandler(async (req, res) => {
  const post = await blogService.approvePost({
    postId: req.params.id,
    adminId: req.user.id,
    note: req.body.note || "",
  });
  res.status(200).json({
    message: "مقاله تایید و منتشر شد",
    post,
  });
});

const rejectPost = asyncHandler(async (req, res) => {
  const post = await blogService.rejectPost({
    postId: req.params.id,
    adminId: req.user.id,
    note: req.body.note || "",
  });
  res.status(200).json({
    message: "مقاله رد شد",
    post,
  });
});

const toggleFeatured = asyncHandler(async (req, res) => {
  const post = await blogService.toggleFeatured({
    postId: req.params.id,
  });
  res.status(200).json({
    message: post.isFeatured ? "مقاله ویژه شد" : "مقاله از حالت ویژه خارج شد",
    post,
  });
});

// ==================== 🔹 کامنت‌ها ====================

const adminListComments = asyncHandler(async (req, res) => {
  const result = await blogService.adminListComments({
    status: req.query.status,
    postId: req.query.postId,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

const approveComment = asyncHandler(async (req, res) => {
  const comment = await blogService.approveComment({
    commentId: req.params.id,
    adminId: req.user.id,
    note: req.body.note || "",
  });
  res.status(200).json({
    message: "کامنت تایید شد",
    comment,
  });
});

const rejectComment = asyncHandler(async (req, res) => {
  const comment = await blogService.rejectComment({
    commentId: req.params.id,
    adminId: req.user.id,
    note: req.body.note || "",
  });
  res.status(200).json({
    message: "کامنت رد شد",
    comment,
  });
});

const adminDeleteComment = asyncHandler(async (req, res) => {
  await blogService.adminDeleteComment({ commentId: req.params.id });
  res.status(200).json({ message: "کامنت حذف شد" });
});

module.exports = {
  adminListPosts,
  adminCreatePost,
  adminUpdatePost,
  adminDeletePost,
  approvePost,
  rejectPost,
  toggleFeatured,
  adminListComments,
  approveComment,
  rejectComment,
  adminDeleteComment,
};
