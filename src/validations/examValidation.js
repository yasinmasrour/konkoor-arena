const { z } = require("zod");


const createExamSchema = z.object({

    title: z.string()
        .min(3),

    examDate: z.coerce.date(),

    startTime: z.string()
        .min(1),

    endTime: z.string()
        .optional(),

    bookletIds: z.array(
        z.string()
    )
    .min(1)

});


const updateExamSchema = z.object({

    title: z.string()
        .min(3)
        .optional(),

    examDate: z.coerce.date()
        .optional(),

    startTime: z.string()
        .optional(),

    endTime: z.string()
        .optional(),


})

.refine(
    data => Object.keys(data).length > 0,
    {
        message: "At least one field is required"
    }
);


module.exports = {

    createExamSchema,

    updateExamSchema

};