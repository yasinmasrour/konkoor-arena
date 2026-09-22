const arenaLeagueService = require("../services/arenaLeagueService");
const asyncHandler = require("../utils/asyncHandler");

const getActiveLeagues = asyncHandler(async (req, res) => {
  const result = await arenaLeagueService.getActiveLeagues(req.user.id);

  res.status(200).json(result);
});

const getUpcomingLeagues = asyncHandler(async (req, res) => {
  const leagues = await arenaLeagueService.getUpcomingLeagues();

  res.status(200).json({
    leagues,
  });
});

const getFinishedLeagues = asyncHandler(async (req, res) => {
  const leagues = await arenaLeagueService.getFinishedLeagues();

  res.status(200).json({
    leagues,
  });
});

module.exports = {
  getActiveLeagues,
  getUpcomingLeagues,
  getFinishedLeagues,
};
