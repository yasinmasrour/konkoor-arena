const COMMENT_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  DELETED: "deleted",
});

const REACTION_TYPE = Object.freeze({
  LIKE: "like",
  DISLIKE: "dislike",
});

const COMMENT_LIMITS = Object.freeze({
  MIN_CONTENT_LENGTH: 3,
  MAX_CONTENT_LENGTH: 1000,
  MIN_RATING: 1,
  MAX_RATING: 5,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_REPLY_DEPTH: 10,
});

module.exports = {
  COMMENT_STATUS,
  REACTION_TYPE,
  COMMENT_LIMITS,
};