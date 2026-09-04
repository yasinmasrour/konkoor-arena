const express = require("express");

const {
  getMyMatchHistory,
  getMatchSummary,
  getMyRatingHistory,
} = require("../controllers/arenaMatchHistoryController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/matches/me", authMiddleware, getMyMatchHistory);
router.get("/rating-history", authMiddleware, getMyRatingHistory);
router.get("/matches/:matchId/summary", authMiddleware, getMatchSummary);

module.exports = router;
