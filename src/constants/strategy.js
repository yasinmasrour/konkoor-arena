const STRATEGY_GRADES = Object.freeze({
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",
});

const STRATEGY_MAJORS = Object.freeze({
  math: "ریاضی",
  experimental: "تجربی",
  humanities: "انسانی",
});

const STRATEGY_LIMITS = Object.freeze({
  MIN_TITLE_LENGTH: 3,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_LESSONS: 20,
  MAX_EXAMS: 50,
  MAX_LESSON_NAME: 50,
  MAX_EXAM_TITLE: 100,
  MAX_CELL_LENGTH: 200,
});

module.exports = {
  STRATEGY_GRADES,
  STRATEGY_MAJORS,
  STRATEGY_LIMITS,
};