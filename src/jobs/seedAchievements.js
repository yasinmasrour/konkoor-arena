const prisma = require("../config/prisma");
const { ACHIEVEMENT_FAMILIES } = require("../constants/achievements");

/**
 * Seed کردن خانواده‌های دستاورد و سطح‌هاشون توی دیتابیس.
 * این تابع idempotent هست — می‌تونی چند بار اجراش کنی.
 */
const seedAchievements = async () => {
  let familiesCreated = 0;
  let familiesUpdated = 0;
  let tiersCreated = 0;
  let tiersUpdated = 0;

  for (const family of ACHIEVEMENT_FAMILIES) {
    const { tiers, ...familyData } = family;

    // upsert خانواده
    const existingFamily = await prisma.achievementFamily.findUnique({
      where: { code: familyData.code },
    });

    const dbFamily = await prisma.achievementFamily.upsert({
      where: { code: familyData.code },
      create: familyData,
      update: {
        title: familyData.title,
        description: familyData.description,
        category: familyData.category,
        icon: familyData.icon,
        sortOrder: familyData.sortOrder,
      },
    });

    if (existingFamily) familiesUpdated++;
    else familiesCreated++;

    // upsert هر tier
    for (const tier of tiers) {
      const existingTier = await prisma.achievementTier.findUnique({
        where: {
          familyId_tier: {
            familyId: dbFamily.id,
            tier: tier.tier,
          },
        },
      });

      await prisma.achievementTier.upsert({
        where: {
          familyId_tier: {
            familyId: dbFamily.id,
            tier: tier.tier,
          },
        },
        create: {
          ...tier,
          familyId: dbFamily.id,
        },
        update: {
          title: tier.title,
          description: tier.description,
          conditionValue: tier.conditionValue,
          points: tier.points,
          sortOrder: tier.sortOrder,
        },
      });

      if (existingTier) tiersUpdated++;
      else tiersCreated++;
    }
  }

  console.log(
    `✅ Achievements seeded: ${familiesCreated} families created, ${familiesUpdated} updated, ${tiersCreated} tiers created, ${tiersUpdated} updated`,
  );
};

module.exports = { seedAchievements };
