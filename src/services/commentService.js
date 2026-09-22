const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const {
  COMMENT_STATUS,
  REACTION_TYPE,
  COMMENT_LIMITS,
} = require("../constants/comment");
const ROLES = require("../constants/roles");
const { hasExamAccess } = require("../utils/accessHelper");

function isAdmin(user) {
  return user?.role?.name === ROLES.ADMIN;
}

const userSelect = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    username: true,
    role: {
      select: {
        name: true,
      },
    },
  },
};

async function getRepliesCount(commentId) {
  return prisma.examComment.count({
    where: {
      parentId: commentId,
      status: COMMENT_STATUS.APPROVED,
    },
  });
}

async function getUserReaction(commentId, userId) {
  if (!userId) return null;
  const reaction = await prisma.commentReaction.findUnique({
    where: {
      userId_commentId: { userId, commentId },
    },
    select: { type: true },
  });
  return reaction?.type || null;
}

/**
 * لیست کامنتهای ریشه یه آزمون (approved)
 * @param {string} examId
 * @param {object} options
 * @param {string} [options.userId] - برای چک reaction کاربر
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 */
async function getExamComments(examId, { userId, page = 1, limit = 20 } = {}) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true },
  });
  if (!exam) throw new AppError("آزمون پیدا نشد", 404);

  const where = {
    examId,
    parentId: null,
    status: COMMENT_STATUS.APPROVED,
  };

  const [comments, total] = await Promise.all([
    prisma.examComment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: userSelect,
        _count: {
          select: {
            replies: {
              where: { status: COMMENT_STATUS.APPROVED },
            },
          },
        },
      },
    }),
    prisma.examComment.count({ where }),
  ]);

  let userReactions = {};
  if (userId && comments.length > 0) {
    const reactions = await prisma.commentReaction.findMany({
      where: {
        userId,
        commentId: { in: comments.map((c) => c.id) },
      },
      select: { commentId: true, type: true },
    });
    userReactions = reactions.reduce((acc, r) => {
      acc[r.commentId] = r.type;
      return acc;
    }, {});
  }

  return {
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      rating: c.rating,
      likes: c.likes,
      dislikes: c.dislikes,
      status: c.status,
      createdAt: c.createdAt,
      author: {
        id: c.user.id,
        firstName: c.user.firstName,
        lastName: c.user.lastName,
        username: c.user.username,
        isAdmin: isAdmin(c.user),
      },
      repliesCount: c._count.replies,
      myReaction: userReactions[c.id] || null,
      isOwner: userId === c.userId,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getCommentReplies(
  commentId,
  { userId, page = 1, limit = 20 } = {},
) {
  const parent = await prisma.examComment.findUnique({
    where: { id: commentId },
    select: { id: true, status: true },
  });
  if (!parent) throw new AppError("کامنت پیدا نشد", 404);

  const where = {
    parentId: commentId,
    status: COMMENT_STATUS.APPROVED,
  };

  const [replies, total] = await Promise.all([
    prisma.examComment.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: userSelect,
        _count: {
          select: {
            replies: {
              where: { status: COMMENT_STATUS.APPROVED },
            },
          },
        },
      },
    }),
    prisma.examComment.count({ where }),
  ]);

  let userReactions = {};
  if (userId && replies.length > 0) {
    const reactions = await prisma.commentReaction.findMany({
      where: {
        userId,
        commentId: { in: replies.map((r) => r.id) },
      },
      select: { commentId: true, type: true },
    });
    userReactions = reactions.reduce((acc, r) => {
      acc[r.commentId] = r.type;
      return acc;
    }, {});
  }

  return {
    replies: replies.map((c) => ({
      id: c.id,
      content: c.content,
      likes: c.likes,
      dislikes: c.dislikes,
      status: c.status,
      createdAt: c.createdAt,
      parentId: c.parentId,
      author: {
        id: c.user.id,
        firstName: c.user.firstName,
        lastName: c.user.lastName,
        username: c.user.username,
        isAdmin: isAdmin(c.user),
      },
      repliesCount: c._count.replies,
      myReaction: userReactions[c.id] || null,
      isOwner: userId === c.userId,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getMyComments(userId, { page = 1, limit = 20 } = {}) {
  const where = {
    userId,
    status: { not: COMMENT_STATUS.DELETED },
  };

  const [comments, total] = await Promise.all([
    prisma.examComment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            examDate: true,
          },
        },
        _count: {
          select: {
            replies: {
              where: { status: COMMENT_STATUS.APPROVED },
            },
          },
        },
      },
    }),
    prisma.examComment.count({ where }),
  ]);

  return {
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      rating: c.rating,
      status: c.status,
      likes: c.likes,
      dislikes: c.dislikes,
      createdAt: c.createdAt,
      parentId: c.parentId,
      exam: c.exam,
      repliesCount: c._count.replies,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getExamCommentStats(examId) {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true },
  });
  if (!exam) throw new AppError("آزمون پیدا نشد", 404);

  const [stats, totalComments] = await Promise.all([
    prisma.examComment.aggregate({
      where: {
        examId,
        parentId: null,
        status: COMMENT_STATUS.APPROVED,
        rating: { not: null },
      },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.examComment.count({
      where: {
        examId,
        status: COMMENT_STATUS.APPROVED,
      },
    }),
  ]);

  return {
    averageRating: stats._avg.rating
      ? Math.round(stats._avg.rating * 10) / 10
      : null,
    ratingsCount: stats._count.rating,
    totalComments,
  };
}

async function createComment({ userId, examId, content, rating }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });

  const hasAccess = await hasExamAccess(userId, examId, user?.role?.name);
  if (!hasAccess) {
    throw new AppError(
      "برای ثبت کامنت باید اشتراک مناسب داشته باشید یا این آزمون را خریداری کنید",
      403,
    );
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true },
  });
  if (!exam) throw new AppError("آزمون پیدا نشد", 404);

  const trimmedContent = content?.trim();
  if (!trimmedContent) {
    throw new AppError("متن کامنت الزامی است", 400);
  }
  if (trimmedContent.length < COMMENT_LIMITS.MIN_CONTENT_LENGTH) {
    throw new AppError(
      `کامنت باید حداقل ${COMMENT_LIMITS.MIN_CONTENT_LENGTH} کاراکتر باشد`,
      400,
    );
  }
  if (trimmedContent.length > COMMENT_LIMITS.MAX_CONTENT_LENGTH) {
    throw new AppError(
      `کامنت باید حداکثر ${COMMENT_LIMITS.MAX_CONTENT_LENGTH} کاراکتر باشد`,
      400,
    );
  }

  let finalRating = null;
  if (rating !== undefined && rating !== null) {
    if (
      !Number.isInteger(rating) ||
      rating < COMMENT_LIMITS.MIN_RATING ||
      rating > COMMENT_LIMITS.MAX_RATING
    ) {
      throw new AppError(
        `امتیاز باید بین ${COMMENT_LIMITS.MIN_RATING} و ${COMMENT_LIMITS.MAX_RATING} باشد`,
        400,
      );
    }
    finalRating = rating;
  }

  const adminAuthor = user?.role?.name === ROLES.ADMIN;

  const comment = await prisma.examComment.create({
    data: {
      userId,
      examId,
      content: trimmedContent,
      rating: finalRating,
      status: adminAuthor ? COMMENT_STATUS.APPROVED : COMMENT_STATUS.PENDING,
      ...(adminAuthor && { reviewedAt: new Date() }),
    },
    include: { user: userSelect },
  });

  return {
    id: comment.id,
    content: comment.content,
    rating: comment.rating,
    status: comment.status,
    createdAt: comment.createdAt,
    author: {
      id: comment.user.id,
      firstName: comment.user.firstName,
      lastName: comment.user.lastName,
      username: comment.user.username,
      isAdmin: isAdmin(comment.user),
    },
  };
}

async function createReply({ userId, commentId, content }) {
  const parent = await prisma.examComment.findUnique({
    where: { id: commentId },
    select: { id: true, examId: true, status: true },
  });
  if (!parent) throw new AppError("کامنت پیدا نشد", 404);
  if (parent.status !== COMMENT_STATUS.APPROVED) {
    throw new AppError("نمیتوانید به این کامنت پاسخ دهید", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  const hasAccess = await hasExamAccess(
    userId,
    parent.examId,
    user?.role?.name,
  );
  if (!hasAccess) {
    throw new AppError("دسترسی مجاز نیست", 403);
  }

  const trimmedContent = content?.trim();
  if (!trimmedContent) {
    throw new AppError("متن پاسخ الزامی است", 400);
  }
  if (trimmedContent.length < COMMENT_LIMITS.MIN_CONTENT_LENGTH) {
    throw new AppError(
      `پاسخ باید حداقل ${COMMENT_LIMITS.MIN_CONTENT_LENGTH} کاراکتر باشد`,
      400,
    );
  }
  if (trimmedContent.length > COMMENT_LIMITS.MAX_CONTENT_LENGTH) {
    throw new AppError(
      `پاسخ باید حداکثر ${COMMENT_LIMITS.MAX_CONTENT_LENGTH} کاراکتر باشد`,
      400,
    );
  }

  let depth = 1;
  let currentParentId = parent.id;
  while (currentParentId && depth < COMMENT_LIMITS.MAX_REPLY_DEPTH) {
    const p = await prisma.examComment.findUnique({
      where: { id: currentParentId },
      select: { parentId: true },
    });
    if (!p?.parentId) break;
    currentParentId = p.parentId;
    depth++;
  }
  if (depth >= COMMENT_LIMITS.MAX_REPLY_DEPTH) {
    throw new AppError("حداکثر عمق پاسخها رعایت نشده", 400);
  }

  const adminAuthor = user?.role?.name === ROLES.ADMIN;

  const reply = await prisma.examComment.create({
    data: {
      userId,
      examId: parent.examId,
      parentId: commentId,
      content: trimmedContent,
      status: adminAuthor ? COMMENT_STATUS.APPROVED : COMMENT_STATUS.PENDING,
      ...(adminAuthor && { reviewedAt: new Date() }),
    },
    include: { user: userSelect },
  });

  return {
    id: reply.id,
    content: reply.content,
    status: reply.status,
    createdAt: reply.createdAt,
    parentId: reply.parentId,
    author: {
      id: reply.user.id,
      firstName: reply.user.firstName,
      lastName: reply.user.lastName,
      username: reply.user.username,
      isAdmin: isAdmin(reply.user),
    },
  };
}

async function updateComment({ commentId, userId, content, rating }) {
  const comment = await prisma.examComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, parentId: true, status: true },
  });
  if (!comment) throw new AppError("کامنت پیدا نشد", 404);
  if (comment.userId !== userId) {
    throw new AppError("شما اجازه ویرایش این کامنت را ندارید", 403);
  }
  if (comment.status === COMMENT_STATUS.DELETED) {
    throw new AppError("این کامنت حذف شده است", 400);
  }

  const trimmedContent = content?.trim();
  if (!trimmedContent) {
    throw new AppError("متن کامنت الزامی است", 400);
  }
  if (trimmedContent.length < COMMENT_LIMITS.MIN_CONTENT_LENGTH) {
    throw new AppError(
      `کامنت باید حداقل ${COMMENT_LIMITS.MIN_CONTENT_LENGTH} کاراکتر باشد`,
      400,
    );
  }
  if (trimmedContent.length > COMMENT_LIMITS.MAX_CONTENT_LENGTH) {
    throw new AppError(
      `کامنت باید حداکثر ${COMMENT_LIMITS.MAX_CONTENT_LENGTH} کاراکتر باشد`,
      400,
    );
  }

  const data = {
    content: trimmedContent,
    status: COMMENT_STATUS.PENDING, // بعد ویرایش → دوباره تایید
    reviewedAt: null,
    reviewedById: null,
    reviewNote: null,
  };

  // 🔹 امتیاز فقط برای کامنت ریشه
  if (!comment.parentId && rating !== undefined) {
    if (rating === null) {
      data.rating = null;
    } else {
      if (
        !Number.isInteger(rating) ||
        rating < COMMENT_LIMITS.MIN_RATING ||
        rating > COMMENT_LIMITS.MAX_RATING
      ) {
        throw new AppError(
          `امتیاز باید بین ${COMMENT_LIMITS.MIN_RATING} و ${COMMENT_LIMITS.MAX_RATING} باشد`,
          400,
        );
      }
      data.rating = rating;
    }
  }

  // 🆕 include user + count تا خروجی کامل باشه
  const updated = await prisma.examComment.update({
    where: { id: commentId },
    data,
    include: {
      user: userSelect,
      _count: {
        select: {
          replies: {
            where: { status: COMMENT_STATUS.APPROVED },
          },
        },
      },
    },
  });

  // 🆕 خروجی کامل (شبیه getExamComments)
  return {
    id: updated.id,
    content: updated.content,
    rating: updated.rating,
    likes: updated.likes,
    dislikes: updated.dislikes,
    status: updated.status,
    createdAt: updated.createdAt,
    parentId: updated.parentId,
    author: {
      id: updated.user.id,
      firstName: updated.user.firstName,
      lastName: updated.user.lastName,
      username: updated.user.username,
      isAdmin: isAdmin(updated.user),
    },
    repliesCount: updated._count.replies,
    myReaction: null,
    isOwner: true,
  };
}

async function deleteComment({ commentId, userId }) {
  const comment = await prisma.examComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, status: true },
  });
  if (!comment) throw new AppError("کامنت پیدا نشد", 404);
  if (comment.userId !== userId) {
    throw new AppError("شما اجازه حذف این کامنت را ندارید", 403);
  }
  if (comment.status === COMMENT_STATUS.DELETED) {
    throw new AppError("این کامنت قبلاً حذف شده است", 400);
  }

  await prisma.examComment.update({
    where: { id: commentId },
    data: {
      status: COMMENT_STATUS.DELETED,
      content: "",
    },
  });

  return { success: true };
}

async function reactToComment({ commentId, userId, type }) {
  if (![REACTION_TYPE.LIKE, REACTION_TYPE.DISLIKE].includes(type)) {
    throw new AppError("نوع واکنش نامعتبر است", 400);
  }

  const comment = await prisma.examComment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      userId: true,
      examId: true,
      status: true,
      likes: true,
      dislikes: true,
    },
  });
  if (!comment) throw new AppError("کامنت پیدا نشد", 404);
  if (comment.status !== COMMENT_STATUS.APPROVED) {
    throw new AppError("نمیتوانید به این کامنت واکنش دهید", 400);
  }
  if (comment.userId === userId) {
    throw new AppError("نمیتوانید به کامنت خودتان واکنش دهید", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  const hasAccess = await hasExamAccess(
    userId,
    comment.examId,
    user?.role?.name,
  );
  if (!hasAccess) {
    throw new AppError("برای واکنش باید اشتراک مناسب داشته باشید", 403);
  }

  const existing = await prisma.commentReaction.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });

  return prisma.$transaction(async (tx) => {
    let likes = comment.likes;
    let dislikes = comment.dislikes;

    if (existing) {
      if (existing.type === type) {
        await tx.commentReaction.delete({ where: { id: existing.id } });
        if (type === REACTION_TYPE.LIKE) likes--;
        else dislikes--;
      } else {
        await tx.commentReaction.update({
          where: { id: existing.id },
          data: { type },
        });
        if (type === REACTION_TYPE.LIKE) {
          likes++;
          dislikes--;
        } else {
          dislikes++;
          likes--;
        }
      }
    } else {
      await tx.commentReaction.create({
        data: { userId, commentId, type },
      });
      if (type === REACTION_TYPE.LIKE) likes++;
      else dislikes++;
    }

    const updated = await tx.examComment.update({
      where: { id: commentId },
      data: {
        likes: Math.max(0, likes),
        dislikes: Math.max(0, dislikes),
      },
      select: { likes: true, dislikes: true },
    });

    return {
      likes: updated.likes,
      dislikes: updated.dislikes,
      myReaction: existing?.type === type ? null : type,
    };
  });
}

async function removeReaction({ commentId, userId }) {
  const existing = await prisma.commentReaction.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });
  if (!existing) {
    throw new AppError("واکنشی وجود ندارد", 404);
  }

  return prisma.$transaction(async (tx) => {
    await tx.commentReaction.delete({ where: { id: existing.id } });

    const comment = await tx.examComment.findUnique({
      where: { id: commentId },
      select: { likes: true, dislikes: true },
    });

    const updated = await tx.examComment.update({
      where: { id: commentId },
      data: {
        likes:
          existing.type === REACTION_TYPE.LIKE
            ? Math.max(0, comment.likes - 1)
            : comment.likes,
        dislikes:
          existing.type === REACTION_TYPE.DISLIKE
            ? Math.max(0, comment.dislikes - 1)
            : comment.dislikes,
      },
      select: { likes: true, dislikes: true },
    });

    return {
      likes: updated.likes,
      dislikes: updated.dislikes,
      myReaction: null,
    };
  });
}

async function listCommentsForAdmin({
  status,
  examId,
  page = 1,
  limit = 20,
} = {}) {
  const where = {};
  if (status) where.status = status;
  if (examId) where.examId = examId;

  const [comments, total] = await Promise.all([
    prisma.examComment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: userSelect,
        exam: {
          select: {
            id: true,
            title: true,
            examDate: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    }),
    prisma.examComment.count({ where }),
  ]);

  return {
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      rating: c.rating,
      status: c.status,
      likes: c.likes,
      dislikes: c.dislikes,
      createdAt: c.createdAt,
      parentId: c.parentId,
      author: {
        id: c.user.id,
        firstName: c.user.firstName,
        lastName: c.user.lastName,
        username: c.user.username,
        isAdmin: isAdmin(c.user),
      },
      exam: c.exam,
      repliesCount: c._count.replies,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function approveComment({ commentId, adminId, note = "" }) {
  const comment = await prisma.examComment.findUnique({
    where: { id: commentId },
    select: { id: true, status: true },
  });
  if (!comment) throw new AppError("کامنت پیدا نشد", 404);
  if (comment.status !== COMMENT_STATUS.PENDING) {
    throw new AppError("این کامنت در وضعیت انتظار نیست", 400);
  }

  return prisma.examComment.update({
    where: { id: commentId },
    data: {
      status: COMMENT_STATUS.APPROVED,
      reviewedById: adminId,
      reviewedAt: new Date(),
      reviewNote: note,
    },
    select: { id: true, status: true, reviewedAt: true },
  });
}

async function rejectComment({ commentId, adminId, note = "" }) {
  const comment = await prisma.examComment.findUnique({
    where: { id: commentId },
    select: { id: true, status: true },
  });
  if (!comment) throw new AppError("کامنت پیدا نشد", 404);
  if (comment.status !== COMMENT_STATUS.PENDING) {
    throw new AppError("این کامنت در وضعیت انتظار نیست", 400);
  }

  return prisma.examComment.update({
    where: { id: commentId },
    data: {
      status: COMMENT_STATUS.REJECTED,
      reviewedById: adminId,
      reviewedAt: new Date(),
      reviewNote: note,
    },
    select: { id: true, status: true, reviewedAt: true },
  });
}

async function deleteCommentByAdmin({ commentId }) {
  const comment = await prisma.examComment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });
  if (!comment) throw new AppError("کامنت پیدا نشد", 404);

  await prisma.examComment.delete({ where: { id: commentId } });

  return { success: true };
}

module.exports = {
  getExamComments,
  getCommentReplies,
  getMyComments,
  getExamCommentStats,
  createComment,
  createReply,
  updateComment,
  deleteComment,
  reactToComment,
  removeReaction,
  listCommentsForAdmin,
  approveComment,
  rejectComment,
  deleteCommentByAdmin,
};
