const dashboardService = require("../services/dashboardService");
const asyncHandler = require("../utils/asyncHandler");

const getStudentHome = asyncHandler(async (req, res) => {
  const data = await dashboardService.getStudentHomeData(req.user.id);
  res.status(200).json(data);
});

module.exports = {
  getStudentHome,
};