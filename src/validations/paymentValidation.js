const { z } = require("zod");

const createPaymentSchema = z.object({
  planId: z.string().trim().min(1),
});

module.exports = { createPaymentSchema };
