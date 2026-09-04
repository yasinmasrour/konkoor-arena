import { Clock3 } from "lucide-react";

interface MatchTimerProps { timeLeft: number; timeLimit: number; }

const MatchTimer = ({ timeLeft, timeLimit }: MatchTimerProps) => {
  const progress = timeLimit > 0 ? Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100)) : 0;
  const urgent = timeLeft <= 5;
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;

  return (
    <div className={`relative flex h-24 w-24 items-center justify-center rounded-full ${urgent ? "animate-pulse" : ""}`}>
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="5" className="text-slate-200 dark:text-white/10" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" className={urgent ? "text-rose-500" : "text-[var(--griffin-gold)]"} strokeDasharray={`${dash} ${circumference}`} />
      </svg>
      <div className="relative text-center">
        <Clock3 className={`mx-auto mb-0.5 h-4 w-4 ${urgent ? "text-rose-500" : "text-[var(--griffin-gold)]"}`} />
        <span className={`block text-xl font-black tabular-nums ${urgent ? "text-rose-500" : ""}`}>{timeLeft}</span>
        <span className="text-[9px] font-bold text-slate-400">ثانیه</span>
      </div>
    </div>
  );
};

export default MatchTimer;
