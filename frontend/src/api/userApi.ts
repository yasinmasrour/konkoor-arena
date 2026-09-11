import api from "./axios";
import type { AuthUser } from "../services/authService";

export const getMyProfile = async () => (await api.get("/users/me")).data.user as AuthUser;
export const updateMyProfile = async (data: {
  birthDate: string;
  major: string;
  grade: string;
  email?: string;
  nationalId?: string;
  address?: string;
  city?: string;
  province?: string;
}) => (await api.patch("/users/me", data)).data.user as AuthUser;
