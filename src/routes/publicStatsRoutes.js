const express = require("express");
const publicStatsController = require("../controllers/publicStatsController");

const router = express.Router();

// 🆕 عمومی — بدون نیاز به لاگین
router.get("/", publicStatsController.getPublicStats);

module.exports = router;