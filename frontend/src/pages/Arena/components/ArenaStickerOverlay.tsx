import { useEffect, useRef } from "react";
import { Sparkles, Zap } from "lucide-react";

export interface ArenaStickerEvent {
  matchId: string;
  stickerId: string;
  asset: string;
  senderId: string;
  senderName: string;
  sentAt: string;
}

interface ArenaStickerOverlayProps {
  event: ArenaStickerEvent | null;
  currentUserId?: string;
  onDone: () => void;
}

// 🆕 مدت نمایش استیکر (به میلی‌ثانیه)
const STICKER_DISPLAY_DURATION = 4000;

const ArenaStickerOverlay = ({
  event,
  currentUserId,
  onDone,
}: ArenaStickerOverlayProps) => {
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!event) return;

    const timeoutId = window.setTimeout(() => {
      onDoneRef.current();
    }, STICKER_DISPLAY_DURATION);

    return () => window.clearTimeout(timeoutId);
  }, [event]);

  if (!event) return null;

  const isMine = event.senderId === currentUserId;

  return (
    <div
      className={`
        pointer-events-none fixed inset-x-0 top-24 z-50
        flex ${isMine ? "justify-end pr-5 sm:pr-12" : "justify-start pl-5 sm:pl-12"}
      `}
    >
      <div
        key={`${event.sentAt}-${event.senderId}-${event.stickerId}`}
        className="arena-sticker-pop relative flex flex-col items-center gap-2"
        style={{
          animation: `arena-sticker-pop 0.5s ease-out, arena-sticker-fade-out 0.5s ease-in ${STICKER_DISPLAY_DURATION - 500}ms forwards`,
        }}
      >
        {/* 🔹 هاله درخشان پشت استیکر */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`
              w-40 h-40 sm:w-52 sm:h-52 rounded-full blur-3xl opacity-70
              ${isMine ? "bg-[var(--griffin-gold)]/40" : "bg-purple-500/40"}
            `}
          />
        </div>

        {/* 🔹 حلقه‌های پالس */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`
              w-32 h-32 sm:w-40 sm:h-40 rounded-full border-2 opacity-60
              ${isMine ? "border-[var(--griffin-gold)]/40" : "border-purple-500/40"}
              animate-ping
            `}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`
              w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 opacity-80
              ${isMine ? "border-[var(--griffin-gold)]/30" : "border-purple-500/30"}
              animate-ping
            `}
            style={{ animationDelay: "0.3s" }}
          />
        </div>

        {/* 🔹 ذرات تزئینی */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { top: "10%", left: "5%", delay: "0s", size: 14 },
            { top: "20%", right: "10%", delay: "0.15s", size: 10 },
            { bottom: "30%", left: "0%", delay: "0.3s", size: 12 },
            { bottom: "15%", right: "5%", delay: "0.45s", size: 14 },
          ].map((sparkle, i) => (
            <Sparkles
              key={i}
              size={sparkle.size}
              className={`
                absolute
                ${isMine ? "text-[var(--griffin-gold)]" : "text-purple-400"}
                animate-pulse
              `}
              style={{
                top: sparkle.top,
                left: sparkle.left,
                right: sparkle.right,
                bottom: sparkle.bottom,
                animationDelay: sparkle.delay,
                filter: "drop-shadow(0 0 6px currentColor)",
              }}
            />
          ))}
        </div>

        {/* 🔹 خود استیکر */}
        <div className="relative">
          <img
            src={event.asset}
            alt={event.senderName}
            className="
              relative
              h-32 w-32 sm:h-40 sm:w-40
              object-contain
              drop-shadow-[0_25px_40px_rgba(0,0,0,0.35)]
              transition-transform duration-300
            "
          />

          {/* 🔹 درخشش روی استیکر */}
          <div
            className={`
              absolute inset-0 rounded-full blur-2xl opacity-40 -z-10
              ${isMine ? "bg-[var(--griffin-gold)]" : "bg-purple-500"}
            `}
          />
        </div>

        {/* 🔹 نام فرستنده */}
        <div
          className={`
            relative inline-flex items-center gap-1.5
            rounded-full px-3.5 py-1.5
            backdrop-blur-md shadow-xl border
            ${
              isMine
                ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600 border-white/20 text-white"
                : "bg-gradient-to-l from-purple-500 to-purple-700 border-white/20 text-white"
            }
          `}
        >
          {isMine ? (
            <Zap size={11} fill="currentColor" />
          ) : (
            <Sparkles size={11} />
          )}
          <span className="text-[10px] font-black tracking-wide">
            {isMine ? "شما" : event.senderName}
          </span>
        </div>

        {/* 🔹 فلش کوچک زیر برچسب نام */}
        <div
          className={`
            absolute -bottom-1 w-2 h-2 rotate-45
            ${
              isMine
                ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600"
                : "bg-gradient-to-l from-purple-500 to-purple-700"
            }
          `}
        />
      </div>
    </div>
  );
};

export default ArenaStickerOverlay;