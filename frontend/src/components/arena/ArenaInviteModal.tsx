import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  LoaderCircle,
  Share2,
  UserPlus,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  cancelArenaInvite,
  createArenaInvite,
  getMyArenaInvite,
  type ArenaInvite,
} from "../../api/arenaApi";
import { socket } from "../../socket/socket";

interface ArenaInviteModalProps {
  leagueId: string;
  leagueTitle: string;
  onClose: () => void;
}

const ArenaInviteModal = ({
  leagueId,
  leagueTitle,
  onClose,
}: ArenaInviteModalProps) => {
  const navigate = useNavigate();
  const [invite, setInvite] = useState<ArenaInvite | null>(null);
  const [expiresIn, setExpiresIn] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [shared, setShared] = useState(false);

  // ساخت یا گرفتن invite
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        // اول چک کن invite فعال داره یا نه
        const existing = await getMyArenaInvite();
        if (cancelled) return;

        if (existing.invite && existing.invite.leagueId === leagueId) {
          setInvite(existing.invite);
          setExpiresIn(existing.expiresInSeconds);
          setLoading(false);
          return;
        }

        // اگه نداشت، بساز
        const result = await createArenaInvite(leagueId);
        if (cancelled) return;
        setInvite(result.invite);
        setExpiresIn(result.expiresInSeconds);
      } catch (err) {
        if (cancelled) return;
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "ساخت کد دعوت انجام نشد";
        setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void init();
    return () => {
      cancelled = true;
    };
  }, [leagueId]);

  // شمارش معکوس
  useEffect(() => {
    if (expiresIn <= 0) return;
    const interval = setInterval(() => {
      setExpiresIn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresIn > 0]);

  // socket: match found
  useEffect(() => {
    const handleMatchFound = (data: { matchId: string }) => {
      navigate(`/arena/match/${data.matchId}`);
    };
    socket.on("arena:match-found", handleMatchFound);
    return () => {
      socket.off("arena:match-found", handleMatchFound);
    };
  }, [navigate]);

  const handleCopy = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleShare = async () => {
    if (!invite) return;

    const shareUrl = `${window.location.origin}/arena/invite/${invite.code}`;
    const shareData = {
      title: "دعوت به نبرد در آرنا",
      text: `بیا توی آرنا با هم بجنگیم! کد دعوت: ${invite.code}`,
      url: shareUrl,
    };

    // چک پشتیبانی Web Share API
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      } catch (err) {
        // کاربر لغو کرد یا خطا
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
        return;
      }
    }

    // fallback: کپی لینک
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleCancel = async () => {
    if (!invite || cancelling) return;
    setCancelling(true);
    try {
      await cancelArenaInvite(invite.code);
      onClose();
    } catch (err) {
      console.error("Cancel failed:", err);
      setCancelling(false);
    }
  };

  const minutes = Math.floor(expiresIn / 60);
  const seconds = expiresIn % 60;
  const progress = expiresIn > 0 ? (expiresIn / 300) * 100 : 0;
  const isExpired = expiresIn <= 0 && !loading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-2xl shadow-2xl animate-[fadeInUp_0.3s_ease-out]"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex items-start justify-between gap-3 p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <UserPlus size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Friendly Match
              </p>
              <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                دعوت دوست به نبرد
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-rose-500/15 hover:text-rose-500 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="relative p-5 space-y-5">
          {loading ? (
            <div className="py-12 text-center">
              <LoaderCircle
                size={28}
                className="mx-auto text-[var(--griffin-gold)] animate-spin mb-3"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                در حال ساخت کد دعوت...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-2.5">
              <AlertCircle
                size={16}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-5">
                {error}
              </p>
            </div>
          ) : invite ? (
            <>
              {/* لیگ */}
              <div className="rounded-xl bg-[var(--griffin-gold)]/5 dark:bg-white/[0.02] border border-[var(--griffin-gold)]/20 dark:border-white/5 p-3 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                  لیگ
                </p>
                <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                  {leagueTitle}
                </p>
              </div>

              {/* کد */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center mb-2">
                  کد دعوت
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-2xl border-2 border-dashed border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 py-4 text-center">
                    <span
                      dir="ltr"
                      className="font-english text-3xl font-black text-[var(--griffin-gold)] tracking-[0.3em] tabular-nums"
                    >
                      {invite.code}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`
                      shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                      ${
                        copied
                          ? "bg-emerald-500 text-white"
                          : "bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 text-white hover:scale-105 shadow-lg shadow-[var(--griffin-gold)]/40"
                      }
                    `}
                    title="کپی کد"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>

              {/* شمارش معکوس */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    <Clock size={11} />
                    زمان باقی‌مانده
                  </span>
                  <span
                    className={`font-heading text-lg font-black tabular-nums ${
                      isExpired ? "text-rose-500" : "text-[var(--griffin-gold)]"
                    }`}
                  >
                    {isExpired
                      ? "منقضی"
                      : `${minutes.toLocaleString("fa-IR")}:${String(seconds).padStart(2, "0")}`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                  <div
                    className={`
                      h-full rounded-full transition-all duration-1000
                      ${
                        isExpired
                          ? "bg-rose-500"
                          : "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400"
                      }
                    `}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* راهنما */}
              <div className="rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-3">
                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-6">
                  💡 کد رو برای دوستت بفرست. به‌محض اینکه قبول کنه، نبرد به‌طور
                  خودکار شروع می‌شه و به صفحه‌ی Match منتقل می‌شید.
                </p>
              </div>

              {/* دکمه‌ها */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 px-4 py-3 text-xs font-black text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 hover:border-[var(--griffin-gold)]/60 transition-all"
                >
                  {shared ? (
                    <>
                      <Check size={15} />
                      لینک کپی شد / اشتراک شد
                    </>
                  ) : (
                    <>
                      <Share2 size={15} />
                      اشتراک‌گذاری لینک دعوت
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 text-xs font-black text-gray-600 dark:text-gray-300 hover:border-rose-500/40 hover:text-rose-500 disabled:opacity-50 transition-all"
                >
                  {cancelling ? "در حال لغو..." : "لغو دعوت"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-3 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl transition-all"
                >
                  بستن
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ArenaInviteModal;
