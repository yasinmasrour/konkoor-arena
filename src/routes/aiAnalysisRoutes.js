const express = require("express");

const aiAnalysisController = require("../controllers/aiAnalysisController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const { aiAnalysisRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post(
  "/:id/ai-analysis",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  aiAnalysisRateLimiter,
  aiAnalysisController.generateAnalysis,
);

router.get(
  "/:id/ai-analysis",
  authMiddleware,
  roleMiddleware(ROLES.STUDENT),
  aiAnalysisController.getAnalysis,
);

module.exports = router;
