const arenaMatchmakingService = require("../services/arenaMatchmakingService");
const asyncHandler = require("../utils/asyncHandler");

const joinQueue = asyncHandler(async (req, res) => {
  const { leagueId } = req.body;

  const result = await arenaMatchmakingService.joinQueue(req.user.id, leagueId);

  res.status(200).json({
    message: result.matched
      ? "Opponent found successfully"
      : "You have been added to the matchmaking queue",
    ...result,
  });
});

const leaveQueue = asyncHandler(async (req, res) => {
  const { leagueId } = req.params;

  const result = await arenaMatchmakingService.leaveQueue(
    req.user.id,
    leagueId,
  );

  res.status(200).json({
    message: "You have left the matchmaking queue",
    ...result,
  });
});

const getQueueStatus = asyncHandler(async (req, res) => {
  const { leagueId } = req.params;

  const result = await arenaMatchmakingService.getQueueStatus(
    req.user.id,
    leagueId,
  );

  res.status(200).json(result);
});

module.exports = {
  joinQueue,
  leaveQueue,
  getQueueStatus,
};
