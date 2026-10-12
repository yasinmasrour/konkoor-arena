const express = require("express");
const protect = require("../middleware/authMiddleware");
const optionalAuth = require("../middleware/optionalAuthMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const arenaStandingController = require("../controllers/arenaStandingController");

const router = express.Router();

// 🟢 عمومی
router.get(
  "/:leagueId",
  optionalAuth,
  arenaStandingController.getLeagueStandings,
);

router.get(
  "/:leagueId/rewards",
  optionalAuth,
  arenaStandingController.getLeagueRewards,
);

// 🔴 ادمین فقط
router.post(
  "/:leagueId/finalize",
  protect,
  allowRoles("ADMIN"),
  arenaStandingController.finalizeLeague,
);

module.exports = router;