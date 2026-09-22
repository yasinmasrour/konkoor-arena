const arenaInviteService = require("../services/arenaInviteService");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

const createInvite = asyncHandler(async (req, res) => {
  const { leagueId } = req.body;

  if (!leagueId) {
    throw new AppError("leagueId الزامی است", 400);
  }

  const result = await arenaInviteService.createInvite(req.user.id, leagueId);

  res.status(201).json({
    message: "کد دعوت ساخته شد",
    ...result,
  });
});

const getInvite = asyncHandler(async (req, res) => {
  const invite = await arenaInviteService.getInviteByCode(
    req.params.code.toUpperCase(),
  );

  res.status(200).json({ invite });
});

const acceptInvite = asyncHandler(async (req, res) => {
  const match = await arenaInviteService.acceptInvite(
    req.params.code.toUpperCase(),
    req.user.id,
  );

  res.status(200).json({
    message: "دعوت قبول شد",
    match,
  });
});

const cancelInvite = asyncHandler(async (req, res) => {
  const result = await arenaInviteService.cancelInvite(
    req.user.id,
    req.params.code.toUpperCase(),
  );

  res.status(200).json({
    message: "دعوت لغو شد",
    ...result,
  });
});

const getMyInvite = asyncHandler(async (req, res) => {
  const result = await arenaInviteService.getMyActiveInvite(req.user.id);
  res.status(200).json(result);
});

module.exports = {
  createInvite,
  getInvite,
  acceptInvite,
  cancelInvite,
  getMyInvite,
};