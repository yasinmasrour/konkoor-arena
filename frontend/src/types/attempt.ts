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
  };
}

export interface AttemptReviewQuestion {
  id: string;
  questionText: string;
  questionImage: string;
  options: string[];
  selectedAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
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
}

export interface MyAttemptsResponse {
  attempts: MyAttempt[];
}
