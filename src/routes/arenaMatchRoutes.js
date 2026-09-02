const express = require("express");
const arenaMatchController = require("../controllers/arenaMatchController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validationMiddleware");
const arenaGameController = require("../controllers/arenaGameController");
const {
  createMatchSchema,
  submitAnswerSchema,
} = require("../validations/arenaMatchValidation");
const router = express.Router();

/**
 * @swagger
 * /arena/matches:
 *   post:
 *     summary: create a new arena match
 *     tags:
 *       - Arena
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - opponentId
 *               - leagueId
 *             properties:
 *               opponentId:
 *                 type: string
 *                 example: ID_OF_PLAYER_2
 *               leagueId:
 *                 type: string
 *                 example: ID_OF_ACTIVE_LEAGUE
 *     responses:
 *       201:
 *         description: Arena match created successfully
 */
router.post(
  "/",
  authMiddleware,
  validate(createMatchSchema),
  arenaMatchController.createMatch,
);

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

/**
 * @swagger
 * /arena/matches/{id}/start:
 *   post:
 *     summary: Start an arena match
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
 *         description: Arena question started successfully
 *       400:
 *         description: Question cannot be started
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Match question not found
 */
router.post("/:id/start", authMiddleware, arenaGameController.startMatch);

/**
 * @swagger
 * /arena/matches/{id}/questions/{questionId}/answer:
 *   post:
 *     summary: Submit an answer to an arena match question
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
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selectedAnswer
 *             properties:
 *               selectedAnswer:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *       400:
 *         description: Invalid answer submission
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Player is not part of the match
 *       404:
 *         description: Match question not found
 */
router.post(
  "/:id/questions/:questionId/answer",
  authMiddleware,
  arenaGameController.submitAnswer,
);

/**
 * @swagger
 * /arena/matches/{id}/questions/{questionId}/timeout:
 *   post:
 *     summary: Finish an arena question because its time expired
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
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question finished by timeout
 *       400:
 *         description: Question time has not expired
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Match question not found
 */
router.post(
  "/:id/questions/:questionId/timeout",
  authMiddleware,
  arenaGameController.timeoutQuestion,
);

module.exports = router;