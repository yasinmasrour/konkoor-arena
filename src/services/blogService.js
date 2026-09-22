const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { slugify, generateUniqueSlug } = require("../utils/slugify");
const {
  BLOG_STATUS,
  BLOG_COMMENT_STATUS,
  BLOG_REACTION_TYPE,
  BLOG_CATEGORIES,
  BLOG_LIMITS,
} = require("../constants/blog");

// ==================== Helpers ====================
const authorSelect = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    username: true,
  },
};

const reviewerSelect = {
  select: {
    id: true,
    firstName: true,
    lastName: true,
    username: true,
  },
};

/**
 * چک میکنه یه slug وجود داره یا نه
 */
async function slugExists(slug, excludeId = null) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!post) return false;
  if (excludeId && post.id === excludeId) return false;
  return true;
}

/**
 * خلاصه خودکار اگه نداده باشن
 */
function buildExcerpt(content, excerpt) {
  if (excerpt && excerpt.trim()) return excerpt.trim();
  const plain = content
    .replace(/[#*`_~\[\]()]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return plain.slice(0, 200);
}

// ==================== 🔹 عمومی ====================

/**
 * لیست مقالات منتشرشده
 */
async function getPublishedPosts({
  category,
  tag,
  search,
  featured,
  page = 1,
  limit = BLOG_LIMITS.DEFAULT_PAGE_SIZE,
} = {}) {
  const where = {
    status: BLOG_STATUS.PUBLISHED,
    ...(category && { category }),
    ...(tag && { tags: { has: tag } }),
    ...(featured === true && { isFeatured: true }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        isFeatured: true,
        viewsCount: true,
        likesCount: true,
        dislikesCount: true,
        publishedAt: true,
        createdAt: true,
        author: authorSelect,
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * جزئیات یه مقاله (با viewsCount++)
 */
async function getPublishedPostBySlug(slug, userId = null) {
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: authorSelect,
      reviewedBy: reviewerSelect,
    },
  });

  if (!post || post.status !== BLOG_STATUS.PUBLISHED) {
    throw new AppError("مقاله پیدا نشد", 404);
  }

  // 🔹 آپدیت viewsCount
  await prisma.blogPost.update({
    where: { id: post.id },
    data: { viewsCount: { increment: 1 } },
  });

  // 🔹 reaction کاربر
  let myReaction = null;
  if (userId) {
    const reaction = await prisma.blogPostReaction.findUnique({
      where: {
        userId_postId: { userId, postId: post.id },
      },
      select: { type: true },
    });
    myReaction = reaction?.type ?? null;
  }

  return {
    post: {
      ...post,
      viewsCount: post.viewsCount + 1,
      myReaction,
    },
  };
}

/**
 * لیست دسته‌بندی‌ها
 */
function getCategories() {
  return Object.entries(BLOG_CATEGORIES).map(([key, label]) => ({
    key,
    label,
  }));
}

/**
 * لیست همه تگ‌ها (یکتا)
 */
async function getTags() {
  const posts = await prisma.blogPost.findMany({
    where: { status: BLOG_STATUS.PUBLISHED },
    select: { tags: true },
  });

  const tagSet = new Set();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagSet.add(tag);
    }
  }

  return Array.from(tagSet).sort();
}

// ==================== 🔹 واکنش ====================

async function reactToPost({ postId, userId, type }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true, status: true },
  });

  if (!post || post.status !== BLOG_STATUS.PUBLISHED) {
    throw new AppError("مقاله پیدا نشد", 404);
  }

  const existing = await prisma.blogPostReaction.findUnique({
    where: { userId_postId: { userId, postId } },
  });

  return prisma.$transaction(async (tx) => {
    let likesCount = 0;
    let dislikesCount = 0;

    if (existing) {
      if (existing.type === type) {
        // برداشتن
        await tx.blogPostReaction.delete({ where: { id: existing.id } });
        if (type === BLOG_REACTION_TYPE.LIKE) {
          await tx.blogPost.update({
            where: { id: postId },
            data: { likesCount: { decrement: 1 } },
          });
        } else {
          await tx.blogPost.update({
            where: { id: postId },
            data: { dislikesCount: { decrement: 1 } },
          });
        }
      } else {
        // تغییر
        await tx.blogPostReaction.update({
          where: { id: existing.id },
          data: { type },
        });
        if (type === BLOG_REACTION_TYPE.LIKE) {
          await tx.blogPost.update({
            where: { id: postId },
            data: {
              likesCount: { increment: 1 },
              dislikesCount: { decrement: 1 },
            },
          });
        } else {
          await tx.blogPost.update({
            where: { id: postId },
            data: {
              dislikesCount: { increment: 1 },
              likesCount: { decrement: 1 },
            },
          });
        }
      }
    } else {
      // ایجاد
      await tx.blogPostReaction.create({
        data: { userId, postId, type },
      });
      if (type === BLOG_REACTION_TYPE.LIKE) {
        await tx.blogPost.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        });
      } else {
        await tx.blogPost.update({
          where: { id: postId },
          data: { dislikesCount: { increment: 1 } },
        });
      }
    }

    const updated = await tx.blogPost.findUnique({
      where: { id: postId },
      select: { likesCount: true, dislikesCount: true },
    });

    const finalReaction = await tx.blogPostReaction.findUnique({
      where: { userId_postId: { userId, postId } },
      select: { type: true },
    });

    return {
      likesCount: updated?.likesCount ?? 0,
      dislikesCount: updated?.dislikesCount ?? 0,
      myReaction: finalReaction?.type ?? null,
    };
  });
}

// ==================== 🔹 نظرات ====================

async function getPostComments({
  postId,
  userId = null,
  page = 1,
  limit = 20,
}) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true, status: true },
  });

  if (!post || post.status !== BLOG_STATUS.PUBLISHED) {
    throw new AppError("مقاله پیدا نشد", 404);
  }

  const where = {
    postId,
    parentId: null,
    status: BLOG_COMMENT_STATUS.APPROVED,
  };

  const [comments, total] = await Promise.all([
    prisma.blogComment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: authorSelect,
        _count: {
          select: {
            replies: {
              where: { status: BLOG_COMMENT_STATUS.APPROVED },
            },
          },
        },
      },
    }),
    prisma.blogComment.count({ where }),
  ]);

  return {
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      status: c.status,
      createdAt: c.createdAt,
      author: c.user,
      repliesCount: c._count.replies,
      isOwner: c.userId === userId,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getCommentReplies({
  commentId,
  userId = null,
  page = 1,
  limit = 20,
}) {
  const parent = await prisma.blogComment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });

  if (!parent) throw new AppError("کامنت پیدا نشد", 404);

  const where = {
    parentId: commentId,
    status: BLOG_COMMENT_STATUS.APPROVED,
  };

  const [replies, total] = await Promise.all([
    prisma.blogComment.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: authorSelect },
    }),
    prisma.blogComment.count({ where }),
  ]);

  return {
    replies: replies.map((c) => ({
      id: c.id,
      content: c.content,
      status: c.status,
      createdAt: c.createdAt,
      author: c.user,
      isOwner: c.userId === userId,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function createComment({ postId, userId, content }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true, status: true },
  });

  if (!post || post.status !== BLOG_STATUS.PUBLISHED) {
    throw new AppError("مقاله پیدا نشد", 404);
  }

  // 🔹 اگه نویسنده ADMIN بود، فوری approved
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  const isAdmin = user?.role?.name === "ADMIN";

  const comment = await prisma.blogComment.create({
    data: {
      postId,
      userId,
      content: content.trim(),
      status: isAdmin
        ? BLOG_COMMENT_STATUS.APPROVED
        : BLOG_COMMENT_STATUS.PENDING,
      ...(isAdmin && { reviewedAt: new Date() }),
    },
    include: { user: authorSelect },
  });

  return {
    id: comment.id,
    content: comment.content,
    status: comment.status,
    createdAt: comment.createdAt,
    author: comment.user,
  };
}

async function createReply({ commentId, userId, content }) {
  const parent = await prisma.blogComment.findUnique({
    where: { id: commentId },
    select: { id: true, postId: true, status: true },
  });

  if (!parent) throw new AppError("کامنت پیدا نشد", 404);
  if (parent.status !== BLOG_COMMENT_STATUS.APPROVED) {
    throw new AppError("نمی‌توانید به این کامنت پاسخ دهید", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  const isAdmin = user?.role?.name === "ADMIN";

  const reply = await prisma.blogComment.create({
    data: {
      postId: parent.postId,
      parentId: commentId,
      userId,
      content: content.trim(),
      status: isAdmin
        ? BLOG_COMMENT_STATUS.APPROVED
        : BLOG_COMMENT_STATUS.PENDING,
      ...(isAdmin && { reviewedAt: new Date() }),
    },
    include: { user: authorSelect },
  });

  return {
    id: reply.id,
    content: reply.content,
    status: reply.status,
    createdAt: reply.createdAt,
    parentId: reply.parentId,
    author: reply.user,
  };
}

async function updateComment({ commentId, userId, content }) {
  const comment = await prisma.blogComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, status: true, parentId: true },
  });

  if (!comment) throw new AppError("کامنت پیدا نشد", 404);
  if (comment.userId !== userId) {
    throw new AppError("دسترسی مجاز نیست", 403);
  }
  if (comment.status === BLOG_COMMENT_STATUS.DELETED) {
    throw new AppError("این کامنت حذف شده است", 400);
  }

  const updated = await prisma.blogComment.update({
    where: { id: commentId },
    data: {
      content: content.trim(),
      status: BLOG_COMMENT_STATUS.PENDING,
      reviewedAt: null,
      reviewedById: null,
      reviewNote: null,
    },
    include: { user: authorSelect },
  });

  return {
    id: updated.id,
    content: updated.content,
    status: updated.status,
    createdAt: updated.createdAt,
    parentId: updated.parentId,
    author: updated.user,
  };
}

async function deleteComment({ commentId, userId }) {
  const comment = await prisma.blogComment.findUnique({
    where: { id: commentId },
    select: { id: true, userId: true, status: true },
  });

  if (!comment) throw new AppError("کامنت پیدا نشد", 404);
  if (comment.userId !== userId) {
    throw new AppError("دسترسی مجاز نیست", 403);
  }
  if (comment.status === BLOG_COMMENT_STATUS.DELETED) {
    throw new AppError("قبلاً حذف شده است", 400);
  }

  await prisma.blogComment.update({
    where: { id: commentId },
    data: {
      status: BLOG_COMMENT_STATUS.DELETED,
      content: "",
    },
  });

  return { success: true };
}

// ==================== 🔹 نویسنده ====================

async function getMyPosts({ userId, status, page = 1, limit = 20 }) {
  const where = {
    authorId: userId,
    ...(status && { status }),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        status: true,
        isFeatured: true,
        viewsCount: true,
        likesCount: true,
        dislikesCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function createPost({ userId, data }) {
  const slug = await generateUniqueSlug(data.title, (s) => slugExists(s));

  // 🔹 اگه ADMIN بود، فوری published
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: { select: { name: true } } },
  });
  const isAdmin = user?.role?.name === "ADMIN";

  const post = await prisma.blogPost.create({
    data: {
      title: data.title.trim(),
      slug,
      excerpt: buildExcerpt(data.content, data.excerpt),
      content: data.content,
      coverImage: data.coverImage || "",
      category: data.category,
      tags: data.tags || [],
      authorId: userId,
      status: isAdmin ? BLOG_STATUS.PUBLISHED : BLOG_STATUS.DRAFT,
      publishedAt: isAdmin ? new Date() : null,
    },
    include: {
      author: authorSelect,
    },
  });

  return post;
}

async function updatePost({ postId, userId, data, isAdmin = false }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, status: true, slug: true, title: true },
  });

  if (!post) throw new AppError("مقاله پیدا نشد", 404);
  if (!isAdmin && post.authorId !== userId) {
    throw new AppError("دسترسی مجاز نیست", 403);
  }
  if (post.status === BLOG_STATUS.ARCHIVED) {
    throw new AppError("این مقاله آرشیو شده است", 400);
  }

  const updateData = {};

  if (data.title !== undefined) {
    updateData.title = data.title.trim();
    // 🔹 اگه عنوان عوض شد، slug جدید
    if (data.title.trim() !== post.title) {
      updateData.slug = await generateUniqueSlug(data.title, (s) =>
        slugExists(s, postId),
      );
    }
  }

  if (data.excerpt !== undefined) {
    updateData.excerpt = buildExcerpt(data.content ?? "", data.excerpt);
  }

  if (data.content !== undefined) {
    updateData.content = data.content;
    if (data.excerpt === undefined) {
      updateData.excerpt = buildExcerpt(data.content, null);
    }
  }

  if (data.coverImage !== undefined) {
    updateData.coverImage = data.coverImage || "";
  }

  if (data.category !== undefined) {
    updateData.category = data.category;
  }

  if (data.tags !== undefined) {
    updateData.tags = data.tags;
  }

  // 🔹 اگه نویسنده تغییر داد، برگرده به draft
  if (!isAdmin && Object.keys(updateData).length > 0) {
    updateData.status = BLOG_STATUS.DRAFT;
  }

  return prisma.blogPost.update({
    where: { id: postId },
    data: updateData,
    include: { author: authorSelect },
  });
}

async function submitPostForReview({ postId, userId }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, status: true },
  });

  if (!post) throw new AppError("مقاله پیدا نشد", 404);
  if (post.authorId !== userId) {
    throw new AppError("دسترسی مجاز نیست", 403);
  }

  if (
    post.status !== BLOG_STATUS.DRAFT &&
    post.status !== BLOG_STATUS.REJECTED
  ) {
    throw new AppError("این مقاله در وضعیت ارسال نیست", 400);
  }

  return prisma.blogPost.update({
    where: { id: postId },
    data: { status: BLOG_STATUS.PENDING },
    include: { author: authorSelect },
  });
}

async function deleteMyPost({ postId, userId }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) throw new AppError("مقاله پیدا نشد", 404);
  if (post.authorId !== userId) {
    throw new AppError("دسترسی مجاز نیست", 403);
  }

  await prisma.blogPost.delete({ where: { id: postId } });
  return { success: true };
}

// ==================== 🔹 ادمین ====================

async function adminListPosts({
  status,
  category,
  authorId,
  search,
  page = 1,
  limit = 20,
}) {
  const where = {
    ...(status && { status }),
    ...(category && { category }),
    ...(authorId && { authorId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: authorSelect,
        _count: { select: { comments: true } },
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  return {
    posts: posts.map((p) => ({
      ...p,
      commentsCount: p._count.comments,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function approvePost({ postId, adminId, note = "" }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true, status: true },
  });

  if (!post) throw new AppError("مقاله پیدا نشد", 404);
  if (post.status !== BLOG_STATUS.PENDING) {
    throw new AppError("این مقاله در وضعیت انتظار نیست", 400);
  }

  return prisma.blogPost.update({
    where: { id: postId },
    data: {
      status: BLOG_STATUS.PUBLISHED,
      publishedAt: new Date(),
      reviewedById: adminId,
      reviewedAt: new Date(),
      reviewNote: note || "",
    },
    include: { author: authorSelect },
  });
}

async function rejectPost({ postId, adminId, note = "" }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true, status: true },
  });

  if (!post) throw new AppError("مقاله پیدا نشد", 404);
  if (post.status !== BLOG_STATUS.PENDING) {
    throw new AppError("این مقاله در وضعیت انتظار نیست", 400);
  }

  return prisma.blogPost.update({
    where: { id: postId },
    data: {
      status: BLOG_STATUS.REJECTED,
      reviewedById: adminId,
      reviewedAt: new Date(),
      reviewNote: note || "",
    },
    include: { author: authorSelect },
  });
}

async function toggleFeatured({ postId }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true, isFeatured: true },
  });

  if (!post) throw new AppError("مقاله پیدا نشد", 404);

  return prisma.blogPost.update({
    where: { id: postId },
    data: { isFeatured: !post.isFeatured },
    include: { author: authorSelect },
  });
}

async function adminDeletePost({ postId }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) throw new AppError("مقاله پیدا نشد", 404);

  await prisma.blogPost.delete({ where: { id: postId } });
  return { success: true };
}

// ==================== 🔹 کامنت ادمین ====================

async function adminListComments({ status, postId, page = 1, limit = 20 }) {
  const where = {
    ...(status && { status }),
    ...(postId && { postId }),
  };

  const [comments, total] = await Promise.all([
    prisma.blogComment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: authorSelect,
        post: {
          select: { id: true, title: true, slug: true },
        },
      },
    }),
    prisma.blogComment.count({ where }),
  ]);

  return {
    comments: comments.map((c) => ({
      id: c.id,
      content: c.content,
      status: c.status,
      createdAt: c.createdAt,
      parentId: c.parentId,
      author: c.user,
      post: c.post,
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
  const comment = await prisma.blogComment.findUnique({
    where: { id: commentId },
    select: { id: true, status: true },
  });

  if (!comment) throw new AppError("کامنت پیدا نشد", 404);
  if (comment.status !== BLOG_COMMENT_STATUS.PENDING) {
    throw new AppError("این کامنت در وضعیت انتظار نیست", 400);
  }

  return prisma.blogComment.update({
    where: { id: commentId },
    data: {
      status: BLOG_COMMENT_STATUS.APPROVED,
      reviewedById: adminId,
      reviewedAt: new Date(),
      reviewNote: note || "",
    },
  });
}

async function rejectComment({ commentId, adminId, note = "" }) {
  const comment = await prisma.blogComment.findUnique({
    where: { id: commentId },
    select: { id: true, status: true },
  });

  if (!comment) throw new AppError("کامنت پیدا نشد", 404);
  if (comment.status !== BLOG_COMMENT_STATUS.PENDING) {
    throw new AppError("این کامنت در وضعیت انتظار نیست", 400);
  }

  return prisma.blogComment.update({
    where: { id: commentId },
    data: {
      status: BLOG_COMMENT_STATUS.REJECTED,
      reviewedById: adminId,
      reviewedAt: new Date(),
      reviewNote: note || "",
    },
  });
}

async function adminDeleteComment({ commentId }) {
  const comment = await prisma.blogComment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });

  if (!comment) throw new AppError("کامنت پیدا نشد", 404);

  await prisma.blogComment.delete({ where: { id: commentId } });
  return { success: true };
}

module.exports = {
  // عمومی
  getPublishedPosts,
  getPublishedPostBySlug,
  getCategories,
  getTags,
  reactToPost,
  getPostComments,
  getCommentReplies,
  createComment,
  createReply,
  updateComment,
  deleteComment,

  // نویسنده
  getMyPosts,
  createPost,
  updatePost,
  submitPostForReview,
  deleteMyPost,

  // ادمین
  adminListPosts,
  approvePost,
  rejectPost,
  toggleFeatured,
  adminDeletePost,
  adminListComments,
  approveComment,
  rejectComment,
  adminDeleteComment,
};
