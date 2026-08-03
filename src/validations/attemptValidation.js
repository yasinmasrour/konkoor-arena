const { z } = require("zod");

const submitAnswerSchema = z.object({
    questionId: z.string()
        .min(1),
    selectedAnswer: z.number()
        .int()
        .min(0)
        // 0 = option1
        // 1 = option2
        // 2 = option3
        // 3 = option4
        .max(3)
});

module.exports = {
    submitAnswerSchema
};