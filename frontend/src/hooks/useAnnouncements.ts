import { useCallback, useEffect, useState } from "react";
import {
  getActiveAnnouncements,
  trackAnnouncementView,
  type ActiveAnnouncements,
  type Announcement,
} from "../api/announcementApi";

const STORAGE_KEY_PREFIX = "griffin-announcement-dismissed-";

/**
 * چک کن آیا کاربر قبلاً این اعلان رو بسته یا نه
 */
export const isDismissed = (id: string): boolean => {
  try {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`) === "1";
  } catch {
    return false;
  }
};

/**
 * علامت‌گذاری اعلان به عنوان بسته‌شده
 */
export const markDismissed = (id: string): void => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, "1");
  } catch {
    // ignore
  }
};

/**
 * هوک اعلان‌ها
 */
export const useAnnouncements = () => {
  const [data, setData] = useState<ActiveAnnouncements>({
    banner: null,
    card: null,
  });
  const [loading, setLoading] = useState(true);

  // ==================== Load ====================
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getActiveAnnouncements();
        if (cancelled) return;

        // فیلتر: اگه قبلاً بسته شده، نمایش نده
        const banner =
          result.banner && !isDismissed(result.banner.id)
            ? result.banner
            : null;
        const card =
          result.card && !isDismissed(result.card.id) ? result.card : null;

        setData({ banner, card });

        // ثبت بازدیدها
        if (banner) void trackAnnouncementView(banner.id);
        if (card) void trackAnnouncementView(card.id);
      } catch (err) {
        console.error("Failed to load announcements:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==================== Dismiss ====================
  const dismissBanner = useCallback(() => {
    if (data.banner) {
      markDismissed(data.banner.id);
      setData((prev) => ({ ...prev, banner: null }));
    }
  }, [data.banner]);

  const dismissCard = useCallback(() => {
    if (data.card) {
      markDismissed(data.card.id);
      setData((prev) => ({ ...prev, card: null }));
    }
  }, [data.card]);

  return {
    banner: data.banner,
    card: data.card,
    loading,
    dismissBanner,
    dismissCard,
  };
};

export type { Announcement };
