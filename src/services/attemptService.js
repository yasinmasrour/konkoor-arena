const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { hasExamAccess } = require("../utils/accessHelper");

const ATTEMPT_STATUS_STARTED = "started";
const ATTEMPT_STATUS_SUBMITTED = "submitted";

const BOOKLET_STATUS_PENDING = "pending";
const BOOKLET_STATUS_ACTIVE = "active";
const BOOKLET_STATUS_RESTING = "resting";
const BOOKLET_STATUS_FINISHED = "finished";

const REST_DURATION_SECONDS = 10;

// ==================== ابزار کمکی ====================
const isPast = (date) => date && new Date(date).getTime() <= Date.now();

const secondsBetween = (from, to = new Date()) => {
  return Math.max(
    0,
    Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 1000),
  );
};

// ==================== 🆕 چک دسترسی آزمون ====================
/**
 * چک می‌کنه کاربر به آزمون دسترسی داره یا نه.
 * اگه نداشت، خطای 403 پرتاب می‌کنه.
 * @param {string} userId
 * @param {string} examId
 * @param {string} [userRole]
 */
const assertExamAccess = async (userId, examId, userRole = null) => {
  const hasAccess = await hasExamAccess(userId, examId, userRole);
  if (!hasAccess) {
    throw new AppError(
      "برای شرکت در این آزمون باید اشتراک تهیه کنید یا آزمون را خریداری کنید",
      403,
    );
  }
};

// ==================== ساخت AttemptBookletها ====================
const createAttemptBooklets = async (tx, attemptId, examBooklets) => {
  const data = examBooklets.map((eb, index) => ({
    attemptId,
    bookletId: eb.bookletId,
    order: index + 1,
    duration: eb.booklet.duration,
    status: BOOKLET_STATUS_PENDING,
  }));

  await tx.attemptBooklet.createMany({ data });
};

// ==================== syncAttemptState ====================
const syncAttemptState = async (attemptId) => {
  return await prisma.$transaction(async (tx) => {
    const attempt = await tx.attempt.findUnique({
      where: { id: attemptId },
      include: {
        attemptBooklets: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!attempt) throw new AppError("Attempt not found", 404);

    if (attempt.status === ATTEMPT_STATUS_SUBMITTED) {
      return attempt;
    }

    const now = new Date();
    let changed = false;

    for (const ab of attempt.attemptBooklets) {
      if (ab.status === BOOKLET_STATUS_ACTIVE) {
        const elapsed = secondsBetween(ab.startedAt, now);
        const total = ab.duration * 60;

        if (elapsed >= total) {
          const restUntil = new Date(
            now.getTime() + REST_DURATION_SECONDS * 1000,
          );

          await tx.attemptBooklet.update({
            where: { id: ab.id },
            data: {
              status: BOOKLET_STATUS_RESTING,
              finishedAt: now,
              restUntil,
              finishedReason: "timeout",
            },
          });

          changed = true;
        }
      } else if (ab.status === BOOKLET_STATUS_RESTING) {
        if (isPast(ab.restUntil)) {
          await tx.attemptBooklet.update({
            where: { id: ab.id },
            data: { status: BOOKLET_STATUS_FINISHED },
          });

          const next = attempt.attemptBooklets.find(
            (b) => b.order === ab.order + 1,
          );

          if (next && next.status === BOOKLET_STATUS_PENDING) {
            await tx.attemptBooklet.update({
              where: { id: next.id },
              data: {
                status: BOOKLET_STATUS_ACTIVE,
                startedAt: now,
              },
            });
          } else if (!next) {
            await finalizeAttemptSubmission(tx, attemptId, now);
          }

          changed = true;
        }
      }
    }

    if (changed) {
      return await tx.attempt.findUnique({
        where: { id: attemptId },
        include: {
          attemptBooklets: { orderBy: { order: "asc" } },
        },
      });
    }

    return attempt;
  });
};

// ==================== finalizeAttemptSubmission ====================
const finalizeAttemptSubmission = async (tx, attemptId, now) => {
  const answers = await tx.attemptAnswer.findMany({
    where: { attemptId },
    include: { question: true },
    orderBy: { createdAt: "asc" },
  });

  if (answers.length === 0) {
    throw new AppError("Attempt has no questions", 400);
  }

  const analysis = calculateAnalysis(answers);

  const result = await tx.attempt.updateMany({
    where: { id: attemptId, status: ATTEMPT_STATUS_STARTED },
    data: {
      status: ATTEMPT_STATUS_SUBMITTED,
      submittedAt: now,
      score: analysis.finalScore,
      analysis,
    },
  });

  if (result.count !== 1) {
    return;
  }

  await tx.attemptBooklet.updateMany({
    where: {
      attemptId,
      status: {
        in: [
          BOOKLET_STATUS_PENDING,
          BOOKLET_STATUS_ACTIVE,
          BOOKLET_STATUS_RESTING,
        ],
      },
    },
    data: {
      status: BOOKLET_STATUS_FINISHED,
      finishedReason: "submitted",
      finishedAt: now,
    },
  });
};

// ==================== calculateAnalysis ====================
const calculateAnalysis = (answers) => {
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const wrongAnswers = answers.filter(
    (answer) => !answer.isCorrect && answer.selectedAnswer !== null,
  ).length;
  const unansweredQuestions = answers.filter(
    (answer) => answer.selectedAnswer === null,
  ).length;

  const negativeScore = Math.floor(wrongAnswers / 3);
  const finalScore = Math.max(correctAnswers - negativeScore, 0);
  const totalQuestions = answers.length;
  const percentage =
    totalQuestions > 0
      ? Number(((finalScore / totalQuestions) * 100).toFixed(2))
      : 0;

  const subjectMap = {};
  for (const answer of answers) {
    const lesson = answer.question.lesson;
    if (!subjectMap[lesson]) {
      subjectMap[lesson] = { lesson, correct: 0, wrong: 0, unanswered: 0 };
    }
    if (answer.selectedAnswer === null) subjectMap[lesson].unanswered++;
    else if (answer.isCorrect) subjectMap[lesson].correct++;
    else subjectMap[lesson].wrong++;
  }

  const subjects = Object.values(subjectMap).map((subject) => {
    const total = subject.correct + subject.wrong + subject.unanswered;
    return {
      ...subject,
      percentage:
        total > 0 ? Number(((subject.correct / total) * 100).toFixed(2)) : 0,
    };
  });

  return {
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    unansweredQuestions,
    negativeScore,
    finalScore,
    percentage,
    subjects,
  };
};

// ==================== startAttempt ====================
const startAttempt = async (studentId, examId, userRole = null) => {
  // 🆕 چک دسترسی قبل از هر کاری
  await assertExamAccess(studentId, examId, userRole);

  try {
    return await prisma.$transaction(async (tx) => {
      const exam = await tx.exam.findUnique({
        where: { id: examId },
        include: {
          booklets: {
            include: {
              booklet: {
                include: {
                  questions: {
                    include: { question: true },
                    orderBy: { order: "asc" },
                  },
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!exam) throw new AppError("Exam not found", 404);
      if (exam.status !== "published") {
        throw new AppError("Exam is not available", 400);
      }

      for (const eb of exam.booklets) {
        if (eb.booklet.status !== "published") {
          throw new AppError(
            `Booklet "${eb.booklet.title || eb.booklet.lesson}" is not available`,
            400,
          );
        }
      }

      const allQuestions = exam.booklets.flatMap((eb) => eb.booklet.questions);

      if (allQuestions.length === 0) {
        throw new AppError("Exam has no questions", 400);
      }

      const questionIds = new Set();
      for (const item of allQuestions) {
        if (questionIds.has(item.questionId)) {
          throw new AppError("Exam contains a duplicate question", 400);
        }
        questionIds.add(item.questionId);

        if (item.question.options.length < 2) {
          throw new AppError(
            "Exam contains a question with invalid options",
            400,
          );
        }

        if (
          item.question.correctAnswer < 0 ||
          item.question.correctAnswer >= item.question.options.length
        ) {
          throw new AppError(
            "Exam contains a question with an invalid correct answer",
            400,
          );
        }
      }

      const existingAttempt = await tx.attempt.findUnique({
        where: { studentId_examId: { studentId, examId } },
      });

      if (existingAttempt) {
        return existingAttempt;
      }

      const attempt = await tx.attempt.create({
        data: {
          studentId,
          examId,
          startedAt: new Date(),
          status: ATTEMPT_STATUS_STARTED,
        },
      });

      await createAttemptBooklets(tx, attempt.id, exam.booklets);

      const firstBooklet = await tx.attemptBooklet.findFirst({
        where: { attemptId: attempt.id },
        orderBy: { order: "asc" },
      });

      if (firstBooklet) {
        await tx.attemptBooklet.update({
          where: { id: firstBooklet.id },
          data: {
            status: BOOKLET_STATUS_ACTIVE,
            startedAt: new Date(),
          },
        });
      }

      await tx.attemptAnswer.createMany({
        data: allQuestions.map((item) => ({
          attemptId: attempt.id,
          questionId: item.questionId,
          questionTextSnapshot: item.question.questionText,
          questionImageSnapshot: item.question.questionImage,
          optionsSnapshot: item.question.options,
          correctAnswerSnapshot: item.question.correctAnswer,
          explanationSnapshot: item.question.explanation,
          difficultySnapshot: item.question.difficulty,
          lessonSnapshot: item.question.lesson,
          chapterSnapshot: item.question.chapter,
          scoreSnapshot: item.score,
        })),
      });

      return attempt;
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError("Attempt already exists", 400);
    }
    throw error;
  }
};

// ==================== getAttemptQuestions ====================
const getAttemptQuestions = async (attemptId, userId, userRole = null) => {
  // 🔹 اول sync کن
  await syncAttemptState(attemptId);

  // 🔹 حالا بخون
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { select: { id: true, title: true } },
      attemptBooklets: {
        orderBy: { order: "asc" },
        include: {
          booklet: {
            select: {
              id: true,
              title: true,
              lesson: true,
              grade: true,
              major: true,
            },
          },
        },
      },
      answers: {
        include: { question: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!attempt) throw new AppError("Attempt not found", 404);
  if (attempt.studentId !== userId) throw new AppError("Forbidden", 403);

  // 🆕 چک دسترسی به آزمون
  await assertExamAccess(userId, attempt.examId, userRole);

  // 🔹 گروه‌بندی answerها بر اساس booklet
  const examBooklets = await prisma.examBooklet.findMany({
    where: { examId: attempt.examId },
    include: {
      booklet: {
        include: {
          questions: {
            select: { questionId: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { order: "asc" },
  });

  const questionToBooklet = new Map();
  for (const eb of examBooklets) {
    for (const bq of eb.booklet.questions) {
      questionToBooklet.set(bq.questionId, eb.bookletId);
    }
  }

  const answerByQuestion = new Map();
  for (const a of attempt.answers) {
    answerByQuestion.set(a.questionId, a);
  }

  const now = new Date();
  let activeBookletId = null;
  let restingBookletId = null;
  let restSecondsRemaining = null;

  const booklets = attempt.attemptBooklets.map((ab) => {
    const bookletQuestions =
      examBooklets
        .find((eb) => eb.bookletId === ab.bookletId)
        ?.booklet.questions.map((bq) => bq.questionId) || [];

    const questions = bookletQuestions
      .map((qid) => {
        const answer = answerByQuestion.get(qid);
        if (!answer) return null;

        return {
          id: answer.questionId,
          questionText:
            answer.questionTextSnapshot ?? answer.question.questionText,
          questionImage:
            answer.questionImageSnapshot ?? answer.question.questionImage,
          options: answer.optionsSnapshot?.length
            ? answer.optionsSnapshot
            : answer.question.options,
          difficulty: answer.difficultySnapshot ?? answer.question.difficulty,
          score: answer.scoreSnapshot,
          selectedAnswer: answer.selectedAnswer,
          isFlagged: answer.isFlagged,
        };
      })
      .filter(Boolean);

    let secondsRemaining = null;
    if (ab.status === BOOKLET_STATUS_ACTIVE && ab.startedAt) {
      const elapsed = secondsBetween(ab.startedAt, now);
      secondsRemaining = Math.max(0, ab.duration * 60 - elapsed);
      activeBookletId = ab.id;
    }

    if (ab.status === BOOKLET_STATUS_RESTING && ab.restUntil) {
      restSecondsRemaining = Math.max(0, secondsBetween(now, ab.restUntil));
      restingBookletId = ab.id;
    }

    return {
      id: ab.id,
      bookletId: ab.bookletId,
      title: ab.booklet.title,
      lesson: ab.booklet.lesson,
      grade: ab.booklet.grade,
      major: ab.booklet.major,
      order: ab.order,
      duration: ab.duration,
      status: ab.status,
      startedAt: ab.startedAt,
      finishedAt: ab.finishedAt,
      restUntil: ab.restUntil,
      finishedReason: ab.finishedReason,
      secondsRemaining,
      questions,
    };
  });

  return {
    attemptId: attempt.id,
    status: attempt.status,
    exam: {
      id: attempt.exam.id,
      title: attempt.exam.title,
    },
    booklets,
    activeBookletId,
    restingBookletId,
    restSecondsRemaining,
    serverTime: now.toISOString(),
  };
};

// ==================== submitAnswer ====================
const submitAnswer = async (attemptId, userId, data, userRole = null) => {
  const { questionId, selectedAnswer } = data;

  // 🆕 چک دسترسی قبل از هر کاری
  const attemptForAccess = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { examId: true, studentId: true },
  });
  if (!attemptForAccess) throw new AppError("Attempt not found", 404);
  if (attemptForAccess.studentId !== userId)
    throw new AppError("Forbidden", 403);

  await assertExamAccess(userId, attemptForAccess.examId, userRole);

  await syncAttemptState(attemptId);

  return await prisma.$transaction(async (tx) => {
    const attempt = await tx.attempt.findUnique({
      where: { id: attemptId },
      include: {
        attemptBooklets: true,
        answers: { where: { questionId }, include: { question: true } },
      },
    });

    if (!attempt) throw new AppError("Attempt not found", 404);
    if (attempt.studentId !== userId) throw new AppError("Forbidden", 403);
    if (attempt.status === ATTEMPT_STATUS_SUBMITTED) {
      throw new AppError("Attempt already submitted", 400);
    }

    const answer = attempt.answers[0];
    if (!answer) {
      throw new AppError("Question does not belong to this exam", 400);
    }

    const examBooklets = await tx.examBooklet.findMany({
      where: { examId: attempt.examId },
      include: {
        booklet: { include: { questions: { select: { questionId: true } } } },
      },
    });

    let bookletId = null;
    for (const eb of examBooklets) {
      if (eb.booklet.questions.some((q) => q.questionId === questionId)) {
        bookletId = eb.bookletId;
        break;
      }
    }

    if (!bookletId) {
      throw new AppError("Question not found in any booklet", 400);
    }

    const ab = attempt.attemptBooklets.find((b) => b.bookletId === bookletId);
    if (!ab || ab.status !== BOOKLET_STATUS_ACTIVE) {
      throw new AppError(
        "This booklet is not active. You can not answer its questions.",
        400,
      );
    }

    const elapsed = secondsBetween(ab.startedAt, new Date());
    if (elapsed >= ab.duration * 60) {
      throw new AppError("Time is over for this booklet", 400);
    }

    const isClearing = selectedAnswer === null || selectedAnswer === undefined;

    let isCorrect = false;
    let normalizedAnswer = null;

    if (!isClearing) {
      const optionCount =
        answer.optionsSnapshot?.length || answer.question.options.length;

      if (selectedAnswer >= optionCount || selectedAnswer < 0) {
        throw new AppError("Selected answer is out of range", 400);
      }

      const correctAnswer =
        answer.correctAnswerSnapshot ?? answer.question.correctAnswer;

      isCorrect = correctAnswer === selectedAnswer;
      normalizedAnswer = selectedAnswer;
    }

    return await tx.attemptAnswer.update({
      where: { id: answer.id },
      data: {
        selectedAnswer: normalizedAnswer,
        isCorrect,
        answeredAt: isClearing ? null : new Date(),
      },
    });
  });
};

// ==================== toggleFlag ====================
const toggleFlag = async (attemptId, userId, questionId, userRole = null) => {
  // 🆕 چک دسترسی
  const attemptForAccess = await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { examId: true, studentId: true },
  });
  if (!attemptForAccess) throw new AppError("Attempt not found", 404);
  if (attemptForAccess.studentId !== userId)
    throw new AppError("Forbidden", 403);

  await assertExamAccess(userId, attemptForAccess.examId, userRole);

  await syncAttemptState(attemptId);

  return await prisma.$transaction(async (tx) => {
    const attempt = await tx.attempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) throw new AppError("Attempt not found", 404);
    if (attempt.studentId !== userId) throw new AppError("Forbidden", 403);
    if (attempt.status === ATTEMPT_STATUS_SUBMITTED) {
      throw new AppError("Attempt already submitted", 400);
    }

    const answer = await tx.attemptAnswer.findUnique({
      where: {
        attemptId_questionId: { attemptId, questionId },
      },
    });

    if (!answer) throw new AppError("Answer not found", 404);

    return await tx.attemptAnswer.update({
      where: { id: answer.id },
      data: { isFlagged: !answer.isFlagged },
    });
  });
};

// ==================== submitAttempt ====================
const submitAttempt = async (attemptId, userId) => {
  await syncAttemptState(attemptId);

  return await prisma.$transaction(async (tx) => {
    const attempt = await tx.attempt.findUnique({
      where: { id: attemptId },
      include: { attemptBooklets: { orderBy: { order: "asc" } } },
    });

    if (!attempt) throw new AppError("Attempt not found", 404);
    if (attempt.studentId !== userId) throw new AppError("Forbidden", 403);
    if (attempt.status === ATTEMPT_STATUS_SUBMITTED) {
      throw new AppError("Attempt already submitted", 400);
    }

    const now = new Date();

    await tx.attemptBooklet.updateMany({
      where: { attemptId },
      data: {
        status: BOOKLET_STATUS_FINISHED,
        finishedAt: now,
        finishedReason: "submitted",
      },
    });

    await finalizeAttemptSubmission(tx, attemptId, now);

    return await tx.attempt.findUnique({ where: { id: attemptId } });
  });
};

// ==================== getAttemptResult ====================
const getAttemptResult = async (attemptId, userId) => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: { exam: { select: { id: true, title: true } } },
  });
  if (!attempt) throw new AppError("Attempt not found", 404);
  if (attempt.studentId !== userId) throw new AppError("Forbidden", 403);

  const analysis = attempt.analysis || {};
  const totalQuestions = analysis.totalQuestions || 0;
  const percentage =
    totalQuestions > 0
      ? Number(((attempt.score / totalQuestions) * 100).toFixed(2))
      : 0;

  return {
    attemptId: attempt.id,
    exam: attempt.exam,
    status: attempt.status,
    result: {
      score: attempt.score,
      totalQuestions,
      correctAnswers: analysis.correctAnswers || 0,
      wrongAnswers: analysis.wrongAnswers || 0,
      unansweredQuestions: analysis.unansweredQuestions || 0,
      negativeScore: analysis.negativeScore || 0,
      percentage,
      subjects: analysis.subjects || [],
    },
  };
};

// ==================== getMyAttempts ====================
const getMyAttempts = async (studentId) => {
  const attempts = await prisma.attempt.findMany({
    where: { studentId },
    include: { exam: { select: { id: true, title: true, examDate: true } } },
    orderBy: { createdAt: "desc" },
  });

  return attempts.map((attempt) => ({
    id: attempt.id,
    exam: attempt.exam,
    status: attempt.status,
    score: attempt.score,
    percentage: attempt.analysis?.percentage ?? 0,
    submittedAt: attempt.submittedAt,
  }));
};

// ==================== getAttemptReview ====================
const getAttemptReview = async (attemptId, userId) => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { select: { id: true, title: true } },
      answers: {
        include: { question: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!attempt) throw new AppError("Attempt not found", 404);
  if (attempt.studentId !== userId) throw new AppError("Forbidden", 403);
  if (attempt.status !== ATTEMPT_STATUS_SUBMITTED) {
    throw new AppError("Attempt has not been submitted", 400);
  }

  return {
    attemptId: attempt.id,
    exam: attempt.exam,
    score: attempt.score,
    questions: attempt.answers.map((answer) => ({
      id: answer.questionId,
      questionText: answer.questionTextSnapshot ?? answer.question.questionText,
      questionImage:
        answer.questionImageSnapshot ?? answer.question.questionImage,
      options: answer.optionsSnapshot?.length
        ? answer.optionsSnapshot
        : answer.question.options,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer:
        answer.correctAnswerSnapshot ?? answer.question.correctAnswer,
      isCorrect: answer.isCorrect,
      isFlagged: answer.isFlagged,
      explanation: answer.explanationSnapshot ?? answer.question.explanation,
      explanationPdf: answer.question.explanationPdf,
      difficulty: answer.difficultySnapshot ?? answer.question.difficulty,
      lesson: answer.lessonSnapshot ?? answer.question.lesson,
      chapter: answer.chapterSnapshot ?? answer.question.chapter,
    })),
  };
};

module.exports = {
  startAttempt,
  getAttemptQuestions,
  submitAnswer,
  toggleFlag,
  submitAttempt,
  getAttemptResult,
  getMyAttempts,
  getAttemptReview,
  syncAttemptState,
};