// ============================================================
// EXAM ACCESS TYPE
// ============================================================

export type ExamAccessType =
  | "FREE"
  | "PURCHASE"
  | "SUBSCRIPTION"
  | "SUBSCRIPTION_OR_PURCHASE";

// ============================================================
// EXAM DETAIL TYPES
// ============================================================

export interface ExamDetailBookletQuestion {
  id: string;
  questionId: string;
  order: number;
  score: number;
}

export interface ExamDetailBooklet {
  id: string;
  title: string;
  lesson: string;
  grade: string;
  major: string;
  examDate: string;
  duration: number;
  status: string;
  questions: ExamDetailBookletQuestion[];
}

export interface ExamDetailBookletItem {
  id: string;
  examId: string;
  bookletId: string;
  order: number;
  booklet: ExamDetailBooklet;
}

export interface ExamDetail {
  id: string;
  title: string;
  examDate: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  isPurchased: boolean;
  accessType: ExamAccessType;
  booklets: ExamDetailBookletItem[];
  createdBy?: {
    id?: string;
    firstName: string;
    lastName: string;
  };
}
