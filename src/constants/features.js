const FEATURES = Object.freeze({
  EXAMS: "exams",
  ARENA: "arena",
  SOLO: "solo",
  STUDY_PLANS: "study-plans",
  AI_ANALYSIS: "ai-analysis",
  STRATEGY: "strategy",
  COMMENTS: "comments",
});

const FEATURE_LABELS = Object.freeze({
  exams: "آزمون‌ها",
  arena: "آرنا",
  solo: "بازی انفرادی",
  "study-plans": "برنامه مطالعاتی",
  "ai-analysis": "تحلیل AI",
  strategy: "برنامه راهبردی",
  comments: "کامنت روی آزمون‌ها",
});

const FEATURE_DESCRIPTIONS = Object.freeze({
  exams: "شرکت در آزمون‌های آزمایشی و مشاهده نتایج",
  arena: "نبرد رقابتی با دیگر دانش‌آموزان",
  solo: "تمرین انفرادی با ۳ سطح دشواری",
  "study-plans": "برنامه مطالعاتی شخصی از طرف مشاور",
  "ai-analysis": "تحلیل هوشمند عملکرد در آزمون‌ها",
  strategy: "برنامه راهبردی سال تحصیلی",
  comments: "ثبت نظر و امتیاز روی آزمون‌ها",
});

// 🔹 قیمت ثابت خرید تکی آزمون (به ریال)
const EXAM_PURCHASE_PRICE = 3000000; // ۳۰۰ هزار تومان

// 🔹 پلن‌های پیش‌فرض
const DEFAULT_PLANS = Object.freeze([
  {
    title: "برنزی",
    description: "دسترسی به آزمون‌ها و کامنت‌ها",
    price: 31000000, // ۳.۱ میلیون تومان
    durationDays: 365,
    features: ["exams", "comments"],
    order: 1,
    badge: null,
  },
  {
    title: "نقره‌ای",
    description: "دسترسی به آزمون‌ها، آرنا، بازی انفرادی و کامنت‌ها",
    price: 41000000, // ۴.۱ میلیون تومان
    durationDays: 365,
    features: ["exams", "arena", "solo", "comments"],
    order: 2,
    badge: "محبوب‌ترین",
  },
  {
    title: "طلایی (VIP)",
    description: "دسترسی کامل به تمامی بخش‌های سایت",
    price: 91000000, // ۹.۱ میلیون تومان
    durationDays: 365,
    features: [
      "exams",
      "arena",
      "solo",
      "study-plans",
      "ai-analysis",
      "comments",
    ],
    order: 3,
    badge: "VIP",
  },
]);

module.exports = {
  FEATURES,
  FEATURE_LABELS,
  FEATURE_DESCRIPTIONS,
  EXAM_PURCHASE_PRICE,
  DEFAULT_PLANS,
};
