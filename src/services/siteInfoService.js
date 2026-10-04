const prisma = require("../config/prisma");
const AppError = require("../utils/appError");

const SINGLETON_ID = "singleton";

// 🆕 کش ۵ دقیقه‌ای
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache = {
  data: null,
  expiresAt: 0,
};

const invalidateCache = () => {
  cache = { data: null, expiresAt: 0 };
};

/**
 * دریافت اطلاعات سایت (با کش)
 */
const getSiteInfo = async () => {
  // چک کش
  if (cache.data && cache.expiresAt > Date.now()) {
    return cache.data;
  }

  // اگه رکورد وجود نداره، یکی با مقادیر خالی بساز
  let info = await prisma.siteInfo.findUnique({
    where: { id: SINGLETON_ID },
  });

  if (!info) {
    info = await prisma.siteInfo.create({
      data: { id: SINGLETON_ID },
    });
  }

  cache = {
    data: info,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  return info;
};

/**
 * آپدیت اطلاعات سایت
 */
const updateSiteInfo = async (data) => {
  // فیلدهای مجاز
  const allowedFields = [
    "phoneFixed",
    "phoneMobile",
    "emailMain",
    "emailSupport",
    "address",
    "instagramUrl",
    "telegramUrl",
    "aparatUrl",
    "workingHours",
    "aboutShort",
    "enamadEnabled",
    "enamadHtml",
  ];

  const safeData = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      safeData[key] = data[key];
    }
  }

  if (Object.keys(safeData).length === 0) {
    throw new AppError("No valid fields to update", 400);
  }

  // upsert: اگه رکورد هست آپدیت، وگرنه بساز
  const info = await prisma.siteInfo.upsert({
    where: { id: SINGLETON_ID },
    update: safeData,
    create: {
      id: SINGLETON_ID,
      ...safeData,
    },
  });

  // کش رو پاک کن تا دفعه بعد دوباره از DB خونده بشه
  invalidateCache();

  return info;
};

module.exports = {
  getSiteInfo,
  updateSiteInfo,
};
