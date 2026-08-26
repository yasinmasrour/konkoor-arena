const arenaMatchHistoryService = require("../services/arenaMatchHistoryService");

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

module.exports = {
  getMyMatchHistory,
};
