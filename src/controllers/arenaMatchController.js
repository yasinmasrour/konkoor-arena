const arenaMatchService = require("../services/arenaMatchService");
const asyncHandler = require("../utils/asyncHandler");
const arenaSocketEvents = require("../socket/arenaSocketEvents");

const createMatch = asyncHandler(async (req, res) => {
  const match = await arenaMatchService.createArenaMatch(
    req.user.id,
    req.body.opponentId,
    req.body.leagueId,
  );

  res.status(201).json({
    message: "Arena match created successfully",
    match,
  });
});

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
  createMatch,
  getMatchById,
};
