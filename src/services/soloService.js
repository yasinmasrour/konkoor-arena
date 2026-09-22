const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { SOLO_LEVELS, SOLO_STATUS, SOLO_CONFIG } = require("../constants/solo");

// ==================== Helper: کاربر ====================
const userSelect = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    username: true,
    grade: true,
    major: true,
  },
};

// ==================== Helper: سوال امن ====================
function sanitizeQuestion(question) {
  if (!question || typeof question !== "object") {
    return null;
  }
  return {
    id: question.id ?? null,
    code: question.code ?? null,
    lesson: question.lesson ?? null,
    grade: question.grade ?? null,
    major: question.major ?? null,
    chapter: question.chapter ?? null,
    topic: question.topic ?? null,
    questionText: question.questionText ?? "",
    questionImage: question.questionImage ?? "",
    options: question.options ?? [],
    difficulty: question.difficulty ?? "medium",
    // ⚠️ correctAnswer و explanation رو نمیدیم
  };
}

// ==================== Helper: محاسبه lives ====================
function calcLives(solo) {
  return Math.max(
    0,
    SOLO_CONFIG.TOTAL_LIVES - solo.wrongAnswers - solo.timeouts,
  );
}

// ==================== Helper: چک پایان ====================
async function checkFinish(soloMatchId, tx = prisma) {
  const solo = await tx.soloMatch.findUnique({
    where: { id: soloMatchId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { question: true },
      },
      league: true,
      user: userSelect,
    },
  });

  if (!solo) return null;
  if (solo.status !== SOLO_STATUS.PLAYING) return solo;

  const lives = calcLives(solo);
  const answeredCount = solo.questions.filter(
    (q) => q.answeredAt !== null,
  ).length;

  // 🆕 اگه جان تموم شد → باخت
  if (lives <= 0) {
    return tx.soloMatch.update({
      where: { id: soloMatchId },
      data: {
        status: SOLO_STATUS.LOST,
        finishedAt: new Date(),
        livesRemaining: 0,
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { question: true },
        },
        league: true,
        user: userSelect,
      },
    });
  }

  // 🆕 اگه ۵ سوال جواب داد → برد
  if (answeredCount >= SOLO_CONFIG.TOTAL_QUESTIONS) {
    return tx.soloMatch.update({
      where: { id: soloMatchId },
      data: {
        status: SOLO_STATUS.WON,
        finishedAt: new Date(),
        livesRemaining: lives,
      },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { question: true },
        },
        league: true,
        user: userSelect,
      },
    });
  }

  return solo;
}

// ==================== 🔹 لیست سطحها ====================
function getLevels() {
  return Object.values(SOLO_LEVELS).map((level) => ({
    key: level.key,
    label: level.label,
    timeLimit: level.timeLimit,
  }));
}

// ==================== 🔹 شروع بازی ====================
async function startSolo({ userId, leagueId, level }) {
  // 🔹 چک سطح
  const levelConfig = SOLO_LEVELS[level];
  if (!levelConfig) {
    throw new AppError("سطح نامعتبر است", 400);
  }

  // 🔹 چک لیگ
  const league = await prisma.arenaLeague.findUnique({
    where: { id: leagueId },
  });

  if (!league) {
    throw new AppError("لیگ پیدا نشد", 404);
  }

  if (league.status !== "active") {
    throw new AppError("این لیگ فعال نیست", 400);
  }

  // 🔹 چک کاربر
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { grade: true, major: true },
  });

  if (!user) throw new AppError("کاربر پیدا نشد", 404);
  if (!user.grade) {
    throw new AppError(
      "برای شرکت در آرنا باید پایه تحصیلی خود را تکمیل کنید",
      400,
    );
  }

  // 🔹 چک سازگاری کاربر با لیگ
  if (league.grade !== user.grade) {
    throw new AppError("پایه تحصیلی شما با این لیگ سازگار نیست", 400);
  }

  if (
    league.compatibleMajors.length > 0 &&
    user.major &&
    !league.compatibleMajors.includes(user.major)
  ) {
    throw new AppError("رشته تحصیلی شما با این لیگ سازگار نیست", 400);
  }

  // 🔹 گرفتن ۵ سوال رندوم
  const questions = await prisma.$queryRaw`
    SELECT id, code, lesson, grade, major, chapter, topic,
           "questionText", "questionImage", options, "correctAnswer",
           explanation, difficulty, "isArena"
    FROM "Question"
    WHERE "isArena" = true
      AND lesson = ${league.lesson}
      AND grade = ${league.grade}
      AND status = 'published'
    ORDER BY RANDOM()
    LIMIT ${SOLO_CONFIG.TOTAL_QUESTIONS}
  `;

  if (questions.length < SOLO_CONFIG.TOTAL_QUESTIONS) {
    throw new AppError(
      `سوالات کافی برای این لیگ موجود نیست (فقط ${questions.length} سوال از ${SOLO_CONFIG.TOTAL_QUESTIONS} موجود)`,
      400,
    );
  }

  // 🔹 ساخت SoloMatch
  const solo = await prisma.soloMatch.create({
    data: {
      userId,
      leagueId,
      level,
      status: SOLO_STATUS.PLAYING,
      livesRemaining: SOLO_CONFIG.TOTAL_LIVES,
      questions: {
        create: questions.map((q, index) => ({
          questionId: q.id,
          order: index + 1,
          timeLimit: levelConfig.timeLimit,
        })),
      },
    },
    include: {
      questions: {
        include: { question: true },
        orderBy: { order: "asc" },
      },
      league: true,
      user: userSelect,
    },
  });

  return {
    ...solo,
    questions: solo.questions.map((q) => ({
      ...q,
      question: sanitizeQuestion(q.question),
    })),
  };
}

// ==================== 🔹 وضعیت بازی ====================
async function getSoloStatus({ soloMatchId, userId }) {
  const solo = await prisma.soloMatch.findUnique({
    where: { id: soloMatchId },
    include: {
      questions: {
        include: { question: true },
        orderBy: { order: "asc" },
      },
      league: true,
      user: userSelect,
    },
  });

  if (!solo) throw new AppError("بازی پیدا نشد", 404);
  if (solo.userId !== userId) {
    throw new AppError("دسترسی مجاز نیست", 403);
  }

  // 🔹 اگه status = playing باشه، سوال فعلی رو برگردون
  let currentQuestion = null;
  if (solo.status === SOLO_STATUS.PLAYING) {
    const current = solo.questions.find((q) => q.answeredAt === null);
    if (current) {
      currentQuestion = {
        order: current.order,
        timeLimit: current.timeLimit,
        question: sanitizeQuestion(current.question),
      };
    }
  }

  const lives = calcLives(solo);
  const answeredCount = solo.questions.filter(
    (q) => q.answeredAt !== null,
  ).length;

  return {
    solo: {
      id: solo.id,
      level: solo.level,
      status: solo.status,
      correctAnswers: solo.correctAnswers,
      wrongAnswers: solo.wrongAnswers,
      timeouts: solo.timeouts,
      livesRemaining: lives,
      totalQuestions: SOLO_CONFIG.TOTAL_QUESTIONS,
      answeredCount,
      startedAt: solo.startedAt,
      finishedAt: solo.finishedAt,
      league: {
        id: solo.league.id,
        title: solo.league.title,
        lesson: solo.league.lesson,
      },
    },
    currentQuestion,
  };
}

// ==================== 🔹 ثبت پاسخ ====================
async function answerSolo({
  soloMatchId,
  userId,
  order,
  selectedAnswer,
  timeSpentMs,
}) {
  return prisma.$transaction(async (tx) => {
    // 🔹 چک بازی
    const solo = await tx.soloMatch.findUnique({
      where: { id: soloMatchId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { question: true },
        },
      },
    });

    if (!solo) throw new AppError("بازی پیدا نشد", 404);
    if (solo.userId !== userId) {
      throw new AppError("دسترسی مجاز نیست", 403);
    }
    if (solo.status !== SOLO_STATUS.PLAYING) {
      throw new AppError("این بازی تمام شده است", 400);
    }

    // 🔹 چک ترتیب — سوال فعلی
    const current = solo.questions.find((q) => q.answeredAt === null);
    if (!current) {
      throw new AppError("سوالی برای پاسخ وجود ندارد", 400);
    }
    if (current.order !== order) {
      throw new AppError(`نوبت سوال ${current.order} است، نه ${order}`, 400);
    }

    // 🔹 چک زمان
    if (timeSpentMs && timeSpentMs > current.timeLimit * 1000 + 2000) {
      // اگه بیش از حد طول کشید، تایماوت حساب کن
      selectedAnswer = null;
    }

    // 🔹 محاسبه نتیجه
    let isCorrect = false;
    let isTimeout = false;
    let wrongAnswers = solo.wrongAnswers;
    let timeouts = solo.timeouts;
    let correctAnswers = solo.correctAnswers;

    if (selectedAnswer === null || selectedAnswer === undefined) {
      // تایماوت
      isTimeout = true;
      timeouts += 1;
    } else if (selectedAnswer === current.question.correctAnswer) {
      isCorrect = true;
      correctAnswers += 1;
    } else {
      wrongAnswers += 1;
    }

    // 🔹 آپدیت سوال
    await tx.soloMatchQuestion.update({
      where: { id: current.id },
      data: {
        selectedAnswer: selectedAnswer ?? null,
        isCorrect,
        isTimeout,
        timeSpentMs: timeSpentMs ?? null,
        answeredAt: new Date(),
      },
    });

    // 🔹 آپدیت بازی
    const newLives = Math.max(
      0,
      SOLO_CONFIG.TOTAL_LIVES - wrongAnswers - timeouts,
    );
    const totalTimeMs = (solo.totalTimeMs || 0) + (timeSpentMs ?? 0);

    await tx.soloMatch.update({
      where: { id: soloMatchId },
      data: {
        correctAnswers,
        wrongAnswers,
        timeouts,
        livesRemaining: newLives,
        totalTimeMs,
      },
    });

    // 🔹 چک پایان
    const finished = await checkFinish(soloMatchId, tx);

    // 🔹 سوال بعدی (اگه ادامه داره)
    let nextQuestion = null;
    if (finished && finished.status === SOLO_STATUS.PLAYING) {
      const next = finished.questions.find((q) => q.answeredAt === null);
      if (next && next.question) {
        nextQuestion = {
          order: next.order,
          timeLimit: next.timeLimit,
          question: sanitizeQuestion(next.question),
        };
      }
    }

    return {
      // 🔹 نتیجه این سوال
      result: {
        order: current.order,
        isCorrect,
        isTimeout,
        correctAnswer: current.question.correctAnswer,
        explanation: current.question.explanation,
        selectedAnswer: selectedAnswer ?? null,
      },
      // 🔹 آمار
      stats: {
        correctAnswers,
        wrongAnswers,
        timeouts,
        livesRemaining: newLives,
        answeredCount:
          solo.questions.filter((q) => q.answeredAt !== null).length + 1,
        totalQuestions: SOLO_CONFIG.TOTAL_QUESTIONS,
      },
      // 🔹 وضعیت
      status: finished?.status ?? solo.status,
      // 🔹 سوال بعدی
      nextQuestion,
    };
  });
}

// ==================== 🔹 انصراف ====================
async function abandonSolo({ soloMatchId, userId }) {
  const solo = await prisma.soloMatch.findUnique({
    where: { id: soloMatchId },
    select: { id: true, userId: true, status: true },
  });

  if (!solo) throw new AppError("بازی پیدا نشد", 404);
  if (solo.userId !== userId) {
    throw new AppError("دسترسی مجاز نیست", 403);
  }
  if (solo.status !== SOLO_STATUS.PLAYING) {
    throw new AppError("این بازی قبلاً تمام شده است", 400);
  }

  const updated = await prisma.soloMatch.update({
    where: { id: soloMatchId },
    data: {
      status: SOLO_STATUS.ABANDONED,
      finishedAt: new Date(),
    },
    select: { id: true, status: true, finishedAt: true },
  });

  return updated;
}

// ==================== 🔹 تاریخچه ====================
async function getSoloHistory({ userId, status, level, page = 1, limit = 20 }) {
  const where = {
    userId,
    ...(status && { status }),
    ...(level && { level }),
  };

  const [matches, total] = await Promise.all([
    prisma.soloMatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        league: {
          select: { id: true, title: true, lesson: true },
        },
      },
    }),
    prisma.soloMatch.count({ where }),
  ]);

  return {
    matches: matches.map((m) => ({
      id: m.id,
      level: m.level,
      status: m.status,
      correctAnswers: m.correctAnswers,
      wrongAnswers: m.wrongAnswers,
      timeouts: m.timeouts,
      livesRemaining: m.livesRemaining,
      startedAt: m.startedAt,
      finishedAt: m.finishedAt,
      totalTimeMs: m.totalTimeMs,
      league: m.league,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ==================== 🔹 آمار ====================
async function getSoloStats(userId) {
  const [total, won, lost, abandoned, byLevel, best] = await Promise.all([
    prisma.soloMatch.count({ where: { userId } }),
    prisma.soloMatch.count({
      where: { userId, status: SOLO_STATUS.WON },
    }),
    prisma.soloMatch.count({
      where: { userId, status: SOLO_STATUS.LOST },
    }),
    prisma.soloMatch.count({
      where: { userId, status: SOLO_STATUS.ABANDONED },
    }),
    prisma.soloMatch.groupBy({
      by: ["level"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.soloMatch.findFirst({
      where: { userId, status: SOLO_STATUS.WON },
      orderBy: { totalTimeMs: "asc" },
      select: { totalTimeMs: true, level: true, finishedAt: true },
    }),
  ]);

  return {
    total,
    won,
    lost,
    abandoned,
    winRate: total > 0 ? Math.round((won / total) * 100) : 0,
    byLevel: byLevel.map((b) => ({
      level: b.level,
      count: b._count._all,
    })),
    fastestWin: best,
  };
}

module.exports = {
  getLevels,
  startSolo,
  getSoloStatus,
  answerSolo,
  abandonSolo,
  getSoloHistory,
  getSoloStats,
  sanitizeQuestion,
};
