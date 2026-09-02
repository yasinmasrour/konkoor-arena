const express = require("express");

const {
  getActiveLeagues,
  getUpcomingLeagues,
  getFinishedLeagues,
  getLeagueOpponents,
} = require("../controllers/arenaLeagueController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/leagues/active", authMiddleware, getActiveLeagues);

router.get("/leagues/upcoming", authMiddleware, getUpcomingLeagues);

router.get("/leagues/finished", authMiddleware, getFinishedLeagues);

router.get("/leagues/:leagueId/opponents", authMiddleware, getLeagueOpponents);

module.exports = router;
