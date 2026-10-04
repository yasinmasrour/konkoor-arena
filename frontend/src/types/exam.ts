// ============================================================
// EXAM ACCESS TYPE
// ============================================================

export type ExamAccessType =
  | "FREE"
  | "PURCHASE"
  | "SUBSCRIPTION"
  | "SUBSCRIPTION_OR_PURCHASE";

// ============================================================
// EXAM STATUS
// ============================================================

export type ExamStatus = "draft" | "review" | "published" | "archived";

// ============================================================
// EXAM TYPES
// ============================================================

export interface ExamQuestion {
  id: string;
  questionId: string;
  order: number;
  score: number;
}

export interface ExamBooklet {
  id: string;
  examId: string;
  bookletId: string;
  order: number;

  booklet: {
    id: string;
    title: string;
    lesson: string;
    grade: string;
    major: string;
    examDate: string;
    duration: number;
    status: string;

    questions: ExamQuestion[];
  };
}

export interface Exam {
  id: string;

  title: string;

  examDate: string;

  startTime: string;

  endTime: string;

  status: ExamStatus;

  accessType: ExamAccessType; // 🆕

  booklets: ExamBooklet[];

  // 🆕 اینا برای نمایش توی لیست (اختیاری)
  duration?: number;
  questionCount?: number;
  lesson?: string;
  grade?: string;
  major?: string;

  createdBy?: {
    id?: string;
    firstName: string;
    lastName: string;
  };
}
