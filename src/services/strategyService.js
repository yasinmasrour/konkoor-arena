const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

// ==================== Helpers ====================
const userSelect = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    username: true,
  },
};

/**
 * چک میکنه data ساختار درست داره یا نه
 */
function validateData(data) {
  if (!data || typeof data !== "object") {
    throw new AppError("data نامعتبر است", 400);
  }
  if (!Array.isArray(data.lessons) || data.lessons.length === 0) {
    throw new AppError("حداقل یک درس لازم است", 400);
  }
  if (!Array.isArray(data.exams) || data.exams.length === 0) {
    throw new AppError("حداقل یک آزمون لازم است", 400);
  }

  const lessonsCount = data.lessons.length;
  for (const exam of data.exams) {
    if (!exam.title || !Array.isArray(exam.cells)) {
      throw new AppError("ساختار آزمون‌ها نامعتبر است", 400);
    }
    if (exam.cells.length !== lessonsCount) {
      throw new AppError(
        "تعداد ستونهای هر آزمون باید با تعداد درسها برابر باشد",
        400,
      );
    }
  }
}

// ==================== 🔹 عمومی ====================

/**
 * لیست برنامه‌های راهبردی منتشرشده
 * @param {object} options
 * @param {string} [options.grade]
 * @param {string} [options.major]
 * @param {number} [options.page]
 * @param {number} [options.limit]
 */
async function getPublishedPlans({ grade, major, page = 1, limit = 20 } = {}) {
  const where = {
    isPublished: true,
    ...(grade && { grade }),
    ...(major && { major }),
  };

  const [plans, total] = await Promise.all([
    prisma.strategyPlan.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        grade: true,
        major: true,
        isPublished: true,
        updatedAt: true,
        createdAt: true,
        createdBy: userSelect,
      },
    }),
    prisma.strategyPlan.count({ where }),
  ]);

  return {
    plans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * جزئیات یه برنامه منتشرشده
 */
async function getPublishedPlanById(planId) {
  const plan = await prisma.strategyPlan.findFirst({
    where: { id: planId, isPublished: true },
    include: { createdBy: userSelect },
  });

  if (!plan) throw new AppError("برنامه راهبردی پیدا نشد", 404);

  return plan;
}

/**
 * بهترین برنامه برای کاربر (بر اساس grade و major)
 * اگه کاربر grade/major نداشته باشه → null
 */
async function getBestPlanForUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { grade: true, major: true },
  });

  if (!user) throw new AppError("کاربر پیدا نشد", 404);

  if (!user.grade || !user.major) {
    return { plan: null, reason: "profile_incomplete" };
  }

  const plan = await prisma.strategyPlan.findFirst({
    where: {
      isPublished: true,
      grade: user.grade,
      major: user.major,
    },
    orderBy: { updatedAt: "desc" },
    include: { createdBy: userSelect },
  });

  if (!plan) {
    return { plan: null, reason: "no_plan" };
  }

  return { plan, reason: "found" };
}

// ==================== 🔹 ادمین ====================

/**
 * لیست همه برنامهها (ادمین)
 */
async function listPlansForAdmin({
  grade,
  major,
  isPublished,
  page = 1,
  limit = 20,
} = {}) {
  const where = {
    ...(grade && { grade }),
    ...(major && { major }),
    ...(typeof isPublished === "boolean" && { isPublished }),
  };

  const [plans, total] = await Promise.all([
    prisma.strategyPlan.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { createdBy: userSelect },
    }),
    prisma.strategyPlan.count({ where }),
  ]);

  return {
    plans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * جزئیات یه برنامه (ادمین — حتی پیشنویس)
 */
async function getPlanById(planId) {
  const plan = await prisma.strategyPlan.findUnique({
    where: { id: planId },
    include: { createdBy: userSelect },
  });

  if (!plan) throw new AppError("برنامه راهبردی پیدا نشد", 404);

  return plan;
}

/**
 * ساخت برنامه جدید
 */
async function createPlan({ adminId, data }) {
  validateData(data.data);

  // 🔹 اگه isPublished=true → قبلیها رو unpublish کن
  if (data.isPublished) {
    await prisma.strategyPlan.updateMany({
      where: {
        grade: data.grade,
        major: data.major,
        isPublished: true,
      },
      data: { isPublished: false },
    });
  }

  const plan = await prisma.strategyPlan.create({
    data: {
      title: data.title,
      description: data.description || null,
      grade: data.grade,
      major: data.major,
      data: data.data,
      isPublished: data.isPublished || false,
      createdById: adminId,
    },
    include: { createdBy: userSelect },
  });

  return plan;
}

/**
 * ویرایش برنامه
 */
async function updatePlan({ planId, data }) {
  const plan = await prisma.strategyPlan.findUnique({
    where: { id: planId },
    select: { id: true, grade: true, major: true, isPublished: true },
  });

  if (!plan) throw new AppError("برنامه راهبردی پیدا نشد", 404);

  if (data.data) {
    validateData(data.data);
  }

  // 🔹 اگه grade یا major عوض شده، یا isPublished=true → چک کن
  const newGrade = data.grade ?? plan.grade;
  const newMajor = data.major ?? plan.major;

  const updated = await prisma.strategyPlan.update({
    where: { id: planId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && {
        description: data.description || null,
      }),
      ...(data.grade !== undefined && { grade: data.grade }),
      ...(data.major !== undefined && { major: data.major }),
      ...(data.data !== undefined && { data: data.data }),
    },
    include: { createdBy: userSelect },
  });

  return updated;
}

/**
 * حذف برنامه
 */
async function deletePlan(planId) {
  const plan = await prisma.strategyPlan.findUnique({
    where: { id: planId },
    select: { id: true },
  });

  if (!plan) throw new AppError("برنامه راهبردی پیدا نشد", 404);

  await prisma.strategyPlan.delete({ where: { id: planId } });

  return { success: true };
}

/**
 * انتشار برنامه (و unpublish خودکار قبلیها)
 */
async function publishPlan(planId) {
  const plan = await prisma.strategyPlan.findUnique({
    where: { id: planId },
    select: { id: true, grade: true, major: true, isPublished: true },
  });

  if (!plan) throw new AppError("برنامه راهبردی پیدا نشد", 404);

  if (plan.isPublished) {
    throw new AppError("این برنامه از قبل منتشر شده است", 400);
  }

  // 🔹 unpublish قبلیها
  await prisma.strategyPlan.updateMany({
    where: {
      grade: plan.grade,
      major: plan.major,
      isPublished: true,
    },
    data: { isPublished: false },
  });

  const updated = await prisma.strategyPlan.update({
    where: { id: planId },
    data: { isPublished: true },
    include: { createdBy: userSelect },
  });

  return updated;
}

/**
 * لغو انتشار برنامه
 */
async function unpublishPlan(planId) {
  const plan = await prisma.strategyPlan.findUnique({
    where: { id: planId },
    select: { id: true, isPublished: true },
  });

  if (!plan) throw new AppError("برنامه راهبردی پیدا نشد", 404);

  if (!plan.isPublished) {
    throw new AppError("این برنامه منتشر نشده است", 400);
  }

  const updated = await prisma.strategyPlan.update({
    where: { id: planId },
    data: { isPublished: false },
    include: { createdBy: userSelect },
  });

  return updated;
}

module.exports = {
  // عمومی
  getPublishedPlans,
  getPublishedPlanById,
  getBestPlanForUser,

  // ادمین
  listPlansForAdmin,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  publishPlan,
  unpublishPlan,
};
