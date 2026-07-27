const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const questionRoutes = require("./questionRoutes");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "Welcome to Konkoor Arena Backend"
    });
});

router.use("/api/auth", authRoutes);
router.use("/api/users", userRoutes);
router.use("/api/questions", questionRoutes);

module.exports = router;