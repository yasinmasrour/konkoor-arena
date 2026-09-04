import api from "./axios";

export interface SubscriptionPlan {
  id: string;
  title: string;
  description: string | null;
  price: number;
  durationDays: number;
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
