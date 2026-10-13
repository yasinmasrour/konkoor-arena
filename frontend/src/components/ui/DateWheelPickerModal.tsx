import { useEffect, useState } from "react";
import { Calendar, X } from "lucide-react";
import * as jalaali from "jalaali-js";
import ScrollWheelPicker from "./ScrollWheelPicker";

interface DateWheelPickerModalProps {
  value: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  "aria-label"?: string;
}

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

// ==================== Export: Jalali Display Helper ====================
// eslint-disable-next-line react-refresh/only-export-components
export function formatJalaliDisplay(value: string, withTime = false): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value);
  if (!match) return "";

  const j = jalaali.toJalaali(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  );

  let result = `${persianNumberFormatter.format(j.jd)} ${
    MONTH_NAMES[j.jm - 1]
  } ${persianNumberFormatter.format(j.jy)}`;

  if (withTime && match[4] && match[5]) {
    const hh = String(Number(match[4])).padStart(2, "0");
    const mm = String(Number(match[5])).padStart(2, "0");
    result += ` — ${hh}:${mm}`;
  }

  return result;
}

// ==================== DateWheelPickerModal ====================
const DateWheelPickerModal = ({
  value,
  onChange,
  withTime = false,
  placeholder = withTime ? "انتخاب تاریخ و ساعت" : "انتخاب تاریخ",
  required = false,
  disabled = false,
  id,
  name,
  "aria-label": ariaLabel,
}: DateWheelPickerModalProps) => {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  // سینک tempValue با value وقتی مودال بسته‌ست
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTempValue(value);
    }
  }, [value, open]);

  const displayValue = formatJalaliDisplay(value, withTime);

  const handleOpen = () => {
    if (disabled) return;
    setTempValue(value);
    setOpen(true);
  };

  const handleConfirm = (newValue: string) => {
    onChange(newValue);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={handleOpen}
        aria-label={ariaLabel ?? placeholder}
        aria-required={required}
        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 pl-10 text-sm text-right text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 relative"
      >
        <Calendar
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
        />
        <span
          className={displayValue ? "" : "text-gray-400 dark:text-gray-500"}
        >
          {displayValue || placeholder}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white dark:bg-[#0b0e15] rounded-2xl shadow-2xl p-4 max-h-[85vh] overflow-y-auto"
          >
            {/* هدر */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white">
                {withTime ? "انتخاب تاریخ و ساعت" : "انتخاب تاریخ"}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Wheel Picker */}
            {/* ✅ variant بر اساس withTime */}
            <ScrollWheelPicker
              value={tempValue}
              onChange={setTempValue}
              withTime={withTime}
              variant={withTime ? "datetime" : "date"}
            />

            {/* دکمه تایید */}
            <button
              type="button"
              onClick={() => handleConfirm(tempValue)}
              className="mt-3 w-full rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl transition-all"
            >
              تایید و بستن
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DateWheelPickerModal;