const express = require("express");
const announcementController = require("../controllers/announcementController");

const router = express.Router();

// عمومی — بدون نیاز به لاگین
router.get("/active", announcementController.getActive);

router.post("/:id/view", announcementController.trackView);
router.post("/:id/click", announcementController.trackClick);
router.post("/:id/dismiss", announcementController.trackDismiss);

module.exports = router;
