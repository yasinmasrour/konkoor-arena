import { Check, CircleX, Lock } from "lucide-react";

interface AnswerOptionsProps {
  options: string[];
  selectedAnswer: number | null;
  disabled: boolean;
  onSelect: (index: number) => void;
  answerResult?: "correct" | "wrong" | null;
}

const AnswerOptions = ({ options, selectedAnswer, disabled, onSelect, answerResult = null }: AnswerOptionsProps) => (
  <div className="mt-4 grid gap-3 md:grid-cols-2">
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
          className={`group relative flex min-h-[76px] items-center gap-4 overflow-hidden rounded-2xl border p-4 text-right transition-all duration-200 ${
            isCorrectSelection
              ? "border-emerald-500/60 bg-emerald-500/10 shadow-[0_12px_35px_rgba(16,185,129,0.12)]"
              : isWrongSelection
                ? "border-rose-500/60 bg-rose-500/10 shadow-[0_12px_35px_rgba(244,63,94,0.12)]"
                : selected
                  ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)]/10 shadow-[0_12px_35px_rgba(197,139,42,0.12)]"
                  : "border-slate-200/80 bg-white/75 hover:-translate-y-0.5 hover:border-[var(--griffin-gold)]/50 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.035]"
          } disabled:cursor-not-allowed disabled:hover:translate-y-0`}
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black transition-colors ${
            isCorrectSelection
              ? "border-emerald-500 bg-emerald-500 text-white"
              : isWrongSelection
                ? "border-rose-500 bg-rose-500 text-white"
                : selected
                  ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)] text-white"
                  : "border-slate-200 bg-slate-50 text-slate-600 group-hover:border-[var(--griffin-gold)]/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
          }`}>
            {isCorrectSelection ? <Check className="h-5 w-5" /> : isWrongSelection ? <CircleX className="h-5 w-5" /> : label}
          </span>
          <span className="flex-1 leading-7">{option}</span>
          {disabled && !selected && <Lock className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-700" />}
        </button>
      );
    })}
  </div>
);

export default AnswerOptions;
