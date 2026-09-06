import api from "./axios";

export interface QuestionAnalytics {
  totals: {
    total: number;
    draft: number;
    review: number;
    published: number;
    archived: number;
    unused: number;
    publishedUnused: number;
    totalUsage: number;
  };
  status: Array<{ status: string; count: number }>;
  difficulty: Array<{ difficulty: string; count: number }>;
  lessons: Array<{ lesson: string; count: number }>;
  grades: Array<{ grade: string; count: number }>;
  majors: Array<{ major: string; count: number }>;
  recentQuestions: Array<{
    id: string;
    code: string;
    lesson: string;
    status: string;
    difficulty: string;
    usageCount: number;
    updatedAt: string;
  }>;
  generatedAt: string;
}

export const getQuestionAnalytics = async () => {
  const response = await api.get<{ analytics: QuestionAnalytics }>("/questions/analytics");
  return response.data.analytics;
};
