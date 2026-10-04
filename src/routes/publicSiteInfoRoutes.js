const express = require("express");
const siteInfoController = require("../controllers/siteInfoController");

const router = express.Router();

// عمومی — بدون نیاز به لاگین
router.get("/", siteInfoController.getSiteInfo);

module.exports = router;