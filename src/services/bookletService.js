const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const getPagination = require("../utils/pagination");

const createBooklet = async (data) => {
  const { createdBy, ...bookletData } = data;

  return await prisma.booklet.create({
    data: {
      ...bookletData,

      createdBy: {
        connect: {
          id: createdBy,
        },
      },
    },
  });
};

const getBooklets = async (query) => {
  const { page, limit, skip } = getPagination(query);

  const [booklets, total] = await Promise.all([
    prisma.booklet.findMany({
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

        questions: {
          include: {
            question: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.booklet.count(),
  ]);

  return {
    booklets,

    pagination: {
      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    },
  };
};

const getBookletById = async (id) => {
  const booklet = await prisma.booklet.findUnique({
    where: { id },

    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },

      questions: {
        orderBy: {
          order: "asc",
        },

        include: {
          question: true,
        },
      },
    },
  });

  if (!booklet) {
    throw new AppError("Booklet not found", 404);
  }

  return booklet;
};

const updateBooklet = async (id, data) => {
  const existing = await prisma.booklet.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Booklet not found", 404);
  }

  return await prisma.booklet.update({
    where: { id },

    data,
  });
};

const deleteBooklet = async (id) => {
  const existing = await prisma.booklet.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Booklet not found", 404);
  }

  await prisma.booklet.delete({
    where: { id },
  });
};

module.exports = {
  createBooklet,
  getBooklets,
  getBookletById,
  updateBooklet,
  deleteBooklet,
};
