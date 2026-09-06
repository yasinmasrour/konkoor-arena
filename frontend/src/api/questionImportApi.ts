import api from "./axios";

export interface ImportRow {
  rowNumber: number;
  valid: boolean;
  data: {
    code: string;
    lesson: string;
    grade: string;
    major: string;
    chapter: string;
    questionText: string;
    options: string[];
    correctAnswer: number | null;
    questionImage: string;
    topic: string;
    explanation: string;
    explanationPdf: string;
    source: string;
    author: string;
    year?: number;
    difficulty: string;
    tags: string[];
  };
  errors: string[];
  warnings: string[];
}

export interface ImportPreview {
  totalRows: number;
  validRows: number;
  warningRows: number;
  invalidRows: number;
  rows: ImportRow[];
}

export interface ImportResponse extends ImportPreview {
  importedCount: number;
  message: string;
  preview: ImportPreview;
}

const createFormData = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
};

export const previewQuestionImport = async (file: File) => {
  const response = await api.post<ImportPreview>("/questions/import/preview", createFormData(file), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const importQuestions = async (file: File) => {
  const response = await api.post<ImportResponse>("/questions/import", createFormData(file), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const downloadQuestionImportTemplate = () => {
  const header = "code,lesson,grade,major,chapter,questionText,option1,option2,option3,option4,correctAnswer,questionImage,topic,explanation,explanationPdf,source,author,year,difficulty,tags";
  const example = 'MATH-IMPORT-001,ریاضی,12,math,تابع,حاصل عبارت چیست؟,1,2,3,4,4,,,,,کتاب تست,طراح نمونه,1405,medium,"تابع,آسان"';
  const blob = new Blob([`\uFEFF${header}\n${example}\n`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "griffin-question-import-template.csv";
  link.click();
  URL.revokeObjectURL(url);
};
