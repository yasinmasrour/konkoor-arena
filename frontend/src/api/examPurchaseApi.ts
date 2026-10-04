import api from "./axios";

// ==================== Types ====================
export interface ExamPurchase {
  id: string;
  userId: string;
  examId: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "refunded";
  paymentId: string | null;
  purchasedAt: string | null;
  createdAt: string;
}

export interface CreateExamPurchaseResponse {
  message: string;
  purchase: ExamPurchase | null;
  payment: {
    id: string;
    amount: number;
    status: string;
    gateway: string;
  };
  paymentUrl?: string;
}

// ==================== API Functions ====================

// 🔹 خرید تکی آزمون
export const purchaseExam = async (
  examId: string,
  gateway: "wallet" | "zarinpal" = "wallet",
): Promise<CreateExamPurchaseResponse> => {
  const response = await api.post(`/exams/${examId}/purchase`, { gateway });
  return response.data;
};

// ==================== Helpers ====================

export const EXAM_PURCHASE_PRICE = 3000000;

export const formatExamPrice = (amountInRial: number): string => {
  const toman = Math.floor(amountInRial / 10);
  return new Intl.NumberFormat("fa-IR").format(toman);
};
