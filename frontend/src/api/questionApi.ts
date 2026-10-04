import api from "./axios";

export type QuestionStatus = "draft" | "review" | "published" | "archived";
export type QuestionDifficulty = "easy" | "medium" | "hard" | "tricky";

export interface QuestionAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface Question {
  id: string;
  code: string;
  lesson: string;
  grade: string;
  major: string;
  chapter: string;
  topic: string;
  questionText: string;
  questionImage: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  explanationPdf: string;
  source: string;
  author: string;
  year: number | null;
  difficulty: QuestionDifficulty;
  tags: string[];
  usageCount: number;
  status: QuestionStatus;
  isArena: boolean;
  createdById: string;
  createdBy?: QuestionAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionPayload {
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
  explanationPdf?: string;
  source?: string;
  author?: string;
  year?: number;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  isArena?: boolean;
}

export interface QuestionListResponse {
  questions: Question[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getQuestions = async (
  params: Record<string, string | number | boolean | undefined>,
) => {
  const response = await api.get<QuestionListResponse>("/questions", {
    params,
  });
  return response.data;
};

export const getQuestion = async (id: string) => {
  const response = await api.get<{ question: Question }>(`/questions/${id}`);
  return response.data.question;
};

export const createQuestion = async (payload: QuestionPayload) => {
  const response = await api.post<{ question: Question }>(
    "/questions",
    payload,
  );
  return response.data.question;
};

export const updateQuestion = async (
  id: string,
  payload: Partial<QuestionPayload>,
) => {
  const response = await api.patch<{ question: Question }>(
    `/questions/${id}`,
    payload,
  );
  return response.data.question;
};

export const submitQuestionForReview = async (id: string) => {
  const response = await api.post<{ question: Question }>(
    `/questions/${id}/submit-review`,
  );
  return response.data.question;
};

export const setQuestionStatus = async (id: string, status: QuestionStatus) => {
  const response = await api.patch<{ question: Question }>(
    `/questions/${id}/status`,
    { status },
  );
  return response.data.question;
};

export const duplicateQuestion = async (id: string) => {
  const response = await api.post<{ question: Question }>(
    `/questions/${id}/duplicate`,
  );
  return response.data.question;
};

export const bulkSetQuestionStatus = async (
  ids: string[],
  status: QuestionStatus,
) => {
  const response = await api.patch<{ questions: Question[] }>(
    "/questions/bulk-status",
    { ids, status },
  );
  return response.data.questions;
};

export const exportQuestions = async (
  params: Record<string, string | number | boolean | undefined>,
) => {
  const response = await api.get<Blob>("/questions/export", {
    params,
    responseType: "blob",
  });
  return {
    blob: response.data,
    count: Number(response.headers["x-exported-count"] || 0),
  };
};

// 🆕 حذف سؤال
export const deleteQuestion = async (id: string) => {
  const response = await api.delete<{ message: string }>(`/questions/${id}`);
  return response.data;
};