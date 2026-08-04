const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const createQuestion = async (data) => {
  const { createdBy, ...questionData } = data;

  const question = await prisma.question.create({
    data: {
      ...questionData,

      createdBy: {
        connect: {
          id: createdBy,
        },
      },
    },
  });

  return question;
};

const getQuestions = async () => {
  return await prisma.question.findMany({
    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getQuestionById = async (id) => {
  const question = await prisma.question.findUnique({
    where: { id },

    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  return question;
};

const updateQuestion = async (id, data) => {
  const existing = await prisma.question.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Question not found", 404);
  }

  return await prisma.question.update({
    where: { id },

    data,
  });
};

const deleteQuestion = async (id) => {
  const existing = await prisma.question.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Question not found", 404);
  }

  await prisma.question.delete({
    where: { id },
  });
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
