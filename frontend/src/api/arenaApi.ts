import api from "./axios";

export interface ArenaLeague {
  id: string;
  title: string;
  lesson: string;
  status: string;
  startDate: string;
  endDate: string;
}

export const getActiveLeagues = async (): Promise<{ leagues: ArenaLeague[] }> => {
  const response = await api.get<{ leagues: ArenaLeague[] }>(
    "/arena/leagues/active",
  );

  return response.data;
};

export const joinArenaQueue = async (leagueId: string) => {
  const response = await api.post("/arena/queue", {
    leagueId,
  });

  return response.data;
};

export const leaveArenaQueue = async (leagueId: string) => {
  const response = await api.delete(`/arena/queue/${leagueId}`);

  return response.data;
};
