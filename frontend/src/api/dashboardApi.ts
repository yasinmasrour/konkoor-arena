import api from "./axios";

export interface StudentStats {
  arenaRating: number;
  arenaMatches: number;
  examsTaken: number;
  progress: number;
}

export interface SubscriptionInfo {
  hasActive: boolean;
  planTitle: string | null;
  endDate: string | null;
  remainingDays: number;
  totalDays: number;
  progress: number;
}

export interface StudentHomeData {
  stats: StudentStats;
  subscription: SubscriptionInfo;
}

export interface AdminBadges {
  contactMessages: number;
}

/**
 * دریافت آمار صفحه اول داشبورد دانش‌آموز
 */
export const getStudentHome = async (): Promise<StudentHomeData> => {
  const response = await api.get("/dashboard/student-home");
  return response.data;
};

/**
 * دریافت badgeهای ادمین
 */
export const getAdminBadges = async (): Promise<AdminBadges> => {
  const response = await api.get("/dashboard/admin-badges");
  return response.data;
};