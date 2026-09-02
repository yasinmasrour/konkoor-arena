export interface ExamDetail {
  id: string;

  title: string;

  examDate: string;

  startTime: string;

  endTime: string;

  status: string;

  booklets: {
    id: string;

    order: number;

    booklet: {
      id: string;

      lesson: string;

      grade: string;

      major: string;

      examDate: string;

      duration: number;

      status: string;

      questions: {
        id: string;
      }[];
    };
  }[];
}
