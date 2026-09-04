const express = require("express");

const aiAnalysisController = require("../controllers/aiAnalysisController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const { aiAnalysisRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

/**
 * @swagger
 * /attempts/{id}/ai-analysis:
 *   post:
 *     summary: Generate AI analysis for a submitted exam attempt
 *     tags:
 *       - AI Analysis
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: AI analysis generated successfully
 *       200:
 *         description: Existing AI analysis returned
 */
router.post(
  "/:id/ai-analysis",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  aiAnalysisRateLimiter,
  aiAnalysisController.generateAnalysis,
);

/**
 * @swagger
 * /attempts/{id}/ai-analysis:
 *   get:
 *     summary: Get AI analysis for a submitted exam attempt
 *     tags:
 *       - AI Analysis
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/:id/ai-analysis",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  aiAnalysisController.getAnalysis,
);

module.exports = router;
