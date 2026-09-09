import { useEffect, useRef } from "react";

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

const ArenaStickerOverlay = ({ event, currentUserId, onDone }: ArenaStickerOverlayProps) => {
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!event) return;

    const timeoutId = window.setTimeout(() => {
      onDoneRef.current();
    }, 1600);

    return () => window.clearTimeout(timeoutId);
  }, [event]);

  if (!event) return null;

  const isMine = event.senderId === currentUserId;

  return (
    <div className={`pointer-events-none fixed inset-x-0 top-28 z-50 flex ${isMine ? "justify-end pr-5 sm:pr-10" : "justify-start pl-5 sm:pl-10"}`}>
      <div key={`${event.sentAt}-${event.senderId}-${event.stickerId}`} className="arena-sticker-pop flex max-w-[170px] flex-col items-center gap-1.5">
        <img
          src={event.asset}
          alt={event.senderName}
          className="h-28 w-28 object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.24)] sm:h-36 sm:w-36"
        />
        <span className="rounded-full border border-white/20 bg-slate-950/75 px-3 py-1 text-[10px] font-black text-white shadow-xl backdrop-blur-md">
          {isMine ? "شما" : event.senderName}
        </span>
      </div>
    </div>
  );
};

export default ArenaStickerOverlay;
