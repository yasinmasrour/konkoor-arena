const asyncHandler = require("../utils/asyncHandler");
const announcementService = require("../services/announcementService");

/**
 * GET /public/announcements/active
 */
const getActive = asyncHandler(async (req, res) => {
  const result = await announcementService.getActiveAnnouncements();
  res.status(200).json(result);
});

/**
 * POST /public/announcements/:id/view
 */
const trackView = asyncHandler(async (req, res) => {
  await announcementService.trackView(req.params.id);
  res.status(200).json({ success: true });
});

/**
 * POST /public/announcements/:id/click
 */
const trackClick = asyncHandler(async (req, res) => {
  await announcementService.trackClick(req.params.id);
  res.status(200).json({ success: true });
});

/**
 * POST /public/announcements/:id/dismiss
 */
const trackDismiss = asyncHandler(async (req, res) => {
  await announcementService.trackDismiss(req.params.id);
  res.status(200).json({ success: true });
});

module.exports = {
  getActive,
  trackView,
  trackClick,
  trackDismiss,
};
