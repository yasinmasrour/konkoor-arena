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

const getName = (player: Player) => `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() || "بازیکن";

const MatchHeader = ({ players, currentUserId }: MatchHeaderProps) => {
  const me = players.find((player) => player.userId === currentUserId);
  const opponent = players.find((player) => player.userId !== currentUserId);

  return (
    <header className="relative mb-5 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
      <PlayerStatus name={me ? getName(me) : "شما"} lives={me?.lives ?? 0} status={me?.status} online={me?.online ?? true} isCurrentUser />
      <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] shadow-[0_0_35px_rgba(197,139,42,0.14)]">
        <Swords className="h-5 w-5" />
      </div>
      <PlayerStatus name={opponent ? getName(opponent) : "در انتظار حریف"} lives={opponent?.lives ?? 0} status={opponent?.status} online={opponent?.online ?? true} />
    </header>
  );
};

export default MatchHeader;
