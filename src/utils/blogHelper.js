/**
 * محاسبه‌ی زمان مطالعه (دقیقه)
 */
function calculateReadingTime(content) {
  if (!content) return 1;

  const plain = content
    .replace(/```[\s\S]*?```/g, "") // حذف code blocks
    .replace(/`[^`]*`/g, "")        // حذف inline code
    .replace(/!\[.*?\]\(.*?\)/g, "") // حذف تصاویر
    .replace(/\[.*?\]\(.*?\)/g, "")  // حذف لینک‌ها
    .replace(/[#*_~>]/g, "")
    .trim();

  const words = plain.split(/\s+/).filter(Boolean);

  // تشخیص زبان
  const persianChars = (plain.match(/[\u0600-\u06FF]/g) || []).length;
  const isPersian = persianChars / Math.max(plain.length, 1) > 0.5;

  const wpm = isPersian ? 150 : 200;
  return Math.max(1, Math.ceil(words.length / wpm));
}

/**
 * استخراج headings از Markdown برای TOC
 */
function extractHeadings(content) {
  if (!content) return [];

  const headings = [];
  const lines = content.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);

      headings.push({
        level,
        text,
        id: id || `heading-${headings.length + 1}`,
      });
    }
  }

  return headings;
}

module.exports = {
  calculateReadingTime,
  extractHeadings,
};