const arenaRankingService = require("../services/arenaRankingService");

const getLeagueRanking = async (req, res, next) => {
  try {
    const result = await arenaRankingService.getLeagueRanking(
      req.params.leagueId,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getPlayerLeagueRanking = async (req, res, next) => {
  try {
    const result = await arenaRankingService.getPlayerLeagueRanking(
      req.params.leagueId,
      req.user.id,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getTopLeaguePlayers = async (req, res, next) => {
  try {
    const result = await arenaRankingService.getTopLeaguePlayers(
      req.params.leagueId,
      Math.min(Math.max(Number(req.query.limit) || 10, 1), 50),
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeagueRanking,
  getPlayerLeagueRanking,
  getTopLeaguePlayers,
};
