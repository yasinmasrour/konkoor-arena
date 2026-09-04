import api from "../api/axios";
import type {
  AttemptResultResponse,
  AttemptReviewResponse,
  MyAttemptsResponse,
} from "../types/attempt";

export const startAttempt = async (examId: string) => {
  const response = await api.post(`/attempts/start/${examId}`);

  return response.data;
};

export const getAttemptQuestions = async (attemptId: string) => {
  const response = await api.get(`/attempts/${attemptId}/questions`);

  return response.data;
};

export const submitAnswer = async (
  attemptId: string,
  questionId: string,
  selectedAnswer: number,
) => {
  const response = await api.post(`/attempts/${attemptId}/answers`, {
    questionId,
    selectedAnswer,
  });

  return response.data;
};

export const submitAttempt = async (attemptId: string) => {
  const response = await api.post(`/attempts/${attemptId}/submit`);

  return response.data;
};

export const getAttemptResult = async (attemptId: string) => {
  const response = await api.get<AttemptResultResponse>(
    `/attempts/${attemptId}/result`,
  );

  return response.data;
};

export const getAttemptReview = async (attemptId: string) => {
  const response = await api.get<AttemptReviewResponse>(
    `/attempts/${attemptId}/review`,
  );

  return response.data;
};

export const getMyAttempts = async () => {
  const response = await api.get<MyAttemptsResponse>("/attempts/my");

  return response.data;
};
