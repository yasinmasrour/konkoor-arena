import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
}

const OtpInput = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error,
  autoFocus = true,
}: OtpInputProps) => {
  const [digits, setDigits] = useState<string[]>(() => {
    const initial = value.split("").slice(0, length);
    return Array.from({ length }, (_, i) => initial[i] ?? "");
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  // 🔹 همگام‌سازی با value خارجی
  useEffect(() => {
    const incoming = value.split("").slice(0, length);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDigits((prev) => {
      const next = [...prev];
      let changed = false;
      for (let i = 0; i < length; i++) {
        const newVal = incoming[i] ?? "";
        if (next[i] !== newVal) {
          next[i] = newVal;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [value, length]);

  // 🔹 Auto-focus روی اولین کادر خالی
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      const firstEmpty = digits.findIndex((d) => !d);
      const targetIndex = firstEmpty === -1 ? 0 : firstEmpty;
      requestAnimationFrame(() => {
        inputRefs.current[targetIndex]?.focus();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  // 🔹 چک auto-submit
  useEffect(() => {
    const fullCode = digits.join("");
    if (
      fullCode.length === length &&
      !digits.includes("") &&
      !hasAutoSubmitted
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasAutoSubmitted(true);
      onComplete?.(fullCode);
    }
    if (fullCode.length < length) {
      setHasAutoSubmitted(false);
    }
  }, [digits, length, onComplete, hasAutoSubmitted]);

  const updateDigits = (next: string[]) => {
    setDigits(next);
    onChange(next.join(""));
  };

  // 🔹 فوکوس روی یه کادر مشخص (با تأخیر رندر)
  const focusInput = (index: number) => {
    if (index < 0 || index >= length) return;
    requestAnimationFrame(() => {
      const input = inputRefs.current[index];
      if (input) {
        input.focus();
        input.select();
      }
    });
  };

  // 🔹 تغییر یه کادر
  const handleChange = (index: number, val: string) => {
    // فقط اعداد
    const sanitized = val.replace(/\D/g, "");
    if (!sanitized) return;

    // اگه چند رقم paste شد
    if (sanitized.length > 1) {
      handlePasteDigits(index, sanitized);
      return;
    }

    // فقط آخرین رقم رو نگه دار (اگه قبلاً چیزی بود)
    const newDigit = sanitized[sanitized.length - 1];

    const next = [...digits];
    next[index] = newDigit;
    updateDigits(next);

    // ✅ برو به کادر بعدی
    if (index < length - 1) {
      focusInput(index + 1);
    }
  };

  // 🔹 Backspace / Arrows / Delete
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      if (digits[index]) {
        // اگه کادر پر بود، خالیش کن (ولی برو عقب نرو)
        const next = [...digits];
        next[index] = "";
        updateDigits(next);
      } else if (index > 0) {
        // اگه خالی بود، برو قبلی و خالیش کن
        const next = [...digits];
        next[index - 1] = "";
        updateDigits(next);
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusInput(index + 1);
    } else if (e.key === "Delete") {
      e.preventDefault();
      const next = [...digits];
      next[index] = "";
      updateDigits(next);
    }
  };

  // 🔹 Paste
  const handlePasteDigits = (startIndex: number, pasted: string) => {
    const sanitized = pasted
      .replace(/\D/g, "")
      .slice(0, length - startIndex);

    if (!sanitized) return;

    const next = [...digits];
    for (let i = 0; i < sanitized.length; i++) {
      next[startIndex + i] = sanitized[i];
    }
    updateDigits(next);

    // فوکوس روی آخرین کادر پر شده یا کادر بعدی
    const lastIndex = Math.min(startIndex + sanitized.length, length - 1);
    focusInput(lastIndex);
  };

  const handlePaste = (index: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    handlePasteDigits(index, pasted);
  };

  // 🔹 فوکوس روی کادر
  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // اگه کادر خالی بود و کادر خالی قبلی هست، بذار همون
    const firstEmpty = digits.findIndex((d) => !d);
    if (firstEmpty !== -1 && firstEmpty !== index && !digits[index]) {
      // اختیاری: می‌تونی این رو حذف کنی اگه می‌خوای کاربر هر جا کلیک کرد، فوکوس بمونه
    }
  };

  return (
    <div className="space-y-2">
      {/* ==================== کادرهای OTP ==================== */}
      <div
        className="flex items-center justify-center gap-2 sm:gap-2.5"
        dir="ltr"
      >
        {Array.from({ length }).map((_, index) => {
          const digit = digits[index] || "";
          const isFocused = focusedIndex === index;
          const isFilled = Boolean(digit);

          return (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              disabled={disabled}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)}
              onFocus={() => handleFocus(index)}
              onBlur={() => setFocusedIndex(null)}
              className={`
                relative
                w-11 h-13 sm:w-12 sm:h-14
                rounded-xl border-2
                bg-white/[0.03]
                backdrop-blur-sm
                text-center font-heading font-black text-xl text-white
                outline-none
                transition-all duration-200
                caret-transparent
                selection:bg-transparent
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "focus:scale-105 focus:z-10"
                }
                ${
                  error
                    ? "border-rose-500/50"
                    : isFocused
                      ? "border-[var(--griffin-gold)] shadow-lg shadow-[var(--griffin-gold)]/30 bg-[var(--griffin-gold)]/5"
                      : isFilled
                        ? "border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/10"
                        : "border-white/10"
                }
              `}
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 40}ms both`,
              }}
            />
          );
        })}
      </div>

      {/* ==================== خطا ==================== */}
      {error && (
        <p className="text-center text-[11px] font-bold text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
};

export default OtpInput;