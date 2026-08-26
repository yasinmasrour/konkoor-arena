const cron = require("node-cron");

const {
  updateLeagueStatuses,
} = require("../services/arenaLeagueLifecycleService");

const startArenaLeagueJob = () => {
  cron.schedule("*/1 * * * *", async () => {
    try {
      await updateLeagueStatuses();

      console.log("Arena league status checked");
    } catch (error) {
      console.error("Arena league job error:", error.message);
    }
  });
};

module.exports = startArenaLeagueJob;
