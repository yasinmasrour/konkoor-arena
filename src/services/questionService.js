const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const getPagination = require("../utils/pagination");
const ROLES = require("../constants/roles");
const { QUESTION_STATUS } = require("../constants/question");
const XLSX = require("xlsx");
const { QUESTION_REVIEW_DECISION } = require("../constants/questionReview");

const questionAuthorSelect = {
  id: true,
  firstName: true,
  lastName: true,
};

const ensureQuestionAccess = (question, user) => {
  if (user.role === ROLES.ADMIN) {
    return;
  }

  if (
    user.role === ROLES.QUESTION_DESIGNER &&
    question.createdById === user.id
  ) {
    return;
  }

  if (user.role === ROLES.COUNSELOR) {
    return;
  }

  throw new AppError("Forbidden", 403);
};

const createQuestion = async (data) => {
  const { createdBy, ...questionData } = data;

  return prisma.question.create({
    data: {
      ...questionData,
      status: questionData.status || QUESTION_STATUS.DRAFT,
      createdBy: {
        connect: {
          id: createdBy,
        },
      },
    },
    include: {
      createdBy: {
        select: questionAuthorSelect,
      },
    },
  });
};

const buildWhere = (query, user) => {
  const {
    search,
    lesson,
    grade,
    major,
    chapter,
    difficulty,
    status,
    createdById,
    isArena,
  } = query;

  const where = {
    ...(search && {
      OR: [
        { questionText: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { topic: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(lesson && { lesson }),
    ...(grade && { grade }),
    ...(major && { major }),
    ...(chapter && { chapter }),
    ...(difficulty && { difficulty }),
    ...(status && { status }),
    ...(createdById && { createdById }),
    ...(isArena !== undefined && {
      isArena: isArena === true || isArena === "true",
    }),
  };

  if (user.role === ROLES.QUESTION_DESIGNER) {
    where.createdById = user.id;
  }

  return where;
};

const getQuestions = async (query, user) => {
  const { page, limit, skip } = getPagination(query);
  const { sort = "createdAt", order = "desc" } = query;
  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "code",
    "lesson",
    "grade",
    "chapter",
    "difficulty",
    "status",
    "usageCount",
    "isArena",
  ];

  const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";
  const sortOrder = order === "asc" ? "asc" : "desc";
  const where = buildWhere(query, user);

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      include: {
        createdBy: {
          select: questionAuthorSelect,
        },
      },
      orderBy: {
        [sortField]: sortOrder,
      },
    }),
    prisma.question.count({ where }),
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

const getQuestionById = async (id, user) => {
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: questionAuthorSelect,
      },
    },
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  ensureQuestionAccess(question, user);

  return question;
};

const updateQuestion = async (id, data, user) => {
  const existing = await prisma.question.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Question not found", 404);
  }

  ensureQuestionAccess(existing, user);

  if (
    user.role === ROLES.QUESTION_DESIGNER &&
    existing.status === QUESTION_STATUS.PUBLISHED
  ) {
    throw new AppError(
      "Published questions cannot be edited by a question designer",
      403,
    );
  }

  if (data.status && user.role !== ROLES.ADMIN) {
    throw new AppError("Only an admin can change question status", 403);
  }

  const { createdById, usageCount, ...safeData } = data;

  return prisma.question.update({
    where: { id },
    data: safeData,
    include: {
      createdBy: {
        select: questionAuthorSelect,
      },
    },
  });
};

const submitQuestionForReview = async (id, user) => {
  const question = await prisma.question.findUnique({
    where: { id },
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  if (user.role !== ROLES.QUESTION_DESIGNER && user.role !== ROLES.ADMIN) {
    throw new AppError(
      "Only a question designer can submit a question for review",
      403,
    );
  }

  ensureQuestionAccess(question, user);

  if (question.status !== QUESTION_STATUS.DRAFT) {
    throw new AppError("Only draft questions can be submitted for review", 400);
  }

  return prisma.question.update({
    where: { id },
    data: { status: QUESTION_STATUS.REVIEW },
    include: {
      createdBy: {
        select: questionAuthorSelect,
      },
    },
  });
};

const setQuestionStatus = async (id, status, user) => {
  const question = await prisma.question.findUnique({
    where: { id },
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  if (user.role !== ROLES.ADMIN) {
    throw new AppError(
      "Only an admin can approve, publish, or archive questions",
      403,
    );
  }

  const allowedTransitions = {
    [QUESTION_STATUS.DRAFT]: [
      QUESTION_STATUS.PUBLISHED,
      QUESTION_STATUS.ARCHIVED,
    ],
    [QUESTION_STATUS.REVIEW]: [
      QUESTION_STATUS.DRAFT,
      QUESTION_STATUS.PUBLISHED,
      QUESTION_STATUS.ARCHIVED,
    ],
    [QUESTION_STATUS.PUBLISHED]: [
      QUESTION_STATUS.ARCHIVED,
      QUESTION_STATUS.DRAFT,
    ],
    [QUESTION_STATUS.ARCHIVED]: [QUESTION_STATUS.DRAFT],
  };

  if (!allowedTransitions[question.status]?.includes(status)) {
    throw new AppError(
      `Cannot change question status from ${question.status} to ${status}`,
      400,
    );
  }

  return prisma.question.update({
    where: { id },
    data: { status },
    include: {
      createdBy: {
        select: questionAuthorSelect,
      },
    },
  });
};

const duplicateQuestion = async (id, user) => {
  const existing = await prisma.question.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Question not found", 404);
  }

  ensureQuestionAccess(existing, user);

  if (user.role !== ROLES.ADMIN && user.role !== ROLES.QUESTION_DESIGNER) {
    throw new AppError(
      "Only an admin or question designer can duplicate questions",
      403,
    );
  }

  const baseCode = `${existing.code}-COPY`;
  let code = `${baseCode}-${Date.now().toString(36).toUpperCase()}`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.question.create({
        data: {
          code,
          lesson: existing.lesson,
          grade: existing.grade,
          major: existing.major,
          chapter: existing.chapter,
          topic: existing.topic,
          questionText: existing.questionText,
          questionImage: existing.questionImage,
          options: existing.options,
          correctAnswer: existing.correctAnswer,
          explanation: existing.explanation,
          explanationPdf: existing.explanationPdf,
          source: existing.source,
          author: existing.author,
          year: existing.year,
          difficulty: existing.difficulty,
          tags: existing.tags,
          usageCount: 0,
          status: QUESTION_STATUS.DRAFT,
          createdBy: {
            connect: { id: user.id },
          },
        },
        include: {
          createdBy: {
            select: questionAuthorSelect,
          },
        },
      });
    } catch (error) {
      if (error?.code !== "P2002") {
        throw error;
      }

      code = `${baseCode}-${Date.now().toString(36).toUpperCase()}-${attempt + 1}`;
    }
  }

  throw new AppError("Could not generate a unique question code", 409);
};

const bulkSetQuestionStatus = async (ids, status, user) => {
  if (user.role !== ROLES.ADMIN) {
    throw new AppError(
      "Only an admin can change question statuses in bulk",
      403,
    );
  }

  const questions = await prisma.question.findMany({
    where: { id: { in: ids } },
    select: { id: true, status: true },
  });

  if (questions.length !== ids.length) {
    throw new AppError("One or more questions were not found", 404);
  }

  const allowedTransitions = {
    [QUESTION_STATUS.DRAFT]: [
      QUESTION_STATUS.PUBLISHED,
      QUESTION_STATUS.ARCHIVED,
    ],
    [QUESTION_STATUS.REVIEW]: [
      QUESTION_STATUS.DRAFT,
      QUESTION_STATUS.PUBLISHED,
      QUESTION_STATUS.ARCHIVED,
    ],
    [QUESTION_STATUS.PUBLISHED]: [
      QUESTION_STATUS.ARCHIVED,
      QUESTION_STATUS.DRAFT,
    ],
    [QUESTION_STATUS.ARCHIVED]: [QUESTION_STATUS.DRAFT],
  };

  const invalid = questions.find(
    (question) => !allowedTransitions[question.status]?.includes(status),
  );
  if (invalid) {
    throw new AppError(
      `Cannot change question status from ${invalid.status} to ${status}`,
      400,
    );
  }

  await prisma.question.updateMany({
    where: { id: { in: ids } },
    data: { status },
  });

  return prisma.question.findMany({
    where: { id: { in: ids } },
    include: { createdBy: { select: questionAuthorSelect } },
    orderBy: { updatedAt: "desc" },
  });
};

const exportQuestions = async (query, user) => {
  const format = query.format === "xlsx" ? "xlsx" : "csv";
  const ids =
    typeof query.ids === "string"
      ? query.ids
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [];

  const where = ids.length ? { id: { in: ids } } : buildWhere(query, user);
  const questions = await prisma.question.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (
    user.role === ROLES.QUESTION_DESIGNER &&
    questions.some((question) => question.createdById !== user.id)
  ) {
    throw new AppError("Forbidden", 403);
  }

  if (questions.length > 1000) {
    throw new AppError("Export is limited to 1000 questions at a time", 400);
  }

  const rows = questions.map((question) => ({
    code: question.code,
    lesson: question.lesson,
    grade: question.grade,
    major: question.major,
    chapter: question.chapter,
    questionText: question.questionText,
    option1: question.options[0] || "",
    option2: question.options[1] || "",
    option3: question.options[2] || "",
    option4: question.options[3] || "",
    correctAnswer: question.correctAnswer + 1,
    questionImage: question.questionImage,
    topic: question.topic,
    explanation: question.explanation,
    explanationPdf: question.explanationPdf,
    source: question.source,
    author: question.author,
    year: question.year ?? "",
    difficulty: question.difficulty,
    tags: question.tags.join(","),
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");

  const buffer =
    format === "xlsx"
      ? XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
      : Buffer.concat([
          Buffer.from("\uFEFF", "utf8"),
          XLSX.write(workbook, { type: "buffer", bookType: "csv", FS: "," }),
        ]);

  return {
    buffer,
    format,
    filename: `griffin-questions-${new Date().toISOString().slice(0, 10)}.${format}`,
    count: questions.length,
  };
};

const getQuestionAnalytics = async (user) => {
  const where = {};
  if (user.role === ROLES.QUESTION_DESIGNER) {
    where.createdById = user.id;
  }

  const [
    total,
    statusGroups,
    difficultyGroups,
    lessonGroups,
    gradeGroups,
    majorGroups,
    usageAggregate,
    unusedCount,
    publishedUnusedCount,
    reviewCount,
    draftCount,
    publishedCount,
    archivedCount,
    arenaCount,
    notArenaCount,
    publishedArenaCount,
    recentQuestions,
  ] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.groupBy({ by: ["status"], where, _count: { _all: true } }),
    prisma.question.groupBy({
      by: ["difficulty"],
      where,
      _count: { _all: true },
    }),
    prisma.question.groupBy({
      by: ["lesson"],
      where,
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.question.groupBy({
      by: ["grade"],
      where,
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.question.groupBy({
      by: ["major"],
      where,
      _count: { _all: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.question.aggregate({ where, _sum: { usageCount: true } }),
    prisma.question.count({ where: { ...where, usageCount: 0 } }),
    prisma.question.count({
      where: { ...where, usageCount: 0, status: QUESTION_STATUS.PUBLISHED },
    }),
    prisma.question.count({
      where: { ...where, status: QUESTION_STATUS.REVIEW },
    }),
    prisma.question.count({
      where: { ...where, status: QUESTION_STATUS.DRAFT },
    }),
    prisma.question.count({
      where: { ...where, status: QUESTION_STATUS.PUBLISHED },
    }),
    prisma.question.count({
      where: { ...where, status: QUESTION_STATUS.ARCHIVED },
    }),
    prisma.question.count({ where: { ...where, isArena: true } }),
    prisma.question.count({ where: { ...where, isArena: false } }),
    prisma.question.count({
      where: { ...where, isArena: true, status: QUESTION_STATUS.PUBLISHED },
    }),
    prisma.question.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        code: true,
        lesson: true,
        status: true,
        difficulty: true,
        usageCount: true,
        updatedAt: true,
      },
    }),
  ]);

  const toGroups = (groups, key) =>
    groups.map((group) => ({
      [key]: group[key],
      count: group._count._all,
    }));

  return {
    totals: {
      total,
      draft: draftCount,
      review: reviewCount,
      published: publishedCount,
      archived: archivedCount,
      unused: unusedCount,
      publishedUnused: publishedUnusedCount,
      totalUsage: usageAggregate._sum.usageCount || 0,
      arena: arenaCount,
      notArena: notArenaCount,
      publishedArena: publishedArenaCount,
    },
    status: toGroups(statusGroups, "status"),
    difficulty: toGroups(difficultyGroups, "difficulty"),
    lessons: toGroups(lessonGroups, "lesson"),
    grades: toGroups(gradeGroups, "grade"),
    majors: toGroups(majorGroups, "major"),
    recentQuestions,
    generatedAt: new Date().toISOString(),
  };
};

const deleteQuestion = async (id) => {
  const existing = await prisma.question.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError("Question not found", 404);
  }

  if (existing.usageCount > 0) {
    throw new AppError(
      "Used questions cannot be deleted; archive the question instead",
      409,
    );
  }

  await prisma.question.delete({
    where: { id },
  });
};

const reviewerSelect = {
  id: true,
  firstName: true,
  lastName: true,
};

const getReviewQueue = async (query, user) => {
  if (user.role !== ROLES.ADMIN) {
    throw new AppError(
      "Only an admin can access the question review queue",
      403,
    );
  }

  const { page, limit, skip } = getPagination(query);
  const search = typeof query.search === "string" ? query.search.trim() : "";

  const where = {
    status: QUESTION_STATUS.REVIEW,
    ...(search && {
      OR: [
        { questionText: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { topic: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(query.lesson && { lesson: query.lesson }),
    ...(query.grade && { grade: query.grade }),
    ...(query.major && { major: query.major }),
    ...(query.difficulty && { difficulty: query.difficulty }),
  };

  const [questions, total] = await Promise.all([
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      include: {
        createdBy: { select: questionAuthorSelect },
      },
      orderBy: { updatedAt: "asc" },
    }),
    prisma.question.count({ where }),
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

const getQuestionReviewDetails = async (id, user) => {
  if (user.role !== ROLES.ADMIN) {
    throw new AppError("Only an admin can review questions", 403);
  }

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      createdBy: { select: questionAuthorSelect },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { reviewer: { select: reviewerSelect } },
      },
    },
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  return question;
};

const reviewQuestion = async (id, decision, note, user) => {
  if (user.role !== ROLES.ADMIN) {
    throw new AppError("Only an admin can review questions", 403);
  }

  const normalizedNote = typeof note === "string" ? note.trim() : "";
  if (
    decision === QUESTION_REVIEW_DECISION.CHANGES_REQUESTED &&
    !normalizedNote
  ) {
    throw new AppError(
      "A review note is required when requesting changes",
      400,
    );
  }

  const nextStatus = {
    [QUESTION_REVIEW_DECISION.APPROVED]: QUESTION_STATUS.PUBLISHED,
    [QUESTION_REVIEW_DECISION.CHANGES_REQUESTED]: QUESTION_STATUS.DRAFT,
    [QUESTION_REVIEW_DECISION.ARCHIVED]: QUESTION_STATUS.ARCHIVED,
  }[decision];

  if (!nextStatus) {
    throw new AppError("Invalid review decision", 400);
  }

  return prisma.$transaction(async (tx) => {
    const question = await tx.question.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!question) {
      throw new AppError("Question not found", 404);
    }

    if (question.status !== QUESTION_STATUS.REVIEW) {
      throw new AppError("Only questions in review can be reviewed", 409);
    }

    await tx.questionReview.create({
      data: {
        questionId: id,
        reviewerId: user.id,
        decision,
        note: normalizedNote,
      },
    });

    const updatedQuestion = await tx.question.update({
      where: { id },
      data: { status: nextStatus },
      include: {
        createdBy: { select: questionAuthorSelect },
        reviews: {
          orderBy: { createdAt: "desc" },
          include: { reviewer: { select: reviewerSelect } },
        },
      },
    });

    return updatedQuestion;
  });
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  submitQuestionForReview,
  setQuestionStatus,
  duplicateQuestion,
  bulkSetQuestionStatus,
  deleteQuestion,
  exportQuestions,
  getQuestionAnalytics,
  getReviewQueue,
  getQuestionReviewDetails,
  reviewQuestion,
};
