const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const getPagination = require("../utils/pagination");

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

const getQuestions = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      skip,
      take: limit,
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
    }),
    prisma.question.count(),
  ]);
  return {
    questions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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
