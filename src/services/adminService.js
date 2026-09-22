const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const ROLES = require("../constants/roles");
const walletService = require("./walletService");

// ==================== لیست کاربران ====================
const listUsers = async ({
  page = 1,
  limit = 20,
  search,
  role,
  sort = "createdAt",
  order = "desc",
}) => {
  const where = {};

  // 🔹 فیلتر نقش
  if (role) {
    where.role = { name: role };
  }

  // 🔹 جستجو
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
      { phoneNumber: { contains: search } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        phoneNumber: true,
        email: true,
        phoneVerifiedAt: true,
        createdAt: true,
        role: { select: { id: true, name: true } },
        wallet: { select: { balance: true } },
        _count: {
          select: {
            attempts: true,
            arenaMatchPlayers: true,
            subscriptions: true,
          },
        },
      },
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      phoneNumber: u.phoneNumber,
      email: u.email,
      isVerified: !!u.phoneVerifiedAt,
      role: u.role?.name,
      balance: u.wallet?.balance || 0,
      attemptsCount: u._count.attempts,
      arenaMatchesCount: u._count.arenaMatchPlayers,
      subscriptionsCount: u._count.subscriptions,
      createdAt: u.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==================== جزئیات کاربر ====================
const getUserDetails = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      phoneNumber: true,
      phoneVerifiedAt: true,
      email: true,
      birthDate: true,
      major: true,
      grade: true,
      nationalId: true,
      address: true,
      city: true,
      province: true,
      createdAt: true,
      updatedAt: true,
      role: { select: { id: true, name: true } },
      wallet: {
        select: {
          id: true,
          balance: true,
          currency: true,
          isActive: true,
        },
      },
      _count: {
        select: {
          attempts: true,
          arenaMatchPlayers: true,
          subscriptions: true,
          payments: true,
          questions: true,
        },
      },
    },
  });

  if (!user) throw new AppError("کاربر پیدا نشد", 404);

  return user;
};

// ==================== تغییر نقش کاربر ====================
const changeUserRole = async ({ userId, roleName, adminId }) => {
  // 🔹 چک نقش معتبر
  const validRoles = Object.values(ROLES);
  if (!validRoles.includes(roleName)) {
    throw new AppError("نقش نامعتبر است", 400);
  }

  // 🔹 چک کاربر
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) throw new AppError("کاربر پیدا نشد", 404);

  // 🔹 جلوگیری از تغییر نقش خود ادمین
  if (userId === adminId) {
    throw new AppError("نمی‌توانید نقش خودتان را تغییر دهید", 400);
  }

  // 🔹 گرفتن نقش جدید
  const newRole = await prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!newRole) throw new AppError("نقش پیدا نشد", 404);

  // 🔹 اگه نقش همونه، برگردون
  if (user.roleId === newRole.id) {
    throw new AppError("کاربر از قبل این نقش را دارد", 400);
  }

  // 🔹 آپدیت
  return prisma.user.update({
    where: { id: userId },
    data: { roleId: newRole.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      role: { select: { id: true, name: true } },
    },
  });
};

// ==================== حذف کاربر ====================
const deleteUser = async ({ userId, adminId }) => {
  // 🔹 چک خود ادمین
  if (userId === adminId) {
    throw new AppError("نمی‌توانید حساب خودتان را حذف کنید", 400);
  }

  // 🔹 چک کاربر
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          attempts: true,
          questions: true,
          payments: true,
        },
      },
    },
  });

  if (!user) throw new AppError("کاربر پیدا نشد", 404);

  // ⚠️ اگه کاربر داده‌های مالی داره، فقط غیرفعال کن
  if (user._count.payments > 0) {
    throw new AppError(
      "این کاربر سابقه‌ی پرداخت دارد و نمی‌تواند حذف شود",
      409,
    );
  }

  // 🔹 حذف
  await prisma.user.delete({ where: { id: userId } });

  return { success: true };
};

// ==================== آمار کلی ====================
const getGlobalStats = async () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersLast30Days,
    newUsersLast7Days,
    verifiedUsers,
    totalQuestions,
    publishedQuestions,
    totalExams,
    totalAttempts,
    activeSubscriptions,
    totalRevenue,
    revenueLast30Days,
    totalWalletBalance,
    totalArenaMatches,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { phoneVerifiedAt: { not: null } } }),
    prisma.question.count(),
    prisma.question.count({ where: { status: "published" } }),
    prisma.exam.count(),
    prisma.attempt.count(),
    prisma.subscription.count({
      where: { status: "active", endDate: { gt: now } },
    }),
    prisma.payment.aggregate({
      where: { status: "paid" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "paid",
        paidAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    }),
    prisma.wallet.aggregate({
      _sum: { balance: true },
    }),
    prisma.arenaMatch.count(),
  ]);

  // 🔹 تعداد کاربران بر اساس نقش
  const usersByRole = await prisma.role.findMany({
    select: {
      name: true,
      _count: { select: { users: true } },
    },
  });

  return {
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      newLast7Days: newUsersLast7Days,
      newLast30Days: newUsersLast30Days,
      byRole: usersByRole.reduce((acc, r) => {
        acc[r.name] = r._count.users;
        return acc;
      }, {}),
    },
    questions: {
      total: totalQuestions,
      published: publishedQuestions,
    },
    exams: {
      total: totalExams,
      attempts: totalAttempts,
    },
    subscriptions: {
      active: activeSubscriptions,
    },
    revenue: {
      total: totalRevenue._sum.amount || 0,
      last30Days: revenueLast30Days._sum.amount || 0,
    },
    wallet: {
      totalBalance: totalWalletBalance._sum.balance || 0,
    },
    arena: {
      totalMatches: totalArenaMatches,
    },
  };
};

// ==================== شارژ دستی کیف پول ====================
const adminChargeWallet = async ({ userId, amount, description, adminId }) => {
  // 🔹 چک کاربر
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true },
  });

  if (!user) throw new AppError("کاربر پیدا نشد", 404);

  // 🔹 شارژ
  const transaction = await walletService.adminAdjustWallet({
    userId,
    amount,
    direction: "IN",
    description: description || `شارژ توسط ادمین`,
    adminId,
  });

  return {
    user,
    transaction,
  };
};

module.exports = {
  listUsers,
  getUserDetails,
  changeUserRole,
  deleteUser,
  getGlobalStats,
  adminChargeWallet,
};
