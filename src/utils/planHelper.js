/**
 * محاسبه‌ی اطلاعات تخفیف یه پلن
 * @param {object} plan - پلن (با discountPercent و discountEndsAt)
 * @returns {object} - { originalPrice, finalPrice, discountPercent, discountAmount, hasDiscount, discountEndsAt, remainingDays }
 */
function getPlanPricing(plan) {
  const originalPrice = plan.price || 0;
  const discountPercent = plan.discountPercent || 0;
  const discountEndsAt = plan.discountEndsAt;

  // 🆕 چک کن تخفیف معتبره
  const now = new Date();
  const isExpired = discountEndsAt ? new Date(discountEndsAt) <= now : false;
  const hasDiscount = discountPercent > 0 && !isExpired;

  let finalPrice = originalPrice;
  let discountAmount = 0;

  if (hasDiscount) {
    discountAmount = Math.floor((originalPrice * discountPercent) / 100);
    finalPrice = originalPrice - discountAmount;
  }

  // 🆕 روزهای باقی‌مونده تخفیف
  let remainingDays = null;
  if (hasDiscount && discountEndsAt) {
    const diff = new Date(discountEndsAt).getTime() - now.getTime();
    remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return {
    originalPrice,
    finalPrice,
    discountPercent: hasDiscount ? discountPercent : 0,
    discountAmount,
    hasDiscount,
    discountEndsAt: hasDiscount ? discountEndsAt : null,
    remainingDays,
  };
}

module.exports = {
  getPlanPricing,
};
