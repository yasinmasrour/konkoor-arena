// ==================== API Types ====================
export interface AttemptQuestion {
  id: string;
  questionText: string;
  questionImage: string;
  options: string[];
  difficulty: string;
  score: number;
  selectedAnswer: number | null;
  isFlagged: boolean;
}

export type BookletStatus = "pending" | "active" | "resting" | "finished";

export interface AttemptBooklet {
  id: string;
  bookletId: string;
  title: string;
  lesson: string;
  grade: string;
  major: string;
  order: number;
  duration: number;
  status: BookletStatus;
  startedAt: string | null;
  finishedAt: string | null;
  restUntil: string | null;
  finishedReason: string | null;
  secondsRemaining: number | null;
  questions: AttemptQuestion[];
}

export interface AttemptStateResponse {
  attemptId: string;
  status: "started" | "submitted";
  exam: {
    id: string;
    title: string;
  };
  booklets: AttemptBooklet[];
  activeBookletId: string | null;
  restingBookletId: string | null;
  restSecondsRemaining: number | null;
  serverTime: string;
}

// ==================== Local State Types ====================
export interface LocalAttemptState {
  currentQuestionIndex: number;
  flagOverrides: Record<string, boolean>;
  answerOverrides: Record<string, number>;
}
