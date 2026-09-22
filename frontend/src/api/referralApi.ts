import api from "./axios";

// ==================== Types ====================
export interface ReferralCycle {
  startDate: string;
  jalaliStart: string;
  jalaliEnd: string;
  daysRemaining: number;
}

export interface ReferralStats {
  currentCycleReferrals: number;
  totalReferrals: number;
  milestonesEarned: number;
  totalRewards: number;
  remainingToNextMilestone: number;
}

export interface ReferralItem {
  id: string;
  referee: {
    name: string;
    username: string;
  };
  reward: number;
  isMilestone: boolean;
  milestoneIndex: number | null;
  completedAt: string | null;
}

export interface MyReferralInfo {
  referralCode: string;
  cycle: ReferralCycle;
  stats: ReferralStats;
  referrals: ReferralItem[];
}

export interface ValidateCodeResponse {
  valid: boolean;
  referrerName: string;
  discount: number;
}

export interface CalculateDiscountResponse {
  discount: number;
  finalAmount: number;
  referrerId: string;
  code: string;
  referrerName: string;
}

export interface ReferralHistoryResponse {
  referrals: ReferralItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== API Functions ====================

// 🔹 اطلاعات کامل referral من
export const getMyReferralInfo = async (): Promise<MyReferralInfo> => {
  const response = await api.get("/referrals/me");
  return response.data;
};

// 🔹 اعتبارسنجی کد دعوت
export const validateReferralCode = async (
  code: string,
): Promise<ValidateCodeResponse> => {
  const response = await api.post("/referrals/validate", { code });
  return response.data;
};

// 🔹 محاسبه تخفیف
export const calculateReferralDiscount = async (
  code: string,
  amount: number,
): Promise<CalculateDiscountResponse> => {
  const response = await api.post("/referrals/calculate-discount", {
    code,
    amount,
  });
  return response.data;
};

// 🔹 تاریخچه دعوتها
export const getReferralHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<ReferralHistoryResponse> => {
  const response = await api.get("/referrals/history", { params });
  return response.data;
};

// ==================== Helpers ====================

// 🔹 فرمت مبلغ (ریال → تومان)
export const formatReferralAmount = (amountInRial: number): string => {
  const toman = Math.floor(amountInRial / 10);
  return new Intl.NumberFormat("fa-IR").format(toman);
};
