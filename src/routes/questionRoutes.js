const express = require("express");

const {
    createQuestion
} = require("../controllers/questionController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


const router = express.Router();


router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin", "counselor"),
    createQuestion
);


module.exports = router;