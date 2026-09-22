export const FEATURES = {
  EXAMS: "exams",
  ARENA: "arena",
  SOLO: "solo",
  STUDY_PLANS: "study-plans",
  AI_ANALYSIS: "ai-analysis",
  STRATEGY: "strategy",
  COMMENTS: "comments",
} as const;

export const FEATURE_LABELS: Record<string, string> = {
  exams: "آزمون‌های آزمایشی",
  arena: "آرنا (نبرد رقابتی)",
  solo: "بازی انفرادی",
  "study-plans": "برنامه مطالعاتی شخصی",
  "ai-analysis": "تحلیل هوشمند AI",
  strategy: "برنامه راهبردی",
  comments: "ثبت نظر روی آزمون‌ها",
};

export const FEATURE_ICONS: Record<string, string> = {
  exams: "FileText",
  arena: "Swords",
  solo: "Target",
  "study-plans": "ClipboardList",
  "ai-analysis": "Brain",
  strategy: "Compass",
  comments: "MessageSquare",
};

export const EXAM_PURCHASE_PRICE = 3000000; // ۳۰۰ هزار تومان
