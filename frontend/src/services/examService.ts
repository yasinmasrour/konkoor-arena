import api from "../config/api";
import type { Exam } from "../types/exam";

export interface ExamsResponse {
  exams: Exam[];

  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getExams = async () => {
  const response = await api.get<ExamsResponse>("/exams");

  return response.data;
};

export const getExamById = async (id: string) => {
  const response = await api.get(`/exams/${id}`);

  return response.data;
};
