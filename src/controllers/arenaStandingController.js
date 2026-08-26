const arenaStandingService = require("../services/arenaStandingService");

const getLeagueStandings = async (req, res, next) => {
  try {
    const result = await arenaStandingService.getLeagueStandings(
      req.params.leagueId,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeagueStandings,
};
