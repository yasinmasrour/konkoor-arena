const z = require("zod");

const joinQueueSchema = z.object({
  leagueId: z.string().min(1, "League ID is required"),
});

module.exports = {
  joinQueueSchema,
};
