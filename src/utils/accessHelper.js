const prisma = require("../config/prisma");
const { SUBSCRIPTION_STATUS } = require("../constants/subscription");
const { FEATURES } = require("../constants/features");

/**
 * چک میکنه کاربر به یه feature خاص دسترسی داره یا نه
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

/**
 * چک میکنه کاربر به یه آزمون خاص دسترسی داره یا نه
 * - ADMIN → بله
 * - اشتراک فعال با feature "exams" → بله
 * - خرید تکی آزمون → بله
 * @param {string} userId
 * @param {string} examId
 * @param {string} [userRole]
 * @returns {Promise<boolean>}
 */
async function hasExamAccess(userId, examId, userRole = null) {
  if (!userId) return false;

  if (userRole === "ADMIN") return true;

  // 🔹 چک اشتراک
  const hasSubscription = await hasFeatureAccess(
    userId,
    FEATURES.EXAMS,
    userRole,
  );
  if (hasSubscription) return true;

  // 🔹 چک خرید تکی
  const purchase = await prisma.examPurchase.findFirst({
    where: {
      userId,
      examId,
      status: "paid",
    },
    select: { id: true },
  });

  return !!purchase;
}

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
