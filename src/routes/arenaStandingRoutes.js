const express = require("express");

const {
  getLeagueStandings,
} = require("../controllers/arenaStandingController");

const router = express.Router();

/**
 * @swagger
 * /arena/leagues/{leagueId}/standings:
 *   get:
 *     summary: Get final standings of a finished league
 *     tags:
 *       - Arena Standing
 *
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: string
 *
 *     responses:
 *
 *       200:
 *         description: League standings returned successfully
 *
 *       400:
 *         description: League is not finished
 *
 *       404:
 *         description: League not found
 */
router.get("/leagues/:leagueId/standings", getLeagueStandings);

module.exports = router;
