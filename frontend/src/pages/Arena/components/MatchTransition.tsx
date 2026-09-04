import { Swords } from "lucide-react";

interface MatchTransitionProps {
  round: number;
  message?: string;
}

const MatchTransition = ({ round, message = "راند بعدی در حال آماده‌سازی است" }: MatchTransitionProps) => (
  <div className="arena-transition absolute inset-0 z-20 flex items-center justify-center rounded-[28px] bg-slate-950/70 p-6 text-center backdrop-blur-md">
    <div className="arena-transition-card max-w-sm rounded-3xl border border-white/10 bg-white/[0.07] px-8 py-7 text-white shadow-2xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)]">
        <Swords className="h-6 w-6 animate-pulse" />
      </div>
      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-[var(--griffin-gold)]">NEXT ROUND</p>
      <h3 className="mt-2 text-2xl font-black">راند {round}</h3>
      <p className="mt-2 text-sm text-slate-300">{message}</p>
    </div>
  </div>
);

export default MatchTransition;
