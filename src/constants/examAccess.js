// ============================================================
// EXAM ACCESS TYPES
// ============================================================
// نوع دسترسی به آزمون‌ها
// FREE                      → کاملاً رایگان
// PURCHASE                  → فقط خرید تکی
// SUBSCRIPTION              → فقط اشتراک فعال
// SUBSCRIPTION_OR_PURCHASE  → اشتراک فعال یا خرید تکی
// ============================================================

const EXAM_ACCESS_TYPE = {
  FREE: "FREE",
  PURCHASE: "PURCHASE",
  SUBSCRIPTION: "SUBSCRIPTION",
  SUBSCRIPTION_OR_PURCHASE: "SUBSCRIPTION_OR_PURCHASE",
};

const EXAM_ACCESS_TYPES_LIST = Object.values(EXAM_ACCESS_TYPE);

const EXAM_ACCESS_LABELS = {
  FREE: "رایگان",
  PURCHASE: "خرید تکی",
  SUBSCRIPTION: "اشتراک",
  SUBSCRIPTION_OR_PURCHASE: "اشتراک یا خرید تکی",
};

module.exports = {
  EXAM_ACCESS_TYPE,
  EXAM_ACCESS_TYPES_LIST,
  EXAM_ACCESS_LABELS,
};
