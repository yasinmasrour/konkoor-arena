const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Konkoor Arena Backend"
    });
});
module.exports = app;