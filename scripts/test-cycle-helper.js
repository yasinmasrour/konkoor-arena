const {
  getCurrentCycleStart,
  getCurrentCycleEnd,
  getCycleInfo,
  needsCycleReset,
} = require("../src/utils/cycleHelper");

console.log("📅 اطلاعات دوره فعلی:");
const info = getCycleInfo();
console.log(info);

console.log("\n🔹 تست needsCycleReset:");
// کاربری که دورهش از ۲ سال پیش شروع شده → باید ریست بشه
const oldDate = new Date("2023-01-01");
console.log(`دوره قدیمی (${oldDate.toISOString()}):`, needsCycleReset(oldDate)); // true

// کاربری که دورهش تازه شروع شده → نباید ریست بشه
console.log("دوره فعلی:", needsCycleReset(new Date())); // false
