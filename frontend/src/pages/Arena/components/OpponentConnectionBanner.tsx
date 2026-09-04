import { Wifi, WifiOff } from "lucide-react";

interface OpponentConnectionBannerProps {
  online: boolean;
  timeLeft: number;
  hasOpponent: boolean;
}

const OpponentConnectionBanner = ({ online, timeLeft, hasOpponent }: OpponentConnectionBannerProps) => {
  if (!hasOpponent || online) return null;

  return (
    <div className="mb-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-center text-amber-700 shadow-sm dark:text-amber-300 sm:flex-row sm:gap-3">
      <WifiOff className="h-4 w-4 shrink-0" />
      <div>
        <p className="text-xs font-black">اتصال حریف قطع شده است</p>
        <p className="mt-0.5 text-[11px] font-medium opacity-80">
          حریف می‌تواند دوباره متصل شود؛ نبرد تا پایان زمان این سؤال ادامه دارد.
        </p>
      </div>
      {timeLeft > 0 && (
        <div className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-white/40 px-2.5 py-1 text-[10px] font-black dark:bg-black/10">
          <Wifi className="h-3 w-3" />
          {timeLeft} ثانیه
        </div>
      )}
    </div>
  );
};

export default OpponentConnectionBanner;
