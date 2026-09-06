const asyncHandler = require("../utils/asyncHandler");
const questionImportService = require("../services/questionImportService");

const previewImport = asyncHandler(async (req, res) => {
  const result = await questionImportService.previewImport(req.file.buffer, req.file.originalname);
  res.status(200).json(result);
});

const importQuestions = asyncHandler(async (req, res) => {
  const result = await questionImportService.importQuestions(
    req.file.buffer,
    req.file.originalname,
    req.user,
  );
  res.status(201).json({
    message: "Questions imported successfully as drafts",
    importedCount: result.importedCount,
    preview: result.preview,
  });
});

module.exports = { previewImport, importQuestions };
