const { z } = require("zod");

const createMatchSchema = z.object({
  opponentId: z.string().min(1, "Opponent ID is required"),

  leagueId: z.string().min(1, "League ID is required"),
});

const submitAnswerSchema = z.object({
  matchQuestionId: z.string().min(1, "Match question ID is required"),

  selectedAnswer: z.number().int().min(0),
});

module.exports = {
  createMatchSchema,
  submitAnswerSchema,
};
