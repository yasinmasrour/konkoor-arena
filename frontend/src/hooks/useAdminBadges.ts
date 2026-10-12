import { useEffect, useState } from "react";
import { getAdminBadges, type AdminBadges } from "../api/dashboardApi";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL_MS = 30 * 1000; // ۳۰ ثانیه

/**
 * هوک دریافت badgeهای ادمین با polling
 */
export const useAdminBadges = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === "ADMIN";

  const [badges, setBadges] = useState<AdminBadges>({
    contactMessages: 0,
  });

  useEffect(() => {
    if (!isAdmin) return;

    let cancelled = false;

    const fetchBadges = async () => {
      try {
        const data = await getAdminBadges();
        if (!cancelled) setBadges(data);
      } catch (err) {
        // سایلنت — badge حیاتی نیست
        console.error("Failed to fetch admin badges:", err);
      }
    };

    // بار اول
    void fetchBadges();

    // polling
    const interval = window.setInterval(fetchBadges, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isAdmin]);

  return badges;
};