import { useCallback, useRef } from "react";

interface UseAttemptSyncOptions {
  onSync: () => Promise<void>;
  intervalSeconds?: number;
}

/**
 * هر N ثانیه یک بار onSync رو صدا می‌زنه.
 * می‌تونه به‌صورت دستی هم صدا زده بشه (برای بعد از actionها).
 */
export const useAttemptSync = ({
  onSync,
  intervalSeconds = 30,
}: UseAttemptSyncOptions) => {
  const onSyncRef = useRef(onSync);

  // همیشه ref رو آپدیت نگه دار
  // eslint-disable-next-line react-hooks/refs
  onSyncRef.current = onSync;

  // 🔹 تابع trigger برای sync دستی
  const trigger = useCallback(async () => {
    try {
      await onSyncRef.current();
    } catch (err) {
      console.error("Sync failed:", err);
    }
  }, []);

  return { trigger, intervalSeconds };
};
