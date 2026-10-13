import { useEffect, useState } from "react";
import { Clock3, X } from "lucide-react";
import ScrollWheelPicker from "./ScrollWheelPicker";

interface TimeWheelPickerProps {
  value: string; // "HH:mm" مثل "08:30"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
}

const TimeWheelPicker = ({
  value,
  onChange,
  placeholder = "انتخاب ساعت",
  disabled = false,
  required = false,
  "aria-label": ariaLabel,
}: TimeWheelPickerProps) => {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value || "08:00");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!open) setTempValue(value || "08:00");
  }, [value, open]);

  const handleOpen = () => {
    if (disabled) return;
    setTempValue(value || "08:00");
    setOpen(true);
  };

  const handleConfirm = (newValue: string) => {
    // newValue = "HH:mm"
    onChange(newValue);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        aria-label={ariaLabel ?? placeholder}
        aria-required={required}
        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-3 pl-10 text-sm text-right text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 relative tabular-nums"
      >
        <Clock3
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
        />
        <span className={value ? "" : "text-gray-400 dark:text-gray-500"}>
          {value || placeholder}
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
            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white">
                انتخاب ساعت
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* ✅ variant="time" → فقط ساعت */}
            <ScrollWheelPicker
              value={tempValue}
              onChange={setTempValue}
              withTime
              variant="time"
            />

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

export default TimeWheelPicker;