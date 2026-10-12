const asyncHandler = require("../utils/asyncHandler");
const sitemapService = require("../services/sitemapService");

const getSitemap = asyncHandler(async (req, res) => {
  const sitemap = await sitemapService.generateSitemap();

  res
    .status(200)
    .type("application/xml")
    .set("Cache-Control", "public, max-age=3600")
    .send(sitemap);
});

module.exports = {
  getSitemap,
};