const BLOG_CATEGORIES = Object.freeze({
  general: "عمومی",
  educational: "آموزشی",
  motivation: "انگیزشی",
  news: "اخبار",
  analysis: "تحلیل",
  interview: "مصاحبه",
});

const BLOG_STATUS = Object.freeze({
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "published",
  REJECTED: "rejected",
  ARCHIVED: "archived",
});

const BLOG_COMMENT_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  DELETED: "deleted",
});

const BLOG_REACTION_TYPE = Object.freeze({
  LIKE: "like",
  DISLIKE: "dislike",
});

const BLOG_LIMITS = Object.freeze({
  MIN_TITLE: 3,
  MAX_TITLE: 200,
  MAX_EXCERPT: 500,
  MAX_CONTENT: 100000,    // ۱۰۰ هزار کاراکتر
  MAX_TAGS: 10,
  MAX_TAG_LENGTH: 30,
  MAX_COVER_URL: 500,
  MAX_SLUG: 200,
  MAX_REVIEW_NOTE: 500,
  MAX_COMMENT: 2000,
  MIN_COMMENT: 2,
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
});

module.exports = {
  BLOG_CATEGORIES,
  BLOG_STATUS,
  BLOG_COMMENT_STATUS,
  BLOG_REACTION_TYPE,
  BLOG_LIMITS,
};