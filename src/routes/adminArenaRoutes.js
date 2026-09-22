const express = require("express");
const adminArenaController = require("../controllers/adminArenaController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const {
  createLeagueSchema,
  updateLeagueSchema,
  changeStatusSchema,
  listLeaguesQuerySchema,
} = require("../validations/adminArenaValidation");

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));

// ==================== لیست ====================
router.get(
  "/leagues",
  validate(listLeaguesQuerySchema, "query"),
  adminArenaController.listLeagues,
);

// ==================== ساخت ====================
router.post(
  "/leagues",
  validate(createLeagueSchema),
  adminArenaController.createLeague,
);

// ==================== جزئیات ====================
router.get("/leagues/:id", adminArenaController.getLeague);

// ==================== ویرایش ====================
router.patch(
  "/leagues/:id",
  validate(updateLeagueSchema),
  adminArenaController.updateLeague,
);

// ==================== تغییر وضعیت ====================
router.patch(
  "/leagues/:id/status",
  validate(changeStatusSchema),
  adminArenaController.changeStatus,
);

// ==================== حذف ====================
router.delete("/leagues/:id", adminArenaController.deleteLeague);

module.exports = router;
