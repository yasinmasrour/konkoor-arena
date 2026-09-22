import { ChevronLeft, ChevronRight, Flag } from "lucide-react";

interface NavigationGridProps {
  total: number;
  currentIndex: number;
  answers: Record<string, number | null>;
  flags: Record<string, boolean>;
  questionIds: string[];
  onSelect: (index: number) => void;
}

const NavigationGrid = ({
  total,
  currentIndex,
  answers,
  flags,
  questionIds,
  onSelect,
}: NavigationGridProps) => {
  if (total <= 1) return null;

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
          ناوبری سوالات
        </span>
        <div className="flex items-center gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-[var(--griffin-gold)]" />
            جواب داده
          </span>
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-300 dark:bg-white/10" />
            نزده
          </span>
          <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Flag size={9} className="text-amber-500" fill="currentColor" />
            علامت
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="shrink-0 w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 disabled:hover:border-gray-200 dark:disabled:hover:border-white/10 disabled:hover:text-gray-500 transition-all"
        >
          <ChevronRight size={16} />
        </button>

        <div className="flex-1 flex flex-wrap gap-1.5 justify-center">
          {Array.from({ length: total }).map((_, index) => {
            const qid = questionIds[index];
            const isAnswered =
              answers[qid] !== undefined && answers[qid] !== null;
            const isFlagged = flags[qid];
            const isCurrent = index === currentIndex;

            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelect(index)}
                className={`
                  relative w-9 h-9 rounded-lg text-xs font-black tabular-nums transition-all duration-200
                  ${
                    isCurrent
                      ? "ring-2 ring-[var(--griffin-gold)] ring-offset-2 ring-offset-white dark:ring-offset-[#080B12] scale-110 z-10"
                      : ""
                  }
                  ${
                    isAnswered
                      ? "bg-[var(--griffin-gold)] text-white shadow-md shadow-[var(--griffin-gold)]/30 hover:scale-105"
                      : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                  }
                `}
              >
                {(index + 1).toLocaleString("fa-IR")}

                {isFlagged && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-[#080B12] flex items-center justify-center">
                    <Flag size={7} className="text-white" fill="currentColor" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onSelect(Math.min(total - 1, currentIndex + 1))}
          disabled={currentIndex === total - 1}
          className="shrink-0 w-9 h-9 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 disabled:hover:border-gray-200 dark:disabled:hover:border-white/10 disabled:hover:text-gray-500 transition-all"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
    </section>
  );
};

export default NavigationGrid;
