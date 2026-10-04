// ============================================================
// SECURITY QUESTIONS
// ============================================================
// لیست ثابت سوالات امنیتی برای بازیابی رمز عبور.
// کاربر یکی رو انتخاب میکنه و جوابش رو وارد میکنه.

const SECURITY_QUESTIONS = {
  FIRST_TEACHER: "اسم اولین معلمت چی بود؟",
  FIRST_PET: "اسم اولین حیوان خانگیت چی بود؟",
  BIRTH_CITY: "توی کدوم شهر به دنیا اومدی؟",
  CHILDHOOD_FRIEND: "اسم بهترین دوست دوران کودکیت چی بود؟",
  FIRST_SCHOOL: "اسم اولین مدرسه‌ای که رفتی چی بود؟",
  FIRST_CAR_PLATE: "شماره پلاک اولین ماشینت چی بود؟",
};

// کلیدها برای ولیدیشن
const SECURITY_QUESTIONS_KEYS = Object.keys(SECURITY_QUESTIONS);

module.exports = {
  SECURITY_QUESTIONS,
  SECURITY_QUESTIONS_KEYS,
};
