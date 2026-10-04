const prisma = require("../config/prisma");
const { SUBSCRIPTION_STATUS } = require("../constants/subscription");

/**
 * آمار صفحه اول داشبورد دانش‌آموز
 * @param {string} userId
 */
async function getStudentHomeData(userId) {
  const now = new Date();

  const [
    arenaRating,
    arenaMatchesCount,
    examsTakenCount,
    attemptsWithScore,
    activeSubscription,
  ] = await Promise.all([
    // Rating آرنا
    prisma.arenaRating.findFirst({
      where: { userId },
      orderBy: { rating: "desc" },
      select: { rating: true },
    }),

    // تعداد نبردهای آرنا (تمام‌شده)
    prisma.arenaMatchPlayer.count({
      where: {
        userId,
        match: {
          status: "finished",
        },
      },
    }),

    // تعداد آزمون‌های انجام‌شده
    prisma.attempt.count({
      where: {
        studentId: userId,
        status: "submitted",
      },
    }),

    // 🆕 آزمون‌ها با نمره (برای محاسبه پیشرفت)
    prisma.attempt.findMany({
      where: {
        studentId: userId,
        status: "submitted",
        analysis: {
          not: undefined, // هر مقداری که null نباشه
        },
      },
      select: { analysis: true },
    }),

    // اشتراک فعال
    prisma.subscription.findFirst({
      where: {
        userId,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        endDate: { gt: now },
      },
      include: {
        plan: true,
      },
      orderBy: { endDate: "desc" },
    }),
  ]);

  // 🆕 محاسبه پیشرفت (میانگین درصد آزمون‌ها)
  let progress = 0;
  if (attemptsWithScore.length > 0) {
    const totalPercentage = attemptsWithScore.reduce((sum, attempt) => {
      const analysis = attempt.analysis || {};
      const percentage = Number(analysis.percentage) || 0;
      return sum + percentage;
    }, 0);
    progress = Math.round(totalPercentage / attemptsWithScore.length);
    progress = Math.min(100, Math.max(0, progress));
  }

  // 🆕 اطلاعات اشتراک
  let subscriptionData = {
    hasActive: false,
    planTitle: null,
    endDate: null,
    remainingDays: 0,
    totalDays: 0,
    progress: 0,
  };

  if (activeSubscription) {
    const startDate = new Date(activeSubscription.startDate);
    const endDate = new Date(activeSubscription.endDate);

    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const remainingDays = Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const usedDays = totalDays - remainingDays;
    const subscriptionProgress =
      totalDays > 0
        ? Math.min(100, Math.round((usedDays / totalDays) * 100))
        : 0;

    subscriptionData = {
      hasActive: true,
      planTitle: activeSubscription.plan.title,
      endDate: endDate.toISOString(),
      remainingDays,
      totalDays,
      progress: subscriptionProgress,
    };
  }

  return {
    stats: {
      arenaRating: arenaRating?.rating || 0,
      arenaMatches: arenaMatchesCount,
      examsTaken: examsTakenCount,
      progress,
    },
    subscription: subscriptionData,
  };
}

module.exports = {
  getStudentHomeData,
};