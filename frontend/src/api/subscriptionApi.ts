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
  discountPercent: number; // 0 اگه تخفیف نداره
  discountEndsAt: string | null;
  originalPrice: number; // همون price
  finalPrice: number; // قیمت با تخفیف
  discountAmount: number; // مقدار تخفیف (تومان)
  hasDiscount: boolean; // آیا تخفیف فعاله
  remainingDays: number | null; // روزهای باقی‌مونده تخفیف
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
  gateway: "wallet" | "zarinpal" = "wallet",
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
    paymentUrl?: string;
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

// ❌ verifySubscriptionPayment حذف شد
