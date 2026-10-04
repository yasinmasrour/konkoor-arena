import api from "./axios";

export interface PublicStats {
  totalStudents: number;
  totalQuestions: number;
  totalExams: number;
  totalArenaMatches: number;
  todayArenaMatches: number;
  generatedAt: string;
}

/**
 * دریافت آمار عمومی (کش ۵ دقیقه‌ای در سرور)
 */
export const getPublicStats = async (): Promise<PublicStats> => {
  const response = await api.get<PublicStats>("/public/stats");
  return response.data;
};

// 🆕 کش ۵ دقیقه‌ای در sessionStorage
// ⚠️ اگه ساختار PublicStats تغییر کرد، نسخه رو بالا ببر (v3, v4, ...)
// تا کش قدیمی مرورگرها دور زده بشه
const CACHE_KEY = "griffin-public-stats-v2";
const CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedStats {
  data: PublicStats;
  timestamp: number;
}

export const getPublicStatsCached = async (): Promise<PublicStats> => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached: CachedStats = JSON.parse(raw);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
    }
  } catch {
    // ignore cache errors
  }

  const data = await getPublicStats();
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() }),
    );
  } catch {
    // ignore storage errors
  }
  return data;
};

// 🆕 Fallback برای زمانی که API در دسترس نیست
export const FALLBACK_STATS: PublicStats = {
  totalStudents: 12000,
  totalQuestions: 45000,
  totalExams: 120,
  totalArenaMatches: 8500,
  todayArenaMatches: 120,
  generatedAt: new Date().toISOString(),
};
