import { Coffee, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface RestOverlayProps {
  nextBookletTitle: string;
  initialSeconds: number;
}

const RestOverlay = ({ nextBookletTitle, initialSeconds }: RestOverlayProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds === 0]);

  const progress = ((initialSeconds - seconds) / initialSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden border-2 border-[var(--griffin-gold)]/40 bg-white/95 dark:bg-[#080B12]/95 shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/20 blur-3xl pointer-events-none" />

        <div className="relative p-8 text-center">
          <div className="relative inline-flex mb-5">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
              <Coffee size={36} strokeWidth={2.3} />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 mb-3">
            <Sparkles size={12} className="text-[var(--griffin-gold)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
              استراحت کوتاه
            </span>
          </div>

          <h2 className="font-heading text-2xl font-black text-gray-900 dark:text-white mb-2">
            خسته نباشی!
          </h2>

          <p className="text-sm leading-7 text-gray-600 dark:text-gray-300 mb-6">
            دفترچه قبلی تموم شد. یه نفس عمیق بکش، آب بخور... <br />
            الان می‌ریم دفترچه بعدی.
          </p>

          <div className="rounded-2xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30 p-4 mb-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
              دفترچه بعدی
            </p>
            <p className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
              {nextBookletTitle}
            </p>
          </div>

          <div className="relative">
            <div className="text-center mb-2">
              <span className="font-heading text-5xl font-black text-[var(--griffin-gold)] tabular-nums">
                {seconds.toLocaleString("fa-IR")}
              </span>
              <span className="text-sm font-black text-gray-500 dark:text-gray-400 mr-2">
                ثانیه
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestOverlay;