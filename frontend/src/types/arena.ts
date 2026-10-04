export interface ArenaLeague {
  participantsCount: number;
  id: string;
  title: string;
  lesson: string;
  status: string;
}

export interface ArenaLeaguesResponse {
  leagues: ArenaLeague[];
}

export interface ArenaOpponent {
  userId: string;
  firstName: string;
  lastName: string;
  rating: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  isAvailable: boolean;
}

export interface ArenaOpponentsResponse {
  league: ArenaLeague;
  opponents: ArenaOpponent[];
}