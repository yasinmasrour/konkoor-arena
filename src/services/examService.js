const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const getPagination = require("../utils/pagination");

const getExamOwnerWhere = (user) =>
  user?.role === "ADMIN" ? {} : { createdById: user.id };

const createExam = async (data) => {
  const { createdBy, bookletIds, ...examData } = data;

  const uniqueBookletIds = [...new Set(bookletIds)];
  if (!uniqueBookletIds.length) throw new AppError("At least one booklet is required", 400);

  const booklets = await prisma.booklet.findMany({
    where: { id: { in: uniqueBookletIds } },
    select: { id: true, status: true },
  });

  if (booklets.length !== uniqueBookletIds.length) {
    throw new AppError("One or more booklets not found", 404);
  }

  return prisma.$transaction(async (tx) => {
    const exam = await tx.exam.create({
      data: {
        ...examData,
        createdBy: { connect: { id: createdBy } },
      },
    });

    await tx.examBooklet.createMany({
      data: uniqueBookletIds.map((bookletId, index) => ({
        examId: exam.id,
        bookletId,
        order: index + 1,
      })),
    });

    return tx.exam.findUnique({
      where: { id: exam.id },
      include: {
        booklets: {
          orderBy: { order: "asc" },
          include: { booklet: { include: { questions: true } } },
        },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
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
    ...(search && { title: { contains: search, mode: "insensitive" } }),
    ...(status && { status }),
  };

  const [exams, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      skip,
      take: limit,
      include: {
        booklets: {
          orderBy: { order: "asc" },
          include: { booklet: { include: { questions: true } } },
        },
        createdBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.exam.count({ where }),
  ]);

  return {
    exams: exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      examDate: exam.examDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      status: exam.status,
      booklets: exam.booklets,
      lesson: exam.booklets[0]?.booklet?.lesson || "",
      grade: exam.booklets[0]?.booklet?.grade || "",
      major: exam.booklets[0]?.booklet?.major || "",
      duration: exam.booklets.reduce((sum, item) => sum + (item.booklet?.duration || 0), 0),
      questionCount: exam.booklets.reduce((sum, item) => sum + (item.booklet?.questions?.length || 0), 0),
      createdBy: exam.createdBy,
    })),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getExamById = async (id, user) => {
  const exam = await prisma.exam.findFirst({
    where: { id, ...getExamOwnerWhere(user) },
    include: {
      booklets: {
        orderBy: { order: "asc" },
        include: {
          booklet: {
            include: {
              questions: { orderBy: { order: "asc" }, select: { id: true, questionId: true, order: true, score: true } },
            },
          },
        },
      },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!exam) throw new AppError("Exam not found", 404);
  return exam;
};

const getOwnedExam = async (id, user, include = {}) => {
  const exam = await prisma.exam.findFirst({ where: { id, ...getExamOwnerWhere(user) }, include });
  if (!exam) throw new AppError("Exam not found", 404);
  return exam;
};

const updateExam = async (id, data, user) => {
  const exam = await getOwnedExam(id, user);
  if (exam.status === "published") throw new AppError("Published exams cannot be edited", 409);
  return prisma.exam.update({ where: { id }, data });
};

const addBookletsToExam = async (id, bookletIds, user) => {
  if (!Array.isArray(bookletIds) || bookletIds.length === 0) {
    throw new AppError("bookletIds must be a non-empty array", 400);
  }

  const uniqueIds = [...new Set(bookletIds)];
  const exam = await getOwnedExam(id, user, { booklets: true });
  if (exam.status === "published") throw new AppError("Published exams cannot be edited", 409);

  const booklets = await prisma.booklet.findMany({ where: { id: { in: uniqueIds } }, select: { id: true } });
  if (booklets.length !== uniqueIds.length) throw new AppError("One or more booklets not found", 404);

  const existing = new Set(exam.booklets.map((item) => item.bookletId));
  const toAdd = uniqueIds.filter((bookletId) => !existing.has(bookletId));
  if (!toAdd.length) throw new AppError("All selected booklets are already attached to this exam", 409);

  const maxOrder = exam.booklets.reduce((max, item) => Math.max(max, item.order), 0);

  await prisma.examBooklet.createMany({
    data: toAdd.map((bookletId, index) => ({ examId: id, bookletId, order: maxOrder + index + 1 })),
  });

  return getExamById(id, user);
};

const removeBookletFromExam = async (id, bookletId, user) => {
  const exam = await getOwnedExam(id, user);
  if (exam.status === "published") throw new AppError("Published exams cannot be edited", 409);

  const relation = await prisma.examBooklet.findUnique({
    where: { examId_bookletId: { examId: id, bookletId } },
  });
  if (!relation) throw new AppError("Booklet is not attached to this exam", 404);
  if (exam.booklets.length <= 1) throw new AppError("An exam must contain at least one booklet", 409);

  await prisma.$transaction(async (tx) => {
    await tx.examBooklet.delete({ where: { id: relation.id } });
    const remaining = await tx.examBooklet.findMany({ where: { examId: id }, orderBy: { order: "asc" } });
    for (let index = 0; index < remaining.length; index += 1) {
      await tx.examBooklet.update({ where: { id: remaining[index].id }, data: { order: index + 1 } });
    }
  });

  return getExamById(id, user);
};

const updateBookletOrder = async (id, booklets, user) => {
  if (!Array.isArray(booklets) || !booklets.length) throw new AppError("booklets must be a non-empty array", 400);
  const exam = await getOwnedExam(id, user, { booklets: true });
  if (exam.status === "published") throw new AppError("Published exams cannot be edited", 409);

  const currentIds = exam.booklets.map((item) => item.bookletId).sort();
  const requestedIds = booklets.map((item) => item.id).sort();
  if (currentIds.length !== requestedIds.length || currentIds.some((value, index) => value !== requestedIds[index])) {
    throw new AppError("Booklet order must contain exactly the current booklets", 400);
  }

  const orders = booklets.map((item) => Number(item.order));
  if (new Set(orders).size !== orders.length || orders.some((order) => !Number.isInteger(order) || order < 1 || order > booklets.length)) {
    throw new AppError("Booklet order values are invalid", 400);
  }

  await prisma.$transaction(
    booklets.map((item) => prisma.examBooklet.update({
      where: { examId_bookletId: { examId: id, bookletId: item.id } },
      data: { order: Number(item.order) },
    })),
  );

  return getExamById(id, user);
};

const deleteExam = async (id, user) => {
  const exam = await getOwnedExam(id, user);
  if (exam.status === "published") throw new AppError("Published exams cannot be deleted", 409);
  await prisma.exam.delete({ where: { id } });
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  addBookletsToExam,
  removeBookletFromExam,
  updateBookletOrder,
  deleteExam,
};
