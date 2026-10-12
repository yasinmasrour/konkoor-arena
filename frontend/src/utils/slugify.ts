const PERSIAN_MAP: Record<string, string> = {
  ا: "a",
  آ: "a",
  ب: "b",
  پ: "p",
  ت: "t",
  ث: "s",
  ج: "j",
  چ: "ch",
  ح: "h",
  خ: "kh",
  د: "d",
  ذ: "z",
  ر: "r",
  ز: "z",
  ژ: "zh",
  س: "s",
  ش: "sh",
  ص: "s",
  ض: "z",
  ط: "t",
  ظ: "z",
  ع: "a",
  غ: "gh",
  ف: "f",
  ق: "gh",
  ک: "k",
  ك: "k",
  گ: "g",
  ل: "l",
  م: "m",
  ن: "n",
  و: "v",
  ه: "h",
  ی: "y",
  ي: "y",
  ئ: "y",
  ء: "",
  ة: "h",
  أ: "a",
  إ: "e",
  ؤ: "o",
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

export const slugifyEnglish = (text: string): string => {
  if (!text) return "";
  let result = "";
  const lower = text.trim().toLowerCase();
  for (const char of lower) {
    if (PERSIAN_MAP[char] !== undefined) {
      result += PERSIAN_MAP[char];
    } else if (/[a-z0-9]/.test(char)) {
      result += char;
    } else if (/[\s\-_.,،؛:!؟?()"'«»[\]{}]/.test(char)) {
      result += "-";
    }
  }
  return result
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
};

export const countWords = (text: string): number => {
  if (!text) return 0;
  const plain = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/[#*_~>]/g, "")
    .trim();
  return plain.split(/\s+/).filter(Boolean).length;
};

export const calculateReadingTime = (content: string): number => {
  if (!content) return 1;
  const words = countWords(content);
  const persianChars = (content.match(/[\u0600-\u06FF]/g) || []).length;
  const isPersian = persianChars / Math.max(content.length, 1) > 0.5;
  const wpm = isPersian ? 150 : 200;
  return Math.max(1, Math.ceil(words / wpm));
};
