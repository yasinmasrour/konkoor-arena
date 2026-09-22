import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Crown,
  Flame,
  // LoaderCircle,
  Medal,
  Shield,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  // User,
  Users,
  // Zap,
} from "lucide-react";
import { getLeagueOpponents } from "../services/arenaService";
import type { ArenaLeague, ArenaOpponent } from "../types/arena";
import RevealOnScroll from "../components/common/RevealOnScroll";

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

const ArenaLobby = () => {
  const { leagueId } = useParams();
  const navigate = useNavigate();
  const [league, setLeague] = useState<ArenaLeague | null>(null);
  const [opponents, setOpponents] = useState<ArenaOpponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOpponents = async () => {
      if (!leagueId) return;
      try {
        const data = await getLeagueOpponents(leagueId);
        setLeague(data.league);
        setOpponents(data.opponents);
      } catch (error) {
        console.error("GET LEAGUE OPPONENTS ERROR:", error);
        setError("دریافت بازیکنان لیگ با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };
    void fetchOpponents();
  }, [leagueId]);

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-40 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <Swords size={28} className="text-white animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            در حال آماده‌سازی میدان نبرد...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error || !league) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Shield size={28} className="text-red-500" />
          </div>
          <p className="font-bold text-red-500">{error || "لیگ پیدا نشد."}</p>
          <button
            onClick={() => navigate("/arena")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--griffin-gold)] text-white text-sm font-bold hover:opacity-90 transition"
          >
            <ArrowRight size={16} />
            بازگشت به آرنا
          </button>
        </div>
      </main>
    );
  }

  const availableCount = opponents.filter((o) => o.isAvailable).length;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ==================== Back ==================== */}
        <RevealOnScroll>
          <button
            type="button"
            onClick={() => navigate("/arena")}
            className="
              group inline-flex items-center gap-2
              text-sm font-bold
              text-gray-500 dark:text-gray-400
              hover:text-[var(--griffin-gold)]
              transition
            "
          >
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
            بازگشت به آرنا
          </button>
        </RevealOnScroll>

        {/* ==================== League Header ==================== */}
        <RevealOnScroll>
          <section className="relative rounded-[2rem] overflow-hidden bg-[#080B12] text-white p-8 md:p-10 border border-white/5 shadow-2xl shadow-[var(--griffin-gold)]/10">
            {/* گرادیان‌های پس‌زمینه */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

            {/* الگوی نقطه‌ای */}
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

            <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
              {/* آیکون لیگ */}
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center shadow-2xl shadow-[var(--griffin-gold)]/50 rotate-3">
                  <Swords size={40} strokeWidth={2.2} />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>

              {/* اطلاعات */}
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">
                    Live · League Active
                  </span>
                </div>

                <h1 className="font-heading text-3xl md:text-5xl font-black leading-tight">
                  {league.title}
                </h1>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-sm">
                  <Target size={14} className="text-[var(--griffin-gold)]" />
                  <span className="text-gray-300">{league.lesson}</span>
                </div>
              </div>

              {/* آمار */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:w-auto">
                <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm px-5 py-4 text-center lg:text-right">
                  <div className="flex items-center justify-center lg:justify-start gap-1.5 text-[10px] text-gray-400 mb-1">
                    <Users size={11} />
                    <span>بازیکنان</span>
                  </div>
                  <p className="font-heading text-2xl font-black text-white">
                    {opponents.length.toLocaleString("fa-IR")}
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm px-5 py-4 text-center lg:text-right">
                  <div className="flex items-center justify-center lg:justify-start gap-1.5 text-[10px] text-emerald-400 mb-1">
                    <Sparkles size={11} />
                    <span>آماده نبرد</span>
                  </div>
                  <p className="font-heading text-2xl font-black text-emerald-400">
                    {availableCount.toLocaleString("fa-IR")}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </RevealOnScroll>

        {/* ==================== Opponents ==================== */}
        <section>
          <RevealOnScroll>
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <Flame
                    size={14}
                    className="text-[var(--griffin-gold)] animate-pulse"
                  />
                  <span className="text-xs font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                    Choose Your Opponent
                  </span>
                </div>
                <h2 className="font-heading text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  انتخاب حریف
                </h2>
                <div className="w-16 h-1 bg-[var(--griffin-gold)] mt-3 rounded-full" />
              </div>

              {opponents.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-400">
                  <Users size={14} />
                  {opponents.length.toLocaleString("fa-IR")} بازیکن
                </div>
              )}
            </div>
          </RevealOnScroll>

          {opponents.length === 0 ? (
            <RevealOnScroll>
              <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-14 text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-5">
                  <Users
                    size={32}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
                <p className="font-heading font-black text-lg text-gray-700 dark:text-gray-300">
                  میدان خالی است!
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  در حال حاضر بازیکن دیگری برای رقابت وجود ندارد. کمی بعد دوباره
                  سر بزن.
                </p>
                <button
                  onClick={() => navigate("/arena")}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--griffin-gold)] text-white text-sm font-bold hover:opacity-90 transition"
                >
                  <ArrowRight size={16} />
                  بازگشت به لیگ‌ها
                </button>
              </div>
            </RevealOnScroll>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {opponents.map((opponent, index) => {
                const tier = getRatingTier(opponent.rating);
                const TierIcon = tier.icon;
                const winRate =
                  opponent.matchesPlayed > 0
                    ? Math.round((opponent.wins / opponent.matchesPlayed) * 100)
                    : 0;

                return (
                  <RevealOnScroll key={opponent.userId} delay={index * 80}>
                    <article
                      className={`
                        group relative h-full flex flex-col
                        rounded-3xl overflow-hidden
                        border transition-all duration-300
                        backdrop-blur-sm
                        ${
                          opponent.isAvailable
                            ? "border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--griffin-gold)]/10 hover:border-[var(--griffin-gold)]/40"
                            : "border-gray-200/60 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] opacity-70"
                        }
                      `}
                    >
                      {/* خط بالای کارت */}
                      <div
                        className={`
                          h-1 w-full
                          bg-gradient-to-r from-transparent via-current to-transparent
                          ${tier.text} opacity-60
                        `}
                      />

                      {/* گرادیان تزئینی */}
                      <div
                        className={`
                          absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500
                          ${tier.bg}
                        `}
                      />

                      <div className="relative p-6 flex-1 flex flex-col">
                        {/* ===== هدر (آواتار + نام + وضعیت) ===== */}
                        <div className="flex items-start gap-4 mb-5">
                          {/* آواتار */}
                          <div className="relative shrink-0">
                            <div
                              className={`
                                absolute inset-0 rounded-2xl blur-lg
                                bg-gradient-to-br ${tier.color}
                                opacity-60
                              `}
                            />
                            <div
                              className={`
                                relative w-16 h-16 rounded-2xl
                                bg-gradient-to-br ${tier.color}
                                flex items-center justify-center
                                text-white font-heading font-black text-2xl
                                border-2 border-white/20 shadow-lg
                              `}
                            >
                              {opponent.firstName?.charAt(0) || "?"}
                            </div>

                            {/* آیکون رتبه */}
                            <div
                              className={`
                                absolute -top-1.5 -left-1.5
                                w-7 h-7 rounded-lg
                                bg-gradient-to-br ${tier.color}
                                flex items-center justify-center
                                shadow-lg
                                border-2 border-white dark:border-[#0a0d14]
                              `}
                            >
                              <TierIcon size={12} className="text-white" />
                            </div>

                            {/* نشان آماده/مشغول */}
                            <div
                              className={`
                                absolute -bottom-1 -right-1
                                w-5 h-5 rounded-full
                                border-2 border-white dark:border-[#0a0d14]
                                flex items-center justify-center
                                ${
                                  opponent.isAvailable
                                    ? "bg-emerald-500"
                                    : "bg-gray-400"
                                }
                              `}
                            >
                              {opponent.isAvailable && (
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              )}
                            </div>
                          </div>

                          {/* نام */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white truncate">
                              {opponent.firstName} {opponent.lastName}
                            </h3>

                            {/* رتبه */}
                            <div
                              className={`
                                mt-1.5 inline-flex items-center gap-1.5
                                px-2 py-1 rounded-lg
                                text-[10px] font-black
                                ${tier.bg} ${tier.text}
                              `}
                            >
                              <TierIcon size={11} />
                              {tier.label}
                            </div>
                          </div>
                        </div>

                        {/* ===== Rating بزرگ ===== */}
                        <div className="flex items-baseline justify-between mb-5 py-4 border-y border-gray-100 dark:border-white/5">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Trophy
                              size={13}
                              className="text-[var(--griffin-gold)]"
                            />
                            <span>Rating</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <p
                              className={`
                                font-heading text-3xl font-black
                                ${tier.text}
                              `}
                            >
                              {opponent.rating.toLocaleString("fa-IR")}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              pts
                            </span>
                          </div>
                        </div>

                        {/* ===== آمار ===== */}
                        <div className="grid grid-cols-3 gap-2 mb-5">
                          <div className="text-center rounded-xl bg-gray-50 dark:bg-white/5 py-2.5">
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">
                              نبرد
                            </p>
                            <p className="font-heading font-black text-sm text-gray-900 dark:text-white">
                              {opponent.matchesPlayed.toLocaleString("fa-IR")}
                            </p>
                          </div>
                          <div className="text-center rounded-xl bg-emerald-500/10 py-2.5">
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-0.5">
                              برد
                            </p>
                            <p className="font-heading font-black text-sm text-emerald-600 dark:text-emerald-400">
                              {opponent.wins.toLocaleString("fa-IR")}
                            </p>
                          </div>
                          <div className="text-center rounded-xl bg-rose-500/10 py-2.5">
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 mb-0.5">
                              باخت
                            </p>
                            <p className="font-heading font-black text-sm text-rose-600 dark:text-rose-400">
                              {opponent.losses.toLocaleString("fa-IR")}
                            </p>
                          </div>
                        </div>

                        {/* ===== نوار Win Rate ===== */}
                        <div className="mb-5">
                          <div className="flex items-center justify-between mb-1.5 text-[10px]">
                            <span className="text-gray-500 dark:text-gray-400 font-bold">
                              نرخ برد
                            </span>
                            <span className="font-black text-gray-900 dark:text-white">
                              {winRate.toLocaleString("fa-IR")}٪
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-1000"
                              style={{ width: `${winRate}%` }}
                            />
                          </div>
                        </div>

                        {/* ===== دکمه ===== */}
                        <button
                          type="button"
                          disabled={!opponent.isAvailable}
                          className={`
                            group/btn relative w-full overflow-hidden
                            rounded-xl py-3.5
                            font-black text-sm
                            flex items-center justify-center gap-2
                            transition-all duration-300
                            ${
                              opponent.isAvailable
                                ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/50 cursor-pointer"
                                : "bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                            }
                          `}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            {opponent.isAvailable ? (
                              <>
                                <Swords size={16} />
                                دعوت به مبارزه
                              </>
                            ) : (
                              <>
                                <Bot size={16} />
                                در حال نبرد
                              </>
                            )}
                          </span>
                          {opponent.isAvailable && (
                            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                          )}
                        </button>
                      </div>
                    </article>
                  </RevealOnScroll>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================== CTA پایین ==================== */}
        {opponents.length > 0 && (
          <RevealOnScroll>
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 border border-[var(--griffin-gold)]/20 p-6 md:p-8 text-center backdrop-blur-xl">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl" />

              <div className="relative space-y-3">
                <TrendingUp
                  size={32}
                  className="mx-auto text-[var(--griffin-gold)]"
                />
                <h3 className="font-heading text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                  حریفت رو انتخاب کن، آماده نبرد شو!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                  با کلیک روی «دعوت به مبارزه»، حریف انتخاب میشه و رقابت شروع
                  میشه. سریع‌تر و دقیق‌تر جواب بده تا برنده بشی! ⚔️
                </p>
              </div>
            </section>
          </RevealOnScroll>
        )}
      </div>
    </main>
  );
};

export default ArenaLobby;
