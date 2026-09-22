const commentService = require("../services/commentService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== 🔹 لیست کامنتها ====================
const getExamComments = asyncHandler(async (req, res) => {
  const result = await commentService.getExamComments(req.params.examId, {
    userId: req.user?.id || null,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

const getCommentReplies = asyncHandler(async (req, res) => {
  const result = await commentService.getCommentReplies(req.params.id, {
    userId: req.user?.id || null,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

const getExamCommentStats = asyncHandler(async (req, res) => {
  const stats = await commentService.getExamCommentStats(req.params.examId);
  res.status(200).json(stats);
});

const getMyComments = asyncHandler(async (req, res) => {
  const result = await commentService.getMyComments(req.user.id, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

// ==================== 🔹 ثبت ====================
const createComment = asyncHandler(async (req, res) => {
  const { content, rating } = req.body;
  const comment = await commentService.createComment({
    userId: req.user.id,
    examId: req.params.examId,
    content,
    rating: rating ?? null,
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
  const { content } = req.body;
  const reply = await commentService.createReply({
    userId: req.user.id,
    commentId: req.params.id,
    content,
  });
  res.status(201).json({
    message:
      reply.status === "approved"
        ? "پاسخ ثبت و منتشر شد"
        : "پاسخ ثبت شد و در انتظار تایید است",
    reply,
  });
});

// ==================== 🔹 ویرایش و حذف ====================
const updateComment = asyncHandler(async (req, res) => {
  const { content, rating } = req.body;
  const result = await commentService.updateComment({
    commentId: req.params.id,
    userId: req.user.id,
    content,
    rating,
  });
  res.status(200).json({
    message: "کامنت ویرایش شد و در انتظار تایید مجدد است",
    comment: result,
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteComment({
    commentId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json({ message: "کامنت حذف شد" });
});

// ==================== 🔹 واکنش ====================
const reactToComment = asyncHandler(async (req, res) => {
  const { type } = req.body;
  const result = await commentService.reactToComment({
    commentId: req.params.id,
    userId: req.user.id,
    type,
  });
  res.status(200).json(result);
});

const removeReaction = asyncHandler(async (req, res) => {
  const result = await commentService.removeReaction({
    commentId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json(result);
});

module.exports = {
  getExamComments,
  getCommentReplies,
  getExamCommentStats,
  getMyComments,
  createComment,
  createReply,
  updateComment,
  deleteComment,
  reactToComment,
  removeReaction,
};
