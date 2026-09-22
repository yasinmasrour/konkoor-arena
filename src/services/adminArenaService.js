const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const {
  VALID_GRADES,
  VALID_MAJORS,
  VALID_STATUSES,
} = require("../validations/adminArenaValidation");

// ==================== لیست لیگ‌ها ====================
const listLeagues = async ({ page = 1, limit = 20, status, grade, lesson }) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;

  const where = {};

  if (status) where.status = status;
  if (grade) where.grade = grade;
  if (lesson) {
    where.lesson = { contains: lesson, mode: "insensitive" };
  }

  const [leagues, total] = await Promise.all([
    prisma.arenaLeague.findMany({
      where,
      orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
      skip: (pageNum - 1) * limitNum, // 🆕
      take: limitNum, // 🆕
      include: {
        _count: {
          select: {
            matches: true,
            queues: true,
            ratings: true,
            invites: true,
          },
        },
      },
    }),
    prisma.arenaLeague.count({ where }),
  ]);

  return {
    leagues,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

// ==================== جزئیات لیگ ====================
const getLeagueById = async (leagueId) => {
  const league = await prisma.arenaLeague.findUnique({
    where: { id: leagueId },
    include: {
      _count: {
        select: {
          matches: true,
          queues: true,
          ratings: true,
          invites: true,
          standings: true,
        },
      },
    },
  });

  if (!league) {
    throw new AppError("Arena league not found", 404);
  }

  return league;
};

// ==================== ساخت لیگ ====================
const createLeague = async (data, adminId) => {
  const { title, lesson, grade, compatibleMajors, startDate, endDate, status } =
    data;

  // 🔹 چک تکراری نبودن (title + grade + lesson)
  const existing = await prisma.arenaLeague.findFirst({
    where: {
      title,
      grade,
      lesson,
    },
  });

  if (existing) {
    throw new AppError("لیگی با همین عنوان، درس و پایه از قبل وجود دارد", 409);
  }

  const league = await prisma.arenaLeague.create({
    data: {
      title,
      lesson,
      grade,
      compatibleMajors: compatibleMajors || [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || "upcoming",
    },
  });

  return league;
};

// ==================== ویرایش لیگ ====================
const updateLeague = async (leagueId, data, adminId) => {
  const league = await prisma.arenaLeague.findUnique({
    where: { id: leagueId },
  });

  if (!league) {
    throw new AppError("Arena league not found", 404);
  }

  // 🔹 چک: لیگ finished رو نشه ویرایش کرد
  if (league.status === "finished") {
    throw new AppError("لیگ‌های تمام‌شده قابل ویرایش نیستند", 400);
  }

  // 🔹 چک تکراری نبودن (اگه title یا grade یا lesson عوض شده)
  if (
    data.title !== undefined ||
    data.grade !== undefined ||
    data.lesson !== undefined
  ) {
    const existing = await prisma.arenaLeague.findFirst({
      where: {
        id: { not: leagueId },
        title: data.title ?? league.title,
        grade: data.grade ?? league.grade,
        lesson: data.lesson ?? league.lesson,
      },
    });

    if (existing) {
      throw new AppError(
        "لیگی با همین عنوان، درس و پایه از قبل وجود دارد",
        409,
      );
    }
  }

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.lesson !== undefined) updateData.lesson = data.lesson;
  if (data.grade !== undefined) updateData.grade = data.grade;
  if (data.compatibleMajors !== undefined)
    updateData.compatibleMajors = data.compatibleMajors;
  if (data.startDate !== undefined)
    updateData.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
  if (data.status !== undefined) updateData.status = data.status;

  return await prisma.arenaLeague.update({
    where: { id: leagueId },
    data: updateData,
  });
};

// ==================== تغییر وضعیت ====================
const changeStatus = async (leagueId, status, adminId) => {
  const league = await prisma.arenaLeague.findUnique({
    where: { id: leagueId },
  });

  if (!league) {
    throw new AppError("Arena league not found", 404);
  }

  if (league.status === status) {
    return league;
  }

  // 🔹 چک: از finished نشه به عقب برگشت
  if (league.status === "finished") {
    throw new AppError("لیگ تمام‌شده رو نمی‌شه تغییر داد", 400);
  }

  // 🔹 چک: active نیاز به تأیید تاریخ داره
  if (status === "active") {
    const now = new Date();
    if (now < league.startDate) {
      throw new AppError("تاریخ شروع نرسیده", 400);
    }
    if (now > league.endDate) {
      throw new AppError("تاریخ پایان گذشته", 400);
    }
  }

  // 🔹 چک: finished نیاز به تأیید تاریخ داره
  if (status === "finished") {
    const now = new Date();
    if (now < league.endDate) {
      throw new AppError("تاریخ پایان نرسیده", 400);
    }
  }

  return await prisma.arenaLeague.update({
    where: { id: leagueId },
    data: { status },
  });
};

// ==================== حذف لیگ ====================
const deleteLeague = async (leagueId, adminId) => {
  const league = await prisma.arenaLeague.findUnique({
    where: { id: leagueId },
    include: {
      _count: {
        select: {
          matches: true,
          standings: true,
        },
      },
    },
  });

  if (!league) {
    throw new AppError("Arena league not found", 404);
  }

  // 🔹 چک: لیگ‌هایی که match دارن رو نشه حذف کرد
  if (league._count.matches > 0) {
    throw new AppError(
      "این لیگ دارای نبرد است و قابل حذف نیست. به‌جاش آرشیو کن",
      409,
    );
  }

  // 🔹 چک: لیگ‌هایی که standing دارن رو نشه حذف کرد
  if (league._count.standings > 0) {
    throw new AppError(
      "این لیگ دارای رتبه‌بندی نهایی است و قابل حذف نیست",
      409,
    );
  }

  await prisma.arenaLeague.delete({
    where: { id: leagueId },
  });

  return { success: true };
};

module.exports = {
  listLeagues,
  getLeagueById,
  createLeague,
  updateLeague,
  changeStatus,
  deleteLeague,
};
