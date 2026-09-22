const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const adminController = require("../controllers/adminController");
const {
  changeRoleSchema,
  adminChargeWalletSchema,
} = require("../validations/adminValidation");

const router = express.Router();

// 🔹 همه‌ی مسیرهای ادمین
router.use(protect);
router.use(allowRoles("ADMIN"));

// ==================== کاربران ====================
router.get("/users", adminController.listUsers);
router.get("/users/:id", adminController.getUserDetails);
router.patch(
  "/users/:id/role",
  validate(changeRoleSchema),
  adminController.changeUserRole,
);
router.delete("/users/:id", adminController.deleteUser);

// ==================== آمار ====================
router.get("/stats", adminController.getGlobalStats);

// ==================== کیف پول ====================
router.post(
  "/wallet/charge",
  validate(adminChargeWalletSchema),
  adminController.adminChargeWallet,
);

// 🆕 Subscription Plans
router.get("/subscription-plans", adminController.getSubscriptionPlans);
router.post("/subscription-plans", adminController.createSubscriptionPlan);
router.patch("/subscription-plans/:id", adminController.updateSubscriptionPlan);
router.delete(
  "/subscription-plans/:id",
  adminController.deleteSubscriptionPlan,
);

module.exports = router;
