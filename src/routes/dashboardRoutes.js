const express = require("express");
const protect = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.use(protect);

// 🆕 آمار صفحه اول داشبورد
router.get("/student-home", dashboardController.getStudentHome);

module.exports = router;