import { Check, CircleX, Lock, Sparkles, Zap } from "lucide-react";
import MathText from "../../../components/questions/MathText";

interface AnswerOptionsProps {
  options: string[];
  selectedAnswer: number | null;
  disabled: boolean;
  onSelect: (index: number) => void;
  answerResult?: "correct" | "wrong" | null;
}

const AnswerOptions = ({
  options,
  selectedAnswer,
  disabled,
  onSelect,
  answerResult = null,
}: AnswerOptionsProps) => (
  <div className="grid grid-cols-2 gap-2 sm:gap-2.5 h-full">
    {options.map((option, index) => {
      const selected = selectedAnswer === index;
      const isCorrectSelection = selected && answerResult === "correct";
      const isWrongSelection = selected && answerResult === "wrong";
      const label = String.fromCharCode(65 + index);

      return (
        <button
          key={`${index}-${option}`}
          type="button"
          onClick={() => onSelect(index)}
          disabled={disabled}
          className={`
            group relative flex items-center gap-2 sm:gap-2.5
            h-full min-h-[72px] sm:min-h-[80px]
            overflow-hidden rounded-xl sm:rounded-2xl border
            p-2.5 sm:p-3
            text-right transition-all duration-200
            active:scale-[0.97]
            disabled:cursor-not-allowed
            ${
              isCorrectSelection
                ? "border-emerald-500/60 bg-gradient-to-l from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 shadow-[0_10px_30px_-8px_rgba(16,185,129,0.4)]"
                : isWrongSelection
                ? "border-rose-500/60 bg-gradient-to-l from-rose-500/20 via-rose-500/10 to-rose-500/5 shadow-[0_10px_30px_-8px_rgba(244,63,94,0.4)]"
                : selected
                ? "border-[var(--griffin-gold)] bg-gradient-to-l from-[var(--griffin-gold)]/20 via-[var(--griffin-gold)]/10 to-[var(--griffin-gold)]/5 shadow-[0_10px_30px_-8px_rgba(197,139,42,0.4)]"
                : "border-white/10 bg-white/5 hover:border-[var(--griffin-gold)]/50 hover:bg-[var(--griffin-gold)]/5 hover:shadow-lg hover:shadow-[var(--griffin-gold)]/10"
            }
          `}
        >
          {/* 🔹 هاله درخشان هنگام انتخاب درست */}
          {isCorrectSelection && (
            <div className="absolute -inset-4 bg-emerald-500/15 blur-2xl animate-pulse pointer-events-none" />
          )}

          {/* 🔹 هاله هنگام انتخاب اشتباه */}
          {isWrongSelection && (
            <div className="absolute -inset-4 bg-rose-500/15 blur-2xl animate-pulse pointer-events-none" />
          )}

          {/* 🔹 افکت shine روی hover (فقط دسکتاپ) */}
          {!selected && !disabled && (
            <span className="hidden sm:block absolute inset-0 bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
          )}

          {/* 🔹 خط رنگی سمت راست */}
          <div
            className={`
              absolute top-0 right-0 bottom-0 w-0.5 sm:w-1
              transition-all duration-300
              ${
                isCorrectSelection
                  ? "bg-gradient-to-b from-transparent via-emerald-500 to-transparent"
                  : isWrongSelection
                  ? "bg-gradient-to-b from-transparent via-rose-500 to-transparent"
                  : selected
                  ? "bg-gradient-to-b from-transparent via-[var(--griffin-gold)] to-transparent"
                  : "bg-transparent"
              }
            `}
          />

          {/* ===== آیکون/برچسب حرف ===== */}
          <span
            className={`
              relative flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center
              rounded-lg sm:rounded-xl border-2
              text-xs sm:text-sm font-black
              transition-all duration-300
              ${
                isCorrectSelection
                  ? "border-emerald-500 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/40"
                  : isWrongSelection
                  ? "border-rose-500 bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-500/40"
                  : selected
                  ? "border-[var(--griffin-gold)] bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 text-white shadow-lg shadow-[var(--griffin-gold)]/40"
                  : "border-white/10 bg-white/5 text-gray-300 group-hover:border-[var(--griffin-gold)]/40 group-hover:bg-[var(--griffin-gold)]/5 group-hover:text-[var(--griffin-gold)]"
              }
            `}
          >
            {isCorrectSelection ? (
              <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
            ) : isWrongSelection ? (
              <CircleX className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
            ) : (
              label
            )}

            {/* درخشش پشت آیکون */}
            {(isCorrectSelection || isWrongSelection || selected) && (
              <span
                className={`
                  absolute inset-0 rounded-lg sm:rounded-xl blur-md opacity-60 -z-10
                  ${
                    isCorrectSelection
                      ? "bg-emerald-500"
                      : isWrongSelection
                      ? "bg-rose-500"
                      : "bg-[var(--griffin-gold)]"
                  }
                `}
              />
            )}
          </span>

          {/* ===== متن گزینه ===== */}
          <span className="relative flex-1 min-w-0 leading-6 sm:leading-7 text-xs sm:text-sm text-white">
            <span className="line-clamp-3 sm:line-clamp-4">
              <MathText content={option} />
            </span>
          </span>

          {/* ===== آیکون قفل (وقتی غیرفعاله و انتخاب نشده) ===== */}
          {disabled && !selected && (
            <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-gray-600" />
          )}

          {/* ===== برچسب درست (فقط دسکتاپ) ===== */}
          {isCorrectSelection && (
            <span className="hidden sm:inline-flex absolute top-1.5 left-1.5 items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black shadow-lg">
              <Check size={9} strokeWidth={3} />
              درست
            </span>
          )}

          {/* ===== برچسب غلط (فقط دسکتاپ) ===== */}
          {isWrongSelection && (
            <span className="hidden sm:inline-flex absolute top-1.5 left-1.5 items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black shadow-lg">
              <CircleX size={9} strokeWidth={3} />
              غلط
            </span>
          )}

          {/* ===== نشان انتخاب‌شده (طلایی) ===== */}
          {selected && !answerResult && (
            <span className="hidden sm:inline-flex absolute top-1.5 left-1.5 items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--griffin-gold)] text-white text-[9px] font-black shadow-lg">
              <Zap size={9} fill="white" />
              انتخاب شد
            </span>
          )}

          {/* ===== افکت ذرات برای گزینه درست ===== */}
          {isCorrectSelection && (
            <Sparkles
              size={12}
              className="hidden sm:block absolute top-1/2 left-2 text-emerald-500 animate-pulse"
            />
          )}
        </button>
      );
    })}
  </div>
);

export default AnswerOptions;