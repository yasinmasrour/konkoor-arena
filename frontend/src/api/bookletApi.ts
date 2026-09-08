import api from "./axios";

export type BookletStatus = "draft" | "review" | "published" | "archived";

export interface BookletQuestion {
  id: string;
  bookletId: string;
  questionId: string;
  order: number;
  score: number;
  question: {
    id: string;
    code: string;
    lesson: string;
    grade: string;
    major: string;
    chapter: string;
    topic?: string;
    questionText: string;
    questionImage?: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    difficulty: string;
  };
}

export interface Booklet {
  id: string;
  title: string;
  lesson: string;
  grade: string;
  major: string;
  examDate: string;
  duration: number;
  status: BookletStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: { id: string; firstName: string; lastName: string };
  questions: BookletQuestion[];
  _count?: { questions: number; examBooklets: number };
}

export interface BookletPayload {
  title: string;
  lesson: string;
  grade: string;
  major: string;
  examDate: string;
  duration: number;
  questionIds?: string[];
}

export interface BookletListResponse {
  booklets: Booklet[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const getBooklets = async (params: Record<string, string | number | undefined>) => {
  const response = await api.get<BookletListResponse>("/booklets", { params });
  return response.data;
};

export const getBooklet = async (id: string) => {
  const response = await api.get<{ booklet: Booklet }>(`/booklets/${id}`);
  return response.data.booklet;
};

export const createBooklet = async (payload: BookletPayload) => {
  const response = await api.post<{ booklet: Booklet }>("/booklets", payload);
  return response.data.booklet;
};

export const updateBooklet = async (id: string, payload: Partial<BookletPayload>) => {
  const response = await api.patch<{ booklet: Booklet }>(`/booklets/${id}`, payload);
  return response.data.booklet;
};

export const setBookletStatus = async (id: string, status: BookletStatus) => {
  const response = await api.patch<{ booklet: Booklet }>(`/booklets/${id}/status`, { status });
  return response.data.booklet;
};

export const addBookletQuestions = async (id: string, questionIds: string[]) => {
  const response = await api.post<{ booklet: Booklet }>(`/booklets/${id}/questions`, { questionIds });
  return response.data.booklet;
};

export const removeBookletQuestion = async (id: string, questionId: string) => {
  const response = await api.delete<{ booklet: Booklet }>(`/booklets/${id}/questions/${questionId}`);
  return response.data.booklet;
};

export const reorderBookletQuestions = async (id: string, questionIds: string[]) => {
  const response = await api.put<{ booklet: Booklet }>(`/booklets/${id}/questions/reorder`, { questionIds });
  return response.data.booklet;
};

export const duplicateBooklet = async (id: string) => {
  const response = await api.post<{ booklet: Booklet }>(`/booklets/${id}/duplicate`);
  return response.data.booklet;
};

export const deleteBooklet = async (id: string) => {
  await api.delete(`/booklets/${id}`);
};
