const { z } = require("zod");


const createBookletSchema = z.object({

    lesson: z.string()
        .trim()
        .min(2),

    grade: z.string()
        .trim()
        .min(1),

    major: z.string()
        .trim()
        .min(1),

    examDate: z.coerce.date(),

    duration: z.number()
        .int()
        .min(1)

});


const updateBookletSchema = z.object({

    lesson: z.string()
        .trim()
        .min(2)
        .optional(),

    grade: z.string()
        .trim()
        .min(1)
        .optional(),

    major: z.string()
        .trim()
        .min(1)
        .optional(),

    examDate: z.coerce.date()
        .optional(),

    duration: z.number()
        .int()
        .min(1)
        .optional(),

    status: z.string()
        .optional()

}).refine(
    data => Object.keys(data).length > 0,
    {
        message: "At least one field is required"
    }
);


module.exports = {

    createBookletSchema,

    updateBookletSchema

};