const { z } = require("zod");
const {
  STUDY_PLAN_STATUS,
  STUDY_TASK_PRIORITY,
  STUDY_PLAN_LIMITS,
} = require("../constants/studyPlan");

const VALID_STATUS = Object.values(STUDY_PLAN_STATUS);
const VALID_PRIORITY = Object.values(STUDY_TASK_PRIORITY);

// ==================== 🔹 ساخت تسک ====================
const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "عنوان تسک الزامی است")
    .max(STUDY_PLAN_LIMITS.MAX_TASK_TITLE),
  description: z
    .string()
    .trim()
    .max(STUDY_PLAN_LIMITS.MAX_TASK_DESCRIPTION)
    .optional()
    .nullable()
    .or(z.literal("")),
  lesson: z.string().trim().max(100).optional().nullable(),
  chapter: z.string().trim().max(100).optional().nullable(),
  priority: z.enum(VALID_PRIORITY).default("medium"),
  estimatedMinutes: z
    .number()
    .int()
    .min(1)
    .max(STUDY_PLAN_LIMITS.MAX_ESTIMATED_MINUTES)
    .optional()
    .nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  order: z.number().int().min(0).optional().default(0),
});

// ==================== 🔹 ساخت برنامه ====================
const createStudyPlanSchema = z.object({
  studentId: z.string().trim().min(1, "دانش‌آموز الزامی است"),
  examId: z.string().trim().optional().nullable(),
  title: z
    .string()
    .trim()
    .min(STUDY_PLAN_LIMITS.MIN_TITLE)
    .max(STUDY_PLAN_LIMITS.MAX_TITLE),
  description: z
    .string()
    .trim()
    .max(STUDY_PLAN_LIMITS.MAX_DESCRIPTION)
    .optional()
    .nullable()
    .or(z.literal("")),
  endDate: z.string().datetime().optional().nullable(),
  tasks: z.array(taskSchema).default([]),
});

// ==================== 🔹 ویرایش برنامه ====================
const updateStudyPlanSchema = z.object({
  title: z
    .string()
    .trim()
    .min(STUDY_PLAN_LIMITS.MIN_TITLE)
    .max(STUDY_PLAN_LIMITS.MAX_TITLE)
    .optional(),
  description: z
    .string()
    .trim()
    .max(STUDY_PLAN_LIMITS.MAX_DESCRIPTION)
    .optional()
    .nullable()
    .or(z.literal("")),
  endDate: z.string().datetime().optional().nullable(),
  status: z.enum(VALID_STATUS).optional(),
});

// ==================== 🔹 افزودن تسک ====================
const addTaskSchema = taskSchema;

// ==================== 🔹 ویرایش تسک ====================
const updateTaskSchema = taskSchema.partial();

// ==================== 🔹 ساخت آزمون شخصی ====================
const createPersonalExamSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1)
    .max(STUDY_PLAN_LIMITS.MAX_PERSONAL_EXAM_TITLE),
  timeLimit: z
    .number()
    .int()
    .min(STUDY_PLAN_LIMITS.MIN_PERSONAL_EXAM_TIME)
    .max(STUDY_PLAN_LIMITS.MAX_PERSONAL_EXAM_TIME),
  questionIds: z
    .array(z.string().min(1))
    .min(STUDY_PLAN_LIMITS.MIN_PERSONAL_EXAM_QUESTIONS)
    .max(STUDY_PLAN_LIMITS.MAX_PERSONAL_EXAM_QUESTIONS),
});

// ==================== 🔹 ثبت پاسخ آزمون شخصی ====================
const submitPersonalExamAnswerSchema = z.object({
  questionId: z.string().min(1),
  selectedAnswer: z.number().int().min(0).max(3).nullable(),
  timeSpentMs: z.number().int().min(0).optional(),
});

// ==================== 🔹 لیست ====================
const listPlansSchema = z.object({
  status: z.enum(VALID_STATUS).optional(),
  studentId: z.string().trim().optional(),
  examId: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(STUDY_PLAN_LIMITS.MAX_PAGE_SIZE)
    .default(STUDY_PLAN_LIMITS.DEFAULT_PAGE_SIZE),
});

module.exports = {
  createStudyPlanSchema,
  updateStudyPlanSchema,
  addTaskSchema,
  updateTaskSchema,
  createPersonalExamSchema,
  submitPersonalExamAnswerSchema,
  listPlansSchema,
};