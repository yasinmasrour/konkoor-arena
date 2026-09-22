import api from "./axios";

// ==================== Types ====================
export interface ArenaLeagueAdmin {
  id: string;
  title: string;
  lesson: string;
  grade: string;
  compatibleMajors: string[];
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "finished";
  rewardsDistributedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    matches: number;
    queues: number;
    ratings: number;
    invites: number;
    standings?: number;
  };
}

export interface ArenaLeagueListResponse {
  leagues: ArenaLeagueAdmin[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateLeaguePayload {
  title: string;
  lesson: string;
  grade: string;
  compatibleMajors: string[];
  startDate: string;
  endDate: string;
  status?: "upcoming" | "active" | "finished";
}

export interface UpdateLeaguePayload {
  title?: string;
  lesson?: string;
  grade?: string;
  compatibleMajors?: string[];
  startDate?: string;
  endDate?: string;
  status?: "upcoming" | "active" | "finished";
}

export interface ListLeaguesParams {
  status?: "upcoming" | "active" | "finished";
  grade?: string;
  lesson?: string;
  page?: number;
  limit?: number;
}

// ==================== API ====================
export const listArenaLeagues = async (
  params?: ListLeaguesParams,
): Promise<ArenaLeagueListResponse> => {
  const response = await api.get<ArenaLeagueListResponse>(
    "/admin/arena/leagues",
    { params },
  );
  return response.data;
};

export const getArenaLeague = async (
  id: string,
): Promise<{ league: ArenaLeagueAdmin }> => {
  const response = await api.get<{ league: ArenaLeagueAdmin }>(
    `/admin/arena/leagues/${id}`,
  );
  return response.data;
};

export const createArenaLeague = async (
  payload: CreateLeaguePayload,
): Promise<{ message: string; league: ArenaLeagueAdmin }> => {
  const response = await api.post<{
    message: string;
    league: ArenaLeagueAdmin;
  }>("/admin/arena/leagues", payload);
  return response.data;
};

export const updateArenaLeague = async (
  id: string,
  payload: UpdateLeaguePayload,
): Promise<{ message: string; league: ArenaLeagueAdmin }> => {
  const response = await api.patch<{
    message: string;
    league: ArenaLeagueAdmin;
  }>(`/admin/arena/leagues/${id}`, payload);
  return response.data;
};

export const changeArenaLeagueStatus = async (
  id: string,
  status: "upcoming" | "active" | "finished",
): Promise<{ message: string; league: ArenaLeagueAdmin }> => {
  const response = await api.patch<{
    message: string;
    league: ArenaLeagueAdmin;
  }>(`/admin/arena/leagues/${id}/status`, { status });
  return response.data;
};

export const deleteArenaLeague = async (
  id: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/admin/arena/leagues/${id}`,
  );
  return response.data;
};
