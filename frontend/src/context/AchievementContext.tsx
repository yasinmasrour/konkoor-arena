import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  getNewAchievements,
  markAchievementsSeen,
} from "../api/achievementApi";
import AchievementToast from "../components/achievements/AchievementToast";

interface AchievementContextValue {
  refresh: () => Promise<void>;
}

const AchievementContext = createContext<AchievementContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAchievements = () => {
  const ctx = useContext(AchievementContext);
  if (!ctx) {
    throw new Error("useAchievements must be used within AchievementProvider");
  }
  return ctx;
};

export const AchievementProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [newAchievements, setNewAchievements] = useState<any[]>([]);

  const checkNew = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getNewAchievements();
      if (data && data.length > 0) {
        setNewAchievements(data);
      }
    } catch (err) {
      console.error("Failed to check new achievements:", err);
    }
  }, [user]);

  // چک اولیه + هر ۵ دقیقه
  useEffect(() => {
    if (!user) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void checkNew();

    const interval = setInterval(() => {
      void checkNew();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, checkNew]);

  const handleMarkSeen = async () => {
    try {
      await markAchievementsSeen();
    } catch (err) {
      console.error("Failed to mark achievements as seen:", err);
    }
  };

  const handleClose = () => {
    setNewAchievements([]);
  };

  return (
    <AchievementContext.Provider value={{ refresh: checkNew }}>
      {children}
      {newAchievements.length > 0 && (
        <AchievementToast
          achievements={newAchievements}
          onClose={handleClose}
          onMarkSeen={handleMarkSeen}
        />
      )}
    </AchievementContext.Provider>
  );
};