import api from "./axios";

// ==================== Types ====================
export type TransactionType =
  | "CHARGE"
  | "PURCHASE"
  | "REFUND"
  | "WITHDRAW"
  | "REWARD"
  | "ADMIN_ADJUST";

export type TransactionDirection = "IN" | "OUT";

export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export type WithdrawStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export interface WalletBalance {
  balance: number;
  currency: string;
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  description: string;
  referenceId: string | null;
  referenceType: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  cardNumber: string;
  cardHolderName: string;
  bankName: string | null;
  iban: string | null;
  shebaNumber: string | null;
  status: WithdrawStatus;
  reviewedById: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  trackingCode: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  direction?: TransactionDirection;
}

// ==================== API Functions ====================

// 🔹 گرفتن موجودی
export const getWalletBalance = async (): Promise<WalletBalance> => {
  const response = await api.get("/wallet/balance");
  return response.data;
};

// 🔹 گرفتن تراکنش‌ها
export const getWalletTransactions = async (
  params: GetTransactionsParams = {},
): Promise<TransactionsResponse> => {
  const response = await api.get("/wallet/transactions", { params });
  return response.data;
};

// 🔹 ثبت درخواست برداشت
export const createWithdrawRequest = async (data: {
  amount: number;
  cardNumber: string;
  cardHolderName: string;
  bankName?: string;
  iban?: string;
  shebaNumber?: string;
}): Promise<{ request: WithdrawRequest; message: string }> => {
  const response = await api.post("/wallet/withdraw", data);
  return response.data;
};

// 🔹 لیست درخواست‌های برداشت من
export const getMyWithdrawRequests = async (): Promise<{
  requests: WithdrawRequest[];
}> => {
  const response = await api.get("/wallet/withdraw/my-requests");
  return response.data;
};

// ==================== ادمین ====================

// 🔹 لیست همه درخواست‌ها
export const getAllWithdrawRequests = async (params?: {
  status?: WithdrawStatus;
  page?: number;
  limit?: number;
}): Promise<{
  requests: WithdrawRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const response = await api.get("/wallet/admin/withdraw-requests", {
    params,
  });
  return response.data;
};

// 🔹 تایید
export const approveWithdrawRequest = async (
  id: string,
  note?: string,
): Promise<{ request: WithdrawRequest; message: string }> => {
  const response = await api.post(
    `/wallet/admin/withdraw-requests/${id}/approve`,
    {
      note,
    },
  );
  return response.data;
};

// 🔹 رد
export const rejectWithdrawRequest = async (
  id: string,
  note?: string,
): Promise<{ request: WithdrawRequest; message: string }> => {
  const response = await api.post(
    `/wallet/admin/withdraw-requests/${id}/reject`,
    {
      note,
    },
  );
  return response.data;
};

// 🔹 تکمیل
export const completeWithdrawRequest = async (
  id: string,
  trackingCode: string,
): Promise<{ request: WithdrawRequest; message: string }> => {
  const response = await api.post(
    `/wallet/admin/withdraw-requests/${id}/complete`,
    {
      trackingCode,
    },
  );
  return response.data;
};

// 🔹 تنظیم دستی ادمین
export const adminAdjustWallet = async (data: {
  userId: string;
  amount: number;
  direction: "IN" | "OUT";
  description?: string;
}): Promise<{ transaction: WalletTransaction; message: string }> => {
  const response = await api.post("/wallet/admin/adjust", data);
  return response.data;
};

// ==================== Helpers ====================

// 🔹 تبدیل ریال به تومان
export const toToman = (amountInRial: number): number => {
  return Math.floor(amountInRial / 10);
};

// 🔹 تبدیل تومان به ریال
export const toRial = (amountInToman: number): number => {
  return amountInToman * 10;
};

// 🔹 فرمت قیمت
export const formatPrice = (amountInRial: number): string => {
  return new Intl.NumberFormat("fa-IR").format(toToman(amountInRial));
};

// 🆕 ایجاد پرداخت شارژ (فقط زرین‌پال)
export const createWalletCharge = async (amount: number) => {
  const response = await api.post("/wallet/charge", {
    amount,
    gateway: "zarinpal",
  });
  return response.data as {
    message: string;
    payment: {
      id: string;
      status: string;
      amount: number;
    };
    paymentUrl?: string;
  };
};