import api from "./axios";
import {
  Gift,
  Zap,
  Sparkles,
  Trophy,
  Rocket,
  Star,
  Flame,
  Megaphone,
  Heart,
  Bell,
  Crown,
  Percent,
  Clock,
  Shield,
  Info,
  type LucideIcon,
} from "lucide-react";

// ==================== Types ====================

export type AnnouncementVariant =
  | "gold"
  | "red"
  | "green"
  | "blue"
  | "purple"
  | "dark"
  | "pink"
  | "orange"
  | "cyan"
  | "indigo"
  | "rose"
  | "slate";

export type AnnouncementDisplayType = "banner" | "card" | "both";

export interface Announcement {
  id: string;
  title: string;
  message: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  variant: AnnouncementVariant;
  icon: string | null;
  displayType: AnnouncementDisplayType;
  dismissible: boolean;
  createdAt: string;
}

export interface ActiveAnnouncements {
  banner: Announcement | null;
  card: Announcement | null;
}

// ==================== Public API ====================

export const getActiveAnnouncements =
  async (): Promise<ActiveAnnouncements> => {
    const response = await api.get("/public/announcements/active");
    return response.data;
  };

export const trackAnnouncementView = async (id: string): Promise<void> => {
  await api.post(`/public/announcements/${id}/view`);
};

export const trackAnnouncementClick = async (id: string): Promise<void> => {
  await api.post(`/public/announcements/${id}/click`);
};

export const trackAnnouncementDismiss = async (id: string): Promise<void> => {
  await api.post(`/public/announcements/${id}/dismiss`);
};

// ==================== Admin Types ====================

export interface AdminAnnouncement extends Announcement {
  isActive: boolean;
  startsAt: string;
  endsAt: string | null;
  dismissible: boolean;
  priority: number;
  viewsCount: number;
  clicksCount: number;
  dismissesCount: number;
  updatedAt: string;
}

export interface AdminAnnouncementsListResponse {
  items: AdminAnnouncement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateAnnouncementPayload {
  title: string;
  message?: string;
  ctaText?: string;
  ctaLink?: string;
  variant: AnnouncementVariant;
  icon?: string;
  displayType: AnnouncementDisplayType;
  isActive?: boolean;
  startsAt?: string;
  endsAt?: string | null;
  dismissible?: boolean;
  priority?: number;
}

// ==================== Admin API ====================

export const adminListAnnouncements = async (params?: {
  isActive?: boolean;
  displayType?: AnnouncementDisplayType;
  page?: number;
  limit?: number;
}): Promise<AdminAnnouncementsListResponse> => {
  const response = await api.get("/admin/announcements", { params });
  return response.data;
};

export const adminGetAnnouncement = async (
  id: string,
): Promise<{ announcement: AdminAnnouncement }> => {
  const response = await api.get(`/admin/announcements/${id}`);
  return response.data;
};

export const adminCreateAnnouncement = async (
  data: CreateAnnouncementPayload,
): Promise<{ message: string; announcement: AdminAnnouncement }> => {
  const response = await api.post("/admin/announcements", data);
  return response.data;
};

export const adminUpdateAnnouncement = async (
  id: string,
  data: Partial<CreateAnnouncementPayload>,
): Promise<{ message: string; announcement: AdminAnnouncement }> => {
  const response = await api.patch(`/admin/announcements/${id}`, data);
  return response.data;
};

export const adminDeleteAnnouncement = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/announcements/${id}`);
  return response.data;
};

export const adminToggleAnnouncementActive = async (
  id: string,
): Promise<{ message: string; announcement: AdminAnnouncement }> => {
  const response = await api.patch(`/admin/announcements/${id}/toggle`);
  return response.data;
};

// ==================== Helpers ====================

export const VARIANT_STYLES: Record<
  AnnouncementVariant,
  {
    label: string;
    bg: string;
    border: string;
    glow: string;
    iconBg: string;
    buttonBg: string;
    accent: string;
  }
> = {
  gold: {
    label: "طلایی",
    bg: "from-amber-600 via-amber-500 to-yellow-500",
    border: "border-amber-400/40",
    glow: "from-amber-400 to-yellow-500",
    iconBg: "from-amber-300/30 to-yellow-200/20",
    buttonBg: "bg-amber-50/20 hover:bg-amber-50/30",
    accent: "text-amber-100",
  },
  red: {
    label: "قرمز",
    bg: "from-rose-700 via-rose-600 to-red-500",
    border: "border-rose-400/40",
    glow: "from-rose-500 to-red-500",
    iconBg: "from-rose-300/30 to-red-200/20",
    buttonBg: "bg-rose-50/20 hover:bg-rose-50/30",
    accent: "text-rose-100",
  },
  green: {
    label: "سبز",
    bg: "from-emerald-700 via-emerald-600 to-teal-500",
    border: "border-emerald-400/40",
    glow: "from-emerald-500 to-teal-500",
    iconBg: "from-emerald-300/30 to-teal-200/20",
    buttonBg: "bg-emerald-50/20 hover:bg-emerald-50/30",
    accent: "text-emerald-100",
  },
  blue: {
    label: "آبی",
    bg: "from-blue-700 via-blue-600 to-indigo-500",
    border: "border-blue-400/40",
    glow: "from-blue-500 to-indigo-500",
    iconBg: "from-blue-300/30 to-indigo-200/20",
    buttonBg: "bg-blue-50/20 hover:bg-blue-50/30",
    accent: "text-blue-100",
  },
  purple: {
    label: "بنفش",
    bg: "from-purple-700 via-purple-600 to-fuchsia-500",
    border: "border-purple-400/40",
    glow: "from-purple-500 to-fuchsia-500",
    iconBg: "from-purple-300/30 to-fuchsia-200/20",
    buttonBg: "bg-purple-50/20 hover:bg-purple-50/30",
    accent: "text-purple-100",
  },
  dark: {
    label: "تیره",
    bg: "from-slate-900 via-slate-800 to-slate-900",
    border: "border-slate-600/40",
    glow: "from-slate-700 to-slate-800",
    iconBg: "from-slate-300/20 to-slate-200/10",
    buttonBg: "bg-slate-50/15 hover:bg-slate-50/25",
    accent: "text-slate-100",
  },

  // ==================== 🆕 جدید ====================
  pink: {
    label: "صورتی",
    bg: "from-pink-600 via-pink-500 to-rose-400",
    border: "border-pink-400/40",
    glow: "from-pink-500 to-rose-400",
    iconBg: "from-pink-300/30 to-rose-200/20",
    buttonBg: "bg-pink-50/20 hover:bg-pink-50/30",
    accent: "text-pink-100",
  },
  orange: {
    label: "نارنجی",
    bg: "from-orange-600 via-orange-500 to-amber-400",
    border: "border-orange-400/40",
    glow: "from-orange-500 to-amber-400",
    iconBg: "from-orange-300/30 to-amber-200/20",
    buttonBg: "bg-orange-50/20 hover:bg-orange-50/30",
    accent: "text-orange-100",
  },
  cyan: {
    label: "فیروزه‌ای",
    bg: "from-cyan-600 via-cyan-500 to-teal-400",
    border: "border-cyan-400/40",
    glow: "from-cyan-500 to-teal-400",
    iconBg: "from-cyan-300/30 to-teal-200/20",
    buttonBg: "bg-cyan-50/20 hover:bg-cyan-50/30",
    accent: "text-cyan-100",
  },
  indigo: {
    label: "نیلی",
    bg: "from-indigo-700 via-indigo-600 to-violet-500",
    border: "border-indigo-400/40",
    glow: "from-indigo-500 to-violet-500",
    iconBg: "from-indigo-300/30 to-violet-200/20",
    buttonBg: "bg-indigo-50/20 hover:bg-indigo-50/30",
    accent: "text-indigo-100",
  },
  rose: {
    label: "سرخابی",
    bg: "from-rose-600 via-rose-500 to-pink-400",
    border: "border-rose-400/40",
    glow: "from-rose-500 to-pink-400",
    iconBg: "from-rose-300/30 to-pink-200/20",
    buttonBg: "bg-rose-50/20 hover:bg-rose-50/30",
    accent: "text-rose-100",
  },
  slate: {
    label: "خاکستری",
    bg: "from-slate-700 via-slate-600 to-slate-500",
    border: "border-slate-400/40",
    glow: "from-slate-500 to-slate-400",
    iconBg: "from-slate-300/20 to-slate-200/10",
    buttonBg: "bg-slate-50/15 hover:bg-slate-50/25",
    accent: "text-slate-100",
  },
};

export const VARIANT_OPTIONS: Array<{
  value: AnnouncementVariant;
  label: string;
}> = [
  { value: "gold", label: "طلایی" },
  { value: "red", label: "قرمز" },
  { value: "green", label: "سبز" },
  { value: "blue", label: "آبی" },
  { value: "purple", label: "بنفش" },
  { value: "dark", label: "تیره" },
  { value: "pink", label: "صورتی" },
  { value: "orange", label: "نارنجی" },
  { value: "cyan", label: "فیروزه‌ای" },
  { value: "indigo", label: "نیلی" },
  { value: "rose", label: "سرخابی" },
  { value: "slate", label: "خاکستری" },
];

export const DISPLAY_TYPE_OPTIONS: Array<{
  value: AnnouncementDisplayType;
  label: string;
  description: string;
}> = [
  {
    value: "banner",
    label: "بنر بالای سایت",
    description: "بالای navbar نمایش داده میشه",
  },
  {
    value: "card",
    label: "کارت گوشه پایین",
    description: "گوشه‌ی پایین چپ صفحه",
  },
  {
    value: "both",
    label: "هر دو",
    description: "بنر + کارت",
  },
];

// ==================== Icon Helpers ====================

export interface AnnouncementIconOption {
  value: string;
  label: string;
  Icon: LucideIcon;
}

export const ANNOUNCEMENT_ICONS: AnnouncementIconOption[] = [
  { value: "Gift", label: "هدیه", Icon: Gift },
  { value: "Percent", label: "تخفیف", Icon: Percent },
  { value: "Zap", label: "انرژی", Icon: Zap },
  { value: "Sparkles", label: "ویژه", Icon: Sparkles },
  { value: "Flame", label: "داغ", Icon: Flame },
  { value: "Trophy", label: "جایزه", Icon: Trophy },
  { value: "Crown", label: "VIP", Icon: Crown },
  { value: "Rocket", label: "شروع", Icon: Rocket },
  { value: "Star", label: "ستاره", Icon: Star },
  { value: "Heart", label: "علاقه", Icon: Heart },
  { value: "Bell", label: "اعلان", Icon: Bell },
  { value: "Megaphone", label: "اطلاعیه", Icon: Megaphone },
  { value: "Clock", label: "زمان محدود", Icon: Clock },
  { value: "Shield", label: "امنیت", Icon: Shield },
  { value: "Info", label: "اطلاعات", Icon: Info },
];

export const getAnnouncementIcon = (name: string | null): LucideIcon => {
  if (!name) return Megaphone;
  const found = ANNOUNCEMENT_ICONS.find((i) => i.value === name);
  return found?.Icon || Megaphone;
};