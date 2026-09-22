const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const arenaStandingController = require("../controllers/arenaStandingController");

const router = express.Router();

router.use(protect);

router.get("/:leagueId", arenaStandingController.getLeagueStandings);
router.get("/:leagueId/rewards", arenaStandingController.getLeagueRewards);

// 🔹 فقط ادمین (برای تست دستی)
router.post(
  "/:leagueId/finalize",
  allowRoles("ADMIN"),
  arenaStandingController.finalizeLeague,
);

module.exports = router;
