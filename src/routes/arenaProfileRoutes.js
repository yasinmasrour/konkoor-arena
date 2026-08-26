const express = require("express");

const { getArenaProfile } = require("../controllers/arenaProfileController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, getArenaProfile);

module.exports = router;
