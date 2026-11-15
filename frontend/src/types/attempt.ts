// ==================== Questions ====================
export interface AttemptQuestion {
  id: string;
  questionText: string;
  questionImage: string;
  options: string[];
  difficulty: string;
  score: number;
}

export interface AttemptQuestionsResponse {
  attemptId: string;
  exam: {
    id: string;
    title: string;
  };
  questions: AttemptQuestion[];
}

// ==================== Result ====================
export interface AttemptSubjectResult {
  lesson: string;
  correct: number;
  wrong: number;
  unanswered: number;
  percentage: number;
}

export interface AttemptResultResponse {
  attemptId: string;

  exam: {
    id: string;
    title: string;
  };

  result: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    unansweredQuestions: number;
    negativeScore: number;
    percentage: number;

    subjects?: AttemptSubjectResult[];

    tarazScore: number | null;
    rank: number | null;
    percentile: number | null;
    totalParticipants: number;
    minParticipants: number;
    examAverage: number | null;
    examStdDev: number | null;
  };
}

// ==================== Review ====================
export interface AttemptReviewQuestion {
  id: string;
  questionText: string;
  questionImage: string;
  options: string[];
  selectedAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  isFlagged: boolean;
  explanation: string;
  explanationPdf: string;
  difficulty: string;
  lesson: string;
  chapter: string;
}

export interface AttemptReviewResponse {
  attemptId: string;

  exam: {
    id: string;
    title: string;
  };

  score: number;

  questions: AttemptReviewQuestion[];
}

// ==================== My Attempts ====================
export interface MyAttempt {
  id: string;

  exam: {
    id: string;
    title: string;
    examDate: string;
  };

  status: string;

  score: number;

  percentage: number;

  submittedAt: string | null;

  tarazScore: number | null;
  rank: number | null;
  percentile: number | null;
  totalParticipants: number | null;
}

export interface MyAttemptsResponse {
  attempts: MyAttempt[];
}
