const STUDY_PLAN_STATUS = Object.freeze({
  ACTIVE: "active",
  COMPLETED: "completed",
  ARCHIVED: "archived",
});

const STUDY_TASK_PRIORITY = Object.freeze({
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
});

const PERSONAL_EXAM_STATUS = Object.freeze({
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  ABANDONED: "abandoned",
});

const STUDY_PLAN_LIMITS = Object.freeze({
  MIN_TITLE: 3,
  MAX_TITLE: 200,
  MAX_DESCRIPTION: 2000,

  MAX_TASK_TITLE: 200,
  MAX_TASK_DESCRIPTION: 1000,
  MAX_ESTIMATED_MINUTES: 1440, // ۲۴ ساعت

  MAX_PERSONAL_EXAM_TITLE: 200,
  MIN_PERSONAL_EXAM_TIME: 1,
  MAX_PERSONAL_EXAM_TIME: 300, // ۵ ساعت

  MAX_PERSONAL_EXAM_QUESTIONS: 100,
  MIN_PERSONAL_EXAM_QUESTIONS: 1,

  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
});

const PRIORITY_LABELS = Object.freeze({
  high: "بالا",
  medium: "متوسط",
  low: "پایین",
});

module.exports = {
  STUDY_PLAN_STATUS,
  STUDY_TASK_PRIORITY,
  PERSONAL_EXAM_STATUS,
  STUDY_PLAN_LIMITS,
  PRIORITY_LABELS,
};
