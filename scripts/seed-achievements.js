// اسکریپت برای اجرای seed
// Usage: node scripts/seed-achievements.js
require("dotenv").config();
const { seedAchievements } = require("../src/jobs/seedAchievements");

(async () => {
  try {
    await seedAchievements();
    console.log("✅ Done");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
})();
