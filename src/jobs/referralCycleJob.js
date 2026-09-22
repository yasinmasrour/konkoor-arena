const cron = require("node-cron");
const prisma = require("../config/prisma");
const {
  getCurrentCycleStart,
} = require("../utils/cycleHelper");
const {
  generateUniqueReferralCode,
} = require("../utils/referralCode");
const notificationService = require("../services/notificationService");
const { NOTIFICATIONS } = require("../constants/referral");

/**
 * ریست دوره همه کاربرانی که نیاز دارن
 */
async function resetExpiredCycles() {
  console.log("🔄 [ReferralCycleJob] شروع بررسی دورهها...");

  const now = new Date();
  const currentCycleStart = getCurrentCycleStart(now);

  const users = await prisma.user.findMany({
    where: {
      cycleStartDate: { lt: currentCycleStart },
    },
    select: {
      id: true,
      referralCode: true,
      cycleStartDate: true,
    },
  });

  if (users.length === 0) {
    console.log("✅ [ReferralCycleJob] هیچ کاربری نیاز به ریست نداره.");
    return { reset: 0 };
  }

  console.log(
    `🔹 [ReferralCycleJob] ${users.length} کاربر نیاز به ریست دارن.`
  );

  let successCount = 0;

  for (const user of users) {
    try {
      const newCode = await generateUniqueReferralCode();

      await prisma.user.update({
        where: { id: user.id },
        data: {
          currentCycleReferrals: 0,
          cycleStartDate: currentCycleStart,
          referralCode: newCode,
        },
      });

      await notificationService.createNotification({
        userId: user.id,
        type: "REFERRAL_CYCLE_RESET",
        title: NOTIFICATIONS.CYCLE_RESET.title,
        message: NOTIFICATIONS.CYCLE_RESET.message,
        link: "/referral",
      });

      successCount++;
    } catch (error) {
      console.error(
        `❌ [ReferralCycleJob] خطا برای کاربر ${user.id}:`,
        error.message
      );
    }
  }

  console.log(
    `🎉 [ReferralCycleJob] ${successCount} کاربر با موفقیت ریست شدن.`
  );

  return { reset: successCount };
}

/**
 * شروع Cron Job
 * هر روز ساعت ۳ بامداد
 * @returns {import('node-cron').ScheduledTask}
 */
function startReferralCycleJob() {
  const task = cron.schedule("0 3 * * *", async () => {
    try {
      await resetExpiredCycles();
    } catch (error) {
      console.error("❌ [ReferralCycleJob] خطای کلی:", error);
    }
  });

  console.log(
    "✅ [ReferralCycleJob] Cron Job راهاندازی شد (هر روز ۳ بامداد)."
  );

  return task;
}

module.exports = {
  startReferralCycleJob,
  resetExpiredCycles,
};