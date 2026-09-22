const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { PERSONAL_EXAM_STATUS } = require("../constants/studyPlan");

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
 * چک میکنه کاربر صاحب آزمونه یا نه
 */
async function ensureOwner(personalExamId, userId) {
  const exam = await prisma.personalExam.findUnique({
    where: { id: personalExamId },
    select: { id: true, studentId: true, status: true, timeLimit: true },
  });

  if (!exam) throw new AppError("آزمون شخصی پیدا نشد", 404);
  if (exam.studentId !== userId) {
    throw new AppError("دسترسی مجاز نیست", 403);
  }

  return exam;
}

// ==================== 🔹 لیست آزمون‌های من ====================
async function getMyExams({ studentId, status, page = 1, limit = 20 }) {
  const where = {
    studentId,
    ...(status && { status }),
  };

  const [exams, total] = await Promise.all([
    prisma.personalExam.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        plan: {
          select: {
            id: true,
            title: true,
            exam: { select: { id: true, title: true } },
          },
        },
        _count: { select: { questions: true } },
      },
    }),
    prisma.personalExam.count({ where }),
  ]);

  return {
    exams: exams.map((e) => ({
      id: e.id,
      title: e.title,
      timeLimit: e.timeLimit,
      status: e.status,
      score: e.score,
      totalScore: e.totalScore,
      startedAt: e.startedAt,
      submittedAt: e.submittedAt,
      questionsCount: e._count.questions,
      plan: e.plan,
      createdAt: e.createdAt,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ==================== 🔹 شروع آزمون ====================
async function startExam({ personalExamId, userId }) {
  const exam = await ensureOwner(personalExamId, userId);

  if (exam.status === PERSONAL_EXAM_STATUS.COMPLETED) {
    throw new AppError("این آزمون قبلاً تموم شده", 400);
  }
  if (exam.status === PERSONAL_EXAM_STATUS.ABANDONED) {
    throw new AppError("این آزمون لغو شده", 400);
  }

  const questions = await prisma.personalExamQuestion.findMany({
    where: { personalExamId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      questionId: true,
      order: true,
      selectedAnswer: true,
      answeredAt: true,
    },
  });

  if (questions.length === 0) {
    throw new AppError("این آزمون سوالی ندارد", 400);
  }

  // 🔹 شروع (اگه اولین باره)
  const now = new Date();
  const updateData = {};

  if (exam.status === PERSONAL_EXAM_STATUS.PENDING) {
    updateData.status = PERSONAL_EXAM_STATUS.IN_PROGRESS;
    updateData.startedAt = now;
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.personalExam.update({
      where: { id: personalExamId },
      data: updateData,
    });
  }

  const fullExam = await prisma.personalExam.findUnique({
    where: { id: personalExamId },
    select: {
      id: true,
      title: true,
      timeLimit: true,
      status: true,
      startedAt: true,
      score: true,
      totalScore: true,
      plan: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return {
    exam: {
      ...fullExam,
      status: updateData.status || exam.status,
      startedAt: updateData.startedAt || fullExam.startedAt,
    },
    questions: questions.map((q, i) => ({
      order: q.order,
      questionId: q.questionId,
      selectedAnswer: q.selectedAnswer,
      answeredAt: q.answeredAt,
      // 🆕 index برای frontend
      index: i,
    })),
  };
}

// ==================== 🔹 گرفتن سوال فعلی ====================
async function getCurrentQuestion({ personalExamId, userId, order }) {
  await ensureOwner(personalExamId, userId);

  const question = await prisma.personalExamQuestion.findUnique({
    where: {
      personalExamId_order: { personalExamId, order },
    },
  });

  if (!question) throw new AppError("سوال پیدا نشد", 404);

  return {
    id: question.id,
    order: question.order,
    questionId: question.questionId,
    questionText: question.questionTextSnapshot,
    questionImage: question.questionImageSnapshot,
    options: question.optionsSnapshot,
    selectedAnswer: question.selectedAnswer,
    answeredAt: question.answeredAt,
    // ⚠️ correctAnswer رو نمی‌دیم
  };
}

// ==================== 🔹 ثبت پاسخ ====================
async function submitAnswer({
  personalExamId,
  userId,
  questionId,
  selectedAnswer,
  timeSpentMs,
}) {
  const exam = await ensureOwner(personalExamId, userId);

  if (exam.status !== PERSONAL_EXAM_STATUS.IN_PROGRESS) {
    throw new AppError("این آزمون در حال انجام نیست", 400);
  }

  const question = await prisma.personalExamQuestion.findFirst({
    where: { personalExamId, questionId },
  });

  if (!question) throw new AppError("سوال پیدا نشد", 404);

  const isCorrect =
    selectedAnswer !== null &&
    selectedAnswer === question.correctAnswerSnapshot;

  const updated = await prisma.personalExamQuestion.update({
    where: { id: question.id },
    data: {
      selectedAnswer: selectedAnswer ?? null,
      isCorrect,
      answeredAt: new Date(),
    },
  });

  return {
    questionId: updated.questionId,
    selectedAnswer: updated.selectedAnswer,
    isCorrect: updated.isCorrect,
    answeredAt: updated.answeredAt,
    timeSpentMs: timeSpentMs ?? null,
    // ⚠️ correctAnswer رو نمی‌دیم (فقط بعد از submit نهایی)
  };
}

// ==================== 🔹 پایان آزمون ====================
async function submitExam({ personalExamId, userId }) {
  const exam = await ensureOwner(personalExamId, userId);

  if (exam.status === PERSONAL_EXAM_STATUS.COMPLETED) {
    throw new AppError("این آزمون قبلاً تموم شده", 400);
  }
  if (exam.status === PERSONAL_EXAM_STATUS.ABANDONED) {
    throw new AppError("این آزمون لغو شده", 400);
  }

  // 🔹 محاسبه نمره
  const questions = await prisma.personalExamQuestion.findMany({
    where: { personalExamId },
    select: {
      id: true,
      questionId: true,
      order: true,
      selectedAnswer: true,
      isCorrect: true,
      correctAnswerSnapshot: true,
      explanationSnapshot: true,
      scoreSnapshot: true,
      lessonSnapshot: true,
      chapterSnapshot: true,
    },
    orderBy: { order: "asc" },
  });

  if (questions.length === 0) {
    throw new AppError("این آزمون سوالی ندارد", 400);
  }

  // 🔹 نمره مثبت برای هر پاسخ درست
  const correctCount = questions.filter((q) => q.isCorrect).length;
  const totalScore = questions.length;
  const score = correctCount;

  const submittedAt = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.personalExam.update({
      where: { id: personalExamId },
      data: {
        status: PERSONAL_EXAM_STATUS.COMPLETED,
        score,
        totalScore,
        submittedAt,
      },
      include: {
        plan: {
          select: {
            id: true,
            title: true,
            studentId: true,
          },
        },
        student: userSelect,
      },
    });

    return updated;
  });

  // 🔹 برگرداندن پاسخ‌ها با پاسخ درست
  const answers = questions.map((q) => ({
    order: q.order,
    questionId: q.questionId,
    selectedAnswer: q.selectedAnswer,
    isCorrect: q.isCorrect,
    correctAnswer: q.correctAnswerSnapshot,
    explanation: q.explanationSnapshot,
    lesson: q.lessonSnapshot,
    chapter: q.chapterSnapshot,
  }));

  return {
    exam: {
      id: result.id,
      title: result.title,
      status: result.status,
      score: result.score,
      totalScore: result.totalScore,
      startedAt: result.startedAt,
      submittedAt: result.submittedAt,
      correctCount,
      wrongCount: questions.filter(
        (q) => !q.isCorrect && q.selectedAnswer !== null,
      ).length,
      unansweredCount: questions.filter((q) => q.selectedAnswer === null)
        .length,
      plan: result.plan,
      student: result.student,
    },
    answers,
  };
}

// ==================== 🔹 نتیجه آزمون ====================
async function getExamResult({ personalExamId, userId, userRole }) {
  const exam = await prisma.personalExam.findUnique({
    where: { id: personalExamId },
    include: {
      plan: {
        select: {
          id: true,
          title: true,
          studentId: true,
          student: userSelect,
        },
      },
      student: userSelect,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          questionId: true,
          order: true,
          selectedAnswer: true,
          isCorrect: true,
          correctAnswerSnapshot: true,
          explanationSnapshot: true,
          questionTextSnapshot: true,
          questionImageSnapshot: true,
          optionsSnapshot: true,
          lessonSnapshot: true,
          chapterSnapshot: true,
          difficultySnapshot: true,
        },
      },
    },
  });

  if (!exam) throw new AppError("آزمون پیدا نشد", 404);

  // 🔹 چک دسترسی
  const isOwner = exam.studentId === userId;
  const isStaff = userRole === "ADMIN" || userRole === "COUNSELOR";

  if (!isOwner && !isStaff) {
    throw new AppError("دسترسی مجاز نیست", 403);
  }

  if (exam.status !== PERSONAL_EXAM_STATUS.COMPLETED) {
    throw new AppError("این آزمون هنوز تموم نشده", 400);
  }

  const correctCount = exam.questions.filter((q) => q.isCorrect).length;
  const wrongCount = exam.questions.filter(
    (q) => !q.isCorrect && q.selectedAnswer !== null,
  ).length;
  const unansweredCount = exam.questions.filter(
    (q) => q.selectedAnswer === null,
  ).length;

  return {
    exam: {
      id: exam.id,
      title: exam.title,
      status: exam.status,
      score: exam.score,
      totalScore: exam.totalScore,
      startedAt: exam.startedAt,
      submittedAt: exam.submittedAt,
      correctCount,
      wrongCount,
      unansweredCount,
      plan: exam.plan,
      student: exam.student,
    },
    questions: exam.questions.map((q) => ({
      order: q.order,
      questionId: q.questionId,
      questionText: q.questionTextSnapshot,
      questionImage: q.questionImageSnapshot,
      options: q.optionsSnapshot,
      selectedAnswer: q.selectedAnswer,
      correctAnswer: q.correctAnswerSnapshot,
      explanation: q.explanationSnapshot,
      isCorrect: q.isCorrect,
      lesson: q.lessonSnapshot,
      chapter: q.chapterSnapshot,
      difficulty: q.difficultySnapshot,
    })),
  };
}

// ==================== 🔹 لغو آزمون ====================
async function abandonExam({ personalExamId, userId }) {
  const exam = await ensureOwner(personalExamId, userId);

  if (exam.status === PERSONAL_EXAM_STATUS.COMPLETED) {
    throw new AppError("این آزمون تموم شده و قابل لغو نیست", 400);
  }
  if (exam.status === PERSONAL_EXAM_STATUS.ABANDONED) {
    throw new AppError("این آزمون قبلاً لغو شده", 400);
  }

  await prisma.personalExam.update({
    where: { id: personalExamId },
    data: { status: PERSONAL_EXAM_STATUS.ABANDONED },
  });

  return { success: true };
}

module.exports = {
  getMyExams,
  startExam,
  getCurrentQuestion,
  submitAnswer,
  submitExam,
  getExamResult,
  abandonExam,
};
