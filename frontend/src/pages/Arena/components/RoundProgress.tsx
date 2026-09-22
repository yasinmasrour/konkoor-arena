import { Check, Crown, Swords, Trophy } from "lucide-react";

interface RoundProgressProps {
  current: number;
  total: number;
}

const RoundProgress = ({ current, total }: RoundProgressProps) => {
  const progress = (Math.min(current, total) / total) * 100;

  return (
    <div className="relative arena-roundbar rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm">
      {/* 🔹 گرادیان طلایی بالای کارت */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

      {/* 🔹 هاله تزئینی */}
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      <div className="relative px-4 py-4">
        {/* ==================== هدر ==================== */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2">
            <Swords
              size={13}
              className="text-[var(--griffin-gold)] animate-pulse"
            />
            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--griffin-gold)]">
              Round Progress
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20">
            <Trophy size={11} className="text-[var(--griffin-gold)]" />
            <span className="font-heading text-[11px] font-black text-[var(--griffin-gold)] tabular-nums">
              راند {Math.min(current, total).toLocaleString("fa-IR")} از{" "}
              {total.toLocaleString("fa-IR")}
            </span>
          </div>
        </div>

        {/* ==================== مراحل راند ==================== */}
        <div className="grid grid-cols-5 gap-2.5" dir="ltr">
          {Array.from({ length: total }, (_, index) => {
            const round = index + 1;
            const completed = round < current;
            const active = round === current;

            return (
              <div key={round} className="flex items-center gap-2">
                <div className="relative group">
                  {/* 🔹 هاله درخشان پشت */}
                  {active && (
                    <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60 animate-pulse" />
                  )}
                  {completed && (
                    <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40" />
                  )}

                  {/* 🔹 حلقه پالس برای راند فعال */}
                  {active && (
                    <div className="absolute inset-0 rounded-xl border-2 border-[var(--griffin-gold)] animate-ping" />
                  )}

                  {/* 🔹 دایره اصلی */}
                  <div
                    className={`
                      relative flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-xl text-[11px] font-heading font-black
                      transition-all duration-500
                      ${
                        completed
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/40 scale-100"
                          : active
                            ? "bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 text-white shadow-lg shadow-[var(--griffin-gold)]/50 scale-110"
                            : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-white/10"
                      }
                    `}
                  >
                    {completed ? (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    ) : active ? (
                      <span className="drop-shadow-sm">
                        {round.toLocaleString("fa-IR")}
                      </span>
                    ) : (
                      <span className="text-[10px]">
                        {round.toLocaleString("fa-IR")}
                      </span>
                    )}

                    {/* 🔹 تاج روی راند فعال اگر آخرین راند باشه */}
                    {active && round === total && (
                      <Crown
                        size={12}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-lg animate-bounce"
                        fill="currentColor"
                      />
                    )}
                  </div>
                </div>

                {/* 🔹 خط اتصال بین راندها */}
                {index < total - 1 && (
                  <div className="relative hidden h-1 flex-1 rounded-full sm:block bg-gray-200 dark:bg-white/10 overflow-hidden">
                    {/* خط پر شده */}
                    <div
                      className={`
                        absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out
                        ${
                          completed
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            : active
                              ? "bg-gradient-to-r from-[var(--griffin-gold)] to-amber-400 shadow-[0_0_8px_rgba(197,139,42,0.5)]"
                              : "w-0"
                        }
                      `}
                      style={{
                        width: completed ? "100%" : active ? "50%" : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ==================== نوار پیشرفت کلی ==================== */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(197,139,42,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-heading text-[10px] font-black text-[var(--griffin-gold)] tabular-nums min-w-[32px] text-right">
            {Math.round(progress).toLocaleString("fa-IR")}٪
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoundProgress;
