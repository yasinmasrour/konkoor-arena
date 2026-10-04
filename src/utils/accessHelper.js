const prisma = require("../config/prisma");
const { SUBSCRIPTION_STATUS } = require("../constants/subscription");
const { FEATURES } = require("../constants/features");
const { EXAM_ACCESS_TYPE } = require("../constants/examAccess");

// ============================================================
// FEATURE ACCESS
// ============================================================

/**
 * چک می‌کنه کاربر به یه feature خاص دسترسی داره یا نه
 * @param {string} userId
 * @param {string} featureName
 * @param {string} [userRole]
 * @returns {Promise<boolean>}
 */
async function hasFeatureAccess(userId, featureName, userRole = null) {
  if (!userId) return false;

  // 🔹 ADMIN همیشه دسترسی کامل
  if (userRole === "ADMIN") return true;

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: { gt: new Date() },
    },
    include: { plan: { select: { features: true } } },
    orderBy: { endDate: "desc" },
  });

  if (!subscription) return false;

  const features = Array.isArray(subscription.plan.features)
    ? subscription.plan.features
    : [];
  return features.includes(featureName);
}

// ============================================================
// 🆕 EXAM ACCESS
// ============================================================

/**
 * چک می‌کنه کاربر به یه آزمون خاص دسترسی داره یا نه
 *
 * بر اساس accessType آزمون تصمیم می‌گیره:
 * - FREE                     → همه دسترسی دارن
 * - PURCHASE                 → فقط اگه خرید کرده
 * - SUBSCRIPTION             → فقط اگه اشتراک فعال داره (feature: exams)
 * - SUBSCRIPTION_OR_PURCHASE → اشتراک فعال یا خرید تکی
 *
 * @param {string} userId
 * @param {string} examId
 * @param {string} [userRole]
 * @returns {Promise<boolean>}
 */
async function hasExamAccess(userId, examId, userRole = null) {
  if (!userId) return false;

  if (userRole === "ADMIN") return true;

  // 🔹 آزمون رو بگیر
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { accessType: true, status: true },
  });

  if (!exam) return false;

  // 🆕 FREE → همه دسترسی دارن
  if (exam.accessType === EXAM_ACCESS_TYPE.FREE) {
    return true;
  }

  // 🔹 چک اشتراک (فقط برای SUBSCRIPTION و SUBSCRIPTION_OR_PURCHASE)
  const needsSubscription =
    exam.accessType === EXAM_ACCESS_TYPE.SUBSCRIPTION ||
    exam.accessType === EXAM_ACCESS_TYPE.SUBSCRIPTION_OR_PURCHASE;

  if (needsSubscription) {
    const hasSubscription = await hasFeatureAccess(
      userId,
      FEATURES.EXAMS,
      userRole,
    );
    if (hasSubscription) return true;
  }

  // 🔹 چک خرید تکی (فقط برای PURCHASE و SUBSCRIPTION_OR_PURCHASE)
  const needsPurchase =
    exam.accessType === EXAM_ACCESS_TYPE.PURCHASE ||
    exam.accessType === EXAM_ACCESS_TYPE.SUBSCRIPTION_OR_PURCHASE;

  if (needsPurchase) {
    const purchase = await prisma.examPurchase.findFirst({
      where: {
        userId,
        examId,
        status: "paid",
      },
      select: { id: true },
    });
    if (purchase) return true;
  }

  return false;
}

// ============================================================
// USER FEATURES
// ============================================================

/**
 * لیست featureهای کاربر
 * @param {string} userId
 * @param {string} [userRole]
 * @returns {Promise<string[]>}
 */
async function getUserFeatures(userId, userRole = null) {
  if (!userId) return [];

  // 🔹 ADMIN همه featureها
  if (userRole === "ADMIN") {
    return Object.values(FEATURES);
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: { gt: new Date() },
    },
    include: { plan: { select: { features: true } } },
    orderBy: { endDate: "desc" },
  });

  if (!subscription) return [];

  return Array.isArray(subscription.plan.features)
    ? subscription.plan.features
    : [];
}

// ============================================================
// EXAM PURCHASES
// ============================================================

/**
 * لیست آزمون‌های خریداری‌شده کاربر
 * @param {string} userId
 * @returns {Promise<string[]>}
 */
async function getUserExamPurchases(userId) {
  if (!userId) return [];

  const purchases = await prisma.examPurchase.findMany({
    where: {
      userId,
      status: "paid",
    },
    select: { examId: true },
  });

  return purchases.map((p) => p.examId);
}

module.exports = {
  hasFeatureAccess,
  hasExamAccess,
  getUserFeatures,
  getUserExamPurchases,
};