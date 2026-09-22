import api from "../api/axios";
export type UserRole = "ADMIN" | "QUESTION_DESIGNER" | "COUNSELOR" | "STUDENT";
export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string | null;
  email: string | null;
  role: UserRole;
  phoneVerifiedAt?: string | null;
  birthDate?: string | null;
  major?: string | null;
  grade?: string | null;
  nationalId?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  features: string[];
  examPurchases: string[];
}

export const getCaptcha = async () =>
  (await api.get("/auth/captcha")).data as {
    token: string;
    question: string;
  };

export const registerUser = async (data: {
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  email?: string;
  password: string;
}) => (await api.post("/auth/register", data)).data;

export const verifyRegistration = async (phoneNumber: string, code: string) =>
  (
    await api.post("/auth/register/verify", {
      phoneNumber,
      code,
    })
  ).data as {
    token: string;
    user: AuthUser;
  };

export const loginUser = async (data: {
  identifier: string;
  password: string;
  captchaToken: string;
  captchaAnswer: string;
}) =>
  (await api.post("/auth/login", data)).data as {
    verificationRequired: boolean;
    phoneNumber: string;
  };

export const verifyLogin = async (phoneNumber: string, code: string) =>
  (
    await api.post("/auth/login/verify", {
      phoneNumber,
      code,
    })
  ).data as {
    token: string;
    user: AuthUser;
  };

export const resendVerificationCode = async (
  phoneNumber: string,
  purpose: "PHONE_REGISTRATION" | "PHONE_LOGIN",
) =>
  (
    await api.post("/auth/verification/resend", {
      phoneNumber,
      purpose,
    })
  ).data;
