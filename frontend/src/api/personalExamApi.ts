import api from "./axios";

// ==================== Types ====================
export type PersonalExamStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "abandoned";

export interface PersonalExamListItem {
  id: string;
  title: string;
  timeLimit: number;
  status: PersonalExamStatus;
  score: number;
  totalScore: number;
  startedAt: string | null;
  submittedAt: string | null;
  questionsCount: number;
  plan: {
    id: string;
    title: string;
    exam: { id: string; title: string } | null;
  };
  createdAt: string;
}

export interface PersonalExamQuestionData {
  id: string;
  order: number;
  questionId: string;
  questionText: string;
  questionImage: string | null;
  options: string[];
  selectedAnswer: number | null;
  answeredAt: string | null;
}

export interface PersonalExamStartResponse {
  exam: {
    id: string;
    title: string;
    timeLimit: number;
    status: PersonalExamStatus;
    startedAt: string | null;
    score: number;
    totalScore: number;
    plan: {
      id: string;
      title: string;
    };
  };
  questions: Array<{
    order: number;
    questionId: string;
    selectedAnswer: number | null;
    answeredAt: string | null;
    index: number;
  }>;
}

export interface PersonalExamAnswerResult {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  answeredAt: string;
  timeSpentMs: number | null;
}

export interface PersonalExamQuestionResult {
  order: number;
  questionId: string;
  questionText: string;
  questionImage: string | null;
  options: string[];
  selectedAnswer: number | null;
  correctAnswer: number;
  explanation: string;
  isCorrect: boolean;
  lesson: string | null;
  chapter: string | null;
  difficulty: string | null;
}

export interface PersonalExamResult {
  exam: {
    id: string;
    title: string;
    status: PersonalExamStatus;
    score: number;
    totalScore: number;
    startedAt: string | null;
    submittedAt: string | null;
    correctCount: number;
    wrongCount: number;
    unansweredCount: number;
    plan: {
      id: string;
      title: string;
      studentId: string;
      student: {
        id: string;
        firstName: string;
        lastName: string;
        username: string;
      };
    };
    student: {
      id: string;
      firstName: string;
      lastName: string;
      username: string;
    };
  };
  questions: PersonalExamQuestionResult[];
}

export interface PersonalExamsListResponse {
  exams: PersonalExamListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== API Functions ====================

// 🔹 آزمون‌های من
export const getMyPersonalExams = async (params?: {
  status?: PersonalExamStatus;
  page?: number;
  limit?: number;
}): Promise<PersonalExamsListResponse> => {
  const response = await api.get("/personal-exams/me", { params });
  return response.data;
};

// 🔹 شروع آزمون
export const startPersonalExam = async (
  examId: string,
): Promise<PersonalExamStartResponse> => {
  const response = await api.post(`/personal-exams/${examId}/start`);
  return response.data;
};

// 🔹 سوال فعلی
export const getCurrentPersonalExamQuestion = async (
  examId: string,
  order: number,
): Promise<{ question: PersonalExamQuestionData }> => {
  const response = await api.get(`/personal-exams/${examId}/current`, {
    params: { order },
  });
  return response.data;
};

// 🔹 ثبت پاسخ
export const submitPersonalExamAnswer = async (
  examId: string,
  data: {
    questionId: string;
    selectedAnswer: number | null;
    timeSpentMs?: number;
  },
): Promise<PersonalExamAnswerResult> => {
  const response = await api.post(`/personal-exams/${examId}/answer`, data);
  return response.data;
};

// 🔹 پایان آزمون
export const submitPersonalExam = async (
  examId: string,
): Promise<{
  message: string;
  exam: PersonalExamResult["exam"];
  answers: PersonalExamQuestionResult[];
}> => {
  const response = await api.post(`/personal-exams/${examId}/submit`);
  return response.data;
};

// 🔹 نتیجه
export const getPersonalExamResult = async (
  examId: string,
): Promise<PersonalExamResult> => {
  const response = await api.get(`/personal-exams/${examId}/result`);
  return response.data;
};

// 🔹 لغو
export const abandonPersonalExam = async (
  examId: string,
): Promise<{ message: string }> => {
  const response = await api.post(`/personal-exams/${examId}/abandon`);
  return response.data;
};

// ==================== Helpers ====================

export const EXAM_STATUS_LABELS: Record<PersonalExamStatus, string> = {
  pending: "در انتظار شروع",
  in_progress: "در حال انجام",
  completed: "تموم‌شده",
  abandoned: "لغو‌شده",
};

export const EXAM_STATUS_COLORS: Record<
  PersonalExamStatus,
  { bg: string; text: string }
> = {
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  in_progress: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  completed: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  abandoned: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
  },
};
