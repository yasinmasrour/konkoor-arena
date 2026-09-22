/**
 * تنظیمات جایزه لیگ آرنا
 * - مبلغ به ریال
 * - بر اساس رتبه
 */
const ARENA_REWARD_CONFIG = Object.freeze({
  // 🔹 جایزه بر اساس رتبه (۱ تا N)
  rewards: {
    1: 5000000, // نفر اول  → ۵۰۰,۰۰۰ تومان
    2: 3000000, // نفر دوم  → ۳۰۰,۰۰۰ تومان
    3: 1000000, // نفر سوم  → ۱۰۰,۰۰۰ تومان
    4: 500000, // نفر چهارم → ۵۰,۰۰۰ تومان
    5: 300000, // نفر پنجم  → ۳۰,۰۰۰ تومان
  },

  // 🔹 حداقل رتبه‌ای که جایزه می‌گیره
  maxRewardRank: 5,

  // 🔹 حداقل تعداد نبرد برای واجد شرایط بودن
  minMatchesForReward: 3,

  // 🔹 حداقل امتیاز برای دریافت جایزه
  minRatingForReward: 0,
});

/**
 * گرفتن مبلغ جایزه بر اساس رتبه
 * @param {number} rank - رتبه بازیکن
 * @returns {number} مبلغ به ریال (۰ اگه جایزه نداره)
 */
const getRewardForRank = (rank) => {
  if (rank > ARENA_REWARD_CONFIG.maxRewardRank) return 0;
  return ARENA_REWARD_CONFIG.rewards[rank] || 0;
};

/**
 * چک کردن اینکه بازیکن واجد شرایط جایزه هست یا نه
 */
const isEligibleForReward = (standing) => {
  const totalMatches = standing.wins + standing.losses + standing.draws;

  if (totalMatches < ARENA_REWARD_CONFIG.minMatchesForReward) return false;
  if (standing.finalRating < ARENA_REWARD_CONFIG.minRatingForReward)
    return false;

  return true;
};

module.exports = {
  ARENA_REWARD_CONFIG,
  getRewardForRank,
  isEligibleForReward,
};
