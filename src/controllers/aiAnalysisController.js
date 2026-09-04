const aiAnalysisService = require("../services/aiAnalysisService");
const asyncHandler = require("../utils/asyncHandler");

const generateAnalysis = asyncHandler(async (req, res) => {
  const result = await aiAnalysisService.generateAnalysis(
    req.params.id,
    req.user.id,
  );

  res.status(result.cached ? 200 : 201).json({
    message: result.cached
      ? "AI analysis already exists"
      : "AI analysis generated successfully",
    result,
  });
});

const getAnalysis = asyncHandler(async (req, res) => {
  const result = await aiAnalysisService.getMyAnalysis(
    req.params.id,
    req.user.id,
  );

  res.status(200).json(result);
});

module.exports = {
  generateAnalysis,
  getAnalysis,
};
