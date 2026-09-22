const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const validate = require("../middleware/validate");
const { walletRateLimiter } = require("../middleware/rateLimiter");
const walletController = require("../controllers/walletController");
const {
  withdrawRequestSchema,
  adminAdjustSchema,
  completeWithdrawSchema,
  rejectWithdrawSchema,
} = require("../validations/walletValidation");

const router = express.Router();

// ==================== همه مسیرها نیاز به لاگین دارند ====================
router.use(protect);

// ==================== موجودی و تراکنش‌ها ====================
router.get("/balance", walletController.getBalance);
router.get("/transactions", walletController.getTransactions);

// ==================== 🆕 شارژ کیف پول ====================
router.post("/charge", walletController.createChargePayment);
router.post("/charge/verify", walletController.verifyChargePayment);

// ==================== درخواست برداشت ====================
router.post(
  "/withdraw",
  walletRateLimiter,
  validate(withdrawRequestSchema),
  walletController.createWithdrawRequest,
);

router.get("/withdraw/my-requests", walletController.getMyWithdrawRequests);

// ==================== ادمین ====================
router.get(
  "/admin/withdraw-requests",
  allowRoles("ADMIN"),
  walletController.getAllWithdrawRequests,
);

router.post(
  "/admin/withdraw-requests/:id/approve",
  allowRoles("ADMIN"),
  validate(rejectWithdrawSchema),
  walletController.approveWithdrawRequest,
);

router.post(
  "/admin/withdraw-requests/:id/reject",
  allowRoles("ADMIN"),
  validate(rejectWithdrawSchema),
  walletController.rejectWithdrawRequest,
);

router.post(
  "/admin/withdraw-requests/:id/complete",
  allowRoles("ADMIN"),
  validate(completeWithdrawSchema),
  walletController.completeWithdrawRequest,
);

// ==================== ادمین: تنظیم دستی ====================
router.post(
  "/admin/adjust",
  allowRoles("ADMIN"),
  validate(adminAdjustSchema),
  walletController.adminAdjustWallet,
);

module.exports = router;
