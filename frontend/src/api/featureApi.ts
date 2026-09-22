import api from "./axios";

// ==================== Types ====================
export interface FeatureItem {
  key: string;
  label: string;
  description: string;
}

export interface MyFeaturesResponse {
  features: string[];
  examPurchases: string[];
}

// ==================== API Functions ====================

// 🔹 featureهای من
export const getMyFeatures = async (): Promise<MyFeaturesResponse> => {
  const response = await api.get("/features/me");
  return response.data;
};

// 🔹 لیست همه featureها (ادمین)
export const getAllFeatures = async (): Promise<{
  features: FeatureItem[];
}> => {
  const response = await api.get("/features/all");
  return response.data;
};
