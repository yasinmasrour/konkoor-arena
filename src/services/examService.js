const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const getPagination = require("../utils/pagination");

const createExam = async (data) => {
  const { createdBy, bookletIds, ...examData } = data;

  const booklets = await prisma.booklet.findMany({
    where: {
      id: {
        in: bookletIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (booklets.length !== bookletIds.length) {
    throw new AppError("One or more booklets not found", 404);
  }

  return await prisma.$transaction(async (tx) => {
    const exam = await tx.exam.create({
      data: {
        ...examData,

        createdBy: {
          connect: {
            id: createdBy,
          },
        },
      },
    });

    await tx.examBooklet.createMany({
      data: bookletIds.map((bookletId, index) => ({
        examId: exam.id,

        bookletId,

        order: index + 1,
      })),
    });

    return await tx.exam.findUnique({
      where: {
        id: exam.id,
      },

      include: {
        booklets: {
          include: {
            booklet: true,
          },
        },

        createdBy: {
          select: {
            id: true,

            firstName: true,

            lastName: true,
          },
        },
      },
    });
  });
};

const getExams = async (query) => {
  const { page, limit, skip } = getPagination(query);

  const { search, status, sort = "createdAt", order = "desc" } = query;

  const allowedSortFields = ["title", "examDate", "status", "createdAt"];

  const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";

  const sortOrder = order === "asc" ? "asc" : "desc";

  const where = {
    ...(search && {
      title: {
        contains: search,
        mode: "insensitive",
      },
    }),

    ...(status && {
      status,
    }),
  };

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,

      skip,

      take: limit,

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

        createdBy: {
          select: {
            firstName: true,

            lastName: true,
          },
        },
      },

      orderBy: {
        [sortField]: sortOrder,
      },
    }),

    prisma.exam.count({
      where,
    }),
  ]);

  const formattedExams = exams.map((exam) => {
    const booklet = exam.booklets[0]?.booklet;

    return {
      id: exam.id,

      title: exam.title,

      examDate: exam.examDate,

      startTime: exam.startTime,

      endTime: exam.endTime,

      status: exam.status,

      lesson: booklet?.lesson || "",

      grade: booklet?.grade || "",

      major: booklet?.major || "",

      duration: booklet?.duration || 0,

      questionCount: booklet?.questions?.length || 0,

      createdBy: exam.createdBy,
    };
  });

  return {
    exams: formattedExams,

    pagination: {
      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),
    },
  };
};

const getExamById = async (id) => {
  const exam = await prisma.exam.findUnique({
    where: {
      id,
    },

    include: {
      booklets: {
        include: {
          booklet: {
            include: {
              questions: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  return exam;
};

const updateExam = async (id, data) => {
  const exam = await prisma.exam.findUnique({
    where: {
      id,
    },
  });

  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  return await prisma.exam.update({
    where: {
      id,
    },

    data,
  });
};

const deleteExam = async (id) => {
  const exam = await prisma.exam.findUnique({
    where: {
      id,
    },
  });

  if (!exam) {
    throw new AppError("Exam not found", 404);
  }

  await prisma.exam.delete({
    where: {
      id,
    },
  });
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
};
