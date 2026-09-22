const jalaali = require("jalaali-js");
const { CYCLE_START_MONTH, CYCLE_START_DAY } = require("../constants/referral");

/**
 * تبدیل تاریخ میلادی به شمسی
 * @param {Date} date
 * @returns {{ jy: number, jm: number, jd: number }}
 */
function toJalali(date) {
  return jalaali.toJalaali(date);
}

/**
 * تبدیل تاریخ شمسی به میلادی
 * @param {number} jy - سال شمسی
 * @param {number} jm - ماه شمسی (۱ تا ۱۲)
 * @param {number} jd - روز شمسی
 * @returns {Date}
 */
function toGregorian(jy, jm, jd) {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

/**
 * شروع دوره فعلی (۱ تیر سال جاری یا گذشته) رو برمیگردونه
 *
 * منطق:
 * - اگه الان بعد از ۱ تیر سال جاری باشه → شروع دوره = ۱ تیر سال جاری
 * - اگه الان قبل از ۱ تیر باشه → شروع دوره = ۱ تیر سال قبل
 *
 * @param {Date} [now=new Date()] - تاریخ مرجع
 * @returns {Date} - تاریخ میلادی شروع دوره
 */
function getCurrentCycleStart(now = new Date()) {
  const { jy, jm } = toJalali(now);

  // 🔹 چک کن آیا از ۱ تیر سال جاری گذشته؟
  const isAfterThisYearTir =
    jm > CYCLE_START_MONTH ||
    (jm === CYCLE_START_MONTH && toJalali(now).jd >= CYCLE_START_DAY);

  const cycleYear = isAfterThisYearTir ? jy : jy - 1;

  return toGregorian(cycleYear, CYCLE_START_MONTH, CYCLE_START_DAY);
}

/**
 * پایان دوره فعلی (۳۱ خرداد سال بعد) رو برمیگردونه
 * @param {Date} [now=new Date()]
 * @returns {Date}
 */
function getCurrentCycleEnd(now = new Date()) {
  const start = getCurrentCycleStart(now);
  const { jy } = toJalali(start);

  // 🔹 آخرین روز سال شمسی بعدی = ۲۹ یا ۳۰ اسفند
  // برای سادگی، ۱ تیر سال بعد رو برمیگردونیم (بهعنوان end exclusive)
  return toGregorian(jy + 1, CYCLE_START_MONTH, CYCLE_START_DAY);
}

/**
 * آیا کاربر نیاز به ریست دوره داره؟
 * @param {Date} cycleStartDate - تاریخ شروع دوره فعلی کاربر
 * @param {Date} [now=new Date()]
 * @returns {boolean}
 */
function needsCycleReset(cycleStartDate, now = new Date()) {
  const currentCycleStart = getCurrentCycleStart(now);
  return cycleStartDate < currentCycleStart;
}

/**
 * اطلاعات کامل دوره فعلی
 * @param {Date} [now=new Date()]
 * @returns {{ start: Date, end: Date, jalaliStart: string, jalaliEnd: string, daysRemaining: number }}
 */
function getCycleInfo(now = new Date()) {
  const start = getCurrentCycleStart(now);
  const end = getCurrentCycleEnd(now);

  const startJ = toJalali(start);
  const endJ = toJalali(end);

  const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  return {
    start,
    end,
    jalaliStart: `${startJ.jy}/${String(startJ.jm).padStart(2, "0")}/${String(startJ.jd).padStart(2, "0")}`,
    jalaliEnd: `${endJ.jy}/${String(endJ.jm).padStart(2, "0")}/${String(endJ.jd).padStart(2, "0")}`,
    daysRemaining: Math.max(0, daysRemaining),
  };
}

module.exports = {
  toJalali,
  toGregorian,
  getCurrentCycleStart,
  getCurrentCycleEnd,
  needsCycleReset,
  getCycleInfo,
};
