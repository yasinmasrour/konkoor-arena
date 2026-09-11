const XLSX = require("xlsx");
const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const ROLES = require("../constants/roles");
const {
  QUESTION_STATUS,
  QUESTION_DIFFICULTY,
} = require("../constants/question");
const {
  QUESTION_IMPORT_LIMITS,
  QUESTION_IMPORT_COLUMNS,
} = require("../constants/questionImport");

const REQUIRED_COLUMNS = QUESTION_IMPORT_COLUMNS.slice(0, 10);
const DIFFICULTIES = new Set(Object.values(QUESTION_DIFFICULTY));
const GRADE_ALIASES = new Map([
  ["10", "10"],
  ["11", "11"],
  ["12", "12"],
  ["دهم", "10"],
  ["یازدهم", "11"],
  ["دوازدهم", "12"],
]);
const MAJOR_ALIASES = new Map([
  ["math", "math"],
  ["experimental", "experimental"],
  ["humanities", "humanities"],
  ["ریاضی", "math"],
  ["تجربی", "experimental"],
  ["علوم تجربی", "experimental"],
  ["انسانی", "humanities"],
  ["علوم انسانی", "humanities"],
]);

const normalizeCell = (value) => String(value ?? "").trim();

const normalizeHeader = (value) => normalizeCell(value).replace(/^\uFEFF/, "");

const toEnglishDigits = (value) =>
  normalizeCell(value)
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

const parseCorrectAnswer = (value) => {
  const raw = toEnglishDigits(value);
  if (!/^[1-4]$/.test(raw)) return null;
  return Number(raw) - 1;
};

const parseYear = (value) => {
  const raw = normalizeCell(value);
  if (!raw) return undefined;
  if (!/^\d+$/.test(raw)) return null;
  const year = Number(raw);
  return Number.isInteger(year) && year >= 1300 && year <= 2100 ? year : null;
};

const parseRows = (buffer, originalName) => {
  const extension = originalName.toLowerCase().split(".").pop();
  if (!extension || !["csv", "xlsx", "xls"].includes(extension)) {
    throw new AppError("Only CSV, XLSX, and XLS files are supported", 400);
  }

  let workbook;
  try {
    workbook = XLSX.read(buffer, {
      type: "buffer",
      cellDates: false,
      raw: true,
      codepage: 65001,
    });
  } catch {
    throw new AppError("Could not read the uploaded spreadsheet", 400);
  }

  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet)
    throw new AppError("The uploaded file has no worksheet", 400);

  const sheet = workbook.Sheets[firstSheet];
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (!matrix.length) throw new AppError("The uploaded file is empty", 400);

  const headers = matrix[0].map(normalizeHeader);
  if (!headers.length || headers.every((header) => !header)) {
    throw new AppError("The first row must contain column headers", 400);
  }
  if (headers.length > QUESTION_IMPORT_LIMITS.MAX_COLUMNS) {
    throw new AppError(
      `The file cannot contain more than ${QUESTION_IMPORT_LIMITS.MAX_COLUMNS} columns`,
      400,
    );
  }

  const headerSet = new Set(headers.filter(Boolean));
  const missing = REQUIRED_COLUMNS.filter((column) => !headerSet.has(column));
  if (missing.length) {
    throw new AppError(`Missing required columns: ${missing.join(", ")}`, 400);
  }

  const duplicateHeaders = headers.filter(
    (header, index) => header && headers.indexOf(header) !== index,
  );
  if (duplicateHeaders.length) {
    throw new AppError(
      `Duplicate column headers: ${[...new Set(duplicateHeaders)].join(", ")}`,
      400,
    );
  }

  const rows = matrix
    .slice(1)
    .filter((row) => row.some((cell) => normalizeCell(cell)));
  if (rows.length > QUESTION_IMPORT_LIMITS.MAX_ROWS) {
    throw new AppError(
      `The file cannot contain more than ${QUESTION_IMPORT_LIMITS.MAX_ROWS} data rows`,
      400,
    );
  }

  return rows.map((row, index) => {
    const record = {};
    headers.forEach((header, columnIndex) => {
      if (header) record[header] = row[columnIndex];
    });
    return { rowNumber: index + 2, record };
  });
};

const validateRows = async (parsedRows) => {
  const codes = parsedRows
    .map(({ record }) => normalizeCell(record.code))
    .filter(Boolean);
  const existingQuestions = codes.length
    ? await prisma.question.findMany({
        where: { code: { in: codes } },
        select: { code: true },
      })
    : [];
  const existingCodes = new Set(
    existingQuestions.map((question) => question.code),
  );
  const seenCodes = new Set();

  const rows = parsedRows.map(({ rowNumber, record }) => {
    const errors = [];
    const warnings = [];
    const data = {
      code: normalizeCell(record.code),
      lesson: normalizeCell(record.lesson),
      grade:
        GRADE_ALIASES.get(normalizeCell(record.grade)) ||
        normalizeCell(record.grade),
      major:
        MAJOR_ALIASES.get(normalizeCell(record.major)) ||
        normalizeCell(record.major),
      chapter: normalizeCell(record.chapter),
      questionText: normalizeCell(record.questionText),
      options: [1, 2, 3, 4].map((index) =>
        normalizeCell(record[`option${index}`]),
      ),
      questionImage: normalizeCell(record.questionImage),
      topic: normalizeCell(record.topic),
      explanation: normalizeCell(record.explanation),
      explanationPdf: normalizeCell(record.explanationPdf),
      source: normalizeCell(record.source),
      author: normalizeCell(record.author),
      difficulty:
        normalizeCell(record.difficulty) || QUESTION_DIFFICULTY.MEDIUM,
      tags: normalizeCell(record.tags)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    const correctAnswer = parseCorrectAnswer(record.correctAnswer);
    const year = parseYear(record.year);
    data.correctAnswer = correctAnswer;
    data.year = year === undefined ? undefined : year;

    if (!data.code) errors.push("کد سؤال الزامی است.");
    else if (existingCodes.has(data.code))
      errors.push("این کد سؤال از قبل در بانک سؤال وجود دارد.");
    else if (seenCodes.has(data.code))
      errors.push("کد سؤال در همین فایل تکراری است.");
    else seenCodes.add(data.code);

    if (data.lesson.length < 2) errors.push("درس باید حداقل ۲ کاراکتر باشد.");
    if (!GRADE_ALIASES.has(normalizeCell(record.grade)))
      errors.push("پایه باید 10، 11 یا 12 یا معادل فارسی آن باشد.");
    if (!MAJOR_ALIASES.has(normalizeCell(record.major)))
      errors.push(
        "رشته باید math، experimental، humanities یا معادل فارسی آن باشد.",
      );
    if (data.chapter.length < 2) errors.push("فصل باید تکمیل شود.");
    if (data.questionText.length < 5)
      errors.push("متن سؤال باید حداقل ۵ کاراکتر باشد.");
    if (data.options.some((option) => !option))
      errors.push("هر سؤال باید دقیقاً ۴ گزینه غیرخالی داشته باشد.");
    if (correctAnswer === null)
      errors.push("correctAnswer باید یک عدد از 1 تا 4 باشد.");
    if (year === null)
      errors.push("year باید یک سال معتبر بین 1300 و 2100 باشد.");
    if (!DIFFICULTIES.has(data.difficulty))
      errors.push("difficulty نامعتبر است.");

    if (!data.explanation) warnings.push("توضیح سؤال خالی است.");
    if (!data.source) warnings.push("منبع سؤال خالی است.");
    if (!data.author) warnings.push("نویسنده/طراح سؤال مشخص نشده است.");
    if (
      data.questionImage &&
      !/^https?:\/\//i.test(data.questionImage) &&
      !data.questionImage.startsWith("/")
    ) {
      warnings.push("questionImage بهتر است یک مسیر یا URL معتبر باشد.");
    }

    return {
      rowNumber,
      valid: errors.length === 0,
      data,
      errors,
      warnings,
    };
  });

  return {
    totalRows: rows.length,
    validRows: rows.filter((row) => row.valid).length,
    warningRows: rows.filter((row) => row.valid && row.warnings.length).length,
    invalidRows: rows.filter((row) => !row.valid).length,
    rows,
  };
};

const previewImport = async (buffer, originalName) => {
  const parsed = parseRows(buffer, originalName);
  return validateRows(parsed);
};

const importQuestions = async (buffer, originalName, user) => {
  if (![ROLES.ADMIN, ROLES.QUESTION_DESIGNER].includes(user.role.name)) {
    throw new AppError(
      "Only an admin or question designer can import questions",
      403,
    );
  }

  const preview = await previewImport(buffer, originalName);
  if (preview.invalidRows > 0) {
    throw new AppError(
      "Import blocked because the file contains invalid rows",
      400,
      preview.rows.filter((row) => !row.valid),
    );
  }

  const data = preview.rows.map(({ data: row }) => ({
    code: row.code,
    lesson: row.lesson,
    grade: row.grade,
    major: row.major,
    chapter: row.chapter,
    topic: row.topic,
    questionText: row.questionText,
    questionImage: row.questionImage,
    options: row.options,
    correctAnswer: row.correctAnswer,
    explanation: row.explanation,
    explanationPdf: row.explanationPdf,
    source: row.source,
    author: row.author,
    year: row.year,
    difficulty: row.difficulty,
    tags: row.tags,
    usageCount: 0,
    status: QUESTION_STATUS.DRAFT,
    createdById: user.id,
  }));

  try {
    const result = await prisma.question.createMany({ data });
    return { importedCount: result.count, preview };
  } catch (error) {
    if (error?.code === "P2002") {
      throw new AppError(
        "Import failed because a question code already exists",
        409,
      );
    }
    throw error;
  }
};

module.exports = { previewImport, importQuestions };
