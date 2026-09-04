const cron = require("node-cron");

const {
  updateLeagueStatuses,
} = require("../services/arenaLeagueLifecycleService");
const {
  cleanupStaleQueues,
} = require("../services/arenaMatchmakingService");

const startArenaLeagueJob = () => {
  const task = cron.schedule("*/1 * * * *", async () => {
    try {
      await updateLeagueStatuses();
      const cleanedQueues = await cleanupStaleQueues();

      console.log(`Arena league status checked; stale queues cleaned: ${cleanedQueues}`);
    } catch (error) {
      console.error("Arena league job error:", error.message);
    }
  });

  return task;
};

module.exports = startArenaLeagueJob;
