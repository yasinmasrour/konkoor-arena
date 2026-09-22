const {
  getUserFeatures,
  getUserExamPurchases,
} = require("../utils/accessHelper");
const {
  FEATURES,
  FEATURE_LABELS,
  FEATURE_DESCRIPTIONS,
} = require("../constants/features");

/**
 * اطلاعات featureهای کاربر
 * @param {string} userId
 * @param {string} userRole
 * @returns {Promise<object>}
 */
async function getMyFeatures(userId, userRole) {
  const [features, examPurchases] = await Promise.all([
    getUserFeatures(userId, userRole),
    getUserExamPurchases(userId),
  ]);

  return {
    features,
    examPurchases,
  };
}

/**
 * لیست همه featureهای قابل انتخاب (برای پنل ادمین)
 * @returns {Array}
 */
function getAllFeatures() {
  return Object.values(FEATURES).map((key) => ({
    key,
    label: FEATURE_LABELS[key] || key,
    description: FEATURE_DESCRIPTIONS[key] || "",
  }));
}

module.exports = {
  getMyFeatures,
  getAllFeatures,
};
