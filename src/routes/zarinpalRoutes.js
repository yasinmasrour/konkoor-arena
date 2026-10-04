const express = require("express");
const zarinpalController = require("../controllers/zarinpalController");

const router = express.Router();

// این route عمداً protect ندارد.
// زرین‌پال Callback را بدون JWT ارسال می‌کند.
router.get("/callback", zarinpalController.callback);

module.exports = router;
