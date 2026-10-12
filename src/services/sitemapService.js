const prisma = require("../config/prisma");
const { BLOG_STATUS } = require("../constants/blog");

const SITE_URL = "https://griffinedu.ir";

const staticPages = [
  "/",
  "/tests",
  "/arena",
  "/subscriptions",
  "/blog/",
  "/strategy",
  "/about",
  "/contact",
  "/faq",
  "/terms",
  "/privacy",
];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

async function generateSitemap() {
  const posts = await prisma.blogPost.findMany({
    where: {
      status: BLOG_STATUS.PUBLISHED,
    },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const urls = [];

  // صفحات اصلی سایت
  for (const path of staticPages) {
    urls.push(`
  <url>
    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>
  </url>`);
  }

  // مقالات منتشرشده
  for (const post of posts) {
    const lastmod = post.updatedAt || post.publishedAt;

    urls.push(`
  <url>
    <loc>${escapeXml(
      `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`,
    )}</loc>
    <lastmod>${formatDate(lastmod)}</lastmod>
  </url>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;
}

module.exports = {
  generateSitemap,
};