const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

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

const getBooklets = async () => {
  return await prisma.booklet.findMany({
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
  });
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
