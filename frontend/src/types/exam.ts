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

  status: string;

  booklets: ExamBooklet[];
}
