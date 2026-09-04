const express = require("express");

const {
  getLeagueRanking,
  getPlayerLeagueRanking,
  getTopLeaguePlayers,
} = require("../controllers/arenaRankingController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /arena/leagues/{leagueId}/ranking:
 *   get:
 *     summary: Get live ranking of an arena league
 *     tags:
 *       - Arena Ranking
 *
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Arena league ID
 *
 *     responses:
 *       200:
 *         description: League ranking returned successfully
 *
 *       404:
 *         description: League not found
 */
router.get("/leagues/:leagueId/ranking", authMiddleware, getLeagueRanking);

/**
 * @swagger
 * /arena/leagues/{leagueId}/ranking/me:
 *   get:
 *     summary: Get current player's ranking in a league
 *     tags:
 *       - Arena Ranking
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: string
 *         description: Arena league ID
 *
 *     responses:
 *
 *       200:
 *         description: Player ranking returned successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Player rating not found
 */
router.get(
  "/leagues/:leagueId/ranking/me",
  authMiddleware,
  getPlayerLeagueRanking,
);

/**
 * @swagger
 * /arena/leagues/{leagueId}/top:
 *   get:
 *     summary: Get top players of an arena league
 *     tags:
 *       - Arena Ranking
 *
 *     parameters:
 *
 *       - in: path
 *         name: leagueId
 *         required: true
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *
 *     responses:
 *       200:
 *         description: Top players returned successfully
 *
 *       404:
 *         description: League not found
 */
router.get("/leagues/:leagueId/top", authMiddleware, getTopLeaguePlayers);

module.exports = router;
