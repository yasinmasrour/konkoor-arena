import api from "./axios";

export interface UserAchievementTier {
  id: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  title: string;
  description: string;
  conditionValue: number;
  points: number;
  unlocked: boolean;
  unlockedAt: string | null;
  seen: boolean;
  currentProgress: number;
}

export interface AchievementFamily {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  sortOrder: number;
  tiers: UserAchievementTier[];
  highestUnlockedTier: string | null;
  currentProgress: number;
}

export interface UserStats {
  id: string;
  userId: string;
  totalAttempts: number;
  totalPerfectScores: number;
  totalHighScores90: number;
  totalHighScores70: number;
  current90Streak: number;
  max90Streak: number;
  current70Streak: number;
  max70Streak: number;
  currentAttemptStreak: number;
  maxAttemptStreak: number;
  totalQuestions: number;
  totalCorrect: number;
  totalWrong: number;
  perfectMath: number;
  perfectPhysics: number;
  perfectChemistry: number;
  perfectBiology: number;
  arenaWins: number;
  arenaFirstRank: number;
  fastAnswers: number;
  earlyFinishes: number;
  hasSubscription: boolean;
  membershipStart: string | null;
  achievementPoints: number;
}

export const getMyAchievements = async () => {
  const res = await api.get<{
    families: AchievementFamily[];
    stats: UserStats;
  }>("/achievements");
  return res.data;
};

export const getMyStats = async () => {
  const res = await api.get<{ stats: UserStats }>("/achievements/stats");
  return res.data.stats;
};

export const getNewAchievements = async () => {
  const res = await api.get<{ achievements: any[] }>("/achievements/new");
  return res.data.achievements;
};

export const markAchievementsSeen = async () => {
  await api.post("/achievements/mark-seen");
};