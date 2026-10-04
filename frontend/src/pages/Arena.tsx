import { useEffect, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  BarChart3,
  Clock,
  Crown,
  Flame,
  History,
  LoaderCircle,
  Lock,
  Medal,
  Shield,
  Swords,
  Target,
  Trophy,
  User,
  UserCircle2,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getActiveLeagues, getFinishedArenaLeagues } from "../api/arenaApi";
import type { ArenaLeague } from "../types/arena";
import RevealOnScroll from "../components/common/RevealOnScroll";
import GriffinMascot from "../components/common/GriffinMascot";
import { useAuth } from "../context/AuthContext";
import { usePublicStats } from "../hooks/usePublicStats";

// 🆕 ذرات ثابت
const PARTICLES = [
  { top: 12, left: 8, delay: 0, duration: 3.5 },
  { top: 28, left: 22, delay: 0.8, duration: 4.2 },
  { top: 45, left: 15, delay: 1.5, duration: 3.8 },
  { top: 62, left: 78, delay: 0.4, duration: 4.5 },
  { top: 18, left: 85, delay: 1.2, duration: 3.2 },
  { top: 75, left: 35, delay: 2, duration: 4 },
  { top: 38, left: 92, delay: 0.6, duration: 3.6 },
  { top: 88, left: 60, delay: 1.8, duration: 4.3 },
];

const Arena = () => {
  const navigate = useNavigate();
  const { user, hasFeature } = useAuth();
  const { stats } = usePublicStats();

  const canPlay = !!user && hasFeature("arena");

  const [leagues, setLeagues] = useState<ArenaLeague[]>([]);
  const [finishedLeagues, setFinishedLeagues] = useState<ArenaLeague[]>([]);
  const [loading, setLoading] = useState(true);
  const [finishedLoading, setFinishedLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const data = await getActiveLeagues();
        setLeagues(data.leagues);
        setError("");
        setNeedsProfile(false);
      } catch (err) {
        console.error("GET ACTIVE LEAGUES ERROR:", err);

        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "دریافت لیگ‌های آرنا با مشکل مواجه شد.";
        setError(message);

        if (
          message.includes("پایه تحصیلی") ||
          message.includes("پروفایل") ||
          message.includes("تکمیل")
        ) {
          setNeedsProfile(true);
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchFinishedLeagues = async () => {
      try {
        const data = await getFinishedArenaLeagues();
        setFinishedLeagues(data.leagues);
      } catch (error) {
        console.error("GET FINISHED LEAGUES ERROR:", error);
      } finally {
        setFinishedLoading(false);
      }
    };

    void fetchLeagues();
    void fetchFinishedLeagues();
  }, []);

  const handleEnterLeague = (league: ArenaLeague) => {
    if (!canPlay) {
      navigate("/subscriptions");
      return;
    }
    navigate(`/arena/leagues/${league.id}`, {
      state: {
        league: {
          title: league.title,
          lesson: league.lesson,
        },
      },
    });
  };

  const quickActions = [
    {
      icon: User,
      title: "پروفایل و Rating",
      desc: "امتیاز و آمار شخصی",
      href: "/arena/profile",
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: History,
      title: "تاریخچه نبردها",
      desc: "نبردهای گذشته تو",
      href: "/arena/history",
      color: "from-purple-500 to-purple-700",
    },
    {
      icon: Swords,
      title: "بازی انفرادی",
      desc: "با خودت رقابت کن",
      href: "/solo/setup",
      color: "from-purple-500 to-purple-700",
    },
    {
      icon: BarChart3,
      title: "آمار انفرادی",
      desc: "عملکردت رو ببین",
      href: "/solo/stats",
      color: "from-emerald-500 to-emerald-700",
    },
  ];

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* ==================== HERO ==================== */}
        <RevealOnScroll>
          <section className="relative rounded-[2.5rem] overflow-hidden bg-[#080B12] text-white p-8 md:p-14 shadow-[0_30px_100px_-20px_rgba(197,139,42,0.4)] border border-white/5">
            {/* گرادیان پس‌زمینه */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />

            {/* 🆕 هاله‌ها سبک‌تر */}
            <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/20 blur-[70px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-600/15 blur-[70px] pointer-events-none" />

            {/* 🆕 ذرات ثابت */}
            {PARTICLES.map((p, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[var(--griffin-gold)] pointer-events-none"
                style={{
                  top: `${p.top}%`,
                  left: `${p.left}%`,
                  animation: `float ${p.duration}s ease-in-out infinite`,
                  animationDelay: `${p.delay}s`,
                  opacity: 0.5,
                }}
              />
            ))}

            {/* ==================== محتوای اصلی ==================== */}
            <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* ===== سمت راست: متن ===== */}
              <div className="space-y-6 text-center lg:text-right order-2 lg:order-1">
                {/* 🆕 بدون backdrop-blur و animate-pulse */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30">
                  <Flame size={14} className="text-[var(--griffin-gold)]" />
                  <span className="text-xs font-bold text-[var(--griffin-gold)] tracking-wider">
                    رقابت زنده · همین حالا
                  </span>
                </div>

                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                  کنکور{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                      آرنا
                    </span>
                    <span className="absolute bottom-1 right-0 left-0 h-3 bg-[var(--griffin-gold)]/20 -z-0 rounded" />
                  </span>
                </h1>

                <p className="text-gray-300 leading-8 max-w-xl mx-auto lg:mx-0">
                  با دیگر داوطلبان رقابت کن، سرعت و دقت خودت رو بسنج و در جدول
                  رده‌بندی صعود کن. هر نبرد، یک قدم به قهرمانی نزدیک‌تر!
                </p>

                {/* 🆕 آمار بدون backdrop-blur — داینامیک */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-1">
                  {[
                    {
                      icon: Users,
                      label: "نبرد فعال",
                      value: `${stats.totalArenaMatches.toLocaleString("fa-IR")}+`,
                    },
                    { icon: Trophy, label: "جایزه ماهانه", value: "۵۰۰K" },
                    {
                      icon: Flame,
                      label: "نبرد امروز",
                      value: `${stats.todayArenaMatches.toLocaleString("fa-IR")}+`,
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10"
                    >
                      <stat.icon
                        size={14}
                        className="text-[var(--griffin-gold)]"
                      />
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">
                          {stat.label}
                        </p>
                        <p className="text-sm font-black text-white">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA کاربر بدون دسترسی */}
                {!canPlay && (
                  <div className="pt-3">
                    <button
                      onClick={() => navigate("/subscriptions")}
                      className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 transition-transform duration-300 hover:-translate-y-0.5 overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Crown size={16} />
                        برای شرکت در آرنا، اشتراک بگیر
                      </span>
                      <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>
                    <p className="text-xs text-gray-400 mt-3 text-center lg:text-right">
                      لیگ‌ها رو می‌تونی ببینی، برای شرکت نیاز به اشتراک نقره‌ای
                      یا بالاتری.
                    </p>
                  </div>
                )}

                {/* CTA کاربر دسترسی‌دار */}
                {canPlay && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                    <button
                      onClick={() =>
                        leagues[0] && handleEnterLeague(leagues[0])
                      }
                      disabled={!leagues.length}
                      className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-7 py-3.5 font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Swords size={18} />
                        شروع نبرد
                      </span>
                      <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>

                    {/* 🆕 بدون backdrop-blur */}
                    <button
                      onClick={() => navigate("/arena/profile")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 font-bold text-white hover:bg-white/10 transition-colors"
                    >
                      <Shield size={18} />
                      پروفایل من
                    </button>
                  </div>
                )}
              </div>

              {/* ===== سمت چپ: mascot ===== */}
              <div className="relative order-1 lg:order-2 flex items-center justify-center">
                <div className="relative w-full max-w-[380px] md:max-w-[460px]">
                  <GriffinMascot
                    variant="arena"
                    size="2xl"
                    animation="float"
                    glowColor="purple"
                    halo
                    particles
                    className="w-full h-auto"
                  />
                </div>

                {/* 🆕 بدون backdrop-blur-xl */}
                <div className="absolute top-2 right-2 lg:top-6 lg:right-4 animate-[float_3s_ease-in-out_infinite]">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-[#0a0d14]/95 border border-[var(--griffin-gold)]/30 shadow-xl">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                      <Swords size={15} />
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Arena
                      </p>
                      <p className="text-[11px] font-black text-gray-900 dark:text-white">
                        نبرد زنده
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute bottom-6 left-2 lg:bottom-10 lg:left-4 animate-[float_3.5s_ease-in-out_infinite]"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-[#0a0d14]/95 border border-purple-500/30 shadow-xl">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg">
                      <Zap size={14} fill="white" />
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Rating
                      </p>
                      <p className="text-[11px] font-black text-gray-900 dark:text-white">
                        صعود در جدول
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* گوشه‌های تزئینی */}
            <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-[var(--griffin-gold)]/30 rounded-tl-2xl pointer-events-none" />
            <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-[var(--griffin-gold)]/30 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-[var(--griffin-gold)]/30 rounded-bl-2xl pointer-events-none" />
            <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-[var(--griffin-gold)]/30 rounded-br-2xl pointer-events-none" />
          </section>
        </RevealOnScroll>

        {/* ==================== دسترسی سریع ==================== */}
        <section>
          <RevealOnScroll>
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                دسترسی سریع
              </h2>
              <div className="w-16 h-1 bg-[var(--griffin-gold)] mx-auto mt-3 rounded-full" />
            </div>
          </RevealOnScroll>

          {!canPlay ? (
            <div className="relative rounded-3xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 p-8 text-center">
              {/* 🆕 هاله سبک‌تر */}
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-[60px] pointer-events-none" />

              <div className="relative">
                <div className="relative inline-flex mb-5">
                  {/* 🆕 بدون blur-2xl و animate-pulse */}
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-40" />
                  <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                    <Lock size={28} strokeWidth={2.3} />
                  </div>
                </div>

                <h3 className="font-heading text-xl font-black text-gray-900 dark:text-white mb-3">
                  دسترسی به پروفایل، تاریخچه و بازی انفرادی
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-7 mb-6">
                  برای دیدن پروفایل، تاریخچه نبردها و بازی انفرادی، نیاز به
                  اشتراک نقره‌ای یا بالاتری.
                </p>

                <button
                  onClick={() => navigate("/subscriptions")}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 transition-transform hover:-translate-y-0.5"
                >
                  <Crown size={16} />
                  مشاهده پلن‌ها
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <RevealOnScroll key={i} delay={i * 120}>
                    <button
                      onClick={() => navigate(action.href)}
                      className="
                        group w-full text-right
                        relative rounded-3xl overflow-hidden
                        border border-gray-200 dark:border-white/10
                        bg-white dark:bg-white/[0.03]
                        p-6
                        transition-transform duration-300
                        hover:-translate-y-1
                        hover:border-[var(--griffin-gold)]/40
                      "
                    >
                      {/* 🆕 هاله سبک‌تر */}
                      <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[var(--griffin-gold)]/8 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative flex items-center gap-4">
                        {/* 🆕 حذف rotate-3 */}
                        <div
                          className={`
                            relative w-14 h-14 rounded-2xl
                            bg-gradient-to-br ${action.color}
                            flex items-center justify-center text-white
                            shadow-lg
                            transition-transform duration-300
                            group-hover:scale-110
                          `}
                        >
                          <Icon size={24} strokeWidth={2.2} />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                            {action.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {action.desc}
                          </p>
                        </div>

                        <ArrowLeft
                          size={18}
                          className="text-gray-400 transition-transform group-hover:-translate-x-1 group-hover:text-[var(--griffin-gold)]"
                        />
                      </div>
                    </button>
                  </RevealOnScroll>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================== لیگ‌های فعال ==================== */}
        <section>
          <RevealOnScroll>
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-black tracking-widest text-emerald-500 uppercase">
                    LIVE
                  </span>
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                  لیگ‌های فعال
                </h2>
                <div className="w-16 h-1 bg-[var(--griffin-gold)] mt-3 rounded-full" />
              </div>

              {!loading && !error && leagues.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-400">
                  <Swords size={14} />
                  {leagues.length.toLocaleString("fa-IR")} لیگ
                </div>
              )}
            </div>
          </RevealOnScroll>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
              <LoaderCircle className="animate-spin" size={20} />
              در حال دریافت لیگ‌ها...
            </div>
          ) : needsProfile ? (
            <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent p-8 text-center">
              {/* 🆕 هاله سبک‌تر */}
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/8 blur-[60px] pointer-events-none" />

              <div className="relative">
                <div className="relative inline-flex mb-5">
                  {/* 🆕 بدون blur-2xl و animate-pulse */}
                  <div className="absolute inset-0 bg-amber-500 blur-xl opacity-40" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                    <UserCircle2 size={36} strokeWidth={2.3} />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 mb-4">
                  <AlertCircle size={11} className="text-amber-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Profile Incomplete
                  </span>
                </div>

                <h3 className="font-heading text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-3">
                  پروفایل شما ناقص است
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-7 mb-6">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard?section=profile")}
                  className="
                    group relative
                    inline-flex items-center justify-center gap-2
                    rounded-xl
                    bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                    px-6 py-3.5
                    font-black text-white text-sm
                    shadow-lg shadow-[var(--griffin-gold)]/40
                    transition-transform duration-300
                    hover:-translate-y-0.5
                    overflow-hidden
                  "
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <User size={16} />
                    تکمیل پروفایل
                    <ArrowLeft size={14} className="rotate-180" />
                  </span>
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/20 dark:bg-red-500/5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 mb-3">
                <AlertCircle size={22} />
              </div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          ) : leagues.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <Swords
                  size={26}
                  className="text-gray-400 dark:text-gray-500"
                />
              </div>
              <p className="font-bold text-gray-600 dark:text-gray-300">
                در حال حاضر لیگ فعالی وجود ندارد.
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                به زودی لیگ‌های جدید اضافه می‌شوند.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leagues.map((league, index) => (
                <RevealOnScroll key={league.id} delay={index * 100}>
                  <article
                    className="
                      group relative h-full flex flex-col
                      rounded-3xl overflow-hidden
                      border border-gray-200 dark:border-white/10
                      bg-white dark:bg-white/[0.03]
                      p-6
                      transition-transform duration-300
                      hover:-translate-y-1
                      hover:border-[var(--griffin-gold)]/40
                    "
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                    {/* 🆕 هاله سبک‌تر */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[var(--griffin-gold)]/8 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="relative flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          لیگ فعال
                        </div>

                        {/* 🆕 حذف rotate-12 */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <Swords size={18} strokeWidth={2.3} />
                        </div>
                      </div>

                      <h3 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                        {league.title}
                      </h3>

                      <div className="mt-2 inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-400">
                        <Target
                          size={12}
                          className="text-[var(--griffin-gold)]"
                        />
                        {league.lesson}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-5 py-5 border-y border-gray-100 dark:border-white/5">
                        <div className="text-center">
                          <div className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                            <Users size={11} />
                            <span>شرکت‌کننده</span>
                          </div>
                          <p className="font-heading text-lg font-black text-gray-900 dark:text-white">
                            {(league.participantsCount ?? 0).toLocaleString(
                              "fa-IR",
                            )}
                            +
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                            <Clock size={11} />
                            <span>زمان هر نبرد</span>
                          </div>
                          <p className="font-heading text-lg font-black text-gray-900 dark:text-white">
                            ۱۵ دقیقه
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEnterLeague(league)}
                        className={`
                          group/btn
                          relative
                          mt-5 w-full
                          overflow-hidden
                          rounded-xl
                          py-3.5
                          font-black
                          transition-transform duration-300
                          ${
                            canPlay
                              ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:-translate-y-0.5"
                              : "bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/40 text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/20"
                          }
                        `}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {canPlay ? (
                            <>
                              <Swords size={16} />
                              ورود به لیگ
                            </>
                          ) : (
                            <>
                              <Lock size={16} />
                              برای شرکت، اشتراک بگیر
                            </>
                          )}
                        </span>
                        {canPlay && (
                          <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        )}
                      </button>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          )}
        </section>

        {/* ==================== فصل‌های گذشته ==================== */}
        <section>
          <RevealOnScroll>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <Archive
                    size={14}
                    className="text-gray-400 dark:text-gray-500"
                  />
                  <span className="text-xs font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                    ARCHIVE
                  </span>
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                  فصل‌های گذشته
                </h2>
                <div className="w-16 h-1 bg-[var(--griffin-gold)] mt-3 rounded-full" />
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  نتایج نهایی و رتبه‌بندی فصل‌های به پایان رسیده
                </p>
              </div>
            </div>
          </RevealOnScroll>

          {finishedLoading ? (
            <div className="flex min-h-[200px] items-center justify-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
              <LoaderCircle className="animate-spin" size={18} />
              در حال دریافت آرشیو...
            </div>
          ) : finishedLeagues.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <Trophy
                  size={26}
                  className="text-gray-400 dark:text-gray-500"
                />
              </div>
              <p className="font-bold text-gray-600 dark:text-gray-300">
                هنوز فصلی به پایان نرسیده است.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {finishedLeagues.map((league, index) => (
                <RevealOnScroll key={league.id} delay={index * 100}>
                  <article
                    className="
                      group relative
                      rounded-3xl overflow-hidden
                      border border-gray-200 dark:border-white/10
                      bg-white dark:bg-white/[0.03]
                      p-6
                      transition-transform duration-300
                      hover:-translate-y-1
                    "
                  >
                    <div className="relative">
                      <div className="flex items-center justify-between mb-5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-500/10 text-gray-500 dark:text-gray-400 text-[10px] font-black">
                          <Archive size={10} />
                          پایان‌یافته
                        </div>

                        {/* 🆕 حذف rotate-12 */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                          <Trophy size={18} strokeWidth={2.3} />
                        </div>
                      </div>

                      <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                        {league.title}
                      </h3>

                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-400">
                        <Target size={12} />
                        {league.lesson}
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/arena/season/${league.id}`)}
                        className="
                          mt-5 w-full inline-flex items-center justify-center gap-2
                          rounded-xl
                          border border-[var(--griffin-gold)]/30
                          bg-[var(--griffin-gold)]/10
                          py-3
                          font-bold text-[var(--griffin-gold)]
                          transition-colors duration-300
                          hover:bg-[var(--griffin-gold)]/20
                          hover:border-[var(--griffin-gold)]/50
                        "
                      >
                        <Medal size={16} />
                        مشاهده نتایج فصل
                      </button>
                    </div>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          )}
        </section>

        {/* ==================== CTA ==================== */}
        <RevealOnScroll>
          <section className="relative rounded-[2.5rem] overflow-hidden bg-[#080B12] text-white p-8 md:p-12 text-center border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-[var(--griffin-gold)]/10 pointer-events-none" />

            {/* 🆕 هاله‌ها سبک‌تر */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-[60px]" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/12 blur-[60px]" />

            <div className="relative space-y-5">
              <div className="inline-flex relative">
                {/* 🆕 بدون blur-xl بزرگ */}
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-40" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
                  <Crown size={24} />
                </div>
              </div>

              <h2 className="font-heading text-2xl md:text-4xl font-black">
                {canPlay ? "آماده‌ای قهرمان بشی؟" : "برای قهرمانی، اشتراک بگیر"}
              </h2>

              <p className="text-gray-300 max-w-lg mx-auto leading-8">
                {canPlay
                  ? "هر نبرد، یک فرصت برای پیشرفت و صعود در جدول رده‌بندی. الان شروع کن!"
                  : "با خرید اشتراک نقره‌ای یا بالاتر، به آرنا، بازی انفرادی و رقابت زنده دسترسی پیدا می‌کنی."}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
                {canPlay ? (
                  <>
                    <button
                      onClick={() =>
                        leagues[0] && handleEnterLeague(leagues[0])
                      }
                      disabled={!leagues.length}
                      className="
                        group relative
                        inline-flex items-center justify-center gap-2
                        rounded-xl
                        bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                        px-7 py-3.5
                        font-black text-white
                        shadow-lg shadow-[var(--griffin-gold)]/40
                        transition-transform duration-300
                        hover:-translate-y-0.5
                        disabled:opacity-40 disabled:cursor-not-allowed
                        overflow-hidden
                      "
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Swords size={18} />
                        شروع نبرد
                      </span>
                      <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>

                    {/* 🆕 بدون backdrop-blur */}
                    <button
                      onClick={() => navigate("/arena/profile")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 font-bold text-white hover:bg-white/10 transition-colors"
                    >
                      <Shield size={18} />
                      پروفایل من
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate("/subscriptions")}
                    className="
                      group relative
                      inline-flex items-center justify-center gap-2
                      rounded-xl
                      bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                      px-7 py-3.5
                      font-black text-white
                      shadow-lg shadow-[var(--griffin-gold)]/40
                      transition-transform duration-300
                      hover:-translate-y-0.5
                      overflow-hidden
                    "
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Crown size={18} />
                      مشاهده پلن‌ها
                    </span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                )}
              </div>
            </div>
          </section>
        </RevealOnScroll>
      </div>
    </main>
  );
};

export default Arena;
