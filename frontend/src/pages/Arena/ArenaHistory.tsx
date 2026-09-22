import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  Crown,
  Filter,
  Flame,
  LoaderCircle,
  Medal,
  Minus,
  Swords,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserPlus,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getArenaMatchHistory,
  type ArenaHistoryItem,
} from "../../api/arenaApi";
import RevealOnScroll from "../../components/common/RevealOnScroll";

type FilterType = "all" | "win" | "loss" | "draw";

const ArenaHistory = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<ArenaHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    getArenaMatchHistory()
      .then((data) => setMatches(data.matches))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ==================== آمار کلی ====================
  const stats = useMemo(() => {
    // 🆕 فقط نبردهای rated توی rating حساب می‌شن
    const ratedMatches = matches.filter((m) => !m.isFriendly);

    const wins = matches.filter((m) => m.result === "win").length;
    const losses = matches.filter((m) => m.result === "loss").length;
    const draws = matches.filter((m) => m.result === "draw").length;
    const friendlyCount = matches.filter((m) => m.isFriendly).length;

    const totalRatingChange = ratedMatches.reduce(
      (sum, m) => sum + (m.ratingChange || 0),
      0,
    );
    const winRate = matches.length > 0 ? (wins / matches.length) * 100 : 0;

    // 🔹 بهترین برد (فقط rated)
    const bestWin = [...ratedMatches]
      .filter((m) => m.result === "win")
      .sort((a, b) => b.ratingChange - a.ratingChange)[0];

    // 🔹 بدترین باخت (فقط rated)
    const worstLoss = [...ratedMatches]
      .filter((m) => m.result === "loss")
      .sort((a, b) => a.ratingChange - b.ratingChange)[0];

    // 🔹 محاسبه Streak فعلی
    let currentStreak = 0;
    let streakType: "win" | "loss" | "none" = "none";
    for (const match of matches) {
      if (match.result === "win") {
        if (streakType === "win" || streakType === "none") {
          currentStreak++;
          streakType = "win";
        } else break;
      } else if (match.result === "loss") {
        if (streakType === "loss" || streakType === "none") {
          currentStreak++;
          streakType = "loss";
        } else break;
      } else break;
    }

    return {
      wins,
      losses,
      draws,
      friendlyCount,
      totalRatingChange,
      winRate,
      bestWin,
      worstLoss,
      currentStreak,
      streakType,
    };
  }, [matches]);

  // ==================== فیلتر ====================
  const filteredMatches = useMemo(() => {
    if (filter === "all") return matches;
    return matches.filter((m) => m.result === filter);
  }, [matches, filter]);

  const filters: {
    key: FilterType;
    label: string;
    count: number;
    color: string;
  }[] = [
    {
      key: "all",
      label: "همه",
      count: matches.length,
      color: "text-gray-600 dark:text-gray-300",
    },
    { key: "win", label: "برد", count: stats.wins, color: "text-emerald-500" },
    { key: "loss", label: "باخت", count: stats.losses, color: "text-rose-500" },
    {
      key: "draw",
      label: "مساوی",
      count: stats.draws,
      color: "text-slate-500",
    },
  ];

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

        {/* ==================== Header ==================== */}
        <RevealOnScroll>
          <header className="relative rounded-[2rem] overflow-hidden bg-[#080B12] text-white p-8 md:p-10 border border-white/5 shadow-2xl shadow-[var(--griffin-gold)]/10">
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
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center shadow-2xl shadow-[var(--griffin-gold)]/50 rotate-3">
                  <Swords size={38} strokeWidth={2.2} />
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-black tracking-[0.25em] text-[var(--griffin-gold)] uppercase">
                  Match History
                </p>
                <h1 className="font-heading text-3xl md:text-4xl font-black leading-tight">
                  تاریخچه نبردها
                </h1>
                <p className="text-gray-300 text-sm leading-7 max-w-xl">
                  تمام Matchهای تمام‌شده‌ات را اینجا ببین. عملکردت رو تحلیل کن و
                  قوی‌تر برگرد!
                </p>
              </div>

              {/* Streak فعلی */}
              {stats.currentStreak > 0 && stats.streakType !== "none" && (
                <div
                  className={`
                    rounded-2xl px-5 py-4 backdrop-blur-sm border
                    ${
                      stats.streakType === "win"
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-rose-500/10 border-rose-500/30"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {stats.streakType === "win" ? (
                      <Flame
                        size={14}
                        className="text-emerald-400 animate-pulse"
                      />
                    ) : (
                      <TrendingDown size={14} className="text-rose-400" />
                    )}
                    <span
                      className={`text-[10px] font-black ${
                        stats.streakType === "win"
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {stats.streakType === "win"
                        ? "زنجیره برد"
                        : "زنجیره باخت"}
                    </span>
                  </div>
                  <p
                    className={`font-heading text-2xl font-black ${
                      stats.streakType === "win"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {stats.currentStreak.toLocaleString("fa-IR")}
                    <span className="text-xs font-bold mr-1">نبرد</span>
                  </p>
                </div>
              )}
            </div>
          </header>
        </RevealOnScroll>

        {/* ==================== آمار کلی ==================== */}
        {!loading && matches.length > 0 && (
          <RevealOnScroll>
            <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                {
                  icon: Trophy,
                  label: "کل نبردها",
                  value: matches.length,
                  color: "text-gray-900 dark:text-white",
                  bg: "bg-gray-500/10",
                  iconColor: "text-gray-500 dark:text-gray-400",
                },
                {
                  icon: Crown,
                  label: "پیروزی‌ها",
                  value: stats.wins,
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10",
                  iconColor: "text-emerald-500",
                },
                {
                  icon: Swords,
                  label: "شکست‌ها",
                  value: stats.losses,
                  color: "text-rose-500",
                  bg: "bg-rose-500/10",
                  iconColor: "text-rose-500",
                },
                {
                  icon: UserPlus,
                  label: "دوستانه",
                  value: stats.friendlyCount,
                  color: "text-purple-600 dark:text-purple-400",
                  bg: "bg-purple-500/10",
                  iconColor: "text-purple-600 dark:text-purple-400",
                },
                {
                  icon: TrendingUp,
                  label: "تغییر Rating",
                  value: `${stats.totalRatingChange > 0 ? "+" : ""}${stats.totalRatingChange}`,
                  color:
                    stats.totalRatingChange >= 0
                      ? "text-emerald-500"
                      : "text-rose-500",
                  bg:
                    stats.totalRatingChange >= 0
                      ? "bg-emerald-500/10"
                      : "bg-rose-500/10",
                  iconColor:
                    stats.totalRatingChange >= 0
                      ? "text-emerald-500"
                      : "text-rose-500",
                },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className="
                      group relative rounded-2xl overflow-hidden
                      border border-gray-200 dark:border-white/10
                      bg-white/70 dark:bg-white/[0.04]
                      backdrop-blur-sm p-5
                      transition-all duration-300
                      hover:-translate-y-1
                      hover:shadow-lg hover:shadow-[var(--griffin-gold)]/5
                    "
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`
                          w-10 h-10 rounded-xl
                          ${stat.bg}
                          flex items-center justify-center
                          transition-transform duration-300
                          group-hover:scale-110 group-hover:rotate-3
                        `}
                      >
                        <Icon size={18} className={stat.iconColor} />
                      </div>
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

        {/* ==================== Win Rate Bar ==================== */}
        {!loading && matches.length > 0 && (
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
                  {Math.round(stats.winRate).toLocaleString("fa-IR")}٪
                </p>
              </div>

              {/* نوار پیشرفت سه‌رنگ */}
              <div className="h-3 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${stats.winRate}%` }}
                />
                <div
                  className="h-full bg-gradient-to-l from-rose-500 to-rose-400 transition-all duration-1000"
                  style={{
                    width: `${(stats.losses / matches.length) * 100}%`,
                  }}
                />
                <div
                  className="h-full bg-gradient-to-l from-slate-500 to-slate-400 transition-all duration-1000"
                  style={{
                    width: `${(stats.draws / matches.length) * 100}%`,
                  }}
                />
              </div>

              <div className="flex items-center gap-4 mt-3 text-xs font-bold text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  برد ({stats.wins.toLocaleString("fa-IR")})
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  باخت ({stats.losses.toLocaleString("fa-IR")})
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  مساوی ({stats.draws.toLocaleString("fa-IR")})
                </div>
              </div>
            </section>
          </RevealOnScroll>
        )}

        {/* ==================== افتخارات ==================== */}
        {!loading && (stats.bestWin || stats.worstLoss) && (
          <RevealOnScroll>
            <section className="grid md:grid-cols-2 gap-4">
              {stats.bestWin && (
                <div className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent backdrop-blur-sm p-6">
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                        <Award size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">
                          Best Win
                        </p>
                        <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                          بهترین پیروزی
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      مقابل{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {stats.bestWin.opponent
                          ? `${stats.bestWin.opponent.firstName} ${stats.bestWin.opponent.lastName}`
                          : "حریف"}
                      </span>
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                      <TrendingUp size={14} />+{stats.bestWin.ratingChange}{" "}
                      Rating
                    </div>
                  </div>
                </div>
              )}

              {stats.worstLoss && (
                <div className="relative rounded-3xl overflow-hidden border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent backdrop-blur-sm p-6">
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-rose-500/20 blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
                        <Zap size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black tracking-widest text-rose-500 uppercase">
                          Toughest Loss
                        </p>
                        <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                          سخت‌ترین شکست
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      مقابل{" "}
                      <span className="font-bold text-gray-900 dark:text-white">
                        {stats.worstLoss.opponent
                          ? `${stats.worstLoss.opponent.firstName} ${stats.worstLoss.opponent.lastName}`
                          : "حریف"}
                      </span>
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 font-black text-sm">
                      <TrendingDown size={14} />
                      {stats.worstLoss.ratingChange} Rating
                    </div>
                  </div>
                </div>
              )}
            </section>
          </RevealOnScroll>
        )}

        {/* ==================== فیلتر ==================== */}
        {!loading && matches.length > 0 && (
          <RevealOnScroll>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 pl-2 shrink-0">
                <Filter size={14} />
                <span>فیلتر:</span>
              </div>
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`
                    shrink-0 inline-flex items-center gap-2
                    px-4 py-2 rounded-xl
                    text-xs font-black
                    transition-all duration-300
                    ${
                      filter === f.key
                        ? "bg-[var(--griffin-gold)] text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                        : "bg-white/60 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40"
                    }
                  `}
                >
                  <span className={filter === f.key ? "" : f.color}>
                    {f.label}
                  </span>
                  <span
                    className={`
                      px-1.5 py-0.5 rounded-md text-[10px]
                      ${filter === f.key ? "bg-white/20" : "bg-gray-100 dark:bg-white/10"}
                    `}
                  >
                    {f.count.toLocaleString("fa-IR")}
                  </span>
                </button>
              ))}
            </div>
          </RevealOnScroll>
        )}

        {/* ==================== لیست نبردها ==================== */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
            <LoaderCircle className="animate-spin" size={20} />
            در حال دریافت تاریخچه...
          </div>
        ) : matches.length === 0 ? (
          <RevealOnScroll>
            <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-14 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-5">
                <Swords
                  size={32}
                  className="text-gray-400 dark:text-gray-500"
                />
              </div>
              <p className="font-heading font-black text-lg text-gray-700 dark:text-gray-300">
                هنوز نبردی ثبت نشده!
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                برو به Arena و اولین نبردت رو شروع کن.
              </p>
              <button
                onClick={() => navigate("/arena")}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white text-sm font-bold hover:opacity-90 transition shadow-lg shadow-[var(--griffin-gold)]/30"
              >
                <Swords size={16} />
                شروع نبرد
              </button>
            </div>
          </RevealOnScroll>
        ) : filteredMatches.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
            <Filter
              size={28}
              className="mx-auto text-gray-400 dark:text-gray-500 mb-3"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              نبردی با این فیلتر وجود ندارد.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMatches.map((match, index) => {
              const isWin = match.result === "win";
              const isLoss = match.result === "loss";
              const isFriendly = match.isFriendly;

              return (
                <RevealOnScroll key={match.matchId} delay={index * 50}>
                  <article
                    className={`
                      group relative rounded-2xl overflow-hidden
                      border backdrop-blur-sm
                      transition-all duration-300
                      hover:-translate-y-1
                      ${
                        isWin
                          ? "border-emerald-500/20 bg-gradient-to-l from-emerald-500/5 via-white/60 to-white/60 dark:from-emerald-500/10 dark:via-white/[0.03] dark:to-white/[0.03] hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/10"
                          : isLoss
                            ? "border-rose-500/20 bg-gradient-to-l from-rose-500/5 via-white/60 to-white/60 dark:from-rose-500/10 dark:via-white/[0.03] dark:to-white/[0.03] hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-500/10"
                            : "border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] hover:border-gray-400/40 hover:shadow-xl hover:shadow-gray-500/10"
                      }
                    `}
                  >
                    {/* خط رنگی سمت راست */}
                    <div
                      className="absolute top-0 right-0 bottom-0 w-1"
                      style={{
                        background: isWin
                          ? "linear-gradient(to bottom, transparent, #10b981, transparent)"
                          : isLoss
                            ? "linear-gradient(to bottom, transparent, #f43f5e, transparent)"
                            : "linear-gradient(to bottom, transparent, #64748b, transparent)",
                      }}
                    />

                    <div className="relative p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* ===== نتیجه (آیکون + حریف) ===== */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* آیکون نتیجه */}
                        <div className="relative shrink-0">
                          <div
                            className={`
                              absolute inset-0 rounded-2xl blur-md opacity-50
                              ${
                                isWin
                                  ? "bg-emerald-500"
                                  : isLoss
                                    ? "bg-rose-500"
                                    : "bg-slate-500"
                              }
                            `}
                          />
                          <div
                            className={`
                              relative w-12 h-12 rounded-2xl
                              flex items-center justify-center
                              border-2
                              ${
                                isWin
                                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                                  : isLoss
                                    ? "bg-rose-500/15 border-rose-500/30 text-rose-500"
                                    : "bg-slate-500/15 border-slate-500/30 text-slate-500"
                              }
                            `}
                          >
                            {isWin ? (
                              <Crown size={20} strokeWidth={2.3} />
                            ) : isLoss ? (
                              <Swords size={20} strokeWidth={2.3} />
                            ) : (
                              <Minus size={20} strokeWidth={2.5} />
                            )}
                          </div>
                        </div>

                        {/* اطلاعات حریف */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                              <Trophy size={9} />
                              {match.league.title}
                            </span>

                            {/* 🆕 badge دوستانه */}
                            {isFriendly && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-black">
                                <UserPlus size={9} />
                                دوستانه
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`
                                w-6 h-6 rounded-lg shrink-0
                                flex items-center justify-center
                                text-white text-[10px] font-black
                                ${
                                  isWin
                                    ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                                    : isLoss
                                      ? "bg-gradient-to-br from-rose-500 to-rose-700"
                                      : "bg-gradient-to-br from-slate-500 to-slate-700"
                                }
                              `}
                            >
                              {match.opponent?.firstName?.charAt(0) || "?"}
                            </div>
                            <p className="font-heading font-black text-gray-900 dark:text-white truncate">
                              {match.opponent
                                ? `${match.opponent.firstName} ${match.opponent.lastName}`
                                : "حریف ناشناس"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ===== آمار نتیجه ===== */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5">
                        {/* نتیجه */}
                        <div
                          className={`
                            flex items-center gap-1.5
                            px-3 py-1.5 rounded-xl
                            text-xs font-black
                            ${
                              isWin
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : isLoss
                                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                  : "bg-slate-500/15 text-slate-600 dark:text-slate-400"
                            }
                          `}
                        >
                          {isWin ? (
                            <>
                              <Crown size={12} />
                              پیروزی
                            </>
                          ) : isLoss ? (
                            <>
                              <Swords size={12} />
                              شکست
                            </>
                          ) : (
                            <>
                              <Minus size={12} />
                              مساوی
                            </>
                          )}
                        </div>

                        {/* 🆕 ratingChange فقط برای نبردهای rated */}
                        {isFriendly ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black">
                            <UserPlus size={10} />
                            بدون Rating
                          </span>
                        ) : (
                          <div
                            className={`
                              inline-flex items-center gap-1
                              font-heading font-black text-lg
                              ${
                                match.ratingChange >= 0
                                  ? "text-emerald-500"
                                  : "text-rose-500"
                              }
                            `}
                          >
                            {match.ratingChange >= 0 ? (
                              <TrendingUp size={16} />
                            ) : (
                              <TrendingDown size={16} />
                            )}
                            <span>
                              {match.ratingChange > 0 ? "+" : ""}
                              {match.ratingChange}
                            </span>
                          </div>
                        )}

                        {/* تاریخ */}
                        <div className="hidden md:block text-[10px] text-gray-400 dark:text-gray-500">
                          {match.playedAt
                            ? new Date(match.playedAt).toLocaleDateString(
                                "fa-IR",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "—"}
                        </div>
                      </div>
                    </div>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default ArenaHistory;
