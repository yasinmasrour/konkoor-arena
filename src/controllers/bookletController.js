const bookletService = require("../services/bookletService");
const asyncHandler = require("../utils/asyncHandler");

const createBooklet = asyncHandler(async (req, res) => {
  const booklet = await bookletService.createBooklet({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ message: "Booklet created successfully", booklet });
});

const getBooklets = asyncHandler(async (req, res) => {
  res.status(200).json(await bookletService.getBooklets(req.query, req.user));
});

const getBookletById = asyncHandler(async (req, res) => {
  res.status(200).json({ booklet: await bookletService.getBookletById(req.params.id, req.user) });
});

const updateBooklet = asyncHandler(async (req, res) => {
  const booklet = await bookletService.updateBooklet(req.params.id, req.body, req.user);
  res.status(200).json({ message: "Booklet updated successfully", booklet });
});

const setStatus = asyncHandler(async (req, res) => {
  const booklet = await bookletService.setStatus(req.params.id, req.body.status, req.user);
  res.status(200).json({ message: "Booklet status updated successfully", booklet });
});

const addQuestions = asyncHandler(async (req, res) => {
  const booklet = await bookletService.addQuestions(req.params.id, req.body.questionIds, req.user);
  res.status(200).json({ message: "Questions added successfully", booklet });
});

const removeQuestion = asyncHandler(async (req, res) => {
  const booklet = await bookletService.removeQuestion(req.params.id, req.params.questionId, req.user);
  res.status(200).json({ message: "Question removed successfully", booklet });
});

const reorderQuestions = asyncHandler(async (req, res) => {
  const booklet = await bookletService.reorderQuestions(req.params.id, req.body.questionIds, req.user);
  res.status(200).json({ message: "Questions reordered successfully", booklet });
});

const duplicateBooklet = asyncHandler(async (req, res) => {
  const booklet = await bookletService.duplicateBooklet(req.params.id, req.user);
  res.status(201).json({ message: "Booklet duplicated successfully", booklet });
});

const deleteBooklet = asyncHandler(async (req, res) => {
  await bookletService.deleteBooklet(req.params.id, req.user);
  res.status(200).json({ message: "Booklet deleted successfully" });
});

module.exports = { createBooklet, getBooklets, getBookletById, updateBooklet, setStatus, addQuestions, removeQuestion, reorderQuestions, duplicateBooklet, deleteBooklet };
