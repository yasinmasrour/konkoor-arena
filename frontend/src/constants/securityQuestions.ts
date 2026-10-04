// ============================================================
// SECURITY QUESTIONS — Frontend Constants
// ============================================================
// این باید با `src/constants/securityQuestions.js` در بک‌اند
// یکسان باشد.
// ============================================================

export const SECURITY_QUESTIONS: Record<string, string> = {
  FIRST_TEACHER: "اسم اولین معلمت چی بود؟",
  FIRST_PET: "اسم اولین حیوان خانگیت چی بود؟",
  BIRTH_CITY: "توی کدوم شهر به دنیا اومدی؟",
  CHILDHOOD_FRIEND: "اسم بهترین دوست دوران کودکیت چی بود؟",
  FIRST_SCHOOL: "اسم اولین مدرسه‌ای که رفتی چی بود؟",
  FIRST_CAR_PLATE: "شماره پلاک اولین ماشینت چی بود؟",
};

export const SECURITY_QUESTIONS_LIST = Object.entries(SECURITY_QUESTIONS).map(
  ([key, text]) => ({ key, text }),
);
