// ==================== رنگ‌ها ====================
const ANNOUNCEMENT_VARIANTS = Object.freeze({
  // ==================== رنگ‌های قبلی ====================
  gold: {
    label: "طلایی",
    bg: "from-[var(--griffin-gold)] to-amber-600",
    text: "text-white",
  },
  red: {
    label: "قرمز",
    bg: "from-rose-500 to-rose-700",
    text: "text-white",
  },
  green: {
    label: "سبز",
    bg: "from-emerald-500 to-emerald-700",
    text: "text-white",
  },
  blue: {
    label: "آبی",
    bg: "from-blue-500 to-blue-700",
    text: "text-white",
  },
  purple: {
    label: "بنفش",
    bg: "from-purple-500 to-purple-700",
    text: "text-white",
  },
  dark: {
    label: "تیره",
    bg: "from-slate-800 to-slate-900",
    text: "text-white",
  },

  // ==================== 🆕 رنگ‌های جدید ====================
  pink: {
    label: "صورتی",
    bg: "from-pink-500 to-pink-700",
    text: "text-white",
  },
  orange: {
    label: "نارنجی",
    bg: "from-orange-500 to-orange-700",
    text: "text-white",
  },
  cyan: {
    label: "فیروزه‌ای",
    bg: "from-cyan-500 to-cyan-700",
    text: "text-white",
  },
  indigo: {
    label: "نیلی",
    bg: "from-indigo-500 to-indigo-700",
    text: "text-white",
  },
  rose: {
    label: "سرخابی",
    bg: "from-rose-400 to-pink-600",
    text: "text-white",
  },
  slate: {
    label: "خاکستری",
    bg: "from-slate-500 to-slate-700",
    text: "text-white",
  },
});

// ==================== انواع نمایش ====================
const ANNOUNCEMENT_DISPLAY_TYPES = Object.freeze({
  banner: "بنر بالای سایت",
  card: "کارت گوشه پایین",
  both: "هر دو",
});

module.exports = {
  ANNOUNCEMENT_VARIANTS,
  ANNOUNCEMENT_DISPLAY_TYPES,
};