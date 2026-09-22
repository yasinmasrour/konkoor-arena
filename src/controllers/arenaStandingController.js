const arenaStandingService = require("../services/arenaStandingService");
const arenaLeagueFinalizationService = require("../services/arenaLeagueFinalizationService");

// ==================== گرفتن جدول رتبه‌بندی ====================
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

// ==================== گرفتن جوایز لیگ ====================
const getLeagueRewards = async (req, res, next) => {
  try {
    const rewards = await arenaLeagueFinalizationService.getLeagueRewards(
      req.params.leagueId,
    );

    res.status(200).json({ rewards });
  } catch (error) {
    next(error);
  }
};

// ==================== نهایی‌سازی لیگ (فقط ادمین - برای تست دستی) ====================
const finalizeLeague = async (req, res, next) => {
  try {
    const result = await arenaLeagueFinalizationService.finalizeLeague(
      req.params.leagueId,
    );

    res.status(200).json({
      message: "لیگ نهایی شد و جوایز پرداخت شد",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeagueStandings,
  getLeagueRewards,
  finalizeLeague,
};
