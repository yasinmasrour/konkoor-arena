import { useEffect, useState } from "react";
import {
  getPublicStatsCached,
  FALLBACK_STATS,
  type PublicStats,
} from "../api/publicStatsApi";

interface UsePublicStatsResult {
  stats: PublicStats;
  loading: boolean;
  isFallback: boolean;
}

export const usePublicStats = (): UsePublicStatsResult => {
  const [stats, setStats] = useState<PublicStats>(FALLBACK_STATS);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let mounted = true;

    getPublicStatsCached()
      .then((data) => {
        if (!mounted) return;
        setStats(data);
        setIsFallback(false);
      })
      .catch((err) => {
        console.error("Failed to load public stats:", err);
        if (!mounted) return;
        setStats(FALLBACK_STATS);
        setIsFallback(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { stats, loading, isFallback };
};
