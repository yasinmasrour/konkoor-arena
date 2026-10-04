const asyncHandler = require("../utils/asyncHandler");
const siteInfoService = require("../services/siteInfoService");

/**
 * GET /public/site-info
 * عمومی — بدون نیاز به لاگین
 */
const getSiteInfo = asyncHandler(async (req, res) => {
  const info = await siteInfoService.getSiteInfo();
  res.status(200).json({ siteInfo: info });
});

/**
 * PATCH /admin/site-info
 * فقط ادمین
 */
const updateSiteInfo = asyncHandler(async (req, res) => {
  const info = await siteInfoService.updateSiteInfo(req.body);
  res.status(200).json({
    message: "Site info updated successfully",
    siteInfo: info,
  });
});

module.exports = {
  getSiteInfo,
  updateSiteInfo,
};
