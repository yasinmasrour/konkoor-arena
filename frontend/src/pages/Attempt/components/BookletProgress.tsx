import { CheckCircle2, Flag, HelpCircle } from "lucide-react";

interface BookletProgressProps {
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
}

const BookletProgress = ({
  totalQuestions,
  answeredCount,
  flaggedCount,
}: BookletProgressProps) => {
  const percentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs font-black text-gray-700 dark:text-gray-300">
              {answeredCount.toLocaleString("fa-IR")} از{" "}
              {totalQuestions.toLocaleString("fa-IR")}
            </span>
          </div>

          {flaggedCount > 0 && (
            <div className="flex items-center gap-2">
              <Flag size={13} className="text-amber-500" />
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                {flaggedCount.toLocaleString("fa-IR")} علامت‌گذاری
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <HelpCircle size={13} className="text-gray-400 dark:text-gray-500" />
          <span className="font-heading text-lg font-black text-[var(--griffin-gold)] tabular-nums">
            {percentage.toLocaleString("fa-IR")}٪
          </span>
        </div>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 transition-all duration-700 shadow-lg shadow-[var(--griffin-gold)]/30"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </section>
  );
};

export default BookletProgress;
