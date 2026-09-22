/**
 * تبدیل عنوان به slug قابل استفاده در URL
 * - حروف فارسی و انگلیسی نگه داشته میشن
 * - فاصله‌ها به - تبدیل میشن
 * - کاراکترهای خاص حذف میشن
 * - به lowercase تبدیل میشه
 *
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  if (!text || typeof text !== "string") return "";

  return (
    text
      .toString()
      .trim()
      .toLowerCase()
      // 🔹 اعداد فارسی به انگلیسی
      .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
      .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString())
      // 🔹 حذف کاراکترهای غیرمجاز (نگه‌داشتن حروف فارسی/انگلیسی/اعداد)
      .replace(/[^\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9\s-]/g, "")
      // 🔹 فاصله‌ها به -
      .replace(/\s+/g, "-")
      // 🔹 حذف - های تکراری
      .replace(/-+/g, "-")
      // 🔹 حذف - از ابتدا و انتها
      .replace(/^-+|-+$/g, "")
      // 🔹 حداکثر طول
      .slice(0, 200)
  );
}

/**
 * تولید slug یکتا با چک کردن دیتابیس
 * @param {string} text
 * @param {Function} checkFn - تابعی که یه slug می‌گیره و برمی‌گردونه آیا وجود داره یا نه
 * @returns {Promise<string>}
 */
async function generateUniqueSlug(text, checkFn) {
  const baseSlug = slugify(text);
  if (!baseSlug) {
    // 🔹 اگه عنوان خالی بود، یه slug رندوم بساز
    return `post-${Date.now().toString(36)}`;
  }

  let slug = baseSlug;
  let counter = 1;

  while (await checkFn(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;

    if (counter > 100) {
      // 🔹 اگه ۱۰۰ بار تکراری بود، رندوم بذار
      slug = `${baseSlug}-${Date.now().toString(36)}`;
      break;
    }
  }

  return slug;
}

module.exports = {
  slugify,
  generateUniqueSlug,
};
