import api from "./axios";

// ==================== Typeها ====================
export interface AIAnalysisOverall {
  summary: string;
  keyTakeaway: string;
  performanceLevel: string | null;
}

export interface AIAnalysisStrength {
  title: string;
  evidence: string;
  why: string;
}

export interface AIAnalysisWeakness {
  title: string;
  evidence: string;
  possibleCause: string | null;
}

export interface AIAnalysisSubject {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
  percentage: number;
  notes: string;
  dataQualityIssues: string[];
}

export interface AIAnalysisPriority {
  topic: string;
  priority: "بالا" | "متوسط" | "پایین";
  reason: string;
}

export interface AIAnalysisRecommendation {
  title: string;
  description: string;
}

export interface AIAnalysisComparisonWithAverage {
  yourScore: number;
  averageScore: number;
  difference: number;
  participantsCount: number;
  level: "بالاتر" | "پایین‌تر" | "برابر";
  percentile: number | null;
}

export interface AIAnalysisComparison {
  withAverage: AIAnalysisComparisonWithAverage;
  interpretation: string;
}

export interface AIAnalysisData {
  overall: AIAnalysisOverall;
  strengths: AIAnalysisStrength[];
  weaknesses: AIAnalysisWeakness[];
  subjectAnalysis: Record<string, AIAnalysisSubject>;
  priorities: AIAnalysisPriority[];
  recommendations: AIAnalysisRecommendation[];
  comparison: AIAnalysisComparison;
}

export interface AIAnalysisResponse {
  attemptId: string;
  status: string;
  model: string;
  generatedAt: string;
  analysis: AIAnalysisData;
  cached?: boolean;
}

// ==================== API ====================
export const generateAIAnalysis = async (attemptId: string) => {
  const response = await api.post<{
    message: string;
    result: AIAnalysisResponse;
  }>(`/attempts/${attemptId}/ai-analysis`);

  return response.data.result;
};
