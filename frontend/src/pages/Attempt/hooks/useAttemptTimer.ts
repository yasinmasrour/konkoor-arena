import { useEffect, useRef, useState } from "react";

interface UseAttemptTimerOptions {
  initialSeconds: number | null;
  onExpire?: () => void;
  enabled?: boolean;
}

/**
 * تایمر شمارش معکوس که از Backend sync می‌شه.
 * هر ۱ ثانیه یک بار کم می‌کنه.
 * هر بار `syncFrom` صدا زده بشه، تایمر با مقدار جدید sync می‌شه.
 */
export const useAttemptTimer = ({
  initialSeconds,
  onExpire,
  enabled = true,
}: UseAttemptTimerOptions) => {
  const [seconds, setSeconds] = useState<number | null>(initialSeconds);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  // همیشه ref رو آپدیت کن
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // وقتی initialSeconds تغییر کرد، sync کن
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeconds(initialSeconds);
    expiredRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (!enabled) return;
    if (seconds === null) return;
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpireRef.current?.();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, seconds === null, seconds === 0]);

  const sync = (newSeconds: number) => {
    setSeconds(newSeconds);
    expiredRef.current = false;
  };

  return { seconds, sync };
};

// ==================== ابزار ====================
export const formatTime = (seconds: number | null): string => {
  if (seconds === null || seconds < 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const formatTimePersian = (seconds: number | null): string => {
  if (seconds === null || seconds < 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toLocaleString("fa-IR")}:${String(s)
    .padStart(2, "0")
    .replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)])}`;
};
