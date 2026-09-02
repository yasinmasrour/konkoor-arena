const express = require("express");
const arenaMatchController = require("../controllers/arenaMatchController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /arena/matches/{id}:
 *   get:
 *     summary: Get arena match by ID
 *     tags:
 *       - Arena
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arena match found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Arena match not found
 */
router.get("/:id", authMiddleware, arenaMatchController.getMatchById);

module.exports = router;
