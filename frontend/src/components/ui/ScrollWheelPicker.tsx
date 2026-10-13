/* eslint-disable react-hooks/set-state-in-effect */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as jalaali from "jalaali-js";

// ==================== Constants ====================
const ITEM_HEIGHT = 34;
const VISIBLE_ITEMS = 3;
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2);
const COLUMN_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const persianNumberFormatter = new Intl.NumberFormat("fa-IR", {
  useGrouping: false,
});

const MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

// ==================== Types ====================
interface WheelOption {
  value: number | string;
  label: string;
}

interface WheelColumnProps {
  options: WheelOption[];
  value: number | string;
  onChange: (value: number | string) => void;
  width?: string;
}

// ==================== WheelColumn ====================
const WheelColumn = memo(
  ({ options, value, onChange, width = "w-16" }: WheelColumnProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isProgrammaticScrollRef = useRef(false);
    const scrollEndTimerRef = useRef<number | null>(null);
    const lastCommittedRef = useRef<number | string>(value);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    const selectedIndex = useMemo(() => {
      const idx = options.findIndex((opt) => opt.value === value);
      return idx >= 0 ? idx : 0;
    }, [options, value]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const targetTop = selectedIndex * ITEM_HEIGHT;
      if (Math.abs(container.scrollTop - targetTop) < 2) return;

      isProgrammaticScrollRef.current = true;
      container.scrollTo({ top: targetTop, behavior: "auto" });
      lastCommittedRef.current = value;

      requestAnimationFrame(() => {
        isProgrammaticScrollRef.current = false;
      });
    }, [selectedIndex, value]);

    const commitScroll = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;

      const index = Math.round(container.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(options.length - 1, index));
      const opt = options[clamped];
      if (!opt) return;

      const targetTop = clamped * ITEM_HEIGHT;
      if (Math.abs(container.scrollTop - targetTop) > 1) {
        isProgrammaticScrollRef.current = true;
        container.scrollTo({ top: targetTop, behavior: "auto" });
        requestAnimationFrame(() => {
          isProgrammaticScrollRef.current = false;
        });
      }

      if (opt.value !== lastCommittedRef.current) {
        lastCommittedRef.current = opt.value;
        onChangeRef.current(opt.value);
      }
    }, [options]);

    const handleScroll = useCallback(() => {
      if (isProgrammaticScrollRef.current) return;
      if (scrollEndTimerRef.current) {
        window.clearTimeout(scrollEndTimerRef.current);
      }
      scrollEndTimerRef.current = window.setTimeout(commitScroll, 80);
    }, [commitScroll]);

    useEffect(() => {
      return () => {
        if (scrollEndTimerRef.current) {
          window.clearTimeout(scrollEndTimerRef.current);
        }
      };
    }, []);

    return (
      <div
        className={`relative ${width} shrink-0`}
        style={{ height: `${COLUMN_HEIGHT}px` }}
      >
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-white dark:from-[#0b0e15] to-transparent"
          style={{ height: `${ITEM_HEIGHT * PADDING_ITEMS}px` }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-white dark:from-[#0b0e15] to-transparent"
          style={{ height: `${ITEM_HEIGHT * PADDING_ITEMS}px` }}
        />
        <div
          className="pointer-events-none absolute left-0 right-0 z-0 border-y-2 border-gray-300 dark:border-white/30"
          style={{
            top: `${PADDING_ITEMS * ITEM_HEIGHT}px`,
            height: `${ITEM_HEIGHT}px`,
          }}
        />
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full overflow-y-scroll no-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            paddingTop: `${PADDING_ITEMS * ITEM_HEIGHT}px`,
            paddingBottom: `${PADDING_ITEMS * ITEM_HEIGHT}px`,
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            willChange: "transform",
          }}
        >
          {options.map((opt, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                key={`${opt.value}-${index}`}
                style={{ height: `${ITEM_HEIGHT}px` }}
                className={`
                  flex items-center justify-center
                  font-heading tabular-nums
                  transition-colors duration-150
                  ${
                    isSelected
                      ? "text-gray-900 dark:text-white font-black text-lg"
                      : "text-gray-400 dark:text-gray-500 font-bold text-sm"
                  }
                `}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

WheelColumn.displayName = "WheelColumn";

// ==================== ScrollWheelPicker ====================
interface ScrollWheelPickerProps {
  value: string; // ISO: "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" or "HH:mm" for variant="time"
  onChange: (value: string) => void;
  withTime?: boolean;
  /** "datetime" (پیش‌فرض) | "date" | "time" */
  variant?: "datetime" | "date" | "time";
}

const ScrollWheelPicker = ({
  value,
  onChange,
  withTime = false,
  variant = "datetime",
}: ScrollWheelPickerProps) => {
  // برای variant="time": value = "HH:mm" (مثل "08:30")
  // برای variant="datetime" و "date": value = ISO
  const parsed = useMemo(() => {
    // اگه variant="time" بود و value "HH:mm" بود
    if (variant === "time") {
      const timeMatch = /^(\d{2}):(\d{2})$/.exec(value);
      if (timeMatch) {
        return {
          jy: 1400,
          jm: 1,
          jd: 1,
          hh: Number(timeMatch[1]),
          mm: Number(timeMatch[2]),
        };
      }
      // اگه ISO بود (مثل "2000-01-01T08:30")
      const isoMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
      if (isoMatch) {
        return {
          jy: 1400,
          jm: 1,
          jd: 1,
          hh: Number(isoMatch[4]),
          mm: Number(isoMatch[5]),
        };
      }
      // پیش‌فرض
      return { jy: 1400, jm: 1, jd: 1, hh: 8, mm: 0 };
    }

    // برای variant="datetime" و "date"
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value);
    if (!match) {
      const now = new Date();
      const j = jalaali.toJalaali(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
      );
      return {
        jy: j.jy,
        jm: j.jm,
        jd: j.jd,
        hh: now.getHours(),
        mm: now.getMinutes(),
      };
    }
    const j = jalaali.toJalaali(
      Number(match[1]),
      Number(match[2]),
      Number(match[3]),
    );
    return {
      jy: j.jy,
      jm: j.jm,
      jd: j.jd,
      hh: match[4] ? Number(match[4]) : 0,
      mm: match[5] ? Number(match[5]) : 0,
    };
  }, [value, variant]);

  const [jy, setJy] = useState(parsed.jy);
  const [jm, setJm] = useState(parsed.jm);
  const [jd, setJd] = useState(parsed.jd);
  const [hh, setHh] = useState(parsed.hh);
  const [mm, setMm] = useState(parsed.mm);

  const onChangeRef = useRef(onChange);
  const lastEmittedRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // سینک از بیرون
  useEffect(() => {
    setJy(parsed.jy);
    setJm(parsed.jm);
    setJd(parsed.jd);
    setHh(parsed.hh);
    setMm(parsed.mm);
    lastEmittedRef.current = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, variant]);

  // ارسال تغییرات به بیرون
  useEffect(() => {
    // برای variant="time": فقط "HH:mm" رو برگردون
    if (variant === "time") {
      const finalValue = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
      if (finalValue !== lastEmittedRef.current) {
        lastEmittedRef.current = finalValue;
        onChangeRef.current(finalValue);
      }
      return;
    }

    // برای variant="datetime" و "date"
    const g = jalaali.toGregorian(jy, jm, jd);
    const dateStr = `${g.gy}-${String(g.gm).padStart(2, "0")}-${String(g.gd).padStart(2, "0")}`;
    const finalValue =
      variant === "datetime" && withTime
        ? `${dateStr}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
        : dateStr;
    if (finalValue !== lastEmittedRef.current) {
      lastEmittedRef.current = finalValue;
      onChangeRef.current(finalValue);
    }
  }, [jy, jm, jd, hh, mm, withTime, variant]);

  // ==================== Options ====================
  const years: WheelOption[] = useMemo(() => {
    const now = new Date();
    const currentYear = jalaali.toJalaali(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
    ).jy;
    const result: WheelOption[] = [];
    for (let y = currentYear - 100; y <= currentYear + 10; y++) {
      result.push({ value: y, label: persianNumberFormatter.format(y) });
    }
    return result;
  }, []);

  const months: WheelOption[] = useMemo(
    () => MONTH_NAMES.map((name, i) => ({ value: i + 1, label: name })),
    [],
  );

  const days: WheelOption[] = useMemo(() => {
    const count = jalaali.jalaaliMonthLength(jy, jm);
    const result: WheelOption[] = [];
    for (let d = 1; d <= count; d++) {
      result.push({ value: d, label: persianNumberFormatter.format(d) });
    }
    return result;
  }, [jy, jm]);

  const hours: WheelOption[] = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        value: i,
        label: String(i).padStart(2, "0"),
      })),
    [],
  );

  const minutes: WheelOption[] = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        value: i,
        label: String(i).padStart(2, "0"),
      })),
    [],
  );

  // اصلاح روز اگه ماه عوض شد
  useEffect(() => {
    if (variant === "time") return;
    const maxDay = jalaali.jalaaliMonthLength(jy, jm);
    if (jd > maxDay) setJd(maxDay);
  }, [jy, jm, jd, variant]);

  const handleDayChange = useCallback(
    (v: number | string) => setJd(Number(v)),
    [],
  );
  const handleMonthChange = useCallback(
    (v: number | string) => setJm(Number(v)),
    [],
  );
  const handleYearChange = useCallback(
    (v: number | string) => setJy(Number(v)),
    [],
  );
  const handleHourChange = useCallback(
    (v: number | string) => setHh(Number(v)),
    [],
  );
  const handleMinuteChange = useCallback(
    (v: number | string) => setMm(Number(v)),
    [],
  );

  const showDate = variant === "datetime" || variant === "date";
  const showTime = variant === "datetime" || variant === "time";

  return (
    <div dir="ltr" className="flex flex-col items-center gap-4">
      {/* ستون‌های تاریخ */}
      {showDate && (
        <div className="flex items-center justify-center gap-1">
          <WheelColumn
            options={days}
            value={jd}
            onChange={handleDayChange}
            width="w-14"
          />
          <WheelColumn
            options={months}
            value={jm}
            onChange={handleMonthChange}
            width="w-24"
          />
          <WheelColumn
            options={years}
            value={jy}
            onChange={handleYearChange}
            width="w-20"
          />
        </div>
      )}

      {/* ستون‌های ساعت */}
      {showTime && (
        <div className="flex items-center justify-center gap-2">
          <WheelColumn
            options={hours}
            value={hh}
            onChange={handleHourChange}
            width="w-14"
          />
          <div
            className="flex items-center justify-center text-2xl font-black text-gray-400 dark:text-gray-500 shrink-0"
            style={{ height: `${COLUMN_HEIGHT}px` }}
          >
            :
          </div>
          <WheelColumn
            options={minutes}
            value={mm}
            onChange={handleMinuteChange}
            width="w-14"
          />
        </div>
      )}
    </div>
  );
};

export default ScrollWheelPicker;