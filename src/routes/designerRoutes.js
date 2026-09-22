const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const designerController = require("../controllers/designerController");

const router = express.Router();

router.use(protect);
router.use(allowRoles("QUESTION_DESIGNER", "ADMIN"));

router.get("/stats", designerController.getStats);
router.get("/questions", designerController.listQuestions);

module.exports = router;
