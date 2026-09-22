const express = require("express");
const protect = require("../middleware/authMiddleware");
const examPurchaseController = require("../controllers/examPurchaseController");

const router = express.Router();

router.use(protect);

router.post("/:examId/purchase", examPurchaseController.createExamPurchase);

module.exports = router;
