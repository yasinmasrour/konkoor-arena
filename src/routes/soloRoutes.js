const express = require("express");
const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const soloController = require("../controllers/soloController");
const {
  startSoloSchema,
  answerSoloSchema,
  historyQuerySchema,
} = require("../validations/soloValidation");

const router = express.Router();

// 🔹 همه مسیرها نیاز به احراز هویت دارن
router.use(protect);

// ==================== 🔹 مسیرهای ثابت (قبل از :id) ====================
router.get("/levels", soloController.getLevels);

router.get(
  "/history",
  validate(historyQuerySchema, "query"),
  soloController.getSoloHistory,
);

router.get("/stats", soloController.getSoloStats);

// ==================== 🔹 شروع ====================
router.post(
  "/start",
  validate(startSoloSchema),
  soloController.startSolo,
);

// ==================== 🔹 داینامیک (آخر) ====================
router.get("/:id", soloController.getSoloStatus);

router.post(
  "/:id/answer",
  validate(answerSoloSchema),
  soloController.answerSolo,
);

router.post("/:id/abandon", soloController.abandonSolo);

module.exports = router;