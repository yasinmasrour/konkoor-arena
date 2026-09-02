import api from "../config/api";

export interface Test {
  id: string;

  title: string;

  subject: string;

  questions: number;

  duration: number;
}

export const getTests = async () => {
  const response = await api.get("/tests");

  return response.data;
};
