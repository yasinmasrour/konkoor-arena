const prisma = require("../config/prisma");
const { QUESTION_STATUS } = require("../constants/question");

// 🆕 کش ۵ دقیقه‌ای در حافظه
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = {
  data: null,
  expiresAt: 0,
};

const getPublicStats = async () => {
  // چک کش
  if (cache.data && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  // 🆕 شروع امروز (برای شمارش نبردهای امروز)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    totalQuestions,
    totalExams,
    totalArenaMatches,
    todayArenaMatches,
  ] = await Promise.all([
    // دانش‌آموزان ثبت‌نام‌شده (نقش STUDENT)
    prisma.user.count({
      where: {
        role: { name: "STUDENT" },
      },
    }),

    // سوالات منتشرشده
    prisma.question.count({
      where: { status: QUESTION_STATUS.PUBLISHED },
    }),

    // آزمون‌های منتشرشده
    prisma.exam.count({
      where: { status: "published" },
    }),

    // کل نبردهای آرنا (تمام‌شده)
    prisma.arenaMatch.count({
      where: { status: "finished" },
    }),

    // نبردهای امروز (تمام‌شده)
    prisma.arenaMatch.count({
      where: {
        status: "finished",
        finishedAt: { gte: startOfToday },
      },
    }),
  ]);

  const data = {
    totalStudents,
    totalQuestions,
    totalExams,
    totalArenaMatches,
    todayArenaMatches,
    generatedAt: new Date().toISOString(),
  };

  cache = {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  return data;
};

module.exports = {
  getPublicStats,
};
