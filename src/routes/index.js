const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const questionRoutes = require("./questionRoutes");
const bookletRoutes = require("./bookletRoutes");
const examRoutes = require("./examRoutes");
const attemptRoutes = require("./attemptRoutes");
const arenaMatchRoutes = require("./arenaMatchRoutes");
const arenaRankingRoutes = require("./arenaRankingRoutes");
const arenaStandingRoutes = require("./arenaStandingRoutes");
const arenaProfileRoutes = require("./arenaProfileRoutes");
const arenaMatchHistoryRoutes = require("./arenaMatchHistoryRoutes");
const arenaLeagueRoutes = require("./arenaLeagueRoutes");
const arenaQueueRoutes = require("./arenaQueueRoutes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Welcome to Konkoor Arena Backend",
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/questions", questionRoutes);
router.use("/booklets", bookletRoutes);
router.use("/exams", examRoutes);
router.use("/attempts", attemptRoutes);
router.use("/arena", arenaMatchHistoryRoutes);
router.use("/arena", arenaRankingRoutes);
router.use("/arena/matches", arenaMatchRoutes);
router.use("/arena", arenaStandingRoutes);
router.use("/arena", arenaProfileRoutes);
router.use("/arena", arenaLeagueRoutes);
router.use("/arena/queue", arenaQueueRoutes);

module.exports = router;
