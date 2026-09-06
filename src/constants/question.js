const QUESTION_STATUS = Object.freeze({
  DRAFT: "draft",
  REVIEW: "review",
  PUBLISHED: "published",
  ARCHIVED: "archived",
});

const QUESTION_DIFFICULTY = Object.freeze({
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
  TRICKY: "tricky",
});

module.exports = {
  QUESTION_STATUS,
  QUESTION_DIFFICULTY,
};
