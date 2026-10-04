const express = require("express");
const siteInfoController = require("../controllers/siteInfoController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const router = express.Router();

// فقط ادمین
router.patch(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  siteInfoController.updateSiteInfo,
);

module.exports = router;
