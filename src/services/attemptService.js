const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const ATTEMPT_STATUS_STARTED = "started";
const ATTEMPT_STATUS_SUBMITTED = "submitted";

const loadAttemptForStudent = async (tx, attemptId, userId) => {
  const attempt = await tx.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { select: { id: true, title: true } },
    },
  });

  if (!attempt) throw new AppError("Attempt not found", 404);
  if (attempt.studentId !== userId) throw new AppError("Forbidden", 403);

  return attempt;
};

const startAttempt = async (studentId, examId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const exam = await tx.exam.findUnique({
        where: { id: examId },
        include: {
          booklets: {
            include: {
              booklet: {
                include: {
                  questions: { include: { question: true }, orderBy: { order: "asc" } },
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

      const questions = exam.booklets.flatMap(
        (examBooklet) => examBooklet.booklet.questions,
      );

      if (questions.length === 0) {
        throw new AppError("Exam has no questions", 400);
      }

      const questionIds = new Set();
      for (const item of questions) {
        if (questionIds.has(item.questionId)) {
          throw new AppError("Exam contains a duplicate question", 400);
        }
        questionIds.add(item.questionId);

        if (item.question.options.length < 2) {
          throw new AppError("Exam contains a question with invalid options", 400);
        }

        if (item.question.correctAnswer < 0 || item.question.correctAnswer >= item.question.options.length) {
          throw new AppError("Exam contains a question with an invalid correct answer", 400);
        }
      }

      const existingAttempt = await tx.attempt.findUnique({
        where: { studentId_examId: { studentId, examId } },
      });

      // Starting an attempt is idempotent. If the student already started this exam,
      // return the existing attempt instead of blocking the user with a 400 error.
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

      await tx.attemptAnswer.createMany({
        data: questions.map((item) => ({
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

      return {
        attempt,
        exam: {
          id: exam.id,
          title: exam.title,
          examDate: exam.examDate,
          startTime: exam.startTime,
          endTime: exam.endTime,
        },
        totalQuestions: questions.length,
      };
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError("Attempt already exists", 400);
    }
    throw error;
  }
};

const getAttemptQuestions = async (attemptId, userId) => {
  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: { select: { id: true, title: true } },
      answers: {
        orderBy: { createdAt: "asc" },
        include: { question: true },
      },
    },
  });

  if (!attempt) throw new AppError("Attempt not found", 404);
  if (attempt.studentId !== userId) throw new AppError("Forbidden", 403);

  return {
    attemptId: attempt.id,
    status: attempt.status,
    exam: attempt.exam,
    questions: attempt.answers.map((answer) => ({
      id: answer.questionId,
      questionText: answer.questionTextSnapshot ?? answer.question.questionText,
      questionImage: answer.questionImageSnapshot ?? answer.question.questionImage,
      options: answer.optionsSnapshot?.length ? answer.optionsSnapshot : answer.question.options,
      difficulty: answer.difficultySnapshot ?? answer.question.difficulty,
      score: answer.scoreSnapshot,
      selectedAnswer: answer.selectedAnswer,
    })),
  };
};

const submitAnswer = async (attemptId, userId, data) => {
  const { questionId, selectedAnswer } = data;

  return await prisma.$transaction(async (tx) => {
    const attempt = await tx.attempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: { where: { questionId }, include: { question: true } },
      },
    });

    if (!attempt) throw new AppError("Attempt not found", 404);
    if (attempt.studentId !== userId) throw new AppError("Forbidden", 403);
    if (attempt.status === ATTEMPT_STATUS_SUBMITTED) {
      throw new AppError("Attempt already submitted", 400);
    }

    const answer = attempt.answers[0];
    if (!answer) throw new AppError("Question does not belong to this exam", 400);

    const optionCount = answer.optionsSnapshot?.length || answer.question.options.length;
    if (selectedAnswer >= optionCount) {
      throw new AppError("Selected answer is out of range", 400);
    }

    const correctAnswer = answer.correctAnswerSnapshot ?? answer.question.correctAnswer;
    const isCorrect = correctAnswer === selectedAnswer;

    return await tx.attemptAnswer.update({
      where: { id: answer.id },
      data: {
        selectedAnswer,
        isCorrect,
        answeredAt: new Date(),
      },
    });
  });
};

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

const submitAttempt = async (attemptId, userId) => {
  return await prisma.$transaction(async (tx) => {
    const attempt = await loadAttemptForStudent(tx, attemptId, userId);

    if (attempt.status === ATTEMPT_STATUS_SUBMITTED) {
      throw new AppError("Attempt already submitted", 400);
    }

    const answers = await tx.attemptAnswer.findMany({
      where: { attemptId },
      include: { question: true },
      orderBy: { createdAt: "asc" },
    });

    if (answers.length === 0) {
      throw new AppError("Attempt has no questions", 400);
    }

    const analysis = calculateAnalysis(answers);

    const updatedAttempt = await tx.attempt.updateMany({
      where: { id: attemptId, status: ATTEMPT_STATUS_STARTED },
      data: {
        status: ATTEMPT_STATUS_SUBMITTED,
        submittedAt: new Date(),
        score: analysis.finalScore,
        analysis,
      },
    });

    if (updatedAttempt.count !== 1) {
      throw new AppError("Attempt was already submitted", 400);
    }

    return await tx.attempt.findUnique({ where: { id: attemptId } });
  });
};

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
      questionImage: answer.questionImageSnapshot ?? answer.question.questionImage,
      options: answer.optionsSnapshot?.length ? answer.optionsSnapshot : answer.question.options,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer: answer.correctAnswerSnapshot ?? answer.question.correctAnswer,
      isCorrect: answer.isCorrect,
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
  submitAttempt,
  getAttemptResult,
  getMyAttempts,
  getAttemptReview,
};
