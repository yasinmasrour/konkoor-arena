// ============================================
// generate-sitemap.js
// تولید خودکار sitemap.xml از DB
// ============================================
import { writeFileSync } from "fs";
import { join } from "path";
import { blogPost } from "../../src/config/prisma";

const SITE_URL = "https://griffinedu.ir";
const OUTPUT_PATH = join(__dirname, "../frontend/public/sitemap.xml");

// ==================== صفحات ثابت ====================
const STATIC_PAGES = [
  { url: "/", priority: 1.0, changefreq: "daily" },
  { url: "/blog", priority: 0.9, changefreq: "daily" },
  { url: "/tests", priority: 0.8, changefreq: "weekly" },
  { url: "/arena", priority: 0.8, changefreq: "weekly" },
  { url: "/subscriptions", priority: 0.8, changefreq: "weekly" },
  { url: "/strategy", priority: 0.7, changefreq: "weekly" },
  { url: "/about", priority: 0.6, changefreq: "monthly" },
  { url: "/contact", priority: 0.6, changefreq: "monthly" },
  { url: "/faq", priority: 0.6, changefreq: "monthly" },
  { url: "/terms", priority: 0.4, changefreq: "yearly" },
  { url: "/privacy", priority: 0.4, changefreq: "yearly" },
];

// ==================== Escape XML ====================
function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ==================== Generate ====================
async function generateSitemap() {
  console.log("🚀 Generating sitemap...");

  // ۱. مقالات منتشرشده
  const posts = await blogPost.findMany({
    where: { status: "published" },
    select: {
      slug: true,
      updatedAt: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  console.log(`📄 Found ${posts.length} published posts`);

  // ۲. Combine
  const urls = [
    ...STATIC_PAGES.map((p) => ({
      ...p,
      lastmod: new Date().toISOString(),
    })),
    ...posts.map((p) => ({
      url: `/blog/${p.slug}`,
      lastmod: (p.updatedAt || p.publishedAt || new Date()).toISOString(),
      priority: 0.8,
      changefreq: "monthly",
    })),
  ];

  // ۳. Build XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${SITE_URL}${escapeXml(item.url)}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority.toFixed(1)}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  // ۴. Write
  writeFileSync(OUTPUT_PATH, xml, "utf8");

  console.log(`✅ Sitemap generated: ${urls.length} URLs`);
  console.log(`📁 Output: ${OUTPUT_PATH}`);
  console.log("");
}

// ==================== Run ====================
generateSitemap()
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
