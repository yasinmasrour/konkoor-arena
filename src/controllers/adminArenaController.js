const adminArenaService = require("../services/adminArenaService");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

// ==================== لیست لیگ‌ها ====================
const listLeagues = asyncHandler(async (req, res) => {
  const result = await adminArenaService.listLeagues(req.query);

  res.status(200).json(result);
});

// ==================== جزئیات ====================
const getLeague = asyncHandler(async (req, res) => {
  const league = await adminArenaService.getLeagueById(req.params.id);
  res.status(200).json({ league });
});

// ==================== ساخت ====================
const createLeague = asyncHandler(async (req, res) => {
  const league = await adminArenaService.createLeague(req.body, req.user.id);

  res.status(201).json({
    message: "لیگ با موفقیت ساخته شد",
    league,
  });
});

// ==================== ویرایش ====================
const updateLeague = asyncHandler(async (req, res) => {
  const league = await adminArenaService.updateLeague(
    req.params.id,
    req.body,
    req.user.id,
  );

  res.status(200).json({
    message: "لیگ با موفقیت به‌روزرسانی شد",
    league,
  });
});

// ==================== تغییر وضعیت ====================
const changeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new AppError("status الزامی است", 400);
  }

  const league = await adminArenaService.changeStatus(
    req.params.id,
    status,
    req.user.id,
  );

  res.status(200).json({
    message: "وضعیت لیگ با موفقیت تغییر کرد",
    league,
  });
});

// ==================== حذف ====================
const deleteLeague = asyncHandler(async (req, res) => {
  await adminArenaService.deleteLeague(req.params.id, req.user.id);

  res.status(200).json({
    message: "لیگ با موفقیت حذف شد",
  });
});

module.exports = {
  listLeagues,
  getLeague,
  createLeague,
  updateLeague,
  changeStatus,
  deleteLeague,
};
