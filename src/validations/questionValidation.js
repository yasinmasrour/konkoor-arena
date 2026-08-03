const { z } = require("zod");


const createQuestionSchema = z.object({
    code: z.string().min(2),
    
    lesson: z.string().min(2),

    grade: z.enum([
        "10",
        "11",
        "12"
    ]),

    major: z.enum([
        "math",
        "experimental",
        "humanities"
    ]),

    chapter: z.string().min(2),

    topic: z.string().optional(),

    questionText: z.string().min(5),

    questionImage: z.string().optional(),

    options: z.array(
        z.string()
    ).length(4),

    correctAnswer: z.number()
        .min(0)
        .max(3),

    explanation: z.string().optional(),

    explanationPdf: z.string().optional(),

    source: z.string().optional(),

    author: z.string().optional(),

    year: z.number().optional(),

    difficulty: z.enum([
        "easy",
        "medium",
        "hard",
        "tricky"
    ]).optional(),

    tags: z.array(
        z.string()
    ).optional()
});

const updateQuestionSchema = createQuestionSchema.partial();

module.exports = {
    createQuestionSchema,
    updateQuestionSchema
};