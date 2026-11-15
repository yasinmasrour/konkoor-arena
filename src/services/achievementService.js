const prisma = require("../config/prisma");

// ==================== getUserStats ====================
/**
 * UserStats رو می‌گیره یا می‌سازه.
 */
const getUserStats = async (userId) => {
  let stats = await prisma.userStats.findUnique({ where: { userId } });
  if (!stats) {
    stats = await prisma.userStats.create({ data: { userId } });
  }
  return stats;
};

// ==================== updateUserStats ====================
/**
 * یه آپدیت روی UserStats انجام می‌ده.
 * @param {string} userId
 * @param {object} updates - مثلاً { totalAttempts: { increment: 1 } }
 */
const updateUserStats = async (userId, updates) => {
  return await prisma.userStats.upsert({
    where: { userId },
    create: { userId, ...updates },
    update: updates,
  });
};

// ==================== applyAttemptToStats ====================
/**
 * بعد از submit یه Attempt، آمار کاربر رو آپدیت می‌کنه.
 * این تابع main business logic برای آپدیت UserStats هست.
 *
 * @param {string} userId
 * @param {object} attempt - Attempt با analysis
 */
const applyAttemptToStats = async (userId, attempt) => {
  const analysis = attempt.analysis || {};
  const percentage = analysis.percentage || 0;
  const correctAnswers = analysis.correctAnswers || 0;
  const wrongAnswers = analysis.wrongAnswers || 0;
  const totalQuestions = analysis.totalQuestions || 0;

  // ==================== محاسبه‌ی چیزهای جدید ====================
  const isPerfect = percentage >= 100;
  const is90Plus = percentage >= 90;
  const is70Plus = percentage >= 70;

  // ==================== گرفتن stats فعلی ====================
  const stats = await getUserStats(userId);

  // ==================== محاسبه‌ی Streak ها ====================
  const new90Streak = is90Plus ? stats.current90Streak + 1 : 0;
  const new70Streak = is70Plus ? stats.current70Streak + 1 : 0;
  const newAttemptStreak = stats.currentAttemptStreak + 1;

  const newMax90 = Math.max(stats.max90Streak, new90Streak);
  const newMax70 = Math.max(stats.max70Streak, new70Streak);
  const newMaxAttempt = Math.max(stats.maxAttemptStreak, newAttemptStreak);

  // ==================== محاسبه‌ی درس‌های کامل ====================
  // از analysis.subjects استفاده می‌کنیم
  // subjects: [{ lesson, correct, wrong, unanswered, percentage }]
  const subjects = analysis.subjects || [];

  let perfectMathInc = 0;
  let perfectPhysicsInc = 0;
  let perfectChemistryInc = 0;
  let perfectBiologyInc = 0;

  for (const subject of subjects) {
    // فقط درس‌هایی که توی این آزمون بودن و ۱۰۰٪ شدن
    if (subject.percentage >= 100 && subject.correct > 0) {
      const lesson = subject.lesson;

      if (lesson === "ریاضی" || lesson === "math") perfectMathInc++;
      else if (lesson === "فیزیک" || lesson === "physics") perfectPhysicsInc++;
      else if (lesson === "شیمی" || lesson === "chemistry")
        perfectChemistryInc++;
      else if (lesson === "زیست" || lesson === "biology") perfectBiologyInc++;
    }
  }

  // ==================== آپدیت UserStats ====================
  const updated = await prisma.userStats.update({
    where: { userId },
    data: {
      // آزمون‌محور
      totalAttempts: { increment: 1 },
      totalPerfectScores: isPerfect ? { increment: 1 } : undefined,
      totalHighScores90: is90Plus ? { increment: 1 } : undefined,
      totalHighScores70: is70Plus ? { increment: 1 } : undefined,

      // Streak ها
      current90Streak: new90Streak,
      max90Streak: newMax90,
      current70Streak: new70Streak,
      max70Streak: newMax70,
      currentAttemptStreak: newAttemptStreak,
      maxAttemptStreak: newMaxAttempt,

      // سوال‌محور
      totalQuestions: { increment: totalQuestions },
      totalCorrect: { increment: correctAnswers },
      totalWrong: { increment: wrongAnswers },

      // درس‌محور
      perfectMath: { increment: perfectMathInc },
      perfectPhysics: { increment: perfectPhysicsInc },
      perfectChemistry: { increment: perfectChemistryInc },
      perfectBiology: { increment: perfectBiologyInc },
    },
  });

  return updated;
};

// ==================== checkAndUnlockAchievements ====================
/**
 * همه‌ی خانواده‌های دستاورد رو چک می‌کنه و اگه کاربر شرط یه tier رو داشت، unlock می‌کنه.
 * @returns {Array} لیست tierهایی که جدیداً unlock شدن
 */
const checkAndUnlockAchievements = async (userId) => {
  const stats = await getUserStats(userId);

  // همه‌ی خانواده‌ها با tierهاشون
  const families = await prisma.achievementFamily.findMany({
    where: { isActive: true },
    include: {
      tiers: { orderBy: { sortOrder: "asc" } },
    },
  });

  // tierهای unlocked کاربر
  const unlockedTiers = await prisma.userAchievement.findMany({
    where: { userId },
    select: { tierId: true },
  });
  const unlockedTierIds = new Set(unlockedTiers.map((u) => u.tierId));

  const newlyUnlocked = [];

  for (const family of families) {
    // ==================== محاسبه‌ی progress برای این خانواده ====================
    const progress = getProgressForFamily(family.code, stats);

    for (const tier of family.tiers) {
      if (unlockedTierIds.has(tier.id)) continue; // قبلاً unlock شده

      if (progress >= tier.conditionValue) {
        // ==================== Unlock ====================
        try {
          const userAchievement = await prisma.userAchievement.create({
            data: {
              userId,
              tierId: tier.id,
              progress: tier.conditionValue,
            },
            include: {
              tier: {
                include: { family: true },
              },
            },
          });

          newlyUnlocked.push(userAchievement);

          // آپدیت امتیاز
          await prisma.userStats.update({
            where: { userId },
            data: {
              achievementPoints: { increment: tier.points },
            },
          });
        } catch (err) {
          // اگه unique constraint خطا داد، یعنی قبلاً unlock شده — نادیده بگیر
          if (err.code !== "P2002") throw err;
        }
      }
    }
  }

  return newlyUnlocked;
};

// ==================== getProgressForFamily ====================
/**
 * progress فعلی کاربر رو برای یه خانواده حساب می‌کنه.
 */
const getProgressForFamily = (code, stats) => {
  switch (code) {
    // ==================== EXAM ====================
    case "EXAM_COUNT":
      return stats.totalAttempts;
    case "PERFECT_SCORE":
      return stats.totalPerfectScores;
    case "CONSECUTIVE_90":
      return stats.max90Streak;
    case "CONSECUTIVE_70":
      return stats.max70Streak;

    // ==================== QUESTION ====================
    case "CORRECT_ANSWERS":
      return stats.totalCorrect;

    // ==================== SUBJECT ====================
    case "PERFECT_MATH":
      return stats.perfectMath;
    case "PERFECT_PHYSICS":
      return stats.perfectPhysics;
    case "PERFECT_CHEMISTRY":
      return stats.perfectChemistry;
    case "PERFECT_BIOLOGY":
      return stats.perfectBiology;

    // ==================== ARENA ====================
    case "ARENA_WINS":
      return stats.arenaWins;
    case "ARENA_FIRST_RANK":
      return stats.arenaFirstRank;

    // ==================== TIME ====================
    case "FAST_ANSWER":
      return stats.fastAnswers;
    case "EARLY_FINISH":
      return stats.earlyFinishes;

    // ==================== SPECIAL ====================
    case "CONSECUTIVE_ATTEMPTS":
      return stats.maxAttemptStreak;
    case "FIRST_SUBSCRIPTION":
      return stats.hasSubscription ? 1 : 0;
    case "ONE_YEAR_MEMBER":
      if (!stats.membershipStart) return 0;
      const days = Math.floor(
        (Date.now() - new Date(stats.membershipStart).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return days;

    default:
      return 0;
  }
};

// ==================== getMyAchievements ====================
/**
 * همه‌ی خانواده‌ها + tierهاشون + وضعیت کاربر رو برمی‌گردونه.
 * برای صفحه‌ی دستاوردها استفاده میشه.
 */
const getMyAchievements = async (userId) => {
  const [families, userAchievements, stats] = await Promise.all([
    prisma.achievementFamily.findMany({
      where: { isActive: true },
      include: {
        tiers: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.userAchievement.findMany({
      where: { userId },
    }),
    getUserStats(userId),
  ]);

  const uaMap = new Map(userAchievements.map((ua) => [ua.tierId, ua]));

  const result = families.map((family) => {
    const progress = getProgressForFamily(family.code, stats);

    const tiers = family.tiers.map((tier) => {
      const ua = uaMap.get(tier.id);
      return {
        id: tier.id,
        tier: tier.tier,
        title: tier.title,
        description: tier.description,
        conditionValue: tier.conditionValue,
        points: tier.points,
        unlocked: Boolean(ua),
        unlockedAt: ua?.unlockedAt ?? null,
        seen: ua?.seen ?? false,
        // progress فعلی نسبت به این tier
        currentProgress: Math.min(progress, tier.conditionValue),
      };
    });

    return {
      id: family.id,
      code: family.code,
      title: family.title,
      description: family.description,
      category: family.category,
      icon: family.icon,
      sortOrder: family.sortOrder,
      tiers,
      // بالاترین tier unlocked
      highestUnlockedTier:
        [...tiers].reverse().find((t) => t.unlocked)?.tier ?? null,
      // progress کل خانواده (برای نمایش progress bar)
      currentProgress: progress,
    };
  });

  return { families: result, stats };
};

// ==================== getNewAchievements ====================
/**
 * دستاوردهای جدید (unlock شده ولی دیده نشده).
 */
const getNewAchievements = async (userId) => {
  return await prisma.userAchievement.findMany({
    where: { userId, seen: false },
    include: {
      tier: {
        include: { family: true },
      },
    },
    orderBy: { unlockedAt: "desc" },
  });
};

// ==================== markAllSeen ====================
const markAllSeen = async (userId) => {
  return await prisma.userAchievement.updateMany({
    where: { userId, seen: false },
    data: { seen: true },
  });
};

// ==================== getLeaderboard ====================
/**
 * رتبه‌بندی کاربران بر اساس امتیاز دستاوردها.
 * (اختیاری — می‌تونه بعداً اضافه بشه)
 */
const getLeaderboard = async (limit = 50) => {
  return await prisma.userStats.findMany({
    take: limit,
    orderBy: { achievementPoints: "desc" },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });
};

module.exports = {
  getUserStats,
  updateUserStats,
  applyAttemptToStats,
  checkAndUnlockAchievements,
  getMyAchievements,
  getNewAchievements,
  markAllSeen,
  getLeaderboard,
  getProgressForFamily,
};
