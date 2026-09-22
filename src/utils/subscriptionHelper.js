const prisma = require("../config/prisma");
const { SUBSCRIPTION_STATUS } = require("../constants/subscription");

/**
 * چک میکنه کاربر اشتراک فعال داره یا نه
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function hasActiveSubscription(userId) {
  if (!userId) return false;

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: { gt: new Date() },
    },
    select: { id: true },
  });

  return !!subscription;
}

module.exports = {
  hasActiveSubscription,
};