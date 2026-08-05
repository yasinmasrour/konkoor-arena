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
  const {
    search,
    lesson,
    grade,
    major,
    chapter,
    sort = "createdAt",
    order = "desc",
  } = query;
  const allowedSortFields = ["createdAt", "lesson", "grade", "chapter"];

  const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";

  const sortOrder = order === "asc" ? "asc" : "desc";
  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where: {
        ...(search && {
          questionText: {
            contains: search,
            mode: "insensitive",
          },
        }),

        ...(lesson && {
          lesson,
        }),

        ...(grade && {
          grade,
        }),

        ...(major && {
          major,
        }),

        ...(chapter && {
          chapter,
        }),
      },
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
        [sortField]: sortOrder,
      },
    }),
    prisma.question.count({
      where: {
        ...(search && {
          questionText: {
            contains: search,
            mode: "insensitive",
          },
        }),

        ...(lesson && {
          lesson,
        }),

        ...(grade && {
          grade,
        }),

        ...(major && {
          major,
        }),

        ...(chapter && {
          chapter,
        }),
      },
    }),
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
