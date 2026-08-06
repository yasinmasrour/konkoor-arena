const express = require("express");

const bookletController = require("../controllers/bookletController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const ROLES = require("../constants/roles");

const router = express.Router();

const validate = require("../middleware/validationMiddleware");
const {
  createBookletSchema,
  updateBookletSchema,
} = require("../validations/bookletValidation");

/**
 * @swagger
 * /booklets:
 *   post:
 *     summary: Create a new booklet
 *     tags:
 *       - Booklets
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - lesson
 *               - grade
 *               - major
 *               - examDate
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *                 example: Mathematics Booklet A
 *               lesson:
 *                 type: string
 *                 example: Mathematics
 *               grade:
 *                 type: string
 *                 example: "12"
 *               major:
 *                 type: string
 *                 example: math
 *               examDate:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 example: 75
 *     responses:
 *       201:
 *         description: Booklet created successfully
 */
router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  validate(createBookletSchema),
  bookletController.createBooklet,
);

/**
 * @swagger
 * /booklets:
 *   get:
 *     summary: Get all booklets
 *     tags:
 *       - Booklets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: lesson
 *         schema:
 *           type: string
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *       - in: query
 *         name: major
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of booklets
 */
router.get("/", authMiddleware, bookletController.getBooklets);

/**
 * @swagger
 * /booklets/{id}:
 *   get:
 *     summary: Get booklet by ID
 *     tags:
 *       - Booklets
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booklet details
 *       404:
 *         description: Booklet not found
 */
router.get("/:id", authMiddleware, bookletController.getBookletById);

/**
 * @swagger
 * /booklets/{id}:
 *   put:
 *     summary: Update booklet
 *     tags:
 *       - Booklets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Booklet updated
 *       404:
 *         description: Booklet not found
 */
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.COUNSELOR),
  validate(updateBookletSchema),
  bookletController.updateBooklet,
);

/**
 * @swagger
 * /booklets/{id}:
 *   delete:
 *     summary: Delete booklet
 *     tags:
 *       - Booklets
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booklet deleted
 *       404:
 *         description: Booklet not found
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  bookletController.deleteBooklet,
);

module.exports = router;
