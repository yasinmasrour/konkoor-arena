const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const adminStrategyController = require("../controllers/adminStrategyController");
const {
  createStrategyPlanSchema,
  updateStrategyPlanSchema,
  listStrategyPlansSchema,
} = require("../validations/strategyValidation");

const router = express.Router();

// 🔹 همه مسیرها نیاز به ADMIN دارن
router.use(protect);
router.use(allowRoles("ADMIN"));

// ==================== 🔹 لیست ====================
router.get(
  "/",
  validate(listStrategyPlansSchema, "query"),
  adminStrategyController.listPlans,
);

// ==================== 🔹 جزئیات ====================
router.get("/:id", adminStrategyController.getPlan);

// ==================== 🔹 ساخت ====================
router.post(
  "/",
  validate(createStrategyPlanSchema),
  adminStrategyController.createPlan,
);

// ==================== 🔹 ویرایش ====================
router.patch(
  "/:id",
  validate(updateStrategyPlanSchema),
  adminStrategyController.updatePlan,
);

// ==================== 🔹 حذف ====================
router.delete("/:id", adminStrategyController.deletePlan);

// ==================== 🔹 انتشار ====================
router.patch("/:id/publish", adminStrategyController.publishPlan);

// ==================== 🔹 لغو انتشار ====================
router.patch("/:id/unpublish", adminStrategyController.unpublishPlan);

module.exports = router;
