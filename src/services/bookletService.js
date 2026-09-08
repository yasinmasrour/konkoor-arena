const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const getPagination = require("../utils/pagination");

const BOOKLET_STATUSES = Object.freeze({
  DRAFT: "draft",
  REVIEW: "review",
  PUBLISHED: "published",
  ARCHIVED: "archived",
});

const ALLOWED_TRANSITIONS = Object.freeze({
  draft: ["review", "published", "archived"],
  review: ["draft", "published", "archived"],
  published: ["archived", "draft"],
  archived: ["draft"],
});

const contentRoles = ["ADMIN", "COUNSELOR"];

const getOwnerWhere = (user) => {
  if (user.role === "ADMIN") return {};
  return { createdById: user.id };
};

const validateQuestions = async (tx, questionIds) => {
  const uniqueIds = [...new Set(questionIds)];
  if (uniqueIds.length !== questionIds.length) {
    throw new AppError("Duplicate question IDs are not allowed", 400);
  }

  if (uniqueIds.length === 0) return [];

  const questions = await tx.question.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, status: true },
  });

  if (questions.length !== uniqueIds.length) {
    throw new AppError("One or more questions not found", 404);
  }

  const unpublished = questions.filter((question) => question.status !== "published");
  if (unpublished.length > 0) {
    throw new AppError("Only published questions can be added to a booklet", 400);
  }

  return questions;
};

const includeBooklet = {
  createdBy: { select: { id: true, firstName: true, lastName: true } },
  questions: {
    orderBy: { order: "asc" },
    include: {
      question: true,
    },
  },
};

const createBooklet = async ({ createdBy, questionIds = [], ...data }) => {
  return prisma.$transaction(async (tx) => {
    await validateQuestions(tx, questionIds);

    const booklet = await tx.booklet.create({
      data: {
        ...data,
        status: BOOKLET_STATUSES.DRAFT,
        createdBy: { connect: { id: createdBy } },
      },
    });

    if (questionIds.length) {
      await tx.bookletQuestion.createMany({
        data: questionIds.map((questionId, index) => ({
          bookletId: booklet.id,
          questionId,
          order: index + 1,
        })),
      });
    }

    return tx.booklet.findUnique({ where: { id: booklet.id }, include: includeBooklet });
  });
};

const getBooklets = async (query, user) => {
  const { page, limit, skip } = getPagination(query);
  const { search, lesson, grade, major, status, sort = "createdAt", order = "desc" } = query;
  const allowedSortFields = ["createdAt", "updatedAt", "title", "lesson", "grade", "examDate", "duration", "status"];
  const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";
  const sortOrder = order === "asc" ? "asc" : "desc";

  const where = {
    ...getOwnerWhere(user),
    ...(search && { OR: [
      { title: { contains: search, mode: "insensitive" } },
      { lesson: { contains: search, mode: "insensitive" } },
    ] }),
    ...(lesson && { lesson }),
    ...(grade && { grade }),
    ...(major && { major }),
    ...(status && { status }),
  };

  const [booklets, total] = await Promise.all([
    prisma.booklet.findMany({
      where,
      skip,
      take: limit,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { questions: true, examBooklets: true } },
      },
      orderBy: { [sortField]: sortOrder },
    }),
    prisma.booklet.count({ where }),
  ]);

  return { booklets, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getBookletById = async (id, user) => {
  const booklet = await prisma.booklet.findFirst({
    where: { id, ...getOwnerWhere(user) },
    include: includeBooklet,
  });
  if (!booklet) throw new AppError("Booklet not found", 404);
  return booklet;
};

const assertEditable = (booklet) => {
  if (booklet.status === BOOKLET_STATUSES.PUBLISHED) {
    throw new AppError("Published booklets cannot be edited. Move it to draft first.", 409);
  }
};

const updateBooklet = async (id, data, user) => {
  const existing = await prisma.booklet.findFirst({ where: { id, ...getOwnerWhere(user) } });
  if (!existing) throw new AppError("Booklet not found", 404);
  assertEditable(existing);
  return prisma.booklet.update({ where: { id }, data, include: includeBooklet });
};

const setStatus = async (id, status, user) => {
  const existing = await prisma.booklet.findFirst({ where: { id, ...getOwnerWhere(user) } });
  if (!existing) throw new AppError("Booklet not found", 404);

  if (existing.status === status) return existing;
  if (!ALLOWED_TRANSITIONS[existing.status]?.includes(status)) {
    throw new AppError(`Invalid booklet status transition: ${existing.status} -> ${status}`, 400);
  }

  if (status === BOOKLET_STATUSES.REVIEW || status === BOOKLET_STATUSES.PUBLISHED) {
    const count = await prisma.bookletQuestion.count({ where: { bookletId: id } });
    if (count === 0) throw new AppError("A booklet must contain at least one question", 400);
  }

  return prisma.booklet.update({ where: { id }, data: { status }, include: includeBooklet });
};

const addQuestions = async (id, questionIds, user) => {
  const existing = await prisma.booklet.findFirst({ where: { id, ...getOwnerWhere(user) } });
  if (!existing) throw new AppError("Booklet not found", 404);
  assertEditable(existing);

  return prisma.$transaction(async (tx) => {
    await validateQuestions(tx, questionIds);
    const current = await tx.bookletQuestion.findMany({ where: { bookletId: id }, orderBy: { order: "asc" } });
    const currentIds = new Set(current.map((item) => item.questionId));
    const additions = questionIds.filter((questionId) => !currentIds.has(questionId));
    if (!additions.length) throw new AppError("All selected questions are already in the booklet", 409);

    let nextOrder = current.length ? Math.max(...current.map((item) => item.order)) + 1 : 1;
    await tx.bookletQuestion.createMany({
      data: additions.map((questionId) => ({ bookletId: id, questionId, order: nextOrder++ })),
    });
    return tx.booklet.findUnique({ where: { id }, include: includeBooklet });
  });
};

const removeQuestion = async (id, questionId, user) => {
  const existing = await prisma.booklet.findFirst({ where: { id, ...getOwnerWhere(user) } });
  if (!existing) throw new AppError("Booklet not found", 404);
  assertEditable(existing);

  await prisma.$transaction(async (tx) => {
    const item = await tx.bookletQuestion.findUnique({ where: { bookletId_questionId: { bookletId: id, questionId } } });
    if (!item) throw new AppError("Question is not in this booklet", 404);
    await tx.bookletQuestion.delete({ where: { id: item.id } });
    const remaining = await tx.bookletQuestion.findMany({ where: { bookletId: id }, orderBy: { order: "asc" } });
    for (let index = 0; index < remaining.length; index += 1) {
      if (remaining[index].order !== index + 1) {
        await tx.bookletQuestion.update({ where: { id: remaining[index].id }, data: { order: index + 1 } });
      }
    }
  });

  return getBookletById(id, user);
};

const reorderQuestions = async (id, questionIds, user) => {
  const existing = await prisma.booklet.findFirst({ where: { id, ...getOwnerWhere(user) } });
  if (!existing) throw new AppError("Booklet not found", 404);
  assertEditable(existing);

  return prisma.$transaction(async (tx) => {
    const current = await tx.bookletQuestion.findMany({ where: { bookletId: id }, select: { id: true, questionId: true } });
    const currentIds = current.map((item) => item.questionId);
    if (currentIds.length !== questionIds.length || currentIds.some((qid) => !questionIds.includes(qid))) {
      throw new AppError("Reorder payload must contain exactly the booklet's questions", 400);
    }
    for (let index = 0; index < questionIds.length; index += 1) {
      const item = current.find((candidate) => candidate.questionId === questionIds[index]);
      await tx.bookletQuestion.update({ where: { id: item.id }, data: { order: index + 1 } });
    }
    return tx.booklet.findUnique({ where: { id }, include: includeBooklet });
  });
};

const duplicateBooklet = async (id, user) => {
  const existing = await getBookletById(id, user);
  return prisma.$transaction(async (tx) => {
    const copy = await tx.booklet.create({
      data: {
        title: existing.title ? `${existing.title} - Copy` : "Booklet Copy",
        lesson: existing.lesson,
        grade: existing.grade,
        major: existing.major,
        examDate: existing.examDate,
        duration: existing.duration,
        status: BOOKLET_STATUSES.DRAFT,
        createdById: user.id,
      },
    });
    if (existing.questions.length) {
      await tx.bookletQuestion.createMany({
        data: existing.questions.map((item) => ({ bookletId: copy.id, questionId: item.questionId, order: item.order, score: item.score })),
      });
    }
    return tx.booklet.findUnique({ where: { id: copy.id }, include: includeBooklet });
  });
};

const deleteBooklet = async (id, user) => {
  const existing = await prisma.booklet.findFirst({ where: { id, ...getOwnerWhere(user) }, include: { examBooklets: true } });
  if (!existing) throw new AppError("Booklet not found", 404);
  if (existing.examBooklets.length) throw new AppError("Booklets used by exams cannot be deleted", 409);
  if (existing.status === BOOKLET_STATUSES.PUBLISHED) throw new AppError("Published booklets cannot be deleted", 409);
  await prisma.booklet.delete({ where: { id } });
};

module.exports = {
  contentRoles,
  BOOKLET_STATUSES,
  createBooklet,
  getBooklets,
  getBookletById,
  updateBooklet,
  setStatus,
  addQuestions,
  removeQuestion,
  reorderQuestions,
  duplicateBooklet,
  deleteBooklet,
};
