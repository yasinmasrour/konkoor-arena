const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.use(protect);

// 🆕 آمار صفحه اول داشبورد
router.get("/student-home", dashboardController.getStudentHome);

// 🆕 badgeهای ادمین — فقط ادمین
router.get(
  "/admin-badges",
  allowRoles("ADMIN"),
  dashboardController.getAdminBadges,
);

module.exports = router;