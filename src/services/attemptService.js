const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const startAttempt = async (studentId, examId) => {
  return await prisma.$transaction(async (tx) => {
    const exam = await tx.exam.findUnique({
      where: {
        id: examId,
      },
      include: {
        booklets: {
          include: {
            booklet: {
              include: {
                questions: true,
              },
            },
          },
        },
      },
    });

    if (!exam) {
      throw new AppError("Exam not found", 404);
    }

    const existingAttempt = await tx.attempt.findUnique({
      where: {
        studentId_examId: {
          studentId,
          examId,
        },
      },
    });

    if (existingAttempt) {
      throw new AppError("Attempt already exists", 400);
    }

    const attempt = await tx.attempt.create({
      data: {
        studentId,
        examId,
        startedAt: new Date(),
      },
    });

    const questions = exam.booklets.flatMap(
      (examBooklet) => examBooklet.booklet.questions,
    );

    await tx.attemptAnswer.createMany({
      data: questions.map((item) => ({
        attemptId: attempt.id,

        questionId: item.questionId,
      })),
    });

    return {
      attempt,
      exam,
    };
  });
};

const getAttemptQuestions = async (attemptId) => {
  const attempt = await prisma.attempt.findUnique({
    where: {
      id: attemptId,
    },

    include: {
      exam: {
        include: {
          booklets: {
            include: {
              booklet: {
                include: {
                  questions: {
                    include: {
                      question: true,
                    },

                    orderBy: {
                      order: "asc",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }

  const questions = attempt.exam.booklets.flatMap((examBooklet) =>
    examBooklet.booklet.questions.map((item) => ({
      id: item.question.id,
      questionText: item.question.questionText,
      questionImage: item.question.questionImage,
      options: item.question.options,
      difficulty: item.question.difficulty,
      score: item.score,
    })),
  );

  return {
    attemptId: attempt.id,

    exam: {
      id: attempt.exam.id,
      title: attempt.exam.title,
    },

    questions,
  };
};

const submitAnswer = async (attemptId, userId, data) => {
  const { questionId, selectedAnswer } = data;

  return await prisma.$transaction(async (tx) => {
    const attempt = await tx.attempt.findUnique({
      where: {
        id: attemptId,
      },

      include: {
        exam: {
          include: {
            booklets: {
              include: {
                booklet: {
                  include: {
                    questions: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new AppError("Attempt not found", 404);
    }

    if (attempt.studentId !== userId) {
      throw new AppError("Forbidden", 403);
    }

    const questionExists = attempt.exam.booklets.some((examBooklet) =>
      examBooklet.booklet.questions.some(
        (question) => question.questionId === questionId,
      ),
    );

    if (!questionExists) {
      throw new AppError("Question does not belong to this exam", 400);
    }

    const question = await tx.question.findUnique({
      where: {
        id: questionId,
      },
    });

    if (!question) {
      throw new AppError("Question not found", 404);
    }

    const isCorrect = question.correctAnswer === selectedAnswer;

    return await tx.attemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId,

          questionId,
        },
      },

      update: {
        selectedAnswer,

        isCorrect,

        answeredAt: new Date(),
      },

      create: {
        attemptId,

        questionId,

        selectedAnswer,

        isCorrect,

        answeredAt: new Date(),
      },
    });
  });
};

const submitAttempt = async (attemptId, userId) => {
  const attempt = await prisma.attempt.findUnique({
    where: {
      id: attemptId,
    },

    include: {
      answers: {
        include: {
          question: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }

  if (attempt.studentId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  if (attempt.status === "submitted") {
    throw new AppError("Attempt already submitted", 400);
  }

  const correctAnswers = attempt.answers.filter(
    (answer) => answer.isCorrect,
  ).length;

  const wrongAnswers = attempt.answers.filter(
    (answer) => !answer.isCorrect && answer.selectedAnswer !== null,
  ).length;

  const unansweredQuestions = await prisma.bookletQuestion.count({
    where: {
      booklet: {
        examBooklets: {
          some: {
            examId: attempt.examId,
          },
        },
      },

      questionId: {
        notIn: attempt.answers.map((answer) => answer.questionId),
      },
    },
  });

  const negativeScore = Math.floor(wrongAnswers / 3);

  const finalScore = Math.max(correctAnswers - negativeScore, 0);

  const totalQuestions = correctAnswers + wrongAnswers + unansweredQuestions;

  const percentage =
    totalQuestions > 0
      ? Number(((finalScore / totalQuestions) * 100).toFixed(2))
      : 0;

  const subjectMap = {};
  for (const answer of attempt.answers) {
    const lesson = answer.question.lesson;

    if (!subjectMap[lesson]) {
      subjectMap[lesson] = {
        lesson,
        correct: 0,
        wrong: 0,
        unanswered: 0,
      };
    }
    if (answer.selectedAnswer === null) {
      subjectMap[lesson].unanswered++;
    } else if (answer.isCorrect) {
      subjectMap[lesson].correct++;
    } else {
      subjectMap[lesson].wrong++;
    }
  }

  const subjects = Object.values(subjectMap).map((subject) => {
    const total = subject.correct + subject.wrong + subject.unanswered;

    return {
      ...subject,

      percentage:
        total > 0 ? Number(((subject.correct / total) * 100).toFixed(2)) : 0,
    };
  });

  const analysis = {
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    unansweredQuestions,
    negativeScore,
    finalScore,
    percentage,
    subjects,
  };

  const updatedAttempt = await prisma.attempt.update({
    where: {
      id: attemptId,
    },

    data: {
      status: "submitted",

      submittedAt: new Date(),

      score: finalScore,

      analysis,
    },
  });

  return updatedAttempt;
};

const getAttemptResult = async (attemptId, userId) => {
  const attempt = await prisma.attempt.findUnique({
    where: {
      id: attemptId,
    },

    include: {
      exam: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }

  if (attempt.studentId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  const analysis = attempt.analysis || {};

  const totalQuestions = analysis.totalQuestions || 0;

  const percentage =
    totalQuestions > 0
      ? Number(((attempt.score / totalQuestions) * 100).toFixed(2))
      : 0;

  return {
    attemptId: attempt.id,

    exam: attempt.exam,

    result: {
      score: attempt.score,

      totalQuestions,

      correctAnswers: analysis.correctAnswers || 0,

      wrongAnswers: analysis.wrongAnswers || 0,

      unansweredQuestions: analysis.unansweredQuestions || 0,

      negativeScore: analysis.negativeScore || 0,

      percentage,
    },
  };
};

const getMyAttempts = async (studentId) => {
  const attempts = await prisma.attempt.findMany({
    where: {
      studentId,
    },

    include: {
      exam: {
        select: {
          id: true,

          title: true,

          examDate: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
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
    where: {
      id: attemptId,
    },

    include: {
      exam: {
        select: {
          id: true,

          title: true,
        },
      },

      answers: {
        include: {
          question: true,
        },

        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!attempt) {
    throw new AppError("Attempt not found", 404);
  }

  if (attempt.studentId !== userId) {
    throw new AppError("Forbidden", 403);
  }

  return {
    attemptId: attempt.id,

    exam: attempt.exam,

    score: attempt.score,

    questions: attempt.answers.map((answer) => ({
      id: answer.question.id,

      questionText: answer.question.questionText,

      questionImage: answer.question.questionImage,

      options: answer.question.options,

      selectedAnswer: answer.selectedAnswer,

      correctAnswer: answer.question.correctAnswer,

      isCorrect: answer.isCorrect,

      explanation: answer.question.explanation,

      explanationPdf: answer.question.explanationPdf,

      difficulty: answer.question.difficulty,

      lesson: answer.question.lesson,

      chapter: answer.question.chapter,
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
