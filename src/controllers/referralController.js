const referralService = require("../services/referralService");
const asyncHandler = require("../utils/asyncHandler");

// ==================== 🔹 اطلاعات من ====================
const getMyReferralInfo = asyncHandler(async (req, res) => {
  const info = await referralService.getMyReferralInfo(req.user.id);
  res.status(200).json(info);
});

// ==================== 🔹 اعتبارسنجی کد ====================
const validateCode = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const result = await referralService.validateCode(req.user.id, code);
  res.status(200).json(result);
});

// ==================== 🔹 محاسبه تخفیف ====================
const calculateDiscount = asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  const result = await referralService.calculateDiscount(
    req.user.id,
    code,
    amount,
  );
  res.status(200).json(result);
});

// ==================== 🔹 تاریخچه ====================
const getReferralHistory = asyncHandler(async (req, res) => {
  const result = await referralService.getReferralHistory(req.user.id, {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

module.exports = {
  getMyReferralInfo,
  validateCode,
  calculateDiscount,
  getReferralHistory,
};
