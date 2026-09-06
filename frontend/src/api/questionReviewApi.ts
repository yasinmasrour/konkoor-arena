import api from "./axios";
import type { Question, QuestionAuthor } from "./questionApi";

export type ReviewDecision = "approved" | "changes_requested" | "archived";

export interface QuestionReviewItem {
  id: string;
  decision: ReviewDecision;
  note: string;
  createdAt: string;
  reviewer?: QuestionAuthor;
}

export interface ReviewQuestion extends Question {
  reviews: QuestionReviewItem[];
}

export interface ReviewQueueResponse {
  questions: Question[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getReviewQueue = async (params: Record<string, string | number | undefined>) => {
  const response = await api.get<ReviewQueueResponse>("/questions/review", { params });
  return response.data;
};

export const getQuestionReview = async (id: string) => {
  const response = await api.get<{ question: ReviewQuestion }>(`/questions/review/${id}`);
  return response.data.question;
};

export const reviewQuestion = async (id: string, decision: ReviewDecision, note?: string) => {
  const response = await api.post<{ message: string; question: ReviewQuestion }>(`/questions/review/${id}/decision`, {
    decision,
    note,
  });
  return response.data.question;
};
