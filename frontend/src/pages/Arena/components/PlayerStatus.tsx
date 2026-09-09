import { useEffect, useRef, useState } from "react";
import { Heart, Wifi, WifiOff, Zap } from "lucide-react";

interface PlayerStatusProps {
  name: string;
  lives: number;
  isCurrentUser?: boolean;
  status?: string;
  online?: boolean;
}

const PlayerStatus = ({ name, lives, isCurrentUser = false, status, online = true }: PlayerStatusProps) => {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const [lifePulse, setLifePulse] = useState(false);
  const previousLives = useRef(lives);

  useEffect(() => {
    if (lives < previousLives.current) {
      const startPulseId = window.setTimeout(() => setLifePulse(true), 0);
      const timeoutId = window.setTimeout(() => setLifePulse(false), 650);
      previousLives.current = lives;
      return () => {
        window.clearTimeout(startPulseId);
        window.clearTimeout(timeoutId);
      };
    }

    previousLives.current = lives;
  }, [lives]);

  const statusText =
    status === "locked"
      ? isCurrentUser ? "قفل شدی؛ منتظر نتیجه راند" : "در این راند قفل شده"
      : status === "eliminated"
        ? "از نبرد خارج شد"
        : !online
          ? "اتصال حریف قطع شده"
          : isCurrentUser
            ? "آماده پاسخ"
            : "در حال پاسخ‌گویی";

  return (
    <div className={`relative overflow-hidden rounded-2xl border px-4 py-3 transition-all duration-300 ${
      lifePulse ? "border-rose-500/60 shadow-[0_0_30px_rgba(244,63,94,0.18)]" : ""
    } ${
      isCurrentUser
        ? "border-[var(--griffin-gold)]/35 bg-[var(--griffin-gold)]/[0.08]"
        : "border-slate-200/70 bg-white/70 dark:border-white/10 dark:bg-white/[0.045]"
    }`}>
      <div className={`absolute inset-y-0 right-0 w-1 ${isCurrentUser ? "bg-[var(--griffin-gold)]" : "bg-slate-300 dark:bg-slate-700"}`} />
      <div className="flex items-center gap-3">
        <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
          isCurrentUser ? "bg-[var(--griffin-gold)] text-white" : "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
        } ${!online ? "opacity-60" : ""}`}>
          {initial}
          {isCurrentUser && <Zap className="absolute -bottom-1 -left-1 h-4 w-4 rounded-full bg-slate-950 p-0.5 text-[var(--griffin-gold)]" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-extrabold">{name}</p>
            {isCurrentUser && <span className="text-[9px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">YOU</span>}
          </div>
          <div className={`mt-1 flex items-center gap-1.5 text-[11px] ${online ? "text-slate-500 dark:text-slate-400" : "text-amber-600 dark:text-amber-300"}`}>
            {online ? <Wifi className="h-3.5 w-3.5 text-emerald-500" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{statusText}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 rounded-xl px-2 py-1 transition-all duration-300 ${lifePulse ? "bg-rose-500/10" : ""}`} aria-label={`${lives} lives`}>
          {[0, 1, 2].map((life) => (
            <Heart key={life} className={`h-4 w-4 transition-all duration-300 ${life < lives ? lifePulse ? "scale-110 fill-rose-500 text-rose-500" : "fill-rose-500 text-rose-500" : "text-slate-300 dark:text-slate-700"}`} />
          ))}
          {lifePulse && <span className="mr-1 text-[10px] font-black text-rose-500">-1</span>}
        </div>
      </div>
    </div>
  );
};

export default PlayerStatus;
