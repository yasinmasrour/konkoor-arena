const express = require("express");
const prisma = require("../config/prisma");

const router = express.Router();

router.get("/live", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.get("/ready", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", database: "ok" });
  } catch (error) {
    res.status(503).json({ status: "unavailable", database: "unavailable" });
  }
});

module.exports = router;
