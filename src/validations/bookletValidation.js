const { z } = require("zod");

const bookletStatus = z.enum(["draft", "review", "published", "archived"]);

const createBookletSchema = z.object({
  title: z.string().trim().min(2).max(200),
  lesson: z.string().trim().min(2).max(100),
  grade: z.string().trim().min(1).max(50),
  major: z.string().trim().min(1).max(100),
  examDate: z.coerce.date(),
  duration: z.number().int().min(1).max(600),
  questionIds: z.array(z.string().min(1)).max(200).optional().default([]),
});

const updateBookletSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  lesson: z.string().trim().min(2).max(100).optional(),
  grade: z.string().trim().min(1).max(50).optional(),
  major: z.string().trim().min(1).max(100).optional(),
  examDate: z.coerce.date().optional(),
  duration: z.number().int().min(1).max(600).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "At least one field is required",
});

const bookletStatusSchema = z.object({
  status: bookletStatus,
});

const addBookletQuestionsSchema = z.object({
  questionIds: z.array(z.string().min(1)).min(1).max(200),
});

const reorderBookletQuestionsSchema = z.object({
  questionIds: z.array(z.string().min(1)).min(1).max(200),
});

module.exports = {
  createBookletSchema,
  updateBookletSchema,
  bookletStatusSchema,
  addBookletQuestionsSchema,
  reorderBookletQuestionsSchema,
};
