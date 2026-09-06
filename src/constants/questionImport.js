const QUESTION_IMPORT_LIMITS = Object.freeze({
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  MAX_ROWS: 500,
  MAX_COLUMNS: 30,
});

const QUESTION_IMPORT_COLUMNS = Object.freeze([
  "code",
  "lesson",
  "grade",
  "major",
  "chapter",
  "questionText",
  "option1",
  "option2",
  "option3",
  "option4",
  "correctAnswer",
  "questionImage",
  "topic",
  "explanation",
  "explanationPdf",
  "source",
  "author",
  "year",
  "difficulty",
  "tags",
]);

module.exports = { QUESTION_IMPORT_LIMITS, QUESTION_IMPORT_COLUMNS };
