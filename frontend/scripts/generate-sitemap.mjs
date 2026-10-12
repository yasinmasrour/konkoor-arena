import fs from "node:fs";
import path from "node:path";

const SITEMAP_URL = "https://api.griffinedu.ir/sitemap.xml";
const OUTPUT_DIR = path.resolve("dist");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "sitemap.xml");

try {
  console.log("Fetching sitemap...");

  const response = await fetch(SITEMAP_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sitemap: ${response.status} ${response.statusText}`,
    );
  }

  const sitemap = await response.text();

  if (!sitemap.includes("<urlset")) {
    throw new Error("Invalid sitemap response.");
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, sitemap, "utf8");

  console.log(`Sitemap generated: ${OUTPUT_FILE}`);
} catch (error) {
  console.error("Sitemap generation failed:", error);
  process.exit(1);
}
