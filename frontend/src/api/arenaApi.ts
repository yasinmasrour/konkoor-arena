import api from "./axios";

export interface ArenaLeague {
  id: string;
  title: string;
  lesson: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface ArenaProfileLeague {
  leagueId: string;
  title: string;
  status: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface ArenaProfile {
  user: { id: string; firstName: string; lastName: string };
  statistics: {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
  };
  leagues: ArenaProfileLeague[];
}

export interface ArenaHistoryItem {
  matchId: string;
  league: { id: string; title: string };
  opponent: { id: string; firstName: string; lastName: string } | null;
  result: "win" | "loss" | "draw";
  ratingChange: number;
  isFriendly: boolean; // 🆕
  playedAt: string | null;
}

export interface ArenaRankingItem {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  rating: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface ArenaRankingResponse {
  league: ArenaLeague;
  rankings: ArenaRankingItem[];
}

export interface ArenaPlayerRankingResponse {
  league: ArenaLeague;
  ranking: ArenaRankingItem;
}

export const getActiveLeagues = async (): Promise<{
  leagues: ArenaLeague[];
}> => {
  const response = await api.get<{ leagues: ArenaLeague[] }>(
    "/arena/leagues/active",
  );
  return response.data;
};

export interface ArenaQueueStatus {
  inQueue: boolean;
  queue: {
    id: string;
    status: string;
    rating: number;
    joinedAt: string;
  } | null;
}

export const joinArenaQueue = async (leagueId: string) => {
  const response = await api.post("/arena/queue", { leagueId });
  return response.data as {
    matched: boolean;
    queueId: string | null;
    match: { id: string } | null;
    alreadyQueued?: boolean;
  };
};

export const getArenaQueueStatus = async (
  leagueId: string,
): Promise<ArenaQueueStatus> => {
  const response = await api.get<ArenaQueueStatus>(`/arena/queue/${leagueId}`);
  return response.data;
};

export const leaveArenaQueue = async (leagueId: string) => {
  const response = await api.delete(`/arena/queue/${leagueId}`);
  return response.data;
};

export const getArenaProfile = async (): Promise<ArenaProfile> => {
  const response = await api.get<ArenaProfile>("/arena/profile");
  return response.data;
};

export const getArenaMatchHistory = async (): Promise<{
  matches: ArenaHistoryItem[];
}> => {
  const response = await api.get<{ matches: ArenaHistoryItem[] }>(
    "/arena/matches/me",
  );
  return response.data;
};

export const getArenaLeagueRanking = async (
  leagueId: string,
): Promise<ArenaRankingResponse> => {
  const response = await api.get<ArenaRankingResponse>(
    `/arena/leagues/${leagueId}/ranking`,
  );
  return response.data;
};

export const getArenaPlayerRanking = async (
  leagueId: string,
): Promise<ArenaPlayerRankingResponse> => {
  const response = await api.get<ArenaPlayerRankingResponse>(
    `/arena/leagues/${leagueId}/ranking/me`,
  );
  return response.data;
};

export interface ArenaRatingHistoryItem {
  index: number;
  matchId: string;
  league: { id: string; title: string };
  oldRating: number;
  newRating: number;
  change: number;
  createdAt: string;
}

export const getArenaRatingHistory = async (
  leagueId?: string,
): Promise<{ history: ArenaRatingHistoryItem[] }> => {
  const response = await api.get<{ history: ArenaRatingHistoryItem[] }>(
    leagueId
      ? `/arena/rating-history?leagueId=${encodeURIComponent(leagueId)}`
      : "/arena/rating-history",
  );
  return response.data;
};

export interface ArenaStandingItem {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  finalRating: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface ArenaLeagueStandingsResponse {
  league: ArenaLeague;
  standings: ArenaStandingItem[];
}

export const getFinishedArenaLeagues = async (): Promise<{
  leagues: ArenaLeague[];
}> => {
  const response = await api.get<{ leagues: ArenaLeague[] }>(
    "/arena/leagues/finished",
  );
  return response.data;
};

export const getArenaLeagueStandings = async (
  leagueId: string,
): Promise<ArenaLeagueStandingsResponse> => {
  const response = await api.get<ArenaLeagueStandingsResponse>(
    `/arena/leagues/${leagueId}/standings`,
  );
  return response.data;
};

// ==================== Arena Invite ====================
export interface ArenaInvite {
  id: string;
  code: string;
  inviterId: string;
  leagueId: string;
  usedById: string | null;
  status: "pending" | "used" | "expired" | "cancelled";
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
  league: {
    id: string;
    title: string;
    lesson: string;
    grade: string;
  };
}

export interface ArenaInviteFull extends ArenaInvite {
  inviter: {
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
    major: string;
  };
}

export const createArenaInvite = async (leagueId: string) => {
  const response = await api.post<{
    message: string;
    invite: ArenaInvite;
    expiresInSeconds: number;
  }>("/arena/invites", { leagueId });
  return response.data;
};

export const getMyArenaInvite = async (): Promise<{
  invite: ArenaInvite | null;
  expiresInSeconds: number;
}> => {
  const response = await api.get<{
    invite: ArenaInvite | null;
    expiresInSeconds: number;
  }>("/arena/invites/my");
  return response.data;
};

export const getArenaInvite = async (
  code: string,
): Promise<{ invite: ArenaInviteFull }> => {
  const response = await api.get<{ invite: ArenaInviteFull }>(
    `/arena/invites/${code}`,
  );
  return response.data;
};

export const acceptArenaInvite = async (code: string) => {
  const response = await api.post<{
    message: string;
    match: { id: string };
  }>(`/arena/invites/${code}/accept`);
  return response.data;
};

export const cancelArenaInvite = async (code: string) => {
  const response = await api.delete<{
    message: string;
    success: boolean;
    alreadyDone: boolean;
  }>(`/arena/invites/${code}`);
  return response.data;
};
