const examService = require("../services/examService");
const asyncHandler = require("../utils/asyncHandler");

const createExam = asyncHandler(async (req, res) => {
  const exam = await examService.createExam({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ message: "Exam created successfully", exam });
});

const getExams = asyncHandler(async (req, res) => {
  res.status(200).json(await examService.getExams(req.query));
});

const getExamById = asyncHandler(async (req, res) => {
  res.status(200).json({ exam: await examService.getExamById(req.params.id, req.user) });
});

const updateExam = asyncHandler(async (req, res) => {
  const exam = await examService.updateExam(req.params.id, req.body, req.user);
  res.status(200).json({ message: "Exam updated", exam });
});

const changeExamStatus = asyncHandler(async (req, res) => {
  const exam = await examService.changeExamStatus(req.params.id, req.body.status, req.user);
  res.status(200).json({ message: "Exam status updated", exam });
});

const duplicateExam = asyncHandler(async (req, res) => {
  const exam = await examService.duplicateExam(req.params.id, req.user);
  res.status(201).json({ message: "Exam duplicated", exam });
});

const deleteExam = asyncHandler(async (req, res) => {
  await examService.deleteExam(req.params.id, req.user);
  res.status(200).json({ message: "Exam deleted" });
});

const addBookletsToExam = asyncHandler(async (req, res) => {
  const exam = await examService.addBookletsToExam(req.params.id, req.body.bookletIds, req.user);
  res.status(201).json({ message: "Booklets added successfully", exam });
});

const removeBookletFromExam = asyncHandler(async (req, res) => {
  const exam = await examService.removeBookletFromExam(req.params.id, req.params.bookletId, req.user);
  res.status(200).json({ message: "Booklet removed from exam", exam });
});

const updateBookletOrder = asyncHandler(async (req, res) => {
  const exam = await examService.updateBookletOrder(req.params.id, req.body.booklets, req.user);
  res.status(200).json({ message: "Booklet order updated", exam });
});

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  changeExamStatus,
  deleteExam,
  duplicateExam,
  addBookletsToExam,
  removeBookletFromExam,
  updateBookletOrder,
};
