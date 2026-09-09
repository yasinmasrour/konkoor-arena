import { useState } from "react";
import { MessageCircle } from "lucide-react";

import { ARENA_STICKERS, type ArenaSticker } from "./arenaStickerConstants";

interface ArenaStickerPanelProps {
  disabled?: boolean;
  onSend: (sticker: ArenaSticker) => void;
}

const ArenaStickerPanel = ({ disabled = false, onSend }: ArenaStickerPanelProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-3 grid w-[min(280px,calc(100vw-2rem))] grid-cols-4 gap-2 rounded-3xl border border-slate-200/80 bg-white/90 p-3 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
          {ARENA_STICKERS.map((sticker) => (
            <button
              key={sticker.id}
              type="button"
              title={sticker.label}
              aria-label={sticker.label}
              onClick={() => {
                onSend(sticker);
              }}
              className="group flex aspect-square items-center justify-center rounded-2xl border border-transparent bg-slate-100/70 p-2 transition hover:-translate-y-0.5 hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/10 dark:bg-white/[0.05]"
            >
              <img
                src={sticker.asset}
                alt=""
                className="h-full w-full object-contain transition group-hover:scale-105"
                draggable={false}
              />
              <span className="sr-only">{sticker.label}</span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-2.5 text-xs font-black text-slate-600 shadow-sm backdrop-blur-md transition hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-300 dark:hover:text-[var(--griffin-gold)]"
      >
        <MessageCircle className="h-4 w-4" />
        استیکر
      </button>
    </div>
  );
};

export default ArenaStickerPanel;
