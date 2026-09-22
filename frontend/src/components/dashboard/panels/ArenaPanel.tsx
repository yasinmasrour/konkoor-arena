import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  BarChart3,
  Crown,
  Flame,
  Gamepad2,
  LoaderCircle,
  Medal,
  Shield,
  Sparkles,
  Swords,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getArenaProfile,
  getArenaMatchHistory,
  type ArenaProfile as ArenaProfileData,
  type ArenaHistoryItem,
} from "../../../api/arenaApi";

const getRatingTier = (rating: number) => {
  if (rating >= 2000)
    return {
      label: "استاد",
      color: "from-red-500 to-rose-700",
      text: "text-red-500",
      bg: "bg-red-500/10",
      icon: Crown,
    };
  if (rating >= 1600)
    return {
      label: "الماس",
      color: "from-purple-500 to-fuchsia-700",
      text: "text-purple-500",
      bg: "bg-purple-500/10",
      icon: Medal,
    };
  if (rating >= 1300)
    return {
      label: "طلا",
      color: "from-[var(--griffin-gold)] to-amber-700",
      text: "text-[var(--griffin-gold)]",
      bg: "bg-[var(--griffin-gold)]/10",
      icon: Trophy,
    };
  if (rating >= 1000)
    return {
      label: "نقره",
      color: "from-slate-400 to-slate-600",
      text: "text-slate-400",
      bg: "bg-slate-400/10",
      icon: Shield,
    };
  return {
    label: "برنز",
    color: "from-amber-700 to-amber-900",
    text: "text-amber-600",
    bg: "bg-amber-700/10",
    icon: Target,
  };
};

const ArenaPanel = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ArenaProfileData | null>(null);
  const [matches, setMatches] = useState<ArenaHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [profileData, matchesData] = await Promise.all([
          getArenaProfile(),
          getArenaMatchHistory(),
        ]);
        if (cancelled) return;
        setProfile(profileData);
        setMatches(matchesData.matches);
      } catch (err) {
        console.error("Failed to load arena data:", err);
        if (!cancelled) setError("دریافت اطلاعات آرنا انجام نشد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // 🔹 آمار محاسبه‌شده
  const stats = useMemo(() => {
    if (!profile) {
      return {
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: 0,
        bestRating: 0,
        currentStreak: 0,
        streakType: "none" as "win" | "loss" | "none",
      };
    }

    const { statistics } = profile;
    const winRate =
      statistics.totalMatches > 0
        ? Math.round((statistics.wins / statistics.totalMatches) * 100)
        : 0;

    const bestRating =
      profile.leagues.length > 0
        ? Math.max(...profile.leagues.map((l) => l.rating))
        : 0;

    // Streak
    let streak = 0;
    let streakType: "win" | "loss" | "none" = "none";
    for (const match of matches) {
      if (match.result === "win") {
        if (streakType === "win" || streakType === "none") {
          streak++;
          streakType = "win";
        } else break;
      } else if (match.result === "loss") {
        if (streakType === "loss" || streakType === "none") {
          streak++;
          streakType = "loss";
        } else break;
      } else break;
    }

    return {
      totalMatches: statistics.totalMatches,
      wins: statistics.wins,
      losses: statistics.losses,
      draws: statistics.draws,
      winRate,
      bestRating,
      currentStreak: streak,
      streakType,
    };
  }, [profile, matches]);

  const topTier = getRatingTier(stats.bestRating);
  const TopTierIcon = topTier.icon;
  const recentMatches = matches.slice(0, 5);

  // ==================== Loading ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <LoaderCircle size={24} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت اطلاعات آرنا...
          </p>
        </div>
      </div>
    );
  }

  // ==================== Error ====================
  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <Shield size={32} className="mx-auto text-rose-500 mb-3" />
        <p className="text-sm font-bold text-rose-500 dark:text-rose-400">
          {error || "اطلاعات آرنا پیدا نشد."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ==================== HERO (تیره، همیشه) ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
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

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          {/* آیکون + رتبه */}
          <div className="relative shrink-0 self-center lg:self-auto">
            <div
              className={`absolute inset-0 rounded-3xl blur-2xl opacity-60 animate-pulse bg-gradient-to-br ${topTier.color}`}
            />
            <div
              className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${topTier.color} flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10`}
            >
              <TopTierIcon size={44} strokeWidth={2.3} />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#080B12] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          {/* متن */}
          <div className="flex-1 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 mb-2">
              <Zap
                size={12}
                className="text-[var(--griffin-gold)] animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Griffin Arena
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
              {profile.user.firstName} {profile.user.lastName}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2 justify-center lg:justify-start">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${topTier.bg} border border-current ${topTier.text}`}
              >
                <TopTierIcon size={13} />
                <span className="text-xs font-black">{topTier.label}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <Trophy size={13} className="text-[var(--griffin-gold)]" />
                <span className="text-xs font-bold text-gray-300">
                  بهترین Rating:{" "}
                  <span className="font-black text-white">
                    {stats.bestRating.toLocaleString("fa-IR")}
                  </span>
                </span>
              </span>
              {stats.currentStreak > 0 && stats.streakType !== "none" && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                    stats.streakType === "win"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  }`}
                >
                  <Flame
                    size={13}
                    className={
                      stats.streakType === "win" ? "animate-pulse" : ""
                    }
                  />
                  <span className="text-xs font-black">
                    {stats.currentStreak.toLocaleString("fa-IR")}{" "}
                    {stats.streakType === "win" ? "برد متوالی" : "باخت متوالی"}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* دکمه ورود */}
          <div className="shrink-0 self-center lg:self-auto">
            <button
              type="button"
              onClick={() => navigate("/arena")}
              className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-4 font-heading font-black text-white shadow-2xl shadow-[var(--griffin-gold)]/50 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/80 hover:-translate-y-1 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Swords size={20} />
                ورود به Arena
                <ArrowLeft size={16} className="rotate-180" />
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================== آمار سریع ==================== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: Swords,
            label: "کل نبردها",
            value: stats.totalMatches.toLocaleString("fa-IR"),
            color: "text-gray-900 dark:text-white",
            bg: "bg-gray-500/10 dark:bg-white/10",
          },
          {
            icon: Crown,
            label: "پیروزی",
            value: stats.wins.toLocaleString("fa-IR"),
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            icon: Target,
            label: "نرخ برد",
            value: `${stats.winRate.toLocaleString("fa-IR")}٪`,
            color: "text-[var(--griffin-gold)]",
            bg: "bg-[var(--griffin-gold)]/10",
          },
          {
            icon: XIcon,
            label: "شکست",
            value: stats.losses.toLocaleString("fa-IR"),
            color: "text-rose-500",
            bg: "bg-rose-500/10",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
            >
              <div
                className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon size={16} className={stat.color} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <p
                className={`font-heading text-xl font-black mt-1 ${stat.color}`}
              >
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* ==================== نوار نرخ برد ==================== */}
      {stats.totalMatches > 0 && (
        <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[var(--griffin-gold)]/10 flex items-center justify-center text-[var(--griffin-gold)]">
                  <BarChart3 size={14} />
                </div>
                <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white">
                  عملکرد کلی
                </h3>
              </div>
              <p className="font-heading text-2xl font-black text-[var(--griffin-gold)]">
                {stats.winRate.toLocaleString("fa-IR")}٪
              </p>
            </div>

            <div className="h-2.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-1000"
                style={{ width: `${stats.winRate}%` }}
              />
              <div
                className="h-full bg-gradient-to-l from-rose-500 to-rose-400 transition-all duration-1000"
                style={{
                  width: `${stats.totalMatches > 0 ? (stats.losses / stats.totalMatches) * 100 : 0}%`,
                }}
              />
              <div
                className="h-full bg-gradient-to-l from-slate-500 to-slate-400 transition-all duration-1000"
                style={{
                  width: `${stats.totalMatches > 0 ? (stats.draws / stats.totalMatches) * 100 : 0}%`,
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] font-black text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                برد ({stats.wins.toLocaleString("fa-IR")})
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                باخت ({stats.losses.toLocaleString("fa-IR")})
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-500" />
                مساوی ({stats.draws.toLocaleString("fa-IR")})
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== دسترسی سریع ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="inline-flex items-center gap-2">
            <Sparkles size={13} className="text-[var(--griffin-gold)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
              Quick Access
            </span>
          </div>
          <h2 className="font-heading text-base font-black text-gray-900 dark:text-white mt-1">
            دسترسی سریع
          </h2>
        </div>

        <div className="p-4 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: Swords,
              label: "شروع نبرد",
              desc: "ورود به لیگ‌ها",
              href: "/arena",
              color: "from-[var(--griffin-gold)] to-amber-700",
            },
            {
              icon: Trophy,
              label: "پروفایل آرنا",
              desc: "آمار و رتبه‌بندی",
              href: "/arena/profile",
              color: "from-purple-500 to-purple-700",
            },
            {
              icon: BarChart3,
              label: "تاریخچه",
              desc: "نبردهای گذشته",
              href: "/arena/history",
              color: "from-emerald-500 to-emerald-700",
            },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => navigate(action.href)}
                className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-4 text-right transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                  <ArrowLeft
                    size={14}
                    className="text-gray-400 dark:text-gray-600 transition-transform group-hover:-translate-x-1 group-hover:text-[var(--griffin-gold)] rotate-180 shrink-0 mt-1"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================== آخرین نبردها ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Gamepad2 size={14} className="text-[var(--griffin-gold)]" />
            <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white">
              آخرین نبردها
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/arena/history")}
            className="inline-flex items-center gap-1.5 text-[10px] font-black text-[var(--griffin-gold)] hover:underline"
          >
            مشاهده همه
            <ArrowLeft size={11} className="rotate-180" />
          </button>
        </div>

        {recentMatches.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <Swords size={28} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
              هنوز نبردی ثبت نشده!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              اولین نبردت رو شروع کن.
            </p>
            <button
              type="button"
              onClick={() => navigate("/arena")}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl transition-all"
            >
              <Swords size={14} />
              شروع نبرد
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {recentMatches.map((match) => {
              const isWin = match.result === "win";
              const isLoss = match.result === "loss";

              return (
                <div
                  key={match.matchId}
                  className={`
                    group relative rounded-xl overflow-hidden border
                    p-3 flex items-center gap-3
                    transition-all duration-300 hover:-translate-y-0.5
                    ${
                      isWin
                        ? "border-emerald-500/20 bg-gradient-to-l from-emerald-500/5 to-transparent"
                        : isLoss
                          ? "border-rose-500/20 bg-gradient-to-l from-rose-500/5 to-transparent"
                          : "border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02]"
                    }
                  `}
                >
                  <div
                    className={`
                      w-10 h-10 rounded-xl shrink-0
                      flex items-center justify-center text-white shadow-md
                      ${
                        isWin
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                          : isLoss
                            ? "bg-gradient-to-br from-rose-500 to-rose-700"
                            : "bg-gradient-to-br from-slate-500 to-slate-700"
                      }
                    `}
                  >
                    {isWin ? (
                      <Crown size={18} strokeWidth={2.3} />
                    ) : isLoss ? (
                      <Swords size={18} strokeWidth={2.3} />
                    ) : (
                      <Shield size={18} strokeWidth={2.3} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gray-500/10 dark:bg-white/5 text-[9px] font-black text-gray-600 dark:text-gray-400">
                        {match.league.title}
                      </span>
                    </div>
                    <p className="font-heading text-xs font-black text-gray-900 dark:text-white truncate">
                      {match.opponent
                        ? `${match.opponent.firstName} ${match.opponent.lastName}`
                        : "حریف ناشناس"}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <span
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-lg
                        text-[10px] font-black
                        ${
                          isWin
                            ? "bg-emerald-500/15 text-emerald-500"
                            : isLoss
                              ? "bg-rose-500/15 text-rose-500"
                              : "bg-slate-500/15 text-slate-500"
                        }
                      `}
                    >
                      {isWin ? (
                        <>
                          <Crown size={9} />
                          برد
                        </>
                      ) : isLoss ? (
                        <>
                          <Swords size={9} />
                          باخت
                        </>
                      ) : (
                        <>
                          <Shield size={9} />
                          مساوی
                        </>
                      )}
                    </span>

                    <span
                      className={`
                        inline-flex items-center gap-1 font-heading font-black text-sm tabular-nums
                        ${match.ratingChange >= 0 ? "text-emerald-500" : "text-rose-500"}
                      `}
                    >
                      {match.ratingChange >= 0 ? (
                        <TrendingUp size={13} />
                      ) : (
                        <TrendingDown size={13} />
                      )}
                      {match.ratingChange > 0 ? "+" : ""}
                      {match.ratingChange.toLocaleString("fa-IR")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==================== لیگ‌ها ==================== */}
      {profile.leagues.length > 0 && (
        <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-200/70 dark:border-white/5">
            <div className="flex items-center gap-2">
              <Award size={14} className="text-[var(--griffin-gold)]" />
              <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white">
                لیگ‌های من
              </h2>
            </div>
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">
              {profile.leagues.length.toLocaleString("fa-IR")} لیگ
            </span>
          </div>

          <div className="p-4 grid gap-3 sm:grid-cols-2">
            {profile.leagues.map((league) => {
              const tier = getRatingTier(league.rating);
              const TierIcon = tier.icon;

              return (
                <button
                  key={league.leagueId}
                  type="button"
                  onClick={() => navigate(`/arena/ranking/${league.leagueId}`)}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-4 text-right transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        {league.status === "active" ? "لیگ فعال" : "لیگ"}
                      </p>
                      <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white mt-0.5 truncate">
                        {league.title}
                      </h3>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
                    >
                      <TierIcon size={16} />
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">
                        Rating
                      </p>
                      <p
                        className={`font-heading text-xl font-black ${tier.text}`}
                      >
                        {league.rating.toLocaleString("fa-IR")}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-0.5">
                        {league.wins}W · {league.losses}L
                      </p>
                      <p className="text-[10px] font-black text-gray-500 dark:text-gray-400">
                        {league.draws} مساوی
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

// ==================== X Icon (inline) ====================
const XIcon = ({ size, className }: { size?: number; className?: string }) => (
  <svg
    width={size ?? 14}
    height={size ?? 14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default ArenaPanel;
