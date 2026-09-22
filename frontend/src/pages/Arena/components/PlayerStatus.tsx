import { useEffect, useRef, useState } from "react";
import { Flame, Heart, Skull } from "lucide-react";

interface PlayerStatusProps {
  name: string;
  lives: number;
  isCurrentUser?: boolean;
  status?: string;
  online?: boolean;
}

const PlayerStatus = ({
  name,
  lives,
  isCurrentUser = false,
  status,
}: PlayerStatusProps) => {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const [lifePulse, setLifePulse] = useState(false);
  const previousLives = useRef(lives);

  // 🆕 انیمیشن کاهش Life
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

  const isEliminated = status === "eliminated" || lives <= 0;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border
        px-2 py-1.5 sm:px-2.5 sm:py-2
        transition-all duration-300
        ${
          lifePulse
            ? "border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
            : ""
        }
        ${
          isEliminated
            ? "border-rose-500/20 bg-rose-500/[0.03] opacity-70"
            : isCurrentUser
              ? "border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/[0.08]"
              : "border-white/10 bg-white/[0.03]"
        }
      `}
    >
      {/* خط رنگی سمت راست */}
      <div
        className={`
          absolute inset-y-0 right-0 w-0.5
          ${
            isEliminated
              ? "bg-rose-500"
              : isCurrentUser
                ? "bg-[var(--griffin-gold)]"
                : "bg-purple-500"
          }
        `}
      />

      {/* هاله قرمز هنگام کاهش Life */}
      {lifePulse && (
        <div className="absolute inset-0 bg-rose-500/10 animate-pulse pointer-events-none" />
      )}

      <div className="relative flex items-center gap-2">
        {/* ==================== آواتار ==================== */}
        <div className="relative shrink-0">
          <div
            className={`
              relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center
              rounded-lg text-sm font-heading font-black
              transition-all duration-300
              ${
                isEliminated
                  ? "bg-gradient-to-br from-rose-500 to-rose-700 text-white opacity-70 grayscale"
                  : isCurrentUser
                    ? "bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 text-white shadow-md shadow-[var(--griffin-gold)]/30"
                    : "bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-md shadow-purple-500/30"
              }
              ${lifePulse ? "animate-pulse" : ""}
            `}
          >
            {isEliminated ? <Skull size={16} /> : initial}
          </div>
        </div>

        {/* ==================== نام + Life ==================== */}
        <div className="min-w-0 flex-1">
          {/* نام */}
          <p
            className={`
              truncate font-heading text-[11px] sm:text-xs font-black leading-tight
              ${isEliminated ? "text-gray-500 line-through" : "text-white"}
            `}
          >
            {name}
          </p>

          {/* Life قلب‌ها */}
          <div
            className={`
              flex items-center gap-0.5 mt-0.5
              transition-all duration-300
              ${lifePulse ? "scale-110" : ""}
            `}
            aria-label={`${lives} lives`}
          >
            {[0, 1, 2].map((life) => {
              const isFilled = life < lives;
              return (
                <Heart
                  key={life}
                  className={`
                    h-3 w-3 sm:h-3.5 sm:w-3.5 transition-all duration-300
                    ${
                      isFilled
                        ? lifePulse
                          ? "scale-125 fill-rose-500 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                          : "fill-rose-500 text-rose-500"
                        : "text-gray-600 fill-transparent"
                    }
                  `}
                />
              );
            })}

            {/* نمایش -۱ هنگام کاهش */}
            {lifePulse && (
              <span className="mr-0.5 font-heading text-[10px] font-black text-rose-500 animate-bounce">
                -۱
              </span>
            )}
          </div>
        </div>

        {/* ==================== نشان برنده (Flame) ==================== */}
        {lives >= 3 && !isEliminated && (
          <Flame
            size={14}
            className="shrink-0 text-[var(--griffin-gold)] drop-shadow-[0_0_6px_rgba(197,139,42,0.6)]"
            fill="currentColor"
          />
        )}
      </div>
    </div>
  );
};

export default PlayerStatus;