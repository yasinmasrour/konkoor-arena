import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BrainCircuit,
  Clock3,
  Flame,
  LoaderCircle,
  Radar,
  Search,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trophy,
  UserPlus,
  Users,
  X,
  Zap,
  KeyRound,
} from "lucide-react";
import {
  getArenaQueueStatus,
  joinArenaQueue,
  leaveArenaQueue,
} from "../../api/arenaApi";
import { socket } from "../../socket/socket";
import RevealOnScroll from "../../components/common/RevealOnScroll";
import ArenaInviteModal from "../../components/arena/ArenaInviteModal";

type MatchmakingLocationState = {
  league?: {
    title?: string;
    lesson?: string;
  };
};

const Matchmaking = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as MatchmakingLocationState | null;
  const leagueTitle = locationState?.league?.title ?? "لیگ کنکورآرنا";
  const lesson = locationState?.league?.lesson ?? "رقابت سرعتی و دانش";

  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const [inviteCode, setInviteCode] = useState("");
  const [codeError, setCodeError] = useState("");

  // ==================== Socket: Match Found ====================
  useEffect(() => {
    const handleMatchFound = (data: { matchId: string; leagueId: string }) => {
      if (data.leagueId === leagueId) {
        navigate(`/arena/match/${data.matchId}`);
      }
    };
    socket.on("arena:match-found", handleMatchFound);
    return () => {
      socket.off("arena:match-found", handleMatchFound);
    };
  }, [leagueId, navigate]);

  // ==================== Timer ====================
  useEffect(() => {
    if (!searching) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [searching]);

  // ==================== Queue Status ====================
  useEffect(() => {
    if (!leagueId) return;
    let cancelled = false;

    const loadQueueStatus = async () => {
      try {
        const result = await getArenaQueueStatus(leagueId);
        if (cancelled) return;

        if (result.inQueue) {
          const joinedAt = new Date(
            result.queue?.joinedAt ?? Date.now(),
          ).getTime();
          const elapsed = Math.max(
            0,
            Math.floor((Date.now() - joinedAt) / 1000),
          );
          setElapsedSeconds(elapsed);
          setSearching(true);
        } else {
          setElapsedSeconds(0);
          setSearching(false);
        }
      } catch (requestError) {
        if (!cancelled) console.error("Queue status error:", requestError);
      }
    };

    void loadQueueStatus();
    return () => {
      cancelled = true;
    };
  }, [leagueId]);

  const elapsedLabel = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [elapsedSeconds]);

  // ==================== Start Matchmaking ====================
  const startMatchmaking = async () => {
    if (!leagueId) return;
    try {
      setError("");
      const result = await joinArenaQueue(leagueId);
      setSearching(true);
      if (result.matched && result.match) {
        navigate(`/arena/match/${result.match.id}`);
      }
    } catch (requestError: unknown) {
      console.error("Matchmaking error:", requestError);
      setSearching(false);
      setError(
        requestError &&
          typeof requestError === "object" &&
          "response" in requestError
          ? String(
              (
                requestError as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message ?? "خطایی در پیدا کردن حریف رخ داد.",
            )
          : requestError instanceof Error
            ? requestError.message
            : "خطایی در پیدا کردن حریف رخ داد.",
      );
    }
  };

  const handleJoinByCode = () => {
    setCodeError("");
    const code = inviteCode.trim().toUpperCase();

    if (code.length !== 6) {
      setCodeError("کد دعوت باید ۶ کاراکتر باشه");
      return;
    }

    navigate(`/arena/invite/${code}`);
  };

  // ==================== Cancel Matchmaking ====================
  const cancelMatchmaking = async () => {
    if (!leagueId) return;
    try {
      await leaveArenaQueue(leagueId);
      setSearching(false);
      setElapsedSeconds(0);
    } catch (requestError) {
      console.error("Cancel matchmaking error:", requestError);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ==================== Back ==================== */}
        <RevealOnScroll>
          <button
            type="button"
            onClick={() => navigate("/arena")}
            className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            بازگشت به لیگ‌ها
          </button>
        </RevealOnScroll>

        {/* ==================== Hero Matchmaking ==================== */}
        <RevealOnScroll>
          <section className="relative rounded-[2rem] overflow-hidden bg-[#080B12] text-white p-6 md:p-12 border border-white/5 shadow-2xl shadow-[var(--griffin-gold)]/10">
            {/* پس‌زمینه */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/25 blur-[100px] pointer-events-none" />

            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* ذرات شناور */}
            {Array.from({ length: 15 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[var(--griffin-gold)] pointer-events-none"
                style={{
                  // eslint-disable-next-line react-hooks/purity
                  top: `${Math.random() * 100}%`,
                  // eslint-disable-next-line react-hooks/purity
                  left: `${Math.random() * 100}%`,
                  // eslint-disable-next-line react-hooks/purity
                  animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                  // eslint-disable-next-line react-hooks/purity
                  animationDelay: `${Math.random() * 3}s`,
                  // eslint-disable-next-line react-hooks/purity
                  opacity: 0.3 + Math.random() * 0.5,
                }}
              />
            ))}

            <div className="relative text-center space-y-5">
              {/* آیکون شمشیر / رادار */}
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-3xl opacity-60 animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center shadow-2xl shadow-[var(--griffin-gold)]/50 rotate-3">
                  {searching ? (
                    <Radar
                      size={38}
                      strokeWidth={2.2}
                      className="text-white animate-pulse"
                    />
                  ) : (
                    <Swords
                      size={38}
                      strokeWidth={2.2}
                      className="text-white"
                    />
                  )}
                </div>
                {searching && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#080B12] flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </span>
                )}
              </div>

              {/* برچسب */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30 backdrop-blur-sm">
                <Zap
                  size={13}
                  className="text-[var(--griffin-gold)] animate-pulse"
                />
                <span className="text-xs font-black tracking-widest text-[var(--griffin-gold)] uppercase">
                  Griffin Arena · Matchmaking
                </span>
              </div>

              {/* تیتر */}
              <h1 className="font-heading text-3xl md:text-5xl font-black leading-tight">
                {searching ? (
                  <>
                    در جستجوی{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                      حریف مناسب
                    </span>
                  </>
                ) : (
                  <>
                    آماده‌ای وارد{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                      نبرد
                    </span>{" "}
                    شوی؟
                  </>
                )}
              </h1>

              <p className="text-gray-300 leading-8 max-w-2xl mx-auto text-sm md:text-base">
                {searching
                  ? "سیستم به‌صورت خودکار بازیکنی با سطح رقابتی نزدیک به تو پیدا می‌کند. فقط آماده باش؛ نبرد به‌محض پیدا شدن حریف شروع می‌شود."
                  : "حریف را انتخاب نمی‌کنی؛ سیستم به‌صورت خودکار بهترین گزینه موجود را برای یک رقابت سریع و منصفانه پیدا می‌کند."}
              </p>
            </div>
          </section>
        </RevealOnScroll>

        {/* ==================== کارت‌های لیگ vs حریف ==================== */}
        <RevealOnScroll>
          <section className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            {/* کارت لیگ */}
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6">
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg shadow-[var(--griffin-gold)]/30">
                    <BrainCircuit size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      لیگ انتخاب‌شده
                    </p>
                    <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                      {leagueTitle}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-white/5">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Target size={12} />
                    موضوع
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {lesson}
                  </span>
                </div>
              </div>
            </div>

            {/* VS */}
            <div className="relative mx-auto flex items-center justify-center">
              {/* حلقه پینگ */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-[var(--griffin-gold)]/30 animate-ping" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-32 h-32 rounded-full border border-[var(--griffin-gold)]/20 animate-ping"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>

              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center shadow-2xl shadow-[var(--griffin-gold)]/50 border-4 border-white dark:border-[#0a0d14]">
                <span className="font-heading text-2xl font-black text-white">
                  VS
                </span>
              </div>
            </div>

            {/* کارت حریف */}
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6">
              <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-purple-500/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`
                      w-12 h-12 rounded-2xl
                      flex items-center justify-center text-white
                      shadow-lg transition-all duration-500
                      ${
                        searching
                          ? "bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/30 animate-pulse"
                          : "bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/30"
                      }
                    `}
                  >
                    {searching ? (
                      <LoaderCircle className="animate-spin" size={22} />
                    ) : (
                      <Users size={22} />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      حریف
                    </p>
                    <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                      {searching ? (
                        <span className="inline-flex items-center gap-2">
                          در حال جستجو
                          <span className="flex gap-0.5">
                            <span
                              className="w-1 h-1 rounded-full bg-[var(--griffin-gold)] animate-bounce"
                              style={{ animationDelay: "0s" }}
                            />
                            <span
                              className="w-1 h-1 rounded-full bg-[var(--griffin-gold)] animate-bounce"
                              style={{ animationDelay: "0.15s" }}
                            />
                            <span
                              className="w-1 h-1 rounded-full bg-[var(--griffin-gold)] animate-bounce"
                              style={{ animationDelay: "0.3s" }}
                            />
                          </span>
                        </span>
                      ) : (
                        "بازیکن تصادفی"
                      )}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-white/5">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Sparkles size={12} />
                    روش انتخاب
                  </span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    Matchmaking خودکار
                  </span>
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* ==================== بخش Searching ==================== */}
        {searching ? (
          <RevealOnScroll>
            <section className="relative rounded-3xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-amber-500/5 to-transparent backdrop-blur-xl p-6 md:p-8">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl" />

              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                {/* وضعیت */}
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60 animate-pulse" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                      <LoaderCircle className="animate-spin" size={26} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" />
                        <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                        Live
                      </span>
                    </div>
                    <p className="font-heading text-lg font-black text-gray-900 dark:text-white mt-1">
                      صف نبرد فعال است
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      به‌محض پیدا شدن حریف، وارد Match می‌شوی.
                    </p>
                  </div>
                </div>

                {/* تایمر */}
                <div className="flex items-center gap-3 rounded-2xl bg-white/80 dark:bg-black/20 border border-gray-200 dark:border-white/10 px-5 py-3 backdrop-blur-sm">
                  <Clock3 size={18} className="text-[var(--griffin-gold)]" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      زمان انتظار
                    </p>
                    <p className="font-heading text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                      {elapsedLabel}
                    </p>
                  </div>
                </div>
              </div>

              {/* نوار پیشرفت */}
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-gray-200/80 dark:bg-white/10">
                <div className="arena-search-progress h-full w-1/3 rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400 shadow-lg shadow-[var(--griffin-gold)]/50" />
              </div>

              {/* نکته */}
              <p className="mt-4 text-[11px] text-gray-500 dark:text-gray-400 text-center">
                جستجو ممکنه چند ثانیه تا چند دقیقه طول بکشه، بسته به تعداد
                بازیکنان آنلاین
              </p>
            </section>
          </RevealOnScroll>
        ) : (
          /* ==================== بخش Idle: ویژگی‌ها ==================== */
          <RevealOnScroll>
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: Shield,
                  label: "۳ Life",
                  desc: "جان‌های تو در نبرد",
                  color: "from-emerald-500 to-emerald-700",
                  shadowColor: "shadow-emerald-500/30",
                },
                {
                  icon: Trophy,
                  label: "۵ سؤال",
                  desc: "در هر نبرد",
                  color: "from-[var(--griffin-gold)] to-amber-700",
                  shadowColor: "shadow-[var(--griffin-gold)]/30",
                },
                {
                  icon: Flame,
                  label: "رقابت سریع",
                  desc: "با حریف هم‌سطح",
                  color: "from-purple-500 to-purple-700",
                  shadowColor: "shadow-purple-500/30",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--griffin-gold)]/5"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg ${item.shadowColor} mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon size={20} />
                    </div>
                    <p className="font-heading text-base font-black text-gray-900 dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </section>
          </RevealOnScroll>
        )}

        {/* ==================== Error ==================== */}
        {error && (
          <RevealOnScroll>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-bold text-red-600 dark:text-red-400">
              {error}
            </div>
          </RevealOnScroll>
        )}

        {/* ==================== دکمه‌های اصلی ==================== */}
        <RevealOnScroll>
          <div className="max-w-md mx-auto space-y-3">
            {/* دکمه بازی با دوست (فقط وقتی جستجو نمی‌کنیم) */}
            {!searching && (
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 px-6 py-3.5 font-black text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 hover:border-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all"
              >
                <UserPlus
                  size={18}
                  className="transition-transform group-hover:scale-110"
                />
                بازی با دوست (کد دعوت)
              </button>
            )}

            {!searching && (
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-3">
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound size={13} className="text-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    کد دعوت داری؟
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    value={inviteCode}
                    onChange={(e) => {
                      setInviteCode(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                      );
                      setCodeError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && inviteCode.length === 6) {
                        handleJoinByCode();
                      }
                    }}
                    placeholder="ABC123"
                    maxLength={6}
                    dir="ltr"
                    className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-center font-english text-base font-black tracking-[0.4em] text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleJoinByCode}
                    disabled={inviteCode.length !== 6}
                    className="shrink-0 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    ورود
                  </button>
                </div>
                {codeError && (
                  <p className="mt-2 text-[10px] font-bold text-rose-500">
                    {codeError}
                  </p>
                )}
              </div>
            )}

            {/* دکمه اصلی: پیدا کردن حریف یا لغو */}
            {!searching ? (
              <button
                type="button"
                onClick={startMatchmaking}
                className="group relative w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-4 font-heading font-black text-white text-lg shadow-2xl shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Search
                    size={22}
                    className="transition-transform group-hover:scale-110"
                  />
                  پیدا کردن حریف
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            ) : (
              <button
                type="button"
                onClick={cancelMatchmaking}
                className="group w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm px-6 py-4 font-black text-gray-700 dark:text-gray-200 hover:border-rose-400/40 hover:text-rose-500 hover:bg-rose-500/5 transition-all duration-300"
              >
                <X
                  size={19}
                  className="transition-transform group-hover:rotate-90"
                />
                لغو جستجو
              </button>
            )}
          </div>
        </RevealOnScroll>

        {/* ==================== توضیح ==================== */}
        <RevealOnScroll>
          <p className="text-center text-xs leading-6 text-gray-400 dark:text-gray-500 max-w-2xl mx-auto">
            سیستم Matchmaking حریف را بر اساس صف فعال انتخاب می‌کند؛ انتخاب دستی
            حریف وجود ندارد.
          </p>
        </RevealOnScroll>
      </div>

      {/* ==================== Invite Modal ==================== */}
      {inviteModalOpen && leagueId && (
        <ArenaInviteModal
          leagueId={leagueId}
          leagueTitle={leagueTitle}
          onClose={() => setInviteModalOpen(false)}
        />
      )}
    </main>
  );
};

export default Matchmaking;
