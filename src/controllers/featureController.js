const featureService = require("../services/featureService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== 🔹 featureهای من ====================
const getMyFeatures = asyncHandler(async (req, res) => {
  const result = await featureService.getMyFeatures(req.user.id, req.user.role);
  res.status(200).json(result);
});

// ==================== 🔹 لیست همه featureها (ادمین) ====================
const getAllFeatures = asyncHandler(async (req, res) => {
  const features = featureService.getAllFeatures();
  res.status(200).json({ features });
});

module.exports = {
  getMyFeatures,
  getAllFeatures,
};
