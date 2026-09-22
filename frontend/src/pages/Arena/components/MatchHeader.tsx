import { Swords } from "lucide-react";
import PlayerStatus from "./PlayerStatus";

interface Player {
  userId: string;
  lives: number;
  status?: string;
  firstName?: string;
  lastName?: string;
  online?: boolean;
}

interface MatchHeaderProps {
  players: Player[];
  currentUserId?: string;
}

const getName = (player: Player) =>
  `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() || "بازیکن";

const MatchHeader = ({ players, currentUserId }: MatchHeaderProps) => {
  const me = players.find((player) => player.userId === currentUserId);
  const opponent = players.find((player) => player.userId !== currentUserId);

  // 🔹 محاسبه پیشتاز
  const meLives = me?.lives ?? 0;
  const oppLives = opponent?.lives ?? 0;
  const meAhead = meLives > oppLives;
  const oppAhead = oppLives > meLives;

  // رنگ VS بر اساس پیشتاز
  const vsState = meAhead ? "me" : oppAhead ? "opp" : "tie";

  const vsPalette = {
    me: {
      border: "border-emerald-500/60",
      bg: "bg-gradient-to-br from-emerald-500/20 to-emerald-700/20",
      glow: "bg-emerald-500",
      icon: "text-emerald-400",
      shadow: "shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      ring: "ring-emerald-500/30",
    },
    opp: {
      border: "border-rose-500/60",
      bg: "bg-gradient-to-br from-rose-500/20 to-rose-700/20",
      glow: "bg-rose-500",
      icon: "text-rose-400",
      shadow: "shadow-[0_0_20px_rgba(244,63,94,0.35)]",
      ring: "ring-rose-500/30",
    },
    tie: {
      border: "border-[var(--griffin-gold)]/50",
      bg: "bg-gradient-to-br from-[var(--griffin-gold)]/20 to-amber-700/20",
      glow: "bg-[var(--griffin-gold)]",
      icon: "text-[var(--griffin-gold)]",
      shadow: "shadow-[0_0_20px_rgba(197,139,42,0.35)]",
      ring: "ring-[var(--griffin-gold)]/30",
    },
  }[vsState];

  return (
    <header className="relative">
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-sm">
        {/* 🔹 خط طلایی بالا */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/60 to-transparent" />

        {/* ==================== گرید سه ستونه (همه سایزها) ==================== */}
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-2.5 p-1.5 sm:p-2">
          {/* ==================== بازیکن من ==================== */}
          <div className="min-w-0">
            <div
              className={`
                rounded-lg transition-all duration-500
                ${meAhead ? `ring-2 ${vsPalette.ring}` : ""}
              `}
            >
              <PlayerStatus
                name={me ? getName(me) : "شما"}
                lives={meLives}
                status={me?.status}
                online={me?.online ?? true}
                isCurrentUser
              />
            </div>
          </div>

          {/* ==================== VS ==================== */}
          <div className="relative flex items-center justify-center shrink-0">
            <div
              className={`
                relative flex h-8 w-8 sm:h-10 sm:w-10
                items-center justify-center
                rounded-full border-2
                transition-all duration-500
                ${vsPalette.border} ${vsPalette.bg} ${vsPalette.shadow}
              `}
            >
              {/* درخشش */}
              <div
                className={`
                  absolute inset-0 rounded-full blur-md opacity-60
                  ${vsPalette.glow}
                `}
              />

              <Swords
                className={`
                  relative h-3.5 w-3.5 sm:h-4 sm:w-4
                  transition-colors duration-500
                  ${vsPalette.icon}
                `}
                strokeWidth={2.4}
              />
            </div>
          </div>

          {/* ==================== حریف ==================== */}
          <div className="min-w-0">
            <div
              className={`
                rounded-lg transition-all duration-500
                ${oppAhead ? `ring-2 ${vsPalette.ring}` : ""}
              `}
            >
              <PlayerStatus
                name={opponent ? getName(opponent) : "در انتظار"}
                lives={oppLives}
                status={opponent?.status}
                online={opponent?.online ?? true}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MatchHeader;
