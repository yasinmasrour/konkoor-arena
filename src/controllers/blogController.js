const blogService = require("../services/blogService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== 🔹 عمومی ====================

const getPublishedPosts = asyncHandler(async (req, res) => {
  const result = await blogService.getPublishedPosts({
    category: req.query.category,
    tag: req.query.tag,
    search: req.query.search,
    featured: req.query.featured,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 12,
  });
  res.status(200).json(result);
});

const getPostBySlug = asyncHandler(async (req, res) => {
  const result = await blogService.getPublishedPostBySlug(
    req.params.slug,
    req.user?.id || null,
  );
  res.status(200).json(result);
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = blogService.getCategories();
  res.status(200).json({ categories });
});

const getTags = asyncHandler(async (req, res) => {
  const tags = await blogService.getTags();
  res.status(200).json({ tags });
});

// ==================== 🔹 واکنش ====================

const reactToPost = asyncHandler(async (req, res) => {
  const result = await blogService.reactToPost({
    postId: req.params.id,
    userId: req.user.id,
    type: req.body.type,
  });
  res.status(200).json(result);
});

// ==================== 🔹 نظرات ====================

const getPostComments = asyncHandler(async (req, res) => {
  const result = await blogService.getPostComments({
    postId: req.params.id,
    userId: req.user?.id || null,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

const getCommentReplies = asyncHandler(async (req, res) => {
  const result = await blogService.getCommentReplies({
    commentId: req.params.id,
    userId: req.user?.id || null,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

const createComment = asyncHandler(async (req, res) => {
  const comment = await blogService.createComment({
    postId: req.params.id,
    userId: req.user.id,
    content: req.body.content,
  });
  res.status(201).json({
    message:
      comment.status === "approved"
        ? "کامنت ثبت و منتشر شد"
        : "کامنت ثبت شد و در انتظار تایید است",
    comment,
  });
});

const createReply = asyncHandler(async (req, res) => {
  const reply = await blogService.createReply({
    commentId: req.params.id,
    userId: req.user.id,
    content: req.body.content,
  });
  res.status(201).json({
    message:
      reply.status === "approved"
        ? "پاسخ ثبت و منتشر شد"
        : "پاسخ ثبت شد و در انتظار تایید است",
    reply,
  });
});

const updateComment = asyncHandler(async (req, res) => {
  const result = await blogService.updateComment({
    commentId: req.params.id,
    userId: req.user.id,
    content: req.body.content,
  });
  res.status(200).json({
    message: "کامنت ویرایش شد و در انتظار تایید مجدد است",
    comment: result,
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  await blogService.deleteComment({
    commentId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json({ message: "کامنت حذف شد" });
});

// ==================== 🔹 نویسنده ====================

const getMyPosts = asyncHandler(async (req, res) => {
  const result = await blogService.getMyPosts({
    userId: req.user.id,
    status: req.query.status,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

const createPost = asyncHandler(async (req, res) => {
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

const updatePost = asyncHandler(async (req, res) => {
  const post = await blogService.updatePost({
    postId: req.params.id,
    userId: req.user.id,
    data: req.body,
    isAdmin: false,
  });
  res.status(200).json({
    message: "مقاله ویرایش شد",
    post,
  });
});

const submitForReview = asyncHandler(async (req, res) => {
  const post = await blogService.submitPostForReview({
    postId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json({
    message: "مقاله برای تایید ارسال شد",
    post,
  });
});

const deleteMyPost = asyncHandler(async (req, res) => {
  await blogService.deleteMyPost({
    postId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json({ message: "مقاله حذف شد" });
});

module.exports = {
  getPublishedPosts,
  getPostBySlug,
  getCategories,
  getTags,
  reactToPost,
  getPostComments,
  getCommentReplies,
  createComment,
  createReply,
  updateComment,
  deleteComment,
  getMyPosts,
  createPost,
  updatePost,
  submitForReview,
  deleteMyPost,
};
