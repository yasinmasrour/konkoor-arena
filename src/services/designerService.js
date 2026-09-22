const prisma = require("../config/prisma");

// ==================== آمار طراح سؤال ====================
const getDesignerStats = async (userId) => {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const [total, published, draft, pending, rejected, today, reviews] =
    await Promise.all([
      prisma.question.count({ where: { createdById: userId } }),
      prisma.question.count({
        where: { createdById: userId, status: "published" },
      }),
      prisma.question.count({
        where: { createdById: userId, status: "draft" },
      }),
      prisma.question.count({
        where: { createdById: userId, status: "pending" },
      }),
      prisma.question.count({
        where: { createdById: userId, status: "rejected" },
      }),
      prisma.question.count({
        where: { createdById: userId, createdAt: { gte: startOfToday } },
      }),
      prisma.questionReview.findMany({
        where: { question: { createdById: userId } },
        select: { decision: true },
      }),
    ]);

  const approvedReviews = reviews.filter(
    (r) => r.decision === "approved",
  ).length;
  const totalReviews = reviews.length;
  const approvalRate =
    totalReviews > 0 ? Math.round((approvedReviews / totalReviews) * 100) : 0;

  return {
    questions: { total, published, draft, pending, rejected, today },
    reviews: { total: totalReviews, approved: approvedReviews, approvalRate },
  };
};

// ==================== لیست سوالات طراح ====================
const listDesignerQuestions = async ({
  userId,
  page = 1,
  limit = 20,
  status,
  lesson,
  difficulty,
}) => {
  const where = { createdById: userId };
  if (status) where.status = status;
  if (lesson) where.lesson = lesson;
  if (difficulty) where.difficulty = difficulty;

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        code: true,
        lesson: true,
        grade: true,
        chapter: true,
        difficulty: true,
        status: true,
        usageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.question.count({ where }),
  ]);

  return {
    questions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

module.exports = { getDesignerStats, listDesignerQuestions };
