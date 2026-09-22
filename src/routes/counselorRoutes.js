const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const counselorController = require("../controllers/counselorController");

const router = express.Router();

router.use(protect);
router.use(allowRoles("COUNSELOR", "ADMIN"));

router.get("/stats", counselorController.getStats);
router.get("/students", counselorController.listStudents);
router.get("/students/:id", counselorController.getStudentById);

module.exports = router;