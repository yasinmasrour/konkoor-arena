const asyncHandler = require("../utils/asyncHandler");
const publicStatsService = require("../services/publicStatsService");

const getPublicStats = asyncHandler(async (req, res) => {
  const stats = await publicStatsService.getPublicStats();
  res.status(200).json(stats);
});

module.exports = {
  getPublicStats,
};
