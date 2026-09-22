import api from "./axios";

// ==================== Types ====================
export type StudyPlanStatus = "active" | "completed" | "archived";
export type StudyTaskPriority = "high" | "medium" | "low";
export type PersonalExamStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "abandoned";

export interface StudyTask {
  id: string;
  planId: string;
  title: string;
  description: string;
  lesson: string | null;
  chapter: string | null;
  priority: StudyTaskPriority;
  estimatedMinutes: number | null;
  dueDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPlanAuthor {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  description: string | null;
  status: StudyPlanStatus;
  startDate: string;
  endDate: string | null;
  totalTasks: number;
  completedTasks: number;
  student?: StudyPlanAuthor;
  counselor?: StudyPlanAuthor;
  exam?: {
    id: string;
    title: string;
    examDate: string;
  } | null;
  personalExam?: {
    id: string;
    status: PersonalExamStatus;
    score: number;
    totalScore: number;
    title?: string;
    timeLimit?: number;
    _count?: { questions: number };
  } | null;
  tasks?: StudyTask[];
  tasksCount?: number;
  createdAt: string;
}

export interface ListPlansResponse {
  plans: StudyPlan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== مشاور/ادمین ====================

// 🔹 لیست برنامه‌ها
export const listPlans = async (params?: {
  status?: StudyPlanStatus;
  studentId?: string;
  examId?: string;
  page?: number;
  limit?: number;
}): Promise<ListPlansResponse> => {
  const response = await api.get("/counselor/plans", { params });
  return response.data;
};

// 🔹 جزئیات
export const getPlanById = async (
  planId: string,
): Promise<{ plan: StudyPlan }> => {
  const response = await api.get(`/counselor/plans/${planId}`);
  return response.data;
};

// 🔹 ساخت برنامه
export const createPlan = async (data: {
  studentId: string;
  examId?: string | null;
  title: string;
  description?: string;
  endDate?: string | null;
  tasks?: Array<{
    title: string;
    description?: string;
    lesson?: string;
    chapter?: string;
    priority?: StudyTaskPriority;
    estimatedMinutes?: number;
    dueDate?: string | null;
  }>;
}): Promise<{ message: string; plan: StudyPlan }> => {
  const response = await api.post("/counselor/plans", data);
  return response.data;
};

// 🔹 ویرایش برنامه
export const updatePlan = async (
  planId: string,
  data: Partial<{
    title: string;
    description: string;
    endDate: string | null;
    status: StudyPlanStatus;
  }>,
): Promise<{ message: string; plan: StudyPlan }> => {
  const response = await api.patch(`/counselor/plans/${planId}`, data);
  return response.data;
};

// 🔹 حذف
export const deletePlan = async (
  planId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/counselor/plans/${planId}`);
  return response.data;
};

// 🔹 افزودن تسک
export const addTask = async (
  planId: string,
  data: {
    title: string;
    description?: string;
    lesson?: string;
    chapter?: string;
    priority?: StudyTaskPriority;
    estimatedMinutes?: number;
    dueDate?: string | null;
  },
): Promise<{ message: string; task: StudyTask }> => {
  const response = await api.post(`/counselor/plans/${planId}/tasks`, data);
  return response.data;
};

// 🔹 ویرایش تسک
export const updateTask = async (
  planId: string,
  taskId: string,
  data: Partial<{
    title: string;
    description: string;
    lesson: string | null;
    chapter: string | null;
    priority: StudyTaskPriority;
    estimatedMinutes: number | null;
    dueDate: string | null;
    order: number;
  }>,
): Promise<{ message: string; task: StudyTask }> => {
  const response = await api.patch(
    `/counselor/plans/${planId}/tasks/${taskId}`,
    data,
  );
  return response.data;
};

// 🔹 حذف تسک
export const deleteTask = async (
  planId: string,
  taskId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(
    `/counselor/plans/${planId}/tasks/${taskId}`,
  );
  return response.data;
};

// ==================== آزمون شخصی (مشاور) ====================

// 🔹 ساخت آزمون شخصی
export const createPersonalExam = async (
  planId: string,
  data: {
    title: string;
    timeLimit: number;
    questionIds: string[];
  },
): Promise<{ message: string; exam: { id: string } }> => {
  const response = await api.post(`/counselor/plans/${planId}/exam`, data);
  return response.data;
};

// 🔹 جزئیات آزمون
export const getPersonalExam = async (
  planId: string,
): Promise<{ exam: unknown }> => {
  const response = await api.get(`/counselor/plans/${planId}/exam`);
  return response.data;
};

// 🔹 حذف آزمون
export const deletePersonalExam = async (
  planId: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/counselor/plans/${planId}/exam`);
  return response.data;
};

// ==================== دانش‌آموز ====================

// 🔹 برنامه‌های من
export const getMyPlans = async (params?: {
  status?: StudyPlanStatus;
  page?: number;
  limit?: number;
}): Promise<ListPlansResponse> => {
  const response = await api.get("/study-plans/me", { params });
  return response.data;
};

// 🔹 جزئیات برنامه من
export const getMyPlan = async (
  planId: string,
): Promise<{ plan: StudyPlan }> => {
  const response = await api.get(`/study-plans/${planId}`);
  return response.data;
};

// 🔹 تیک/برداشتن تسک
export const toggleTask = async (
  planId: string,
  taskId: string,
): Promise<{ message: string; task: StudyTask }> => {
  const response = await api.patch(
    `/study-plans/${planId}/tasks/${taskId}/toggle`,
  );
  return response.data;
};

// ==================== Helpers ====================

export const PRIORITY_LABELS: Record<StudyTaskPriority, string> = {
  high: "بالا",
  medium: "متوسط",
  low: "پایین",
};

export const PRIORITY_COLORS: Record<
  StudyTaskPriority,
  { bg: string; text: string; border: string }
> = {
  high: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30",
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
  },
  low: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
  },
};

export const STATUS_LABELS: Record<StudyPlanStatus, string> = {
  active: "فعال",
  completed: "تکمیل‌شده",
  archived: "آرشیو",
};

export const STATUS_COLORS: Record<
  StudyPlanStatus,
  { bg: string; text: string }
> = {
  active: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  completed: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  archived: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
};

export const formatPlanDate = (date: string | null): string => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export const getProgressPercent = (plan: StudyPlan): number => {
  if (plan.totalTasks === 0) return 0;
  return Math.round((plan.completedTasks / plan.totalTasks) * 100);
};
