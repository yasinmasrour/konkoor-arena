const { z } = require("zod");

// ==================== ثابت‌ها ====================
const VALID_GRADES = ["10", "11", "12"];
const VALID_MAJORS = ["math", "experimental", "humanities"];
const VALID_STATUSES = ["upcoming", "active", "finished"];

// ==================== ساخت لیگ ====================
const createLeagueSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "عنوان باید حداقل ۲ کاراکتر باشد")
      .max(100, "عنوان حداکثر ۱۰۰ کاراکتر"),

    lesson: z
      .string()
      .trim()
      .min(2, "درس باید حداقل ۲ کاراکتر باشد")
      .max(50, "درس حداکثر ۵۰ کاراکتر"),

    grade: z.enum(VALID_GRADES, {
      errorMap: () => ({
        message: "پایه باید یکی از 10، 11، 12 باشد",
      }),
    }),

    compatibleMajors: z.array(z.enum(VALID_MAJORS)).default([]),

    startDate: z.string().datetime({
      message: "تاریخ شروع معتبر نیست",
    }),

    endDate: z.string().datetime({
      message: "تاریخ پایان معتبر نیست",
    }),

    status: z.enum(VALID_STATUSES).default("upcoming"),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "تاریخ پایان باید بعد از تاریخ شروع باشد",
    path: ["endDate"],
  });

// ==================== ویرایش لیگ ====================
const updateLeagueSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "عنوان باید حداقل ۲ کاراکتر باشد")
      .max(100, "عنوان حداکثر ۱۰۰ کاراکتر")
      .optional(),

    lesson: z
      .string()
      .trim()
      .min(2, "درس باید حداقل ۲ کاراکتر باشد")
      .max(50, "درس حداکثر ۵۰ کاراکتر")
      .optional(),

    grade: z.enum(VALID_GRADES).optional(),

    compatibleMajors: z.array(z.enum(VALID_MAJORS)).optional(),

    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(VALID_STATUSES).optional(),
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      new Date(data.endDate) > new Date(data.startDate),
    {
      message: "تاریخ پایان باید بعد از تاریخ شروع باشد",
      path: ["endDate"],
    },
  );

// ==================== تغییر وضعیت ====================
const changeStatusSchema = z.object({
  status: z.enum(VALID_STATUSES, {
    errorMap: () => ({
      message: "وضعیت باید یکی از upcoming، active، finished باشد",
    }),
  }),
});

// ==================== فیلتر لیست ====================
const listLeaguesQuerySchema = z.object({
  status: z.enum(VALID_STATUSES).optional(),
  grade: z.enum(VALID_GRADES).optional(),
  lesson: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  createLeagueSchema,
  updateLeagueSchema,
  changeStatusSchema,
  listLeaguesQuerySchema,
  VALID_GRADES,
  VALID_MAJORS,
  VALID_STATUSES,
};
