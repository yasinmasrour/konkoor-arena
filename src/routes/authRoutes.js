const protect = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { registerSchema } = require("../validations/authValidation");

const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();
const rateLimiter = require("../middleware/rateLimiter");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Mehran
 *               lastName:
 *                 type: string
 *                 example: Masrour
 *               email:
 *                 type: string
 *                 example: mehran@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: User already exists
 *       400:
 *         description: Validation failed
 */
router.post(
  "/register",
  rateLimiter,
  validate(registerSchema),
  authController.register,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: mehran@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post("/login", rateLimiter, authController.login);

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

module.exports = router;
