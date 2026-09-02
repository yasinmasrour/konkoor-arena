const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const arenaQueueController = require("../controllers/arenaQueueController");
const { joinQueueSchema } = require("../validations/arenaQueueValidation");

router.post(
  "/",
  authMiddleware,
  validate(joinQueueSchema),
  arenaQueueController.joinQueue,
);

router.delete("/:leagueId", authMiddleware, arenaQueueController.leaveQueue);

router.get("/:leagueId", authMiddleware, arenaQueueController.getQueueStatus);

module.exports = router;
