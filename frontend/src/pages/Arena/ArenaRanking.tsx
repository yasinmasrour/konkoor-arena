import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Crown,
  Flame,
  // LoaderCircle,
  Medal,
  // Minus,
  Swords,
  Target,
  Trophy,
  TrendingUp,
  Users,
  Zap,
  Sparkles,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getArenaLeagueRanking,
  getArenaPlayerRanking,
  type ArenaRankingResponse,
  type ArenaPlayerRankingResponse,
} from "../../api/arenaApi";
import RevealOnScroll from "../../components/common/RevealOnScroll";

// 🔹 تعیین رنگ و رتبه بر اساس Rating
const getRatingTier = (rating: number) => {
  if (rating >= 2000)
    return {
      label: "استاد",
      color: "from-red-500 to-rose-700",
      bg: "bg-red-500/10",
      text: "text-red-500",
      ring: "ring-red-500/30",
    };
  if (rating >= 1600)
    return {
      label: "الماس",
      color: "from-purple-500 to-fuchsia-700",
      bg: "bg-purple-500/10",
      text: "text-purple-500",
      ring: "ring-purple-500/30",
    };
  if (rating >= 1300)
    return {
      label: "طلا",
      color: "from-[var(--griffin-gold)] to-amber-700",
      bg: "bg-[var(--griffin-gold)]/10",
      text: "text-[var(--griffin-gold)]",
      ring: "ring-[var(--griffin-gold)]/30",
    };
  if (rating >= 1000)
    return {
      label: "نقره",
      color: "from-slate-400 to-slate-600",
      bg: "bg-slate-400/10",
      text: "text-slate-500",
      ring: "ring-slate-400/30",
    };
  return {
    label: "برنز",
    color: "from-amber-700 to-amber-900",
    bg: "bg-amber-700/10",
    text: "text-amber-700",
    ring: "ring-amber-700/30",
  };
};

const ArenaRanking = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ArenaRankingResponse | null>(null);
  const [me, setMe] = useState<ArenaPlayerRankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!leagueId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [ranking, player] = await Promise.all([
          getArenaLeagueRanking(leagueId),
          getArenaPlayerRanking(leagueId),
        ]);
        if (cancelled) return;
        setData(ranking);
        setMe(player);
      } catch {
        if (!cancelled) setError("دریافت جدول رتبه‌بندی با مشکل مواجه شد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [leagueId]);

  // 🔹 Top 3 و بقیه بازیکنان
  const topThree = useMemo(() => data?.rankings.slice(0, 3) ?? [], [data]);
  const restPlayers = useMemo(() => data?.rankings.slice(3) ?? [], [data]);

  // 🔹 جایگاه پودیوم (برای چیدمان درست)
  const podiumOrder = useMemo(() => {
    if (topThree.length < 3) return topThree;
    return [topThree[1], topThree[0], topThree[2]]; // [2nd, 1st, 3rd]
  }, [topThree]);

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-40 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <Trophy size={28} className="text-white animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            در حال آماده‌سازی تالار افتخارات...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Trophy size={28} className="text-red-500" />
          </div>
          <p className="font-bold text-red-500">
            {error || "جدول رتبه‌بندی پیدا نشد."}
          </p>
          <button
            onClick={() => navigate("/arena/profile")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--griffin-gold)] text-white text-sm font-bold hover:opacity-90 transition"
          >
            <ArrowLeft size={16} />
            بازگشت به پروفایل
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ==================== Back ==================== */}
        <RevealOnScroll>
          <button
            onClick={() => navigate("/arena/profile")}
            className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            پروفایل Arena
          </button>
        </RevealOnScroll>

        {/* ==================== Hero ==================== */}
        <RevealOnScroll>
          <section className="relative rounded-[2rem] overflow-hidden bg-[#080B12] text-white p-6 md:p-10 border border-white/5 shadow-2xl shadow-[var(--griffin-gold)]/10">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

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
                  opacity: 0.3 + Math.random() * 0.4,
                }}
              />
            ))}

            <div className="relative text-center space-y-5">
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center shadow-2xl shadow-[var(--griffin-gold)]/50 rotate-3">
                  <Trophy size={40} strokeWidth={2.2} />
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30">
                <Flame
                  size={12}
                  className="text-[var(--griffin-gold)] animate-pulse"
                />
                <span className="text-[10px] font-black tracking-widest text-[var(--griffin-gold)] uppercase">
                  Leaderboard · Live
                </span>
              </div>

              <h1 className="font-heading text-3xl md:text-5xl font-black leading-tight">
                {data.league.title}
              </h1>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm">
                <Target size={14} className="text-[var(--griffin-gold)]" />
                <span className="text-gray-300">{data.league.lesson}</span>
              </div>

              <p className="text-gray-300 text-sm leading-7 max-w-xl mx-auto">
                جدول رقابت بازیکنان این لیگ — بهترین‌ها اینجا هستند!
              </p>
            </div>
          </section>
        </RevealOnScroll>

        {/* ==================== خلاصه من ==================== */}
        {me && (
          <RevealOnScroll>
            <section className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Crown,
                  label: "رتبه فعلی من",
                  value: `#${me.ranking.rank}`,
                  color: "text-[var(--griffin-gold)]",
                  bg: "bg-[var(--griffin-gold)]/10",
                  iconColor: "text-[var(--griffin-gold)]",
                },
                {
                  icon: Trophy,
                  label: "Rating من",
                  value: me.ranking.rating.toLocaleString("fa-IR"),
                  color: "text-[var(--griffin-gold)]",
                  bg: "bg-[var(--griffin-gold)]/10",
                  iconColor: "text-[var(--griffin-gold)]",
                },
                {
                  icon: Users,
                  label: "بازیکنان جدول",
                  value: data.rankings.length.toLocaleString("fa-IR"),
                  color: "text-gray-900 dark:text-white",
                  bg: "bg-gray-500/10",
                  iconColor: "text-gray-500 dark:text-gray-400",
                },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--griffin-gold)]/5"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    >
                      <Icon size={18} className={stat.iconColor} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      {stat.label}
                    </p>
                    <p
                      className={`font-heading text-2xl font-black mt-1 ${stat.color}`}
                    >
                      {typeof stat.value === "number"
                        ? stat.value.toLocaleString("fa-IR")
                        : stat.value}
                    </p>
                  </div>
                );
              })}
            </section>
          </RevealOnScroll>
        )}

        {/* ==================== پودیوم Top 3 ==================== */}
        {topThree.length > 0 && (
          <section>
            <RevealOnScroll>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-[var(--griffin-gold)]" />
                  <span className="text-xs font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                    Hall of Fame
                  </span>
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  تالار افتخارات
                </h2>
                <div className="w-16 h-1 bg-[var(--griffin-gold)] mx-auto mt-3 rounded-full" />
              </div>
            </RevealOnScroll>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-end">
              {podiumOrder.map((player, i) => {
                const isFirst = player.rank === 1;
                const isSecond = player.rank === 2;
                const isThird = player.rank === 3;
                const tier = getRatingTier(player.rating);
                const isMe = me?.ranking.userId === player.userId;

                return (
                  <RevealOnScroll key={player.userId} delay={i * 150}>
                    <div
                      className={`
                        relative rounded-3xl overflow-hidden
                        border transition-all duration-300
                        ${isFirst ? "sm:-mt-6 sm:pb-4" : ""}
                        ${
                          isFirst
                            ? "border-[var(--griffin-gold)]/50 bg-gradient-to-br from-[var(--griffin-gold)]/20 via-amber-500/10 to-transparent backdrop-blur-xl shadow-2xl shadow-[var(--griffin-gold)]/30"
                            : isSecond
                              ? "border-slate-400/40 bg-gradient-to-br from-slate-400/15 via-slate-400/5 to-transparent backdrop-blur-xl shadow-xl shadow-slate-500/10"
                              : "border-amber-700/40 bg-gradient-to-br from-amber-700/15 via-amber-700/5 to-transparent backdrop-blur-xl shadow-xl shadow-amber-700/10"
                        }
                        ${isMe ? "ring-2 ring-[var(--griffin-gold)]/40" : ""}
                      `}
                    >
                      {/* گرادیان تزئینی */}
                      <div
                        className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl ${
                          isFirst
                            ? "bg-[var(--griffin-gold)]/30"
                            : isSecond
                              ? "bg-slate-400/20"
                              : "bg-amber-700/20"
                        }`}
                      />

                      <div className="relative p-6 text-center">
                        {/* نشان رتبه */}
                        <div className="flex justify-center mb-4">
                          {isFirst && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
                              <Crown
                                size={36}
                                className="relative text-[var(--griffin-gold)]"
                                strokeWidth={2.3}
                              />
                            </div>
                          )}
                          {isSecond && (
                            <Medal
                              size={32}
                              className="text-slate-400"
                              strokeWidth={2.3}
                            />
                          )}
                          {isThird && (
                            <Medal
                              size={32}
                              className="text-amber-600"
                              strokeWidth={2.3}
                            />
                          )}
                        </div>

                        {/* آواتار */}
                        <div className="relative inline-flex mb-4">
                          <div
                            className={`absolute inset-0 rounded-full blur-xl opacity-60 bg-gradient-to-br ${tier.color}`}
                          />
                          <div
                            className={`
                              relative rounded-full
                              bg-gradient-to-br ${tier.color}
                              flex items-center justify-center
                              text-white font-heading font-black
                              border-4 border-white dark:border-[#0a0d14]
                              shadow-2xl
                              ${isFirst ? "w-24 h-24 text-4xl" : "w-20 h-20 text-3xl"}
                            `}
                          >
                            {player.firstName?.charAt(0) || "?"}
                          </div>
                        </div>

                        {/* نام */}
                        <h3
                          className={`
                            font-heading font-black text-gray-900 dark:text-white
                            ${isFirst ? "text-xl" : "text-lg"}
                          `}
                        >
                          {player.firstName} {player.lastName}
                        </h3>

                        {isMe && (
                          <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--griffin-gold)]/15 text-[10px] font-black text-[var(--griffin-gold)]">
                            <Sparkles size={9} />
                            شما
                          </span>
                        )}

                        {/* Rating */}
                        <div className="mt-4 py-4 border-y border-white/10">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Rating
                          </p>
                          <p
                            className={`font-heading font-black ${
                              isFirst ? "text-4xl" : "text-3xl"
                            } ${tier.text}`}
                          >
                            {player.rating.toLocaleString("fa-IR")}
                          </p>
                        </div>

                        {/* آمار */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-xl bg-emerald-500/10 py-2">
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5">
                              برد
                            </p>
                            <p className="font-heading font-black text-emerald-600 dark:text-emerald-400">
                              {player.wins.toLocaleString("fa-IR")}
                            </p>
                          </div>
                          <div className="rounded-xl bg-gray-500/10 py-2">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
                              نبرد
                            </p>
                            <p className="font-heading font-black text-gray-700 dark:text-gray-300">
                              {player.matchesPlayed.toLocaleString("fa-IR")}
                            </p>
                          </div>
                        </div>

                        {/* بج رتبه */}
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black">
                          <span className={tier.text}>{tier.label}</span>
                        </div>
                      </div>
                    </div>
                  </RevealOnScroll>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================== جدول کامل ==================== */}
        {restPlayers.length > 0 && (
          <RevealOnScroll>
            <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm overflow-hidden">
              {/* هدر جدول */}
              <div className="p-6 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-end justify-between flex-wrap gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 mb-2">
                      <Swords
                        size={14}
                        className="text-[var(--griffin-gold)]"
                      />
                      <span className="text-xs font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                        Full Rankings
                      </span>
                    </div>
                    <h2 className="font-heading text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                      جدول کامل رتبه‌بندی
                    </h2>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-400">
                    <Users size={14} />
                    {data.rankings.length.toLocaleString("fa-IR")} بازیکن
                  </div>
                </div>
              </div>

              {/* هدر ستون‌ها */}
              <div className="grid grid-cols-[52px_1fr_90px_70px_70px] gap-3 bg-gray-50/80 dark:bg-white/[0.02] px-4 py-3 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-200/70 dark:border-white/5">
                <span className="text-center">رتبه</span>
                <span>بازیکن</span>
                <span className="text-center">Rating</span>
                <span className="text-center hidden sm:block">برد</span>
                <span className="text-center hidden sm:block">نبرد</span>
              </div>

              {/* ردیف‌ها */}
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {restPlayers.map((player, index) => {
                  const tier = getRatingTier(player.rating);
                  const isMe = me?.ranking.userId === player.userId;
                  const winRate =
                    player.matchesPlayed > 0
                      ? Math.round((player.wins / player.matchesPlayed) * 100)
                      : 0;

                  return (
                    <RevealOnScroll
                      key={player.userId}
                      delay={Math.min(index * 30, 300)}
                    >
                      <div
                        className={`
                          grid grid-cols-[52px_1fr_90px_70px_70px] items-center gap-3
                          px-4 py-4
                          transition-all duration-200
                          hover:bg-gray-50/50 dark:hover:bg-white/[0.02]
                          ${
                            isMe
                              ? "bg-[var(--griffin-gold)]/8 border-r-2 border-r-[var(--griffin-gold)]"
                              : ""
                          }
                        `}
                      >
                        {/* رتبه */}
                        <div className="flex items-center justify-center">
                          <span className="font-heading text-sm font-black text-gray-400 dark:text-gray-500">
                            #{player.rank.toLocaleString("fa-IR")}
                          </span>
                        </div>

                        {/* بازیکن */}
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div
                              className={`
                                relative w-10 h-10 rounded-xl
                                bg-gradient-to-br ${tier.color}
                                flex items-center justify-center
                                text-white font-heading font-black text-sm
                                border-2 border-white/30 dark:border-white/10
                                shadow-lg
                              `}
                            >
                              {player.firstName?.charAt(0) || "?"}
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                {player.firstName} {player.lastName}
                              </p>
                              {isMe && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--griffin-gold)]/15 text-[9px] font-black text-[var(--griffin-gold)]">
                                  <Sparkles size={8} />
                                  شما
                                </span>
                              )}
                              <span
                                className={`
                                  inline-flex items-center gap-1
                                  px-1.5 py-0.5 rounded-md
                                  text-[9px] font-black
                                  ${tier.bg} ${tier.text}
                                `}
                              >
                                {tier.label}
                              </span>
                            </div>

                            {/* نوار Win Rate در موبایل */}
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden max-w-[120px]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-400"
                                  style={{ width: `${winRate}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                {winRate.toLocaleString("fa-IR")}٪
                              </span>
                            </div>

                            {/* آمار در موبایل */}
                            <p className="sm:hidden mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                              {player.wins.toLocaleString("fa-IR")} برد ·{" "}
                              {player.losses.toLocaleString("fa-IR")} باخت
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="text-center">
                          <p
                            className={`font-heading font-black text-sm ${tier.text}`}
                          >
                            {player.rating.toLocaleString("fa-IR")}
                          </p>
                        </div>

                        {/* برد */}
                        <div className="hidden sm:flex justify-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                            {player.wins.toLocaleString("fa-IR")}
                          </span>
                        </div>

                        {/* نبرد */}
                        <div className="hidden sm:flex justify-center">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            {player.matchesPlayed.toLocaleString("fa-IR")}
                          </span>
                        </div>
                      </div>
                    </RevealOnScroll>
                  );
                })}
              </div>
            </section>
          </RevealOnScroll>
        )}

        {/* ==================== CTA ==================== */}
        <RevealOnScroll>
          <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 border border-[var(--griffin-gold)]/20 p-8 md:p-10 text-center backdrop-blur-xl">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl" />

            <div className="relative space-y-4">
              <div className="inline-flex relative">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-40" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
                  <TrendingUp size={24} className="text-white" />
                </div>
              </div>

              <h2 className="font-heading text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                جای تو بالای این جدوله!
              </h2>

              <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto leading-7 text-sm">
                با هر نبرد، رتبه‌ات رو ارتقا بده و خودت رو به بالای جدول برسون.
              </p>

              <button
                onClick={() => navigate("/arena")}
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-7 py-3.5 font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Swords size={18} />
                  شروع نبرد جدید
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </section>
        </RevealOnScroll>
      </div>
    </main>
  );
};

export default ArenaRanking;
