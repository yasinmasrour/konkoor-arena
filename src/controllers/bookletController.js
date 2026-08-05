const bookletService = require("../services/bookletService");
const asyncHandler = require("../utils/asyncHandler");

const createBooklet = asyncHandler(async (req, res) => {
  const booklet = await bookletService.createBooklet({
    ...req.body,
    createdBy: req.user.id,
  });

  res.status(201).json({
    message: "Booklet created successfully",
    booklet,
  });
});

const getBooklets = asyncHandler(async (req, res) => {
  const result = await bookletService.getBooklets(req.query);

  res.status(200).json(result);
});

const getBookletById = asyncHandler(async (req, res) => {
  const booklet = await bookletService.getBookletById(req.params.id);

  res.status(200).json({
    booklet,
  });
});

const updateBooklet = asyncHandler(async (req, res) => {
  const booklet = await bookletService.updateBooklet(req.params.id, req.body);

  res.status(200).json({
    message: "Booklet updated successfully",

    booklet,
  });
});

const deleteBooklet = asyncHandler(async (req, res) => {
  await bookletService.deleteBooklet(req.params.id);

  res.status(200).json({
    message: "Booklet deleted successfully",
  });
});

module.exports = {
  createBooklet,
  getBooklets,
  getBookletById,
  updateBooklet,
  deleteBooklet,
};
