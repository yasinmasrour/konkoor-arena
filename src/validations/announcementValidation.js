const { z } = require("zod");
const {
  ANNOUNCEMENT_VARIANTS,
  ANNOUNCEMENT_DISPLAY_TYPES,
} = require("../constants/announcement");

const VALID_VARIANTS = Object.keys(ANNOUNCEMENT_VARIANTS);
const VALID_DISPLAY_TYPES = Object.keys(ANNOUNCEMENT_DISPLAY_TYPES);

// ==================== ساخت اعلان ====================
const createAnnouncementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "عنوان حداقل ۳ کاراکتر باشد")
    .max(100, "عنوان حداکثر ۱۰۰ کاراکتر"),

  message: z
    .string()
    .trim()
    .max(300, "پیام حداکثر ۳۰۰ کاراکتر")
    .optional()
    .nullable()
    .or(z.literal("")),

  ctaText: z
    .string()
    .trim()
    .max(50, "متن دکمه حداکثر ۵۰ کاراکتر")
    .optional()
    .nullable()
    .or(z.literal("")),

  ctaLink: z.string().trim().max(200).optional().nullable().or(z.literal("")),

  variant: z
    .enum(VALID_VARIANTS, {
      errorMap: () => ({ message: "رنگ نامعتبر است" }),
    })
    .default("gold"),

  icon: z
    .string()
    .trim()
    .max(10, "آیکون حداکثر ۱۰ کاراکتر (ایموجی)")
    .optional()
    .nullable()
    .or(z.literal("")),

  displayType: z
    .enum(VALID_DISPLAY_TYPES, {
      errorMap: () => ({ message: "نوع نمایش نامعتبر است" }),
    })
    .default("banner"),

  isActive: z.boolean().default(true),

  startsAt: z.string().datetime().optional().or(z.literal("")),

  endsAt: z.string().datetime().optional().nullable().or(z.literal("")),

  dismissible: z.boolean().default(true),

  priority: z.coerce.number().int().min(0).max(100).default(0),
});

const updateAnnouncementSchema = createAnnouncementSchema.partial();

// ==================== لیست (ادمین) ====================
const adminListAnnouncementsSchema = z.object({
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  displayType: z.enum(VALID_DISPLAY_TYPES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  createAnnouncementSchema,
  updateAnnouncementSchema,
  adminListAnnouncementsSchema,
  VALID_VARIANTS,
  VALID_DISPLAY_TYPES,
};
