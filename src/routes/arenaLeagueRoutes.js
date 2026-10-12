const express = require("express");

const {
  getActiveLeagues,
  getUpcomingLeagues,
  getFinishedLeagues,
} = require("../controllers/arenaLeagueController");

const optionalAuth = require("../middleware/optionalAuthMiddleware");

const router = express.Router();

// 🆕 همه با optionalAuth — کاربر مهمان هم می‌تونه لیگ‌ها رو ببینه
router.get("/leagues/active", optionalAuth, getActiveLeagues);
router.get("/leagues/upcoming", optionalAuth, getUpcomingLeagues);
router.get("/leagues/finished", optionalAuth, getFinishedLeagues);

module.exports = router;