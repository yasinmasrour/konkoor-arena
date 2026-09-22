import api from "./axios";

// ==================== Types ====================
export type SoloLevel = "easy" | "medium" | "hard";
export type SoloStatus = "playing" | "won" | "lost" | "abandoned";

export interface SoloLevelInfo {
  key: SoloLevel;
  label: string;
  timeLimit: number;
}

export interface SoloQuestion {
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
  difficulty: string;
}

export interface CurrentSoloQuestion {
  order: number;
  timeLimit: number;
  question: SoloQuestion;
}

export interface SoloInfo {
  id: string;
  level: SoloLevel;
  status: SoloStatus;
  correctAnswers: number;
  wrongAnswers: number;
  timeouts: number;
  livesRemaining: number;
  totalQuestions: number;
  answeredCount: number;
  startedAt: string;
  finishedAt: string | null;
  league: {
    id: string;
    title: string;
    lesson: string;
  };
}

export interface StartSoloResponse {
  message: string;
  solo: {
    id: string;
    level: SoloLevel;
    status: SoloStatus;
    correctAnswers: number;
    wrongAnswers: number;
    timeouts: number;
    livesRemaining: number;
    totalQuestions: number;
    startedAt: string;
    league: {
      id: string;
      title: string;
      lesson: string;
    };
  };
  currentQuestion: CurrentSoloQuestion | null;
}

export interface SoloStatusResponse {
  solo: SoloInfo;
  currentQuestion: CurrentSoloQuestion | null;
}

export interface AnswerSoloResponse {
  result: {
    order: number;
    isCorrect: boolean;
    isTimeout: boolean;
    correctAnswer: number;
    explanation: string;
    selectedAnswer: number | null;
  };
  stats: {
    correctAnswers: number;
    wrongAnswers: number;
    timeouts: number;
    livesRemaining: number;
    answeredCount: number;
    totalQuestions: number;
  };
  status: SoloStatus;
  nextQuestion: CurrentSoloQuestion | null;
}

export interface SoloHistoryItem {
  id: string;
  level: SoloLevel;
  status: SoloStatus;
  correctAnswers: number;
  wrongAnswers: number;
  timeouts: number;
  livesRemaining: number;
  startedAt: string;
  finishedAt: string | null;
  totalTimeMs: number | null;
  league: {
    id: string;
    title: string;
    lesson: string;
  };
}

export interface SoloHistoryResponse {
  matches: SoloHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SoloStats {
  total: number;
  won: number;
  lost: number;
  abandoned: number;
  winRate: number;
  byLevel: Array<{ level: SoloLevel; count: number }>;
  fastestWin: {
    totalTimeMs: number;
    level: SoloLevel;
    finishedAt: string;
  } | null;
}

// ==================== API Functions ====================

// 🔹 لیست سطحها
export const getSoloLevels = async (): Promise<{
  levels: SoloLevelInfo[];
}> => {
  const response = await api.get("/solo/levels");
  return response.data;
};

// 🔹 شروع بازی
export const startSolo = async (data: {
  leagueId: string;
  level: SoloLevel;
}): Promise<StartSoloResponse> => {
  const response = await api.post("/solo/start", data);
  return response.data;
};

// 🔹 وضعیت بازی
export const getSoloStatus = async (
  soloId: string,
): Promise<SoloStatusResponse> => {
  const response = await api.get(`/solo/${soloId}`);
  return response.data;
};

// 🔹 ثبت پاسخ
export const answerSolo = async (
  soloId: string,
  data: {
    order: number;
    selectedAnswer: number | null;
    timeSpentMs?: number;
  },
): Promise<AnswerSoloResponse> => {
  const response = await api.post(`/solo/${soloId}/answer`, data);
  return response.data;
};

// 🔹 انصراف
export const abandonSolo = async (
  soloId: string,
): Promise<{ message: string; solo: { id: string; status: string } }> => {
  const response = await api.post(`/solo/${soloId}/abandon`);
  return response.data;
};

// 🔹 تاریخچه
export const getSoloHistory = async (params?: {
  status?: SoloStatus;
  level?: SoloLevel;
  page?: number;
  limit?: number;
}): Promise<SoloHistoryResponse> => {
  const response = await api.get("/solo/history", { params });
  return response.data;
};

// 🔹 آمار
export const getSoloStats = async (): Promise<{ stats: SoloStats }> => {
  const response = await api.get("/solo/stats");
  return response.data;
};

// ==================== Helpers ====================

export const LEVEL_LABELS: Record<SoloLevel, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
};

export const LEVEL_COLORS: Record<
  SoloLevel,
  { bg: string; text: string; border: string; gradient: string }
> = {
  easy: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
    gradient: "from-emerald-500 to-emerald-700",
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    gradient: "from-amber-500 to-amber-700",
  },
  hard: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30",
    gradient: "from-rose-500 to-rose-700",
  },
};

export const STATUS_LABELS: Record<SoloStatus, string> = {
  playing: "در حال بازی",
  won: "برنده",
  lost: "باخته",
  abandoned: "انصراف",
};

export const STATUS_COLORS: Record<SoloStatus, { bg: string; text: string }> = {
  playing: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  won: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  lost: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  abandoned: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400" },
};
