const { z } = require("zod");
const { QUESTION_STATUS, QUESTION_DIFFICULTY } = require("../constants/question");

const createQuestionSchema = z.object({
  code: z.string().trim().min(2),
  lesson: z.string().trim().min(2),
  grade: z.enum(["10", "11", "12"]),
  major: z.enum(["math", "experimental", "humanities"]),
  chapter: z.string().trim().min(2),
  topic: z.string().trim().optional(),
  questionText: z.string().trim().min(5),
  questionImage: z.string().trim().optional(),
  options: z.array(z.string().trim().min(1)).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().optional(),
  explanationPdf: z.string().trim().optional(),
  source: z.string().trim().optional(),
  author: z.string().trim().optional(),
  year: z.number().int().optional(),
  difficulty: z.enum([
    QUESTION_DIFFICULTY.EASY,
    QUESTION_DIFFICULTY.MEDIUM,
    QUESTION_DIFFICULTY.HARD,
    QUESTION_DIFFICULTY.TRICKY,
  ]).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
});

const updateQuestionSchema = createQuestionSchema.partial();

const bulkQuestionStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
  status: z.enum([
    QUESTION_STATUS.DRAFT,
    QUESTION_STATUS.REVIEW,
    QUESTION_STATUS.PUBLISHED,
    QUESTION_STATUS.ARCHIVED,
  ]),
});

const questionStatusSchema = z.object({
  status: z.enum([
    QUESTION_STATUS.DRAFT,
    QUESTION_STATUS.REVIEW,
    QUESTION_STATUS.PUBLISHED,
    QUESTION_STATUS.ARCHIVED,
  ]),
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  questionStatusSchema,
  bulkQuestionStatusSchema,
};
