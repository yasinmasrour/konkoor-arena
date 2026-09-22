const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const featureController = require("../controllers/featureController");

const router = express.Router();

router.use(protect);

// 🔹 featureهای من
router.get("/me", featureController.getMyFeatures);

// 🔹 لیست همه featureها (فقط ادمین)
router.get("/all", allowRoles("ADMIN"), featureController.getAllFeatures);

module.exports = router;
