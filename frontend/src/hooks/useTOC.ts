import { useMemo } from "react";

export interface TocHeading {
  level: number;
  text: string;
  id: string;
}

/**
 * استخراج headings از محتوای Markdown
 */
export const useTOC = (content: string): TocHeading[] => {
  return useMemo(() => {
    if (!content) return [];

    const headings: TocHeading[] = [];
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
        const id = slugifyHeading(text, headings.length);

        headings.push({ level, text, id });
      }
    }

    return headings;
  }, [content]);
};

/**
 * تبدیل heading به id (برای anchor)
 */
export const slugifyHeading = (text: string, index: number): string => {
  const id = text
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  return id || `heading-${index + 1}`;
};
