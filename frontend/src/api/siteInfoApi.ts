import api from "./axios";

export interface SiteInfo {
  id: string;
  phoneFixed: string | null;
  phoneMobile: string | null;
  emailMain: string | null;
  emailSupport: string | null;
  address: string | null;

  instagramUrl: string | null;
  telegramUrl: string | null;
  aparatUrl: string | null;

  workingHours: string | null;
  aboutShort: string | null;

  enamadEnabled: boolean;
  enamadHtml: string | null;

  updatedAt: string;
}

export interface SiteInfoUpdatePayload {
  phoneFixed?: string;
  phoneMobile?: string;
  emailMain?: string;
  emailSupport?: string;
  address?: string;
  instagramUrl?: string;
  telegramUrl?: string;
  aparatUrl?: string;
  workingHours?: string;
  aboutShort?: string;
  enamadEnabled?: boolean;
  enamadHtml?: string;
}

/**
 * دریافت اطلاعات سایت (عمومی)
 */
export const getSiteInfo = async (): Promise<SiteInfo> => {
  const response = await api.get<{ siteInfo: SiteInfo }>("/public/site-info");
  return response.data.siteInfo;
};

/**
 * آپدیت اطلاعات سایت (فقط ادمین)
 */
export const updateSiteInfo = async (
  payload: SiteInfoUpdatePayload,
): Promise<SiteInfo> => {
  const response = await api.patch<{ siteInfo: SiteInfo }>(
    "/admin/site-info",
    payload,
  );
  return response.data.siteInfo;
};

// 🆕 کش ۵ دقیقه‌ای در sessionStorage
const CACHE_KEY = "griffin-site-info-v1";
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedInfo {
  data: SiteInfo;
  timestamp: number;
}

export const getSiteInfoCached = async (): Promise<SiteInfo> => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached: CachedInfo = JSON.parse(raw);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
    }
  } catch {
    // ignore
  }

  const data = await getSiteInfo();
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch {
    // ignore
  }
  return data;
};

// 🆕 Fallback برای زمان خطا
export const FALLBACK_SITE_INFO: SiteInfo = {
  id: "singleton",
  phoneFixed: "۰۲۱-۱۲۳۴۵۶۷۸",
  phoneMobile: "",
  emailMain: "info@griffin-academy.ir",
  emailSupport: "",
  address: "تهران، ایران",
  instagramUrl: "",
  telegramUrl: "",
  aparatUrl: "",
  workingHours: "شنبه تا پنجشنبه، ۹ تا ۱۸",
  aboutShort:
    "آکادمی گریفین، پلتفرم هوشمند یادگیری، آزمون و رقابت برای دانش‌آموزان کنکوری. مسیر موفقیت را با ما تجربه کن.",
  enamadEnabled: false,
  enamadHtml: "",
  updatedAt: new Date().toISOString(),
};
