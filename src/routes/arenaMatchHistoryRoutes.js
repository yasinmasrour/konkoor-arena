const express = require("express");

const {
  getMyMatchHistory,
} = require("../controllers/arenaMatchHistoryController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/matches/me", authMiddleware, getMyMatchHistory);

module.exports = router;
