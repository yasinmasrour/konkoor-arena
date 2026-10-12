import api from "./axios";

export interface CreateContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  adminNote: string | null;
  repliedAt: string | null;
  ip: string | null;
  userAgent: string | null;
  userId: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email?: string;
    phoneNumber?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListContactMessagesParams {
  page?: number;
  limit?: number;
  status?: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  search?: string;
  sort?: "createdAt" | "updatedAt";
  order?: "asc" | "desc";
}

export interface ListContactMessagesResponse {
  items: ContactMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== عمومی ====================
export const createContactMessage = async (
  payload: CreateContactPayload,
) => {
  const res = await api.post("/contact", payload);
  return res.data;
};

// ==================== ادمین ====================
export const listContactMessages = async (
  params: ListContactMessagesParams = {},
) => {
  const res = await api.get<ListContactMessagesResponse>(
    "/admin/contact-messages",
    { params },
  );
  return res.data;
};

export const getContactStats = async () => {
  const res = await api.get<{ newCount: number; totalCount: number }>(
    "/admin/contact-messages/stats",
  );
  return res.data;
};

export const getContactMessageById = async (id: string) => {
  const res = await api.get<{ contactMessage: ContactMessage }>(
    `/admin/contact-messages/${id}`,
  );
  return res.data.contactMessage;
};

export const updateContactMessage = async (
  id: string,
  payload: { status?: ContactMessage["status"]; adminNote?: string },
) => {
  const res = await api.patch(`/admin/contact-messages/${id}`, payload);
  return res.data;
};

export const deleteContactMessage = async (id: string) => {
  const res = await api.delete(`/admin/contact-messages/${id}`);
  return res.data;
};