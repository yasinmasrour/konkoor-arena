const { z } = require("zod");

const startSoloSchema = z.object({
  leagueId: z.string().trim().min(1, "leagueId الزامی است"),
  level: z.enum(["easy", "medium", "hard"], {
    errorMap: () => ({ message: "سطح نامعتبر است" }),
  }),
});

const answerSoloSchema = z.object({
  order: z.number().int().min(1).max(5),
  selectedAnswer: z.number().int().min(0).max(3).nullable(),
  timeSpentMs: z.number().int().min(0).optional(),
});

const historyQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["playing", "won", "lost", "abandoned"]).optional(),
  level: z.enum(["easy", "medium", "hard"]).optional(),
});

module.exports = {
  startSoloSchema,
  answerSoloSchema,
  historyQuerySchema,
};
