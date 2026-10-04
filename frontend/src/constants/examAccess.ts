import type { ExamAccessType } from "../api/examApi";

// ============================================================
// EXAM ACCESS TYPE LABELS
// ============================================================

export const EXAM_ACCESS_LABELS: Record<ExamAccessType, string> = {
  FREE: "رایگان",
  PURCHASE: "خرید تکی",
  SUBSCRIPTION: "اشتراک",
  SUBSCRIPTION_OR_PURCHASE: "اشتراک یا خرید تکی",
};

export const EXAM_ACCESS_DESCRIPTIONS: Record<ExamAccessType, string> = {
  FREE: "بدون نیاز به خرید اشتراک یا پرداخت",
  PURCHASE: "فقط با خرید تکی آزمون",
  SUBSCRIPTION: "فقط با اشتراک فعال",
  SUBSCRIPTION_OR_PURCHASE: "اشتراک فعال یا خرید تکی",
};

export const EXAM_ACCESS_LIST: ExamAccessType[] = [
  "FREE",
  "PURCHASE",
  "SUBSCRIPTION",
  "SUBSCRIPTION_OR_PURCHASE",
];
