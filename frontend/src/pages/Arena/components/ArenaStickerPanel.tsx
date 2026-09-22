import { useEffect, useRef, useState } from "react";
import { MessageCircle, Sparkles, X } from "lucide-react";

import { ARENA_STICKERS, type ArenaSticker } from "./arenaStickerConstants";

interface ArenaStickerPanelProps {
  disabled?: boolean;
  onSend: (sticker: ArenaSticker) => void;
}

const ArenaStickerPanel = ({
  disabled = false,
  onSend,
}: ArenaStickerPanelProps) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // 🔹 بستن پنل با کلیک بیرون
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const handleSend = (sticker: ArenaSticker) => {
    onSend(sticker);
    setOpen(false);
  };

  return (
    <div
      ref={panelRef}
      className="relative w-full shrink-0 border-t border-white/5 bg-[#0a0d14]/95 backdrop-blur-xl"
    >
      {/* ==================== پنل استیکرها (از پایین باز می‌شه) ==================== */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-out
          ${open ? "max-h-[180px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="relative border-b border-white/5">
          {/* خط طلایی بالا */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/60 to-transparent" />

          <div className="p-2 sm:p-3">
            {/* هدر پنل */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles
                  size={11}
                  className="text-[var(--griffin-gold)] animate-pulse"
                />
                <p className="text-[9px] sm:text-[10px] font-black text-white tracking-widest uppercase">
                  استیکرها
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="بستن"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 hover:text-rose-400 transition-colors"
              >
                <X size={10} />
              </button>
            </div>

            {/* گرید استیکرها (۶ ستونه در موبایل، ۸ ستونه در دسکتاپ) */}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 sm:gap-2">
              {ARENA_STICKERS.map((sticker, index) => (
                <button
                  key={sticker.id}
                  type="button"
                  title={sticker.label}
                  aria-label={sticker.label}
                  onClick={() => handleSend(sticker)}
                  className="
                    group relative aspect-square
                    flex items-center justify-center
                    rounded-lg sm:rounded-xl
                    border border-white/5
                    bg-gradient-to-br from-white/[0.04] to-white/[0.02]
                    p-1 sm:p-1.5
                    overflow-hidden
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:border-[var(--griffin-gold)]/50
                    hover:shadow-md hover:shadow-[var(--griffin-gold)]/20
                    active:scale-95
                    animate-[fadeInUp_0.3s_ease-out_both]
                  "
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* گرادیان طلایی hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/0 to-[var(--griffin-gold)]/0 group-hover:from-[var(--griffin-gold)]/10 group-hover:to-transparent transition-all duration-300" />

                  <img
                    src={sticker.asset}
                    alt=""
                    className="relative h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                    draggable={false}
                  />

                  <span className="sr-only">{sticker.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== دکمه اصلی (تمام عرض) ==================== */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        aria-label="پنل استیکر"
        aria-expanded={open}
        className={`
          group relative w-full
          flex items-center justify-center gap-1.5 sm:gap-2
          px-3 py-2 sm:px-4 sm:py-2.5
          text-[11px] sm:text-xs font-black
          overflow-hidden
          transition-all duration-300
          disabled:cursor-not-allowed disabled:opacity-40
          ${
            open
              ? "bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]"
              : "bg-transparent text-gray-300 hover:bg-white/5 hover:text-[var(--griffin-gold)]"
          }
        `}
      >
        {/* shine effect */}
        {!open && !disabled && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        )}

        <MessageCircle
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10 transition-transform duration-300 ${
            open ? "rotate-12" : "group-hover:scale-110"
          }`}
        />
        <span className="relative z-10">
          {open ? "بستن استیکرها" : "استیکر"}
        </span>

        {/* نشان تعداد */}
        {!open && (
          <span className="relative z-10 w-4 h-4 rounded-md bg-white/10 text-gray-400 flex items-center justify-center text-[9px] font-black group-hover:bg-[var(--griffin-gold)]/20 group-hover:text-[var(--griffin-gold)] transition-colors">
            {ARENA_STICKERS.length.toLocaleString("fa-IR")}
          </span>
        )}

        {/* فلش بالا/پایین */}
        <span
          className={`
            relative z-10 transition-transform duration-300
            ${open ? "rotate-180" : ""}
          `}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </span>
      </button>
    </div>
  );
};

export default ArenaStickerPanel;
