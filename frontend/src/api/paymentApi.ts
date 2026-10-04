import api from "./axios";

// ==================== Types ====================
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

// 🆕 mock حذف شد
export type PaymentGateway = "pending" | "wallet" | "zarinpal";

export type PaymentType =
  | "subscription"
  | "wallet_charge"
  | "exam"
  | "exam_purchase";

export interface Payment {
  id: string;
  userId: string;
  planId: string | null;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  gateway: PaymentGateway;
  merchantOrderId: string;
  authority: string | null;
  transactionId: string | null;
  paidAt: string | null;
  metadata: Record<string, unknown> | null;
  subscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    durationDays: number;
  } | null;
  discountAmount?: number;
  referralId?: string | null;
}

export interface CreateSubscriptionPaymentResponse {
  message: string;
  payment: Payment;
  subscription: {
    id: string;
    userId: string;
    planId: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  paymentUrl?: string;
  discount?: {
    amount: number;
    finalAmount: number;
  };
}

export interface CreateWalletChargeResponse {
  message: string;
  payment: Payment;
  paymentUrl?: string;
}

// ==================== API Functions ====================

// 🔹 لیست پرداخت‌های من
export const getMyPayments = async (): Promise<{ payments: Payment[] }> => {
  const response = await api.get("/payments/my");
  return response.data;
};

// 🔹 جزئیات یه پرداخت
export const getMyPaymentById = async (
  id: string,
): Promise<{ payment: Payment }> => {
  const response = await api.get(`/payments/${id}`);
  return response.data;
};

// 🔹 خرید اشتراک
export const createSubscriptionPayment = async (data: {
  planId: string;
  gateway?: "wallet" | "zarinpal";
  referralCode?: string;
}): Promise<CreateSubscriptionPaymentResponse> => {
  const response = await api.post("/payments/subscription", data);
  return response.data;
};

// 🔹 شارژ کیف پول
export const createWalletChargePayment = async (data: {
  amount: number;
  gateway?: "zarinpal";
}): Promise<CreateWalletChargeResponse> => {
  const response = await api.post("/payments/wallet-charge", data);
  return response.data;
};

// ==================== Helpers ====================

export const mapPaymentStatus = (
  status: PaymentStatus,
): "success" | "pending" | "failed" | "refunded" => {
  if (status === "paid") return "success";
  if (status === "pending") return "pending";
  if (status === "failed" || status === "cancelled") return "failed";
  if (status === "refunded") return "refunded";
  return "pending";
};

export const getPaymentTypeLabel = (type: PaymentType): string => {
  if (type === "subscription") return "خرید اشتراک";
  if (type === "wallet_charge") return "شارژ کیف پول";
  if (type === "exam") return "خرید آزمون";
  if (type === "exam_purchase") return "خرید آزمون";
  return "پرداخت";
};

export const getGatewayLabel = (gateway: PaymentGateway): string => {
  if (gateway === "wallet") return "کیف پول";
  if (gateway === "zarinpal") return "زرین‌پال";
  if (gateway === "pending") return "—";
  return gateway;
};

export const formatPrice = (amountInRial: number): string => {
  const toman = Math.floor(amountInRial / 10);
  return new Intl.NumberFormat("fa-IR").format(toman);
};

export const toToman = (amountInRial: number): number => {
  return Math.floor(amountInRial / 10);
};

export const toRial = (amountInToman: number): number => {
  return amountInToman * 10;
};
