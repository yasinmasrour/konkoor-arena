import api from "./axios";

// ==================== Types ====================
export interface StrategyData {
  lessons: string[];
  exams: Array<{
    title: string;
    cells: string[];
  }>;
}

export interface StrategyPlan {
  id: string;
  title: string;
  description: string | null;
  grade: string;
  major: string;
  data: StrategyData;
  isPublished: boolean;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ListPlansResponse {
  plans: StrategyPlan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BestPlanResponse {
  plan: StrategyPlan | null;
  reason: "found" | "no_plan" | "profile_incomplete";
}

// ==================== API Functions ====================

// 🔹 لیست منتشرشدهها (عمومی)
export const getPublishedPlans = async (params?: {
  grade?: string;
  major?: string;
  page?: number;
  limit?: number;
}): Promise<ListPlansResponse> => {
  const response = await api.get("/strategy-plans", { params });
  return response.data;
};

// 🔹 جزئیات یه برنامه
export const getPublishedPlanById = async (
  id: string,
): Promise<{ plan: StrategyPlan }> => {
  const response = await api.get(`/strategy-plans/${id}`);
  return response.data;
};

// 🔹 بهترین برنامه برای من
export const getBestPlanForMe = async (): Promise<BestPlanResponse> => {
  const response = await api.get("/strategy-plans/me/best");
  return response.data;
};

// ==================== ادمین ====================

// 🔹 لیست همه (ادمین)
export const adminListPlans = async (params?: {
  grade?: string;
  major?: string;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}): Promise<ListPlansResponse> => {
  const response = await api.get("/admin/strategy-plans", { params });
  return response.data;
};

// 🔹 جزئیات (ادمین)
export const adminGetPlan = async (
  id: string,
): Promise<{ plan: StrategyPlan }> => {
  const response = await api.get(`/admin/strategy-plans/${id}`);
  return response.data;
};

// 🔹 ساخت
export const adminCreatePlan = async (data: {
  title: string;
  description?: string;
  grade: string;
  major: string;
  data: StrategyData;
  isPublished?: boolean;
}): Promise<{ message: string; plan: StrategyPlan }> => {
  const response = await api.post("/admin/strategy-plans", data);
  return response.data;
};

// 🔹 ویرایش
export const adminUpdatePlan = async (
  id: string,
  data: Partial<{
    title: string;
    description: string;
    grade: string;
    major: string;
    data: StrategyData;
  }>,
): Promise<{ message: string; plan: StrategyPlan }> => {
  const response = await api.patch(`/admin/strategy-plans/${id}`, data);
  return response.data;
};

// 🔹 حذف
export const adminDeletePlan = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/strategy-plans/${id}`);
  return response.data;
};

// 🔹 انتشار
export const adminPublishPlan = async (
  id: string,
): Promise<{ message: string; plan: StrategyPlan }> => {
  const response = await api.patch(`/admin/strategy-plans/${id}/publish`);
  return response.data;
};

// 🔹 لغو انتشار
export const adminUnpublishPlan = async (
  id: string,
): Promise<{ message: string; plan: StrategyPlan }> => {
  const response = await api.patch(`/admin/strategy-plans/${id}/unpublish`);
  return response.data;
};

// ==================== Helpers ====================

export const GRADE_LABELS: Record<string, string> = {
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",
};

export const MAJOR_LABELS: Record<string, string> = {
  math: "ریاضی",
  experimental: "تجربی",
  humanities: "انسانی",
};

export const GRADE_OPTIONS = [
  { value: "10", label: "دهم" },
  { value: "11", label: "یازدهم" },
  { value: "12", label: "دوازدهم" },
];

export const MAJOR_OPTIONS = [
  { value: "math", label: "ریاضی" },
  { value: "experimental", label: "تجربی" },
  { value: "humanities", label: "انسانی" },
];
