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

/**
 * دریافت آمار صفحه اول داشبورد دانش‌آموز
 */
export const getStudentHome = async (): Promise<StudentHomeData> => {
  const response = await api.get("/dashboard/student-home");
  return response.data;
};