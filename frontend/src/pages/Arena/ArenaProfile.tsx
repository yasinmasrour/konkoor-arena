import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  // Award,
  BarChart3,
  // Bot,
  Crown,
  Flame,
  LoaderCircle,
  Medal,
  Minus,
  Shield,
  Sparkles,
  Swords,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
  // Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getArenaProfile,
  getArenaRatingHistory,
  getArenaMatchHistory,
  type ArenaProfile as ArenaProfileData,
  type ArenaRatingHistoryItem,
  type ArenaHistoryItem,
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
      icon: Crown,
    };
  if (rating >= 1600)
    return {
      label: "الماس",
      color: "from-purple-500 to-fuchsia-700",
      bg: "bg-purple-500/10",
      text: "text-purple-500",
      icon: Medal,
    };
  if (rating >= 1300)
    return {
      label: "طلا",
      color: "from-[var(--griffin-gold)] to-amber-700",
      bg: "bg-[var(--griffin-gold)]/10",
      text: "text-[var(--griffin-gold)]",
      icon: Trophy,
    };
  if (rating >= 1000)
    return {
      label: "نقره",
      color: "from-slate-400 to-slate-600",
      bg: "bg-slate-400/10",
      text: "text-slate-500",
      icon: Shield,
    };
  return {
    label: "برنز",
    color: "from-amber-700 to-amber-900",
    bg: "bg-amber-700/10",
    text: "text-amber-700",
    icon: Target,
  };
};

const ArenaProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ArenaProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingHistory, setRatingHistory] = useState<ArenaRatingHistoryItem[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [matchHistory, setMatchHistory] = useState<ArenaHistoryItem[]>([]);
  const [matchHistoryLoading, setMatchHistoryLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getArenaProfile();
        if (cancelled) return;
        setProfile(data);
        setSelectedLeague(data.leagues[0]?.leagueId ?? "");
      } catch {
        if (!cancelled) setError("دریافت پروفایل Arena با مشکل مواجه شد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getArenaMatchHistory();
        if (!cancelled) setMatchHistory(data.matches);
      } catch {
        if (!cancelled) setMatchHistory([]);
      } finally {
        if (!cancelled) setMatchHistoryLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!profile || !selectedLeague) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRatingHistory([]);
      setHistoryLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setHistoryLoading(true);
      try {
        const data = await getArenaRatingHistory(selectedLeague);
        if (!cancelled) setRatingHistory(data.history);
      } catch {
        if (!cancelled) setRatingHistory([]);
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [profile, selectedLeague]);

  const winRate = useMemo(() => {
    if (!profile?.statistics.totalMatches) return 0;
    return Math.round(
      (profile.statistics.wins / profile.statistics.totalMatches) * 100
    );
  }, [profile]);

  const chart = useMemo(() => {
    if (!ratingHistory.length) return null;
    const values = [
      ratingHistory[0].oldRating,
      ...ratingHistory.map((item) => item.newRating),
    ];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = Math.max(max - min, 20);
    const width = 760;
    const height = 220;
    const points = values.map((value, index) => {
      const x =
        values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y =
        height -
        ((value - (min - spread * 0.12)) / (spread * 1.24)) * height;
      return { x, y, value };
    });
    return { points, min, max, latest: values[values.length - 1] };
  }, [ratingHistory]);

  const progression = useMemo(() => {
    const leagueMatches = matchHistory
      .filter((item) => item.league.id === selectedLeague)
      .sort(
        (a, b) =>
          new Date(a.playedAt ?? 0).getTime() -
          new Date(b.playedAt ?? 0).getTime()
      );
    const recent = leagueMatches.slice(-5);
    const wins = leagueMatches.filter((item) => item.result === "win").length;
    const losses = leagueMatches.filter((item) => item.result === "loss").length;
    const draws = leagueMatches.filter((item) => item.result === "draw").length;
    const streak = [...leagueMatches]
      .reverse()
      .reduce((count, item, index, arr) => {
        if (index === 0) return 1;
        return item.result === arr[index - 1].result ? count + 1 : count;
      }, 0);
    const currentStreak = leagueMatches.length
      ? leagueMatches[leagueMatches.length - 1].result
      : null;
    const netRating = ratingHistory.length
      ? ratingHistory[ratingHistory.length - 1].newRating -
        ratingHistory[0].oldRating
      : 0;
    return {
      leagueMatches,
      recent,
      wins,
      losses,
      draws,
      streak,
      currentStreak,
      netRating,
    };
  }, [matchHistory, selectedLeague, ratingHistory]);

  // 🔹 بهترین Rating در لیگ‌ها
  const bestRating = useMemo(() => {
    if (!profile?.leagues.length) return 0;
    return Math.max(...profile.leagues.map((l) => l.rating));
  }, [profile]);

  const topTier = getRatingTier(bestRating);
  const TopTierIcon = topTier.icon;

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-40 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <User size={28} className="text-white animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت پروفایل...
          </p>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Shield size={28} className="text-red-500" />
          </div>
          <p className="font-bold text-red-500">
            {error || "پروفایل پیدا نشد."}
          </p>
          <button
            onClick={() => navigate("/arena")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--griffin-gold)] text-white text-sm font-bold hover:opacity-90 transition"
          >
            <ArrowLeft size={16} />
            بازگشت به Arena
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
            onClick={() => navigate("/arena")}
            className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            بازگشت به Arena
          </button>
        </RevealOnScroll>

        {/* ==================== Hero پروفایل ==================== */}
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
            {Array.from({ length: 12 }).map((_, i) => (
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

            <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
              {/* آواتار */}
              <div className="relative shrink-0">
                <div className={`absolute inset-0 rounded-3xl blur-xl opacity-60 bg-gradient-to-br ${topTier.color}`} />
                <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${topTier.color} flex items-center justify-center text-white font-heading font-black text-4xl border-2 border-white/20 shadow-2xl`}>
                  {profile.user.firstName?.[0] ?? "G"}
                </div>

                {/* نشان رتبه */}
                <div className={`absolute -top-2 -left-2 w-10 h-10 rounded-2xl bg-gradient-to-br ${topTier.color} flex items-center justify-center shadow-lg border-2 border-white dark:border-[#0a0d14]`}>
                  <TopTierIcon size={18} className="text-white" />
                </div>

                {/* نشان آنلاین */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0a0d14] flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>

              {/* اطلاعات */}
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30">
                  <Sparkles size={12} className="text-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black tracking-widest text-[var(--griffin-gold)] uppercase">
                    Griffin Arena Player
                  </span>
                </div>

                <h1 className="font-heading text-3xl md:text-4xl font-black leading-tight">
                  {profile.user.firstName} {profile.user.lastName}
                </h1>

                {/* بج رتبه + Rating */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${topTier.bg} border border-current ${topTier.text}`}>
                    <TopTierIcon size={14} />
                    <span className="text-xs font-black">{topTier.label}</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <Trophy size={14} className="text-[var(--griffin-gold)]" />
                    <span className="text-xs font-bold text-gray-300">
                      بهترین Rating:{" "}
                      <span className="font-black text-white">
                        {bestRating.toLocaleString("fa-IR")}
                      </span>
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-7">
                  پروفایل رقابتی و سابقه نبردهای تو در Arena گریفین
                </p>
              </div>

              {/* دکمه‌ها */}
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:items-end">
                <button
                  onClick={() => navigate("/arena")}
                  className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Swords size={16} />
                    نبرد جدید
                  </span>
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>

                <button
                  onClick={() => navigate("/arena/history")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm px-5 py-3 text-sm font-bold text-white hover:bg-white/10 transition"
                >
                  <BarChart3 size={16} />
                  تاریخچه نبردها
                </button>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* ==================== آمار کلی ==================== */}
        <RevealOnScroll>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Swords,
                label: "کل نبردها",
                value: profile.statistics.totalMatches,
                color: "text-gray-900 dark:text-white",
                bg: "bg-gray-500/10",
                iconColor: "text-gray-500 dark:text-gray-400",
              },
              {
                icon: Crown,
                label: "پیروزی",
                value: profile.statistics.wins,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                iconColor: "text-emerald-500",
              },
              {
                icon: Target,
                label: "نرخ برد",
                value: `${winRate}٪`,
                color: "text-[var(--griffin-gold)]",
                bg: "bg-[var(--griffin-gold)]/10",
                iconColor: "text-[var(--griffin-gold)]",
              },
              {
                icon: Minus,
                label: "مساوی",
                value: profile.statistics.draws,
                color: "text-slate-500",
                bg: "bg-slate-500/10",
                iconColor: "text-slate-500",
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

        {/* ==================== Win Rate Bar ==================== */}
        {profile.statistics.totalMatches > 0 && (
          <RevealOnScroll>
            <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg shadow-[var(--griffin-gold)]/30">
                    <Medal size={16} />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-black text-gray-900 dark:text-white">
                      نرخ برد کل
                    </h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      میانگین عملکرد تو در تمام نبردها
                    </p>
                  </div>
                </div>
                <p className="font-heading text-3xl font-black text-[var(--griffin-gold)]">
                  {winRate.toLocaleString("fa-IR")}٪
                </p>
              </div>

              <div className="h-3 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${winRate}%` }}
                />
                <div
                  className="h-full bg-gradient-to-l from-rose-500 to-rose-400 transition-all duration-1000"
                  style={{
                    width: `${(profile.statistics.losses / profile.statistics.totalMatches) * 100}%`,
                  }}
                />
                <div
                  className="h-full bg-gradient-to-l from-slate-500 to-slate-400 transition-all duration-1000"
                  style={{
                    width: `${(profile.statistics.draws / profile.statistics.totalMatches) * 100}%`,
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  برد ({profile.statistics.wins.toLocaleString("fa-IR")})
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  باخت ({profile.statistics.losses.toLocaleString("fa-IR")})
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  مساوی ({profile.statistics.draws.toLocaleString("fa-IR")})
                </div>
              </div>
            </section>
          </RevealOnScroll>
        )}

        {/* ==================== Rating لیگ‌ها ==================== */}
        <RevealOnScroll>
          <section>
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <Trophy size={14} className="text-[var(--griffin-gold)]" />
                  <span className="text-xs font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                    League Ratings
                  </span>
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  Rating لیگ‌ها
                </h2>
                <div className="w-16 h-1 bg-[var(--griffin-gold)] mt-3 rounded-full" />
              </div>
            </div>

            {profile.leagues.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
                <Trophy size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="font-bold text-gray-600 dark:text-gray-300">
                  هنوز در هیچ لیگی Rating ثبت نشده!
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  برو به Arena و اولین نبردت رو شروع کن.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {profile.leagues.map((league, index) => {
                  const tier = getRatingTier(league.rating);
                  const TierIcon = tier.icon;
                  const leagueWinRate =
                    league.wins + league.losses + league.draws > 0
                      ? Math.round(
                          (league.wins /
                            (league.wins + league.losses + league.draws)) *
                            100
                        )
                      : 0;

                  return (
                    <RevealOnScroll key={league.leagueId} delay={index * 100}>
                      <button
                        onClick={() =>
                          navigate(`/arena/ranking/${league.leagueId}`)
                        }
                        className="group relative w-full text-right rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--griffin-gold)]/10 hover:border-[var(--griffin-gold)]/40"
                      >
                        {/* خط بالای کارت */}
                        <div className={`h-1 w-full bg-gradient-to-r from-transparent via-current to-transparent ${tier.text} opacity-60`} />

                        {/* گرادیان تزئینی */}
                        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${tier.bg}`} />

                        <div className="relative">
                          {/* هدر */}
                          <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                              <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                                {league.status === "active" ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    لیگ فعال
                                  </>
                                ) : (
                                  "لیگ"
                                )}
                              </div>
                              <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                                {league.title}
                              </h3>
                            </div>

                            {/* آیکون رتبه */}
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                              <TierIcon size={20} />
                            </div>
                          </div>

                          {/* Rating بزرگ */}
                          <div className="flex items-baseline justify-between mb-5 py-4 border-y border-gray-100 dark:border-white/5">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Trophy
                                size={13}
                                className="text-[var(--griffin-gold)]"
                              />
                              <span>Rating</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <p className={`font-heading text-3xl font-black ${tier.text}`}>
                                {league.rating.toLocaleString("fa-IR")}
                              </p>
                              <span className="text-[10px] text-gray-400">
                                pts
                              </span>
                            </div>
                          </div>

                          {/* آمار */}
                          <div className="grid grid-cols-3 gap-2 mb-4">
                            <div className="text-center rounded-xl bg-emerald-500/10 py-2">
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5">
                                برد
                              </p>
                              <p className="font-heading font-black text-sm text-emerald-600 dark:text-emerald-400">
                                {league.wins.toLocaleString("fa-IR")}
                              </p>
                            </div>
                            <div className="text-center rounded-xl bg-rose-500/10 py-2">
                              <p className="text-[10px] text-rose-600 dark:text-rose-400 mb-0.5">
                                باخت
                              </p>
                              <p className="font-heading font-black text-sm text-rose-600 dark:text-rose-400">
                                {league.losses.toLocaleString("fa-IR")}
                              </p>
                            </div>
                            <div className="text-center rounded-xl bg-slate-500/10 py-2">
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                                مساوی
                              </p>
                              <p className="font-heading font-black text-sm text-slate-500 dark:text-slate-400">
                                {league.draws.toLocaleString("fa-IR")}
                              </p>
                            </div>
                          </div>

                          {/* نوار Win Rate */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1.5 text-[10px]">
                              <span className="text-gray-500 dark:text-gray-400 font-bold">
                                نرخ برد
                              </span>
                              <span className="font-black text-gray-900 dark:text-white">
                                {leagueWinRate.toLocaleString("fa-IR")}٪
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-1000"
                                style={{ width: `${leagueWinRate}%` }}
                              />
                            </div>
                          </div>

                          {/* CTA */}
                          <p className="text-xs font-bold text-[var(--griffin-gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                            مشاهده جدول رتبه‌بندی ←
                          </p>
                        </div>
                      </button>
                    </RevealOnScroll>
                  );
                })}
              </div>
            )}
          </section>
        </RevealOnScroll>

        {/* ==================== روند پیشرفت ==================== */}
        {profile.leagues.length > 0 && (
          <RevealOnScroll>
            <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <Flame size={14} className="text-[var(--griffin-gold)]" />
                    <span className="text-xs font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                      Player Progression
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                    روند پیشرفت
                  </h2>
                  <div className="w-16 h-1 bg-[var(--griffin-gold)] mt-3 rounded-full" />
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    عملکردت را در طول نبردهای این لیگ دنبال کن
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--griffin-gold)]/10 text-xs font-black text-[var(--griffin-gold)]">
                  <Swords size={14} />
                  {matchHistoryLoading
                    ? "در حال بارگذاری..."
                    : `${progression.leagueMatches.length.toLocaleString("fa-IR")} نبرد`}
                </div>
              </div>

              {!matchHistoryLoading && progression.leagueMatches.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  هنوز نبردی در این لیگ ثبت نشده است.
                </div>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-4">
                    {[
                      {
                        icon: Crown,
                        label: "برد",
                        value: progression.wins,
                        color: "text-emerald-500",
                        bg: "bg-emerald-500/10",
                      },
                      {
                        icon: Swords,
                        label: "باخت",
                        value: progression.losses,
                        color: "text-rose-500",
                        bg: "bg-rose-500/10",
                      },
                      {
                        icon: Minus,
                        label: "مساوی",
                        value: progression.draws,
                        color: "text-slate-500",
                        bg: "bg-slate-500/10",
                      },
                      {
                        icon: Flame,
                        label: "استریک",
                        value: `${progression.streak} ${
                          progression.currentStreak === "win"
                            ? "برد"
                            : progression.currentStreak === "loss"
                            ? "باخت"
                            : "مساوی"
                        }`,
                        color:
                          progression.currentStreak === "win"
                            ? "text-emerald-500"
                            : progression.currentStreak === "loss"
                            ? "text-rose-500"
                            : "text-slate-500",
                        bg:
                          progression.currentStreak === "win"
                            ? "bg-emerald-500/10"
                            : progression.currentStreak === "loss"
                            ? "bg-rose-500/10"
                            : "bg-slate-500/10",
                      },
                    ].map((stat, i) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={i}
                          className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-4"
                        >
                          <div
                            className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}
                          >
                            <Icon size={16} className={stat.color} />
                          </div>
                          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                            {stat.label}
                          </p>
                          <p
                            className={`font-heading text-xl font-black mt-1 ${stat.color}`}
                          >
                            {typeof stat.value === "number"
                              ? stat.value.toLocaleString("fa-IR")
                              : stat.value}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* فرم اخیر + Net Rating */}
                  <div className="mt-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-black/10 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                          فرم ۵ نبرد اخیر
                        </p>
                        <div className="mt-3 flex gap-2">
                          {progression.recent.length === 0 ? (
                            <span className="text-xs text-gray-400">
                              نبردی ثبت نشده
                            </span>
                          ) : (
                            progression.recent.map((item) => (
                              <span
                                key={item.matchId}
                                title={item.result}
                                className={`
                                  flex h-10 w-10 items-center justify-center
                                  rounded-xl text-xs font-black
                                  transition-transform hover:scale-110
                                  ${
                                    item.result === "win"
                                      ? "bg-emerald-500/15 text-emerald-500 shadow-lg shadow-emerald-500/20"
                                      : item.result === "loss"
                                      ? "bg-rose-500/15 text-rose-500 shadow-lg shadow-rose-500/20"
                                      : "bg-slate-500/15 text-slate-500 shadow-lg shadow-slate-500/20"
                                  }
                                `}
                              >
                                {item.result === "win"
                                  ? "W"
                                  : item.result === "loss"
                                  ? "L"
                                  : "D"}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="text-left">
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                          تغییر خالص Rating
                        </p>
                        <p
                          className={`font-heading text-3xl font-black mt-1 inline-flex items-center gap-1 ${
                            progression.netRating >= 0
                              ? "text-emerald-500"
                              : "text-rose-500"
                          }`}
                        >
                          {progression.netRating >= 0 ? (
                            <TrendingUp size={20} />
                          ) : (
                            <TrendingDown size={20} />
                          )}
                          {progression.netRating > 0 ? "+" : ""}
                          {progression.netRating.toLocaleString("fa-IR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>
          </RevealOnScroll>
        )}

        {/* ==================== مسیر Rating ==================== */}
        {profile.leagues.length > 0 && (
          <RevealOnScroll>
            <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <TrendingUp
                      size={14}
                      className="text-[var(--griffin-gold)]"
                    />
                    <span className="text-xs font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                      Rating Journey
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                    مسیر Rating
                  </h2>
                  <div className="w-16 h-1 bg-[var(--griffin-gold)] mt-3 rounded-full" />
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    تغییر Rating خودت را بعد از هر نبرد دنبال کن
                  </p>
                </div>

                <select
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition"
                >
                  {profile.leagues.map((league) => (
                    <option key={league.leagueId} value={league.leagueId}>
                      {league.title}
                    </option>
                  ))}
                </select>
              </div>

              {historyLoading ? (
                <div className="flex min-h-[200px] items-center justify-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                  <LoaderCircle className="animate-spin" size={18} />
                  در حال دریافت مسیر Rating...
                </div>
              ) : !chart ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <TrendingUp
                      size={26}
                      className="text-gray-400 dark:text-gray-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    برای این لیگ هنوز سابقه Rating ثبت نشده است.
                  </p>
                </div>
              ) : (
                <>
                  {/* نمودار */}
                  <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-black/10 p-4">
                    <svg
                      viewBox={`0 0 760 220`}
                      className="h-56 w-full overflow-visible"
                      role="img"
                      aria-label="نمودار تغییر Rating"
                    >
                      {/* خطوط شبکه افقی */}
                      {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                        <line
                          key={pct}
                          x1={0}
                          y1={pct * 220}
                          x2={760}
                          y2={pct * 220}
                          stroke="currentColor"
                          strokeWidth="0.5"
                          className="text-gray-200 dark:text-white/5"
                          strokeDasharray="4 4"
                        />
                      ))}

                      {/* گرادیان زیر نمودار */}
                      <defs>
                        <linearGradient
                          id="ratingGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--griffin-gold)"
                            stopOpacity="0.3"
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--griffin-gold)"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>

                      {/* ناحیه زیر نمودار */}
                      <path
                        d={`M ${chart.points[0].x},220 L ${chart.points.map((p) => `${p.x},${p.y}`).join(" L ")} L ${chart.points[chart.points.length - 1].x},220 Z`}
                        fill="url(#ratingGradient)"
                      />

                      {/* خط نمودار */}
                      <path
                        d={`M ${chart.points.map((p) => `${p.x},${p.y}`).join(" L ")}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[var(--griffin-gold)]"
                      />

                      {/* نقاط */}
                      {chart.points.map((p, i) => (
                        <circle
                          key={i}
                          cx={p.x}
                          cy={p.y}
                          r="6"
                          className="fill-white stroke-[var(--griffin-gold)] dark:fill-slate-950"
                          strokeWidth="3"
                        />
                      ))}
                    </svg>

                    <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-400">
                      <span>حداقل: {chart.min}</span>
                      <span className="text-[var(--griffin-gold)]">
                        Rating فعلی:{" "}
                        <strong className="font-heading text-base">
                          {chart.latest.toLocaleString("fa-IR")}
                        </strong>
                      </span>
                      <span>حداکثر: {chart.max}</span>
                    </div>
                  </div>

                  {/* ۳ نبرد آخر */}
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {ratingHistory
                      .slice(-3)
                      .reverse()
                      .map((item) => (
                        <div
                          key={`${item.matchId}-${item.createdAt}`}
                          className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-4 transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                              {new Date(item.createdAt).toLocaleDateString(
                                "fa-IR",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                            <span
                              className={`
                                inline-flex items-center gap-1
                                px-2 py-1 rounded-lg
                                text-xs font-black
                                ${
                                  item.change >= 0
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-rose-500/10 text-rose-500"
                                }
                              `}
                            >
                              {item.change >= 0 ? (
                                <TrendingUp size={12} />
                              ) : (
                                <TrendingDown size={12} />
                              )}
                              {item.change > 0 ? "+" : ""}
                              {item.change.toLocaleString("fa-IR")}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.oldRating.toLocaleString("fa-IR")}
                            </span>
                            <ArrowLeft
                              size={12}
                              className="text-gray-400 rotate-180"
                            />
                            <span className="font-heading font-black text-sm text-gray-900 dark:text-white">
                              {item.newRating.toLocaleString("fa-IR")}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </section>
          </RevealOnScroll>
        )}
      </div>
    </main>
  );
};

export default ArenaProfile;