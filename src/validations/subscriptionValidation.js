const { z } = require("zod");

const createSubscriptionPlanSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  price: z.number().int().min(0),
  durationDays: z.number().int().min(1).max(3650),
});

const updateSubscriptionPlanSchema = z
  .object({
    title: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    price: z.number().int().min(0).optional(),
    durationDays: z.number().int().min(1).max(3650).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

module.exports = {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
};
