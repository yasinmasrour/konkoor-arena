const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { registerSchema } = require("../validations/authValidation");

const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();


router.post(
    "/register",
    validate(registerSchema),
    authController.register
);

router.post(
    "/login",
    authController.login
);

router.get(
    "/me",
    protect,
    (req, res) => {

        res.status(200).json({
            message: "Protected route accessed successfully",
            user: req.user
        });

    }
);

module.exports = router;