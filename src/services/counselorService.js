const prisma = require("../config/prisma");

// ==================== آمار مشاور ====================
const getCounselorStats = async () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalStudents,
    newLast7Days,
    newLast30Days,
    totalAttempts,
    attemptsLast7Days,
    avgScoreResult,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { name: "STUDENT" } } }),
    prisma.user.count({
      where: { role: { name: "STUDENT" }, createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.user.count({
      where: { role: { name: "STUDENT" }, createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.attempt.count(),
    prisma.attempt.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.attempt.aggregate({
      _avg: { score: true },
      where: { status: "submitted" },
    }),
  ]);

  return {
    students: {
      total: totalStudents,
      newLast7Days,
      newLast30Days,
    },
    performance: {
      averageScore: Math.round(avgScoreResult._avg.score || 0),
      totalAttempts,
      attemptsLast7Days,
    },
  };
};

// ==================== لیست دانش‌آموزان ====================
const listStudents = async ({ page = 1, limit = 20, search }) => {
  const where = { role: { name: "STUDENT" } };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
      { phoneNumber: { contains: search } },
    ];
  }

  const [students, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        phoneNumber: true,
        grade: true,
        major: true,
        phoneVerifiedAt: true,
        createdAt: true,
        _count: { select: { attempts: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    students: students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      username: s.username,
      phoneNumber: s.phoneNumber,
      grade: s.grade,
      major: s.major,
      isVerified: !!s.phoneVerifiedAt,
      attemptsCount: s._count.attempts,
      createdAt: s.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = { getCounselorStats, listStudents };
