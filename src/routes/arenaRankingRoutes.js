const express = require("express");

const {
  getLeagueRanking,
  getPlayerLeagueRanking,
  getTopLeaguePlayers,
} = require("../controllers/arenaRankingController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/leagues/:leagueId/ranking", getLeagueRanking);

router.get(
  "/leagues/:leagueId/ranking/me",
  authMiddleware,
  getPlayerLeagueRanking,
);

router.get("/leagues/:leagueId/top", getTopLeaguePlayers);

module.exports = router;
