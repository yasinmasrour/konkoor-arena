const asyncHandler = require("../utils/asyncHandler");
const announcementService = require("../services/announcementService");

const adminList = asyncHandler(async (req, res) => {
  const result = await announcementService.adminList({
    isActive: req.query.isActive,
    displayType: req.query.displayType,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  res.status(200).json(result);
});

const adminGetById = asyncHandler(async (req, res) => {
  const item = await announcementService.adminGetById(req.params.id);
  res.status(200).json({ announcement: item });
});

const adminCreate = asyncHandler(async (req, res) => {
  const item = await announcementService.adminCreate(req.body);
  res.status(201).json({
    message: "اعلان ساخته شد",
    announcement: item,
  });
});

const adminUpdate = asyncHandler(async (req, res) => {
  const item = await announcementService.adminUpdate(req.params.id, req.body);
  res.status(200).json({
    message: "اعلان ویرایش شد",
    announcement: item,
  });
});

const adminDelete = asyncHandler(async (req, res) => {
  await announcementService.adminDelete(req.params.id);
  res.status(200).json({ message: "اعلان حذف شد" });
});

const adminToggleActive = asyncHandler(async (req, res) => {
  const item = await announcementService.adminToggleActive(req.params.id);
  res.status(200).json({
    message: item.isActive ? "اعلان فعال شد" : "اعلان غیرفعال شد",
    announcement: item,
  });
});

module.exports = {
  adminList,
  adminGetById,
  adminCreate,
  adminUpdate,
  adminDelete,
  adminToggleActive,
};