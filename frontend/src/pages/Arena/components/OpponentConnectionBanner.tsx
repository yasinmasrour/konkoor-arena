import { WifiOff } from "lucide-react";

interface OpponentConnectionBannerProps {
  online: boolean;
  timeLeft: number;
  hasOpponent: boolean;
}

const OpponentConnectionBanner = ({
  online,
  timeLeft,
  hasOpponent,
}: OpponentConnectionBannerProps) => {
  // اگه حریفی نیست یا آنلاینه، چیزی نشون نده
  if (!hasOpponent || online) return null;

  return (
    <div className="relative rounded-xl overflow-hidden border border-amber-500/30 bg-gradient-to-l from-amber-500/15 via-amber-500/10 to-transparent backdrop-blur-sm">
      {/* 🔹 خط رنگی سمت راست */}
      <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-amber-500 to-transparent" />

      {/* 🔹 هاله ملایم گوشه */}
      <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-amber-500/20 blur-2xl animate-pulse pointer-events-none" />

      {/* 🔹 محتوای بنر */}
      <div className="relative flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3">
        {/* آیکون */}
        <div className="relative shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <WifiOff size={15} className="text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* متن */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs sm:text-sm font-heading font-black text-amber-400 leading-tight">
              اتصال حریف قطع شده
            </p>
          </div>
          <p className="mt-0.5 text-[10px] sm:text-[11px] leading-4 text-amber-300/80 truncate">
            نبرد تا پایان زمان این سؤال ادامه دارد
          </p>
        </div>

        {/* تایمر */}
        {timeLeft > 0 && (
          <div className="shrink-0 flex items-baseline gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="font-heading text-sm sm:text-base font-black tabular-nums text-amber-400 leading-none">
              {timeLeft.toLocaleString("fa-IR")}
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-amber-400/70">
              ثانیه
            </span>
          </div>
        )}
      </div>

      {/* 🔹 نوار پیشرفت پایین */}
      {timeLeft > 0 && (
        <div className="relative h-px bg-amber-500/10">
          <div
            className="h-full bg-gradient-to-l from-amber-500 to-amber-400 transition-all duration-1000 ease-linear"
            style={{
              width: `${Math.min(100, (timeLeft / 30) * 100)}%`,
              boxShadow: "0 0 6px rgba(245, 158, 11, 0.6)",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OpponentConnectionBanner;
