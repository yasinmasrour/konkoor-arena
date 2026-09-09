import api from "./axios";

export type ExamStatus = "draft" | "review" | "published" | "archived";

export interface ExamBookletItem {
  id: string;
  examId: string;
  bookletId: string;
  order: number;
  booklet: {
    id: string;
    title: string;
    lesson: string;
    grade: string;
    major: string;
    examDate: string;
    duration: number;
    status: string;
    questions: Array<{ id: string; questionId: string; order: number; score: number }>;
  };
}

export interface Exam {
  id: string;
  title: string;
  examDate: string;
  startTime: string;
  endTime: string;
  status: ExamStatus;
  booklets: ExamBookletItem[];
  duration?: number;
  questionCount?: number;
  lesson?: string;
  grade?: string;
  major?: string;
  createdBy?: { id?: string; firstName: string; lastName: string };
}

export interface ExamsResponse {
  exams: Exam[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface ExamPayload {
  title: string;
  examDate: string;
  startTime: string;
  endTime?: string;
  bookletIds: string[];
}

export const getExams = async (params: Record<string, string | number | undefined> = {}) => {
  const response = await api.get<ExamsResponse>("/exams", { params });
  return response.data;
};

export const getExam = async (id: string) => {
  const response = await api.get<{ exam: Exam }>(`/exams/${id}`);
  return response.data.exam;
};

export const createExam = async (payload: ExamPayload) => {
  const response = await api.post<{ exam: Exam }>("/exams", payload);
  return response.data.exam;
};

export const updateExam = async (id: string, payload: Partial<Omit<ExamPayload, "bookletIds">>) => {
  const response = await api.patch<{ exam: Exam }>(`/exams/${id}`, payload);
  return response.data.exam;
};

export const changeExamStatus = async (id: string, status: ExamStatus) => {
  const response = await api.patch<{ exam: Exam }>(`/exams/${id}/status`, { status });
  return response.data.exam;
};

export const addExamBooklets = async (id: string, bookletIds: string[]) => {
  const response = await api.post<{ exam: Exam }>(`/exams/${id}/booklets`, { bookletIds });
  return response.data.exam;
};

export const removeExamBooklet = async (id: string, bookletId: string) => {
  const response = await api.delete<{ exam: Exam }>(`/exams/${id}/booklets/${bookletId}`);
  return response.data.exam;
};

export const reorderExamBooklets = async (id: string, booklets: Array<{ id: string; order: number }>) => {
  const response = await api.patch<{ exam: Exam }>(`/exams/${id}/booklets/order`, { booklets });
  return response.data.exam;
};

export const duplicateExam = async (id: string) => {
  const response = await api.post<{ exam: Exam }>(`/exams/${id}/duplicate`);
  return response.data.exam;
};

export const deleteExam = async (id: string) => {
  await api.delete(`/exams/${id}`);
};
