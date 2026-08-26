const arenaProfileService = require("../services/arenaProfileService");

const getArenaProfile = async (req, res, next) => {
  try {
    const result = await arenaProfileService.getArenaProfile(req.user.id);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArenaProfile,
};
