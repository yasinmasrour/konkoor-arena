const prisma = require("../config/prisma");

// 🔹 حروف و اعداد بدون کاراکترهای گیجکننده
// حذف شده: O, 0, I, 1, L
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * تولید کد رندوم با طول مشخص
 * @param {number} length - طول کد (پیشفرض ۶)
 * @returns {string}
 */
function randomCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/**
 * تولید کد یونیک referralCode
 * @param {number} maxAttempts - حداکثر تلاش (پیشفرض ۱۰)
 * @returns {Promise<string>}
 */
async function generateUniqueReferralCode(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const code = randomCode(6);
    const exists = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error(
    `نتونستم کد یونیک تولید کنم بعد از ${maxAttempts} تلاش.`
  );
}

module.exports = {
  generateUniqueReferralCode,
  randomCode,
  ALPHABET,
};