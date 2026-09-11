const express = require("express");
const protect = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, userController.getProfile);
router.patch("/me", protect, userController.updateProfile);

module.exports = router;
