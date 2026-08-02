const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const questionRoutes = require("./questionRoutes");
const bookletRoutes = require("./bookletRoutes");
const examRoutes = require("./examRoutes");
const attemptRoutes = require("./attemptRoutes");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "Welcome to Konkoor Arena Backend"
    });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/questions", questionRoutes);
router.use("/booklets", bookletRoutes);
router.use("/exams", examRoutes);
router.use("/attempts", attemptRoutes);

module.exports = router;