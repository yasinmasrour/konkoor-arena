const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const {
  STUDY_PLAN_STATUS,
  PERSONAL_EXAM_STATUS,
} = require("../constants/studyPlan");

// ==================== Helpers ====================
const userSelect = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    username: true,
  },
};

const examSelect = {
  select: {
    id: true,
    title: true,
    examDate: true,
  },
};

// ==================== 🔹 ساخت برنامه ====================
async function createPlan({ counselorId, data }) {
  // 🔹 چک دانش‌آموز
  const student = await prisma.user.findUnique({
    where: { id: data.studentId },
    select: { id: true, role: { select: { name: true } } },
  });

  if (!student) throw new AppError("دانش‌آموز پیدا نشد", 404);

  // 🔹 چک آزمون (اگه داده شده)
  if (data.examId) {
    const exam = await prisma.exam.findUnique({
      where: { id: data.examId },
      select: { id: true },
    });
    if (!exam) throw new AppError("آزمون پیدا نشد", 404);
  }

  // 🔹 ساخت با تراکنش
  return prisma.$transaction(async (tx) => {
    const plan = await tx.studyPlan.create({
      data: {
        studentId: data.studentId,
        counselorId,
        examId: data.examId || null,
        title: data.title.trim(),
        description: data.description || null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: STUDY_PLAN_STATUS.ACTIVE,
        totalTasks: data.tasks?.length || 0,
        tasks: data.tasks?.length
          ? {
              create: data.tasks.map((task, i) => ({
                title: task.title.trim(),
                description: task.description || "",
                lesson: task.lesson || null,
                chapter: task.chapter || null,
                priority: task.priority || "medium",
                estimatedMinutes: task.estimatedMinutes || null,
                dueDate: task.dueDate ? new Date(task.dueDate) : null,
                order: task.order ?? i,
              })),
            }
          : undefined,
      },
      include: {
        student: userSelect,
        counselor: userSelect,
        exam: examSelect,
        tasks: { orderBy: { order: "asc" } },
        personalExam: true,
      },
    });

    return plan;
  });
}

// ==================== 🔹 لیست برنامه‌ها (برای مشاور/ادمین) ====================
async function listPlans({ status, studentId, examId, page = 1, limit = 20 }) {
  const where = {
    ...(status && { status }),
    ...(studentId && { studentId }),
    ...(examId && { examId }),
  };

  const [plans, total] = await Promise.all([
    prisma.studyPlan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        student: userSelect,
        counselor: userSelect,
        exam: examSelect,
        _count: { select: { tasks: true } },
      },
    }),
    prisma.studyPlan.count({ where }),
  ]);

  return {
    plans: plans.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      totalTasks: p.totalTasks,
      completedTasks: p.completedTasks,
      student: p.student,
      counselor: p.counselor,
      exam: p.exam,
      tasksCount: p._count.tasks,
      createdAt: p.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ==================== 🔹 جزئیات برنامه ====================
async function getPlanById(planId) {
  const plan = await prisma.studyPlan.findUnique({
    where: { id: planId },
    include: {
      student: userSelect,
      counselor: userSelect,
      exam: examSelect,
      tasks: { orderBy: { order: "asc" } },
      personalExam: {
        include: {
          _count: { select: { questions: true } },
        },
      },
    },
  });

  if (!plan) throw new AppError("برنامه پیدا نشد", 404);

  return plan;
}

// ==================== 🔹 ویرایش برنامه ====================
async function updatePlan({ planId, data }) {
  const plan = await prisma.studyPlan.findUnique({
    where: { id: planId },
    select: { id: true },
  });

  if (!plan) throw new AppError("برنامه پیدا نشد", 404);

  return prisma.studyPlan.update({
    where: { id: planId },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.description !== undefined && {
        description: data.description || null,
      }),
      ...(data.endDate !== undefined && {
        endDate: data.endDate ? new Date(data.endDate) : null,
      }),
      ...(data.status && { status: data.status }),
    },
    include: {
      student: userSelect,
      counselor: userSelect,
      exam: examSelect,
      tasks: { orderBy: { order: "asc" } },
    },
  });
}

// ==================== 🔹 حذف برنامه ====================
async function deletePlan(planId) {
  const plan = await prisma.studyPlan.findUnique({
    where: { id: planId },
    select: { id: true },
  });

  if (!plan) throw new AppError("برنامه پیدا نشد", 404);

  await prisma.studyPlan.delete({ where: { id: planId } });
  return { success: true };
}

// ==================== 🔹 افزودن تسک ====================
async function addTask({ planId, data }) {
  const plan = await prisma.studyPlan.findUnique({
    where: { id: planId },
    select: { id: true, totalTasks: true },
  });

  if (!plan) throw new AppError("برنامه پیدا نشد", 404);

  return prisma.$transaction(async (tx) => {
    const task = await tx.studyTask.create({
      data: {
        planId,
        title: data.title.trim(),
        description: data.description || "",
        lesson: data.lesson || null,
        chapter: data.chapter || null,
        priority: data.priority || "medium",
        estimatedMinutes: data.estimatedMinutes || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        order: data.order ?? plan.totalTasks,
      },
    });

    await tx.studyPlan.update({
      where: { id: planId },
      data: { totalTasks: { increment: 1 } },
    });

    return task;
  });
}

// ==================== 🔹 ویرایش تسک ====================
async function updateTask({ planId, taskId, data }) {
  const task = await prisma.studyTask.findFirst({
    where: { id: taskId, planId },
    select: { id: true, isCompleted: true },
  });

  if (!task) throw new AppError("تسک پیدا نشد", 404);

  return prisma.studyTask.update({
    where: { id: taskId },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.description !== undefined && {
        description: data.description || "",
      }),
      ...(data.lesson !== undefined && { lesson: data.lesson || null }),
      ...(data.chapter !== undefined && { chapter: data.chapter || null }),
      ...(data.priority && { priority: data.priority }),
      ...(data.estimatedMinutes !== undefined && {
        estimatedMinutes: data.estimatedMinutes || null,
      }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.order !== undefined && { order: data.order }),
    },
  });
}

// ==================== 🔹 حذف تسک ====================
async function deleteTask({ planId, taskId }) {
  const task = await prisma.studyTask.findFirst({
    where: { id: taskId, planId },
    select: { id: true, isCompleted: true },
  });

  if (!task) throw new AppError("تسک پیدا نشد", 404);

  return prisma.$transaction(async (tx) => {
    await tx.studyTask.delete({ where: { id: taskId } });

    await tx.studyPlan.update({
      where: { id: planId },
      data: {
        totalTasks: { decrement: 1 },
        ...(task.isCompleted && { completedTasks: { decrement: 1 } }),
      },
    });

    return { success: true };
  });
}

// ==================== 🔹 تیک/برداشتن تیک تسک (دانش‌آموز) ====================
async function toggleTask({ planId, taskId, studentId }) {
  const plan = await prisma.studyPlan.findUnique({
    where: { id: planId },
    select: { id: true, studentId: true },
  });

  if (!plan) throw new AppError("برنامه پیدا نشد", 404);
  if (plan.studentId !== studentId) {
    throw new AppError("دسترسی مجاز نیست", 403);
  }

  const task = await prisma.studyTask.findFirst({
    where: { id: taskId, planId },
    select: { id: true, isCompleted: true },
  });

  if (!task) throw new AppError("تسک پیدا نشد", 404);

  const newState = !task.isCompleted;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.studyTask.update({
      where: { id: taskId },
      data: {
        isCompleted: newState,
        completedAt: newState ? new Date() : null,
      },
    });

    await tx.studyPlan.update({
      where: { id: planId },
      data: {
        completedTasks: newState ? { increment: 1 } : { decrement: 1 },
      },
    });

    // 🔹 چک: اگه همه تسک‌ها انجام شد → plan completed
    const remaining = await tx.studyTask.count({
      where: { planId, isCompleted: false },
    });

    if (remaining === 0) {
      await tx.studyPlan.update({
        where: { id: planId },
        data: { status: STUDY_PLAN_STATUS.COMPLETED },
      });
    } else {
      await tx.studyPlan.update({
        where: { id: planId },
        data: { status: STUDY_PLAN_STATUS.ACTIVE },
      });
    }

    return updated;
  });
}

// ==================== 🔹 برنامه‌های من (دانش‌آموز) ====================
async function getMyPlans({ studentId, status, page = 1, limit = 20 }) {
  const where = {
    studentId,
    ...(status && { status }),
  };

  const [plans, total] = await Promise.all([
    prisma.studyPlan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        counselor: userSelect,
        exam: examSelect,
        _count: { select: { tasks: true } },
        personalExam: {
          select: {
            id: true,
            status: true,
            score: true,
            totalScore: true,
          },
        },
      },
    }),
    prisma.studyPlan.count({ where }),
  ]);

  return {
    plans: plans.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      totalTasks: p.totalTasks,
      completedTasks: p.completedTasks,
      counselor: p.counselor,
      exam: p.exam,
      personalExam: p.personalExam,
      createdAt: p.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ==================== 🔹 ساخت آزمون شخصی ====================
async function createPersonalExam({ planId, data }) {
  const plan = await prisma.studyPlan.findUnique({
    where: { id: planId },
    select: {
      id: true,
      studentId: true,
      personalExam: { select: { id: true } },
    },
  });

  if (!plan) throw new AppError("برنامه پیدا نشد", 404);
  if (plan.personalExam) {
    throw new AppError("این برنامه از قبل آزمون شخصی دارد", 400);
  }

  // 🔹 چک سوالات
  const uniqueIds = [...new Set(data.questionIds)];
  if (uniqueIds.length !== data.questionIds.length) {
    throw new AppError("سوالات تکراری هستند", 400);
  }

  const questions = await prisma.question.findMany({
    where: { id: { in: uniqueIds } },
    select: {
      id: true,
      questionText: true,
      questionImage: true,
      options: true,
      correctAnswer: true,
      explanation: true,
      lesson: true,
      chapter: true,
      difficulty: true,
    },
  });

  if (questions.length !== uniqueIds.length) {
    throw new AppError("برخی سوالات پیدا نشدند", 404);
  }

  return prisma.$transaction(async (tx) => {
    const personalExam = await tx.personalExam.create({
      data: {
        planId,
        studentId: plan.studentId,
        title: data.title.trim(),
        timeLimit: data.timeLimit,
        status: PERSONAL_EXAM_STATUS.PENDING,
        questions: {
          create: uniqueIds.map((qid, index) => {
            const q = questions.find((x) => x.id === qid);
            return {
              questionId: qid,
              order: index + 1,
              questionTextSnapshot: q.questionText,
              questionImageSnapshot: q.questionImage,
              optionsSnapshot: q.options,
              correctAnswerSnapshot: q.correctAnswer,
              explanationSnapshot: q.explanation,
              lessonSnapshot: q.lesson,
              chapterSnapshot: q.chapter,
              difficultySnapshot: q.difficulty,
            };
          }),
        },
      },
      include: {
        _count: { select: { questions: true } },
      },
    });

    return personalExam;
  });
}

// ==================== 🔹 حذف آزمون شخصی ====================
async function deletePersonalExam(planId) {
  const personalExam = await prisma.personalExam.findUnique({
    where: { planId },
    select: { id: true, status: true },
  });

  if (!personalExam) throw new AppError("آزمون شخصی پیدا نشد", 404);
  if (personalExam.status === PERSONAL_EXAM_STATUS.COMPLETED) {
    throw new AppError("آزمون انجام‌شده قابل حذف نیست", 400);
  }

  await prisma.personalExam.delete({ where: { id: personalExam.id } });
  return { success: true };
}

// ==================== 🔹 جزئیات آزمون شخصی (برای مشاور) ====================
async function getPersonalExam(planId) {
  const personalExam = await prisma.personalExam.findUnique({
    where: { planId },
    include: {
      questions: { orderBy: { order: "asc" } },
      student: userSelect,
      plan: {
        select: { id: true, title: true, studentId: true },
      },
    },
  });

  if (!personalExam) throw new AppError("آزمون شخصی پیدا نشد", 404);

  return personalExam;
}

module.exports = {
  createPlan,
  listPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
  getMyPlans,
  createPersonalExam,
  deletePersonalExam,
  getPersonalExam,
};
