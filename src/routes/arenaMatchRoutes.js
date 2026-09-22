const express = require("express");
const arenaMatchController = require("../controllers/arenaMatchController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/:id", authMiddleware, arenaMatchController.getMatchById);

module.exports = router;
