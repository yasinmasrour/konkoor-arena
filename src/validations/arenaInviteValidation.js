const { z } = require("zod");

const createInviteSchema = z.object({
  leagueId: z.string().min(1, "leagueId الزامی است"),
});

module.exports = {
  createInviteSchema,
};