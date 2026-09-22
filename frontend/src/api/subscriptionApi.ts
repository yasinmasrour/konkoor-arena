import api from "./axios";

export interface SubscriptionPlan {
  id: string;
  title: string;
  description: string | null;
  price: number;
  durationDays: number;
  features: string[];
  isActive: boolean;
  order: number;
  badge: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled" | string;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
}

export const getSubscriptionPlans = async () => {
  const response = await api.get<{ plans: SubscriptionPlan[] }>(
    "/subscription-plans",
  );
  return response.data;
};

export const getMySubscription = async () => {
  const response = await api.get<{ subscription: Subscription | null }>(
    "/subscriptions/me",
  );
  return response.data;
};

export const getMySubscriptionHistory = async () => {
  const response = await api.get<{ subscriptions: Subscription[] }>(
    "/subscriptions/me/history",
  );
  return response.data;
};

// 🆕 خرید اشتراک
export const purchaseSubscription = async (
  planId: string,
  gateway: "wallet" | "mock" = "wallet",
  referralCode?: string,
) => {
  const response = await api.post<{
    message: string;
    payment: {
      id: string;
      status: string;
      amount: number;
    };
    subscription: Subscription | null;
    refundInfo: {
      refundAmount: number;
      remainingDays: number;
    } | null;
  }>("/subscriptions/purchase", {
    planId,
    gateway,
    referralCode,
  });
  return response.data;
};

// 🆕 تأیید پرداخت اشتراک
export const verifySubscriptionPayment = async (
  paymentId: string,
  success = true,
) => {
  const response = await api.post("/subscriptions/purchase/verify", {
    paymentId,
    success,
  });
  return response.data;
};
