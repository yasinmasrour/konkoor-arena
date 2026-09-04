const arenaMatchHistoryService = require("../services/arenaMatchHistoryService");
const arenaRatingHistoryService = require("../services/arenaRatingHistoryService");

const getMatchSummary = async (req, res, next) => {
  try {
    const result = await arenaMatchHistoryService.getMatchSummary(
      req.params.matchId,
      req.user.id,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getMyMatchHistory = async (req, res, next) => {
  try {
    const result = await arenaMatchHistoryService.getMyMatchHistory(
      req.user.id,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getMyRatingHistory = async (req, res, next) => {
  try {
    const result = await arenaRatingHistoryService.getMyRatingHistory(
      req.user.id,
      req.query.leagueId,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyMatchHistory,
  getMatchSummary,
  getMyRatingHistory,
};
