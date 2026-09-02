const arenaMatchService = require("../services/arenaMatchService");
const asyncHandler = require("../utils/asyncHandler");

const getMatchById = asyncHandler(async (req, res) => {
  const match = await arenaMatchService.getArenaMatchById(
    req.params.id,
    req.user.id,
  );

  res.status(200).json({
    match,
  });
});

module.exports = {
  getMatchById,
};
