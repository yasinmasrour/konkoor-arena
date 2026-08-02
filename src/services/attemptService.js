const prisma = require("../config/prisma");

const startAttempt = async (studentId, examId) => {
  const exam = await prisma.exam.findUnique({
    where: {
      id: examId,
    },
    include: {
      booklets: {
        include: {
          booklet: {
            include: {
              questions: {
                include: {
                  question: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!exam) {
    throw new Error("Exam not found");
  }

  const existingAttempt = await prisma.attempt.findUnique({
    where: {
      studentId_examId: {
        studentId,
        examId,
      },
    },
  });

  if (existingAttempt) {
    throw new Error("Attempt already exists");
  }

  const attempt = await prisma.attempt.create({
    data: {
      studentId,
      examId,
      startedAt: new Date(),
    },
  });

  return {
    attempt,
    exam,
  };
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
    throw new Error("Attempt not found");
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
    throw new Error("Attempt not found");
  }

  if (attempt.studentId !== userId) {
    throw new Error("Forbidden");
  }

  const questionExists = attempt.exam.booklets.some((examBooklet) =>
    examBooklet.booklet.questions.some(
      (question) => question.questionId === questionId,
    ),
  );

  if (!questionExists) {
    throw new Error("Question does not belong to this exam");
  }

  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });

  if (!question) {
    throw new Error("Question not found");
  }

  const isCorrect = question.correctAnswer === selectedAnswer;

  const answer = await prisma.attemptAnswer.upsert({
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

  return answer;
};

const submitAttempt = async (attemptId, userId) => {
  const attempt = await prisma.attempt.findUnique({
    where: {
      id: attemptId,
    },

    include: {
      answers: true,
    },
  });

  if (!attempt) {
    throw new Error("Attempt not found");
  }

  if (attempt.studentId !== userId) {
    throw new Error("Forbidden");
  }

  if (attempt.status === "submitted") {
    throw new Error("Attempt already submitted");
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
        exams: {
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

  const analysis = {
    totalQuestions,

    correctAnswers,

    wrongAnswers,

    unansweredQuestions,

    negativeScore,

    finalScore,
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

module.exports = {
  startAttempt,
  getAttemptQuestions,
  submitAnswer,
  submitAttempt,
};
