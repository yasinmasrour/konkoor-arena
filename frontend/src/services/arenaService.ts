import api from "../config/api";

import type {
  ArenaLeaguesResponse,
  ArenaOpponentsResponse,
} from "../types/arena";

export const getActiveLeagues = async () => {
  const response = await api.get<ArenaLeaguesResponse>(
    "/arena/leagues/active",
  );

  return response.data;
};

export const getLeagueOpponents = async (leagueId: string) => {
  const response = await api.get<ArenaOpponentsResponse>(
    `/arena/leagues/${leagueId}/opponents`,
  );

  return response.data;
};