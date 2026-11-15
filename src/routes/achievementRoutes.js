const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getMyAchievements,
  getNewAchievements,
  markAllSeen,
  getStats,
  getLeaderboard,
} = require("../controllers/achievementController");

const router = express.Router();

// همه‌ی routeها نیاز به لاگین دارن
router.use(authMiddleware);

// ==================== دستاوردهای من ====================
router.get("/", getMyAchievements);
router.get("/new", getNewAchievements);
router.post("/mark-seen", markAllSeen);
router.get("/stats", getStats);
router.get("/leaderboard", getLeaderboard);

module.exports = router;
