const { z } = require("zod");
const { STRATEGY_LIMITS } = require("../constants/strategy");

const VALID_GRADES = ["10", "11", "12"];
const VALID_MAJORS = ["math", "experimental", "humanities"];

// ==================== 🔹 ساختار data ====================
const strategyDataSchema = z.object({
  lessons: z
    .array(
      z
        .string()
        .trim()
        .min(1, "نام درس نمیتواند خالی باشد")
        .max(
          STRATEGY_LIMITS.MAX_LESSON_NAME,
          `نام درس حداکثر ${STRATEGY_LIMITS.MAX_LESSON_NAME} کاراکتر`,
        ),
    )
    .min(1, "حداقل یک درس لازم است")
    .max(
      STRATEGY_LIMITS.MAX_LESSONS,
      `حداکثر ${STRATEGY_LIMITS.MAX_LESSONS} درس مجاز است`,
    ),

  exams: z
    .array(
      z.object({
        title: z
          .string()
          .trim()
          .min(1, "عنوان آزمون نمیتواند خالی باشد")
          .max(
            STRATEGY_LIMITS.MAX_EXAM_TITLE,
            `عنوان آزمون حداکثر ${STRATEGY_LIMITS.MAX_EXAM_TITLE} کاراکتر`,
          ),
        cells: z.array(z.string().max(STRATEGY_LIMITS.MAX_CELL_LENGTH)),
      }),
    )
    .min(1, "حداقل یک آزمون لازم است")
    .max(
      STRATEGY_LIMITS.MAX_EXAMS,
      `حداکثر ${STRATEGY_LIMITS.MAX_EXAMS} آزمون مجاز است`,
    ),
});

// ==================== 🔹 ساخت ====================
const createStrategyPlanSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(STRATEGY_LIMITS.MIN_TITLE_LENGTH)
      .max(STRATEGY_LIMITS.MAX_TITLE_LENGTH),
    description: z
      .string()
      .trim()
      .max(STRATEGY_LIMITS.MAX_DESCRIPTION_LENGTH)
      .optional()
      .nullable()
      .or(z.literal("")),
    grade: z.enum(VALID_GRADES, {
      errorMap: () => ({ message: "پایه تحصیلی نامعتبر است" }),
    }),
    major: z.enum(VALID_MAJORS, {
      errorMap: () => ({ message: "رشته تحصیلی نامعتبر است" }),
    }),
    data: strategyDataSchema,
    isPublished: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      const lessonsCount = data.data.lessons.length;
      return data.data.exams.every(
        (exam) => exam.cells.length === lessonsCount,
      );
    },
    {
      message: "تعداد ستونهای هر آزمون باید با تعداد درسها برابر باشد",
      path: ["data", "exams"],
    },
  );

// ==================== 🔹 ویرایش ====================
const updateStrategyPlanSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(STRATEGY_LIMITS.MIN_TITLE_LENGTH)
      .max(STRATEGY_LIMITS.MAX_TITLE_LENGTH)
      .optional(),
    description: z
      .string()
      .trim()
      .max(STRATEGY_LIMITS.MAX_DESCRIPTION_LENGTH)
      .optional()
      .nullable()
      .or(z.literal("")),
    grade: z.enum(VALID_GRADES).optional(),
    major: z.enum(VALID_MAJORS).optional(),
    data: strategyDataSchema.optional(),
  })
  .refine(
    (data) => {
      if (!data.data) return true;
      const lessonsCount = data.data.lessons.length;
      return data.data.exams.every(
        (exam) => exam.cells.length === lessonsCount,
      );
    },
    {
      message: "تعداد ستونهای هر آزمون باید با تعداد درسها برابر باشد",
      path: ["data", "exams"],
    },
  );

// ==================== 🔹 لیست ====================
const listStrategyPlansSchema = z.object({
  grade: z.enum(VALID_GRADES).optional(),
  major: z.enum(VALID_MAJORS).optional(),
  isPublished: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  createStrategyPlanSchema,
  updateStrategyPlanSchema,
  listStrategyPlansSchema,
  VALID_GRADES,
  VALID_MAJORS,
};
