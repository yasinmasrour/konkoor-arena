const express = require("express");

const {
  getLeagueRanking,
  getPlayerLeagueRanking,
  getTopLeaguePlayers,
} = require("../controllers/arenaRankingController");

const optionalAuth = require("../middleware/optionalAuthMiddleware");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// 🟢 عمومی
router.get("/leagues/:leagueId/ranking", optionalAuth, getLeagueRanking);
router.get("/leagues/:leagueId/top", optionalAuth, getTopLeaguePlayers);

// 🔴 خصوصی (رتبه شخصی کاربر)
router.get("/leagues/:leagueId/ranking/me", protect, getPlayerLeagueRanking);

module.exports = router;
