const commentService = require("../services/commentService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== 🔹 لیست کامنتها ====================
const listComments = asyncHandler(async (req, res) => {
  const result = await commentService.listCommentsForAdmin({
    status: req.query.status,
    examId: req.query.examId,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

// ==================== 🔹 تایید ====================
const approveComment = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const result = await commentService.approveComment({
    commentId: req.params.id,
    adminId: req.user.id,
    note: note || "",
  });
  res.status(200).json({
    message: "کامنت تایید شد",
    comment: result,
  });
});

// ==================== 🔹 رد ====================
const rejectComment = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const result = await commentService.rejectComment({
    commentId: req.params.id,
    adminId: req.user.id,
    note: note || "",
  });
  res.status(200).json({
    message: "کامنت رد شد",
    comment: result,
  });
});

// ==================== 🔹 حذف ====================
const deleteComment = asyncHandler(async (req, res) => {
  await commentService.deleteCommentByAdmin({
    commentId: req.params.id,
  });
  res.status(200).json({ message: "کامنت حذف شد" });
});

module.exports = {
  listComments,
  approveComment,
  rejectComment,
  deleteComment,
};
