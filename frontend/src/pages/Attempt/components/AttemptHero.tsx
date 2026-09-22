import { AlertTriangle, Clock, FileText, Sparkles } from "lucide-react";
import { formatTimePersian } from "../hooks/useAttemptTimer";

interface AttemptHeroProps {
  examTitle: string;
  bookletTitle: string;
  bookletOrder: number;
  totalBooklets: number;
  lesson: string;
  secondsRemaining: number | null;
  isResting: boolean;
}

const AttemptHero = ({
  examTitle,
  bookletTitle,
  bookletOrder,
  totalBooklets,
  lesson,
  secondsRemaining,
  isResting,
}: AttemptHeroProps) => {
  const isLowTime =
    secondsRemaining !== null && secondsRemaining <= 60 && !isResting;
  const isVeryLowTime =
    secondsRemaining !== null && secondsRemaining <= 30 && !isResting;

  return (
    <section className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

      <div className="relative p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* عنوان */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60 animate-pulse" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <FileText size={24} strokeWidth={2.3} />
              </div>
            </div>

            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 mb-1">
                <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  آزمون در جریان
                </span>
              </div>

              <h1 className="font-heading text-lg sm:text-xl font-black text-gray-900 dark:text-white truncate">
                {examTitle}
              </h1>

              <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 px-2.5 py-1 font-black text-[var(--griffin-gold)]">
                  دفترچه {bookletOrder.toLocaleString("fa-IR")} از{" "}
                  {totalBooklets.toLocaleString("fa-IR")}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {lesson}
                </span>
                <span className="text-gray-400 dark:text-gray-500 truncate hidden sm:inline">
                  · {bookletTitle}
                </span>
              </div>
            </div>
          </div>

          {/* تایمر */}
          <div
            className={`
              relative shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-300
              ${
                isVeryLowTime
                  ? "border-rose-500/60 bg-rose-500/10 shadow-lg shadow-rose-500/20 animate-pulse"
                  : isLowTime
                    ? "border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                    : "border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 shadow-lg shadow-[var(--griffin-gold)]/20"
              }
            `}
          >
            <div className="px-5 py-3 flex items-center gap-3">
              <div
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${
                    isVeryLowTime
                      ? "bg-rose-500/20 text-rose-500"
                      : isLowTime
                        ? "bg-amber-500/20 text-amber-500"
                        : "bg-[var(--griffin-gold)]/20 text-[var(--griffin-gold)]"
                  }
                `}
              >
                {isVeryLowTime ? (
                  <AlertTriangle size={20} className="animate-pulse" />
                ) : (
                  <Clock size={20} />
                )}
              </div>
              <div>
                <p
                  className={`
                    text-[10px] font-black uppercase tracking-widest
                    ${
                      isVeryLowTime
                        ? "text-rose-500"
                        : isLowTime
                          ? "text-amber-500"
                          : "text-gray-500 dark:text-gray-400"
                    }
                  `}
                >
                  زمان باقی‌مانده
                </p>
                <p
                  className={`
                    font-heading text-3xl font-black tabular-nums leading-none mt-0.5
                    ${
                      isVeryLowTime
                        ? "text-rose-500"
                        : isLowTime
                          ? "text-amber-500"
                          : "text-[var(--griffin-gold)]"
                    }
                  `}
                  dir="ltr"
                >
                  {formatTimePersian(secondsRemaining)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AttemptHero;
