import { Flag, LoaderCircle, X, Zap } from "lucide-react";
import MathText from "../../../components/questions/MathText";

interface QuestionCardProps {
  number: number;
  total: number;
  questionText: string;
  questionImage: string;
  options: string[];
  selectedAnswer: number | null;
  isFlagged: boolean;
  difficulty: string;
  loadingAnswer: boolean;
  onSelectAnswer: (index: number) => void;
  onClearAnswer: () => void;
  onToggleFlag: () => void;
}

const difficultyLabels: Record<string, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
  tricky: "مفهومی",
};

const difficultyStyles: Record<string, { bg: string; text: string }> = {
  easy: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  hard: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  tricky: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
  },
};

const QuestionCard = ({
  number,
  total,
  questionText,
  questionImage,
  options,
  selectedAnswer,
  isFlagged,
  difficulty,
  loadingAnswer,
  onSelectAnswer,
  onClearAnswer,
  onToggleFlag,
}: QuestionCardProps) => {
  const diffStyle = difficultyStyles[difficulty] || difficultyStyles.medium;

  return (
    <section className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

      <div className="relative p-5 sm:p-6">
        {/* هدر */}
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-40" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-lg shadow-lg">
                {number.toLocaleString("fa-IR")}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                سوال
              </p>
              <p className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                {number.toLocaleString("fa-IR")} از{" "}
                {total.toLocaleString("fa-IR")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-black ${diffStyle.bg} ${diffStyle.text}`}
            >
              <Zap size={10} />
              {difficultyLabels[difficulty] || difficulty}
            </span>

            <button
              type="button"
              onClick={onToggleFlag}
              className={`
                group w-9 h-9 rounded-xl flex items-center justify-center transition-all
                ${
                  isFlagged
                    ? "bg-amber-500/15 text-amber-500 border border-amber-500/40 shadow-lg shadow-amber-500/20"
                    : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-transparent hover:border-amber-500/40 hover:text-amber-500"
                }
              `}
              title={isFlagged ? "برداشتن علامت" : "علامت‌گذاری برای مرور"}
            >
              <Flag
                size={15}
                fill={isFlagged ? "currentColor" : "none"}
                className="transition-transform group-hover:scale-110"
              />
            </button>
          </div>
        </div>

        {/* متن سوال */}
        <div className="text-base sm:text-lg leading-8 font-semibold text-gray-900 dark:text-white mb-6">
          <MathText content={questionText} />
        </div>

        {/* تصویر */}
        {questionImage && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-2">
            <img
              src={questionImage}
              alt="تصویر سوال"
              className="max-h-80 w-full rounded-xl object-contain mx-auto"
            />
          </div>
        )}

        {/* راهنما */}
        {selectedAnswer !== null && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2">
            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
              💡 برای برداشتن جواب، روی گزینه انتخاب‌شده کلیک کن
            </p>
            <button
              type="button"
              onClick={onClearAnswer}
              disabled={loadingAnswer}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 px-2.5 py-1 text-[10px] font-black transition-colors disabled:opacity-50"
            >
              <X size={11} strokeWidth={3} />
              برداشتن
            </button>
          </div>
        )}

        {/* گزینه‌ها */}
        <div className="space-y-3">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const letter = String.fromCharCode(65 + index);

            return (
              <button
                key={index}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    onClearAnswer();
                  } else {
                    onSelectAnswer(index);
                  }
                }}
                disabled={loadingAnswer}
                className={`
                  group relative w-full rounded-2xl border-2 p-4 text-right transition-all duration-300
                  disabled:opacity-70 disabled:cursor-wait
                  ${
                    isSelected
                      ? "border-[var(--griffin-gold)] bg-gradient-to-l from-[var(--griffin-gold)]/15 via-[var(--griffin-gold)]/5 to-transparent shadow-lg shadow-[var(--griffin-gold)]/20"
                      : "border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-heading font-black text-sm transition-all
                      ${
                        isSelected
                          ? "bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 text-white shadow-lg shadow-[var(--griffin-gold)]/40 scale-110"
                          : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 group-hover:bg-[var(--griffin-gold)]/15 group-hover:text-[var(--griffin-gold)]"
                      }
                    `}
                  >
                    {letter}
                  </div>

                  <div className="min-w-0 flex-1 pt-1.5 text-sm leading-7 text-gray-900 dark:text-white">
                    <MathText content={option} />
                  </div>

                  {isSelected && (
                    <div className="shrink-0 w-6 h-6 rounded-full bg-[var(--griffin-gold)] flex items-center justify-center text-white mt-1.5 shadow-lg">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {loadingAnswer && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <LoaderCircle size={14} className="animate-spin" />
            در حال ثبت...
          </div>
        )}
      </div>
    </section>
  );
};

export default QuestionCard;
