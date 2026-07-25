const express = require("express");
const authRoutes = require("./authRoutes");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "Welcome to Konkoor Arena Backend"
    });
});

router.use("/api/auth", authRoutes);

module.exports = router;