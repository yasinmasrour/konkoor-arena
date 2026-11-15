const cron = require("node-cron");
const prisma = require("../config/prisma");
const achievementService = require("../services/achievementService");

// ==================== چک ONE_YEAR_MEMBER ====================
const checkOneYearMembers = async () => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    const users = await prisma.userStats.findMany({
      where: {
        membershipStart: { lte: oneYearAgo },
        hasSubscription: true,
      },
      select: { userId: true },
    });

    console.log(`🔍 Checking ${users.length} users for ONE_YEAR_MEMBER`);

    for (const user of users) {
      await achievementService
        .checkAndUnlockAchievements(user.userId)
        .catch((err) =>
          console.error(
            `Failed to check achievements for ${user.userId}:`,
            err,
          ),
        );
    }
  } catch (err) {
    console.error("checkOneYearMembers error:", err);
  }
};

// ==================== اجرا هر روز ساعت ۳ بامداد ====================
const startAchievementDailyJob = () => {
  cron.schedule("0 3 * * *", () => {
    console.log("⏰ Running daily achievement job...");
    void checkOneYearMembers();
  });

  console.log("✅ Achievement daily job scheduled (3 AM)");
};

module.exports = { startAchievementDailyJob, checkOneYearMembers };
