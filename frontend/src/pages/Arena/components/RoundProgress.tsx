import { Check, Circle } from "lucide-react";

interface RoundProgressProps {
  current: number;
  total: number;
}

const RoundProgress = ({ current, total }: RoundProgressProps) => (
  <div className="arena-roundbar arena-panel rounded-2xl px-4 py-3">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--griffin-gold)]">ROUND PROGRESS</span>
      <span className="text-xs font-black text-slate-500 dark:text-slate-400">راند {Math.min(current, total)} از {total}</span>
    </div>
    <div className="grid grid-cols-5 gap-2" dir="ltr">
      {Array.from({ length: total }, (_, index) => {
        const round = index + 1;
        const completed = round < current;
        const active = round === current;
        return (
          <div key={round} className="flex items-center gap-1.5">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black transition-all duration-300 ${
              completed
                ? "bg-emerald-500 text-white shadow-[0_0_18px_rgba(16,185,129,0.18)]"
                : active
                  ? "bg-[var(--griffin-gold)] text-white shadow-[0_0_20px_rgba(197,139,42,0.22)]"
                  : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-600"
            }`}>
              {completed ? <Check className="h-3.5 w-3.5" /> : active ? round : <Circle className="h-2.5 w-2.5" />}
            </div>
            {index < total - 1 && <div className={`hidden h-0.5 flex-1 rounded-full sm:block ${completed ? "bg-emerald-500/60" : "bg-slate-200 dark:bg-white/10"}`} />}
          </div>
        );
      })}
    </div>
  </div>
);

export default RoundProgress;
