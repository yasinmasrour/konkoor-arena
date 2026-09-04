import api from "./axios";

export interface AIAnalysisSubject {
  notes?: string;
  correct: number;
  wrong: number;
  unanswered: number;
  percentage: number;
  totalQuestions?: number;
  dataQualityIssues?: string[];
}

export interface AIAnalysisData {
  overall: string;
  strengths: string[];
  weaknesses: string[];
  subjectAnalysis: Record<string, AIAnalysisSubject>;
  priorities: string[];
  recommendations: string[];
}

export interface AIAnalysisResponse {
  attemptId: string;
  status: string;
  model: string;
  generatedAt: string;
  analysis: AIAnalysisData;
  cached?: boolean;
}

export const generateAIAnalysis = async (attemptId: string) => {
  const response = await api.post<{
    message: string;
    result: AIAnalysisResponse;
  }>(`/attempts/${attemptId}/ai-analysis`);

  return response.data.result;
};
