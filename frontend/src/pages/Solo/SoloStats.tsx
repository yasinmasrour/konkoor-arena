import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  Crown,
  Flame,
  Gauge,
  History,
  LoaderCircle,
  Medal,
  RotateCcw,
  Sparkles,
  Swords,
  TrendingUp,
  Trophy,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getSoloStats,
  LEVEL_COLORS,
  LEVEL_LABELS,
  type SoloStats as SoloStatsType,
  type SoloLevel,
} from "../../api/soloApi";

const SoloStats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SoloStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================== Load ====================
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getSoloStats();
        if (!cancelled) setStats(result.stats);
      } catch (err) {
        console.error("Failed to load solo stats:", err);
        if (!cancelled) setError("دریافت آمار انجام نشد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <LoaderCircle size={28} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500">
            در حال دریافت آمار...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error || !stats) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <AlertCircle size={28} className="text-rose-500" />
          </div>
          <p className="font-bold text-rose-500">{error || "آماری پیدا نشد"}</p>
          <button
            onClick={() => navigate("/solo/setup")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-bold hover:opacity-90 transition"
          >
            بازگشت
          </button>
        </div>
      </main>
    );
  }

  // ==================== Computed ====================
  const { total, won, lost, abandoned, winRate, byLevel, fastestWin } = stats;

  const formatTime = (ms: number | null) => {
    if (!ms) return "—";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes === 0) return `${secs} ثانیه`;
    return `${minutes}:${String(secs).padStart(2, "0")} دقیقه`;
  };

  const formatDate = (value: string | null) => {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  };

  // 🔹 سطح با بیشترین بازی
  const favoriteLevel = byLevel.reduce(
    (max, curr) => (curr.count > (max?.count ?? 0) ? curr : max),
    byLevel[0],
  );

  // ==================== JSX ====================
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12 bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
      {/* پسزمینه */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto space-y-6">
        {/* ==================== Back ==================== */}
        <button
          type="button"
          onClick={() => navigate("/arena")}
          className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-400 transition"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت به آرنا
        </button>

        {/* ==================== هدر ==================== */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/25 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0 self-center sm:self-auto">
              <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                <BarChart3 size={32} strokeWidth={2.3} />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-right">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">
                  Solo Stats
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                آمار بازیهای انفرادی
              </h1>

              <p className="mt-1.5 text-sm text-gray-400">
                نگاهی به عملکردت در بازیهای انفرادی
              </p>
            </div>

            <div className="shrink-0 self-center sm:self-auto flex gap-2">
              <button
                type="button"
                onClick={() => navigate("/solo/history")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-black text-gray-300 text-xs hover:border-purple-500/40 hover:text-purple-400 transition-all"
              >
                <History size={13} />
                تاریخچه
              </button>

              <button
                type="button"
                onClick={() => navigate("/solo/setup")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-purple-500 to-purple-700 px-4 py-2.5 font-black text-white text-xs shadow-lg shadow-purple-500/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <Swords size={13} />
                بازی جدید
              </button>
            </div>
          </div>
        </section>

        {/* ==================== اگر بازیای نداری ==================== */}
        {total === 0 ? (
          <section className="relative rounded-3xl overflow-hidden border border-dashed border-gray-500/30 bg-white/[0.02] backdrop-blur-sm p-12 text-center">
            <div className="relative inline-flex mb-5">
              <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-40 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                <BarChart3 size={36} strokeWidth={2.3} />
              </div>
            </div>

            <h2 className="font-heading text-xl font-black text-white mb-3">
              هنوز بازی انفرادی نکردی
            </h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto leading-7 mb-6">
              با شروع یه بازی انفرادی، آمارت اینجا نمایش داده میشه.
            </p>

            <button
              type="button"
              onClick={() => navigate("/solo/setup")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-purple-500 to-purple-700 px-6 py-3.5 font-heading font-black text-white text-sm shadow-lg shadow-purple-500/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Swords size={16} />
              شروع اولین بازی
            </button>
          </section>
        ) : (
          <>
            {/* ==================== کارتهای اصلی ==================== */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  icon: Swords,
                  label: "کل بازیها",
                  value: total,
                  color: "text-purple-400",
                  bg: "bg-purple-500/10",
                  border: "border-purple-500/20",
                },
                {
                  icon: Trophy,
                  label: "بردها",
                  value: won,
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                  border: "border-emerald-500/20",
                },
                {
                  icon: XCircle,
                  label: "باختها",
                  value: lost,
                  color: "text-rose-400",
                  bg: "bg-rose-500/10",
                  border: "border-rose-500/20",
                },
                {
                  icon: X,
                  label: "انصرافها",
                  value: abandoned,
                  color: "text-gray-400",
                  bg: "bg-gray-500/10",
                  border: "border-gray-500/20",
                },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className={`
                      group relative rounded-2xl overflow-hidden border
                      ${stat.border} ${stat.bg}
                      backdrop-blur-sm p-4 text-center
                      transition-all duration-300 hover:-translate-y-1
                    `}
                  >
                    <div
                      className={`
                        w-11 h-11 mx-auto rounded-xl ${stat.bg}
                        flex items-center justify-center mb-3
                        transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                      `}
                    >
                      <Icon
                        size={20}
                        className={stat.color}
                        strokeWidth={2.4}
                      />
                    </div>
                    <p
                      className={`
                        font-heading text-3xl font-black tabular-nums
                        ${stat.color}
                      `}
                    >
                      {stat.value.toLocaleString("fa-IR")}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </section>

            {/* ==================== نرخ برد ==================== */}
            <section className="relative rounded-2xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-amber-500/5 to-transparent backdrop-blur-sm p-6">
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-3xl pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                      <TrendingUp size={28} strokeWidth={2.3} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                      Win Rate
                    </p>
                    <h3 className="font-heading text-lg font-black text-white -mt-0.5">
                      نرخ برد
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      از {total.toLocaleString("fa-IR")} بازی
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-2">
                  <p className="font-heading text-5xl font-black text-[var(--griffin-gold)] tabular-nums leading-none">
                    {winRate.toLocaleString("fa-IR")}
                    <span className="text-2xl">٪</span>
                  </p>
                </div>
              </div>

              {/* نوار پیشرفت */}
              <div className="mt-5 h-3 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400 transition-all duration-1000 shadow-lg shadow-[var(--griffin-gold)]/50"
                  style={{ width: `${winRate}%` }}
                />
              </div>

              {/* تفکیک برد/باخت */}
              <div className="mt-4 flex items-center justify-between gap-3 text-[10px]">
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-black">
                  <CheckCircle2 size={11} />
                  {won.toLocaleString("fa-IR")} برد
                </span>
                <span className="inline-flex items-center gap-1.5 text-rose-400 font-black">
                  <XCircle size={11} />
                  {lost.toLocaleString("fa-IR")} باخت
                </span>
                <span className="inline-flex items-center gap-1.5 text-gray-400 font-black">
                  <X size={11} />
                  {abandoned.toLocaleString("fa-IR")} انصراف
                </span>
              </div>
            </section>

            {/* ==================== توزیع سطحها ==================== */}
            {byLevel.length > 0 && (
              <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Gauge size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      By Level
                    </p>
                    <h2 className="font-heading text-base font-black text-white -mt-0.5">
                      توزیع سطحها
                    </h2>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {(["easy", "medium", "hard"] as SoloLevel[]).map((level) => {
                    const levelStats = byLevel.find((b) => b.level === level);
                    const count = levelStats?.count ?? 0;
                    const percent =
                      total > 0 ? Math.round((count / total) * 100) : 0;
                    const colors = LEVEL_COLORS[level];
                    const isFavorite = favoriteLevel?.level === level;

                    return (
                      <div
                        key={level}
                        className={`
                          relative rounded-xl border p-4
                          ${colors.border} ${colors.bg}
                          transition-all duration-300 hover:-translate-y-1
                          ${isFavorite ? "ring-2 ring-[var(--griffin-gold)]/30" : ""}
                        `}
                      >
                        {isFavorite && (
                          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-lg bg-[var(--griffin-gold)] flex items-center justify-center shadow-lg border-2 border-[#080B12]">
                            <Crown
                              size={11}
                              className="text-white"
                              fill="white"
                            />
                          </span>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className={`
                              w-8 h-8 rounded-lg flex items-center justify-center
                              bg-gradient-to-br ${colors.gradient} text-white shadow-lg
                            `}
                          >
                            <Gauge size={14} strokeWidth={2.4} />
                          </div>
                          <span
                            className={`font-heading text-sm font-black ${colors.text}`}
                          >
                            {LEVEL_LABELS[level]}
                          </span>
                        </div>

                        <p
                          className={`font-heading text-2xl font-black tabular-nums ${colors.text}`}
                        >
                          {count.toLocaleString("fa-IR")}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          {percent.toLocaleString("fa-IR")}٪ از کل
                        </p>

                        {/* نوار پیشرفت */}
                        <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-l ${colors.gradient} transition-all duration-1000`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ==================== بهترین رکورد ==================== */}
            {fastestWin && (
              <section className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent backdrop-blur-sm p-6">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
                  {/* آیکون */}
                  <div className="relative shrink-0 self-center sm:self-auto">
                    <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-60 animate-pulse" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                      <Award size={28} strokeWidth={2.3} />
                    </div>
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-lg bg-[var(--griffin-gold)] flex items-center justify-center shadow-lg border-2 border-[#080B12]">
                      <Crown size={10} className="text-white" fill="white" />
                    </span>
                  </div>

                  {/* متن */}
                  <div className="flex-1 text-center sm:text-right">
                    <div className="inline-flex items-center gap-2 mb-2">
                      <Sparkles
                        size={11}
                        className="text-emerald-400 animate-pulse"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        Fastest Win
                      </span>
                    </div>
                    <h3 className="font-heading text-xl font-black text-white">
                      سریعترین برد
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      بهترین رکوردت در بازیهای انفرادی
                    </p>
                  </div>

                  {/* آمار */}
                  <div className="shrink-0 flex items-center gap-3 justify-center sm:justify-start">
                    <div className="text-center px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">
                        زمان
                      </p>
                      <p className="font-heading text-2xl font-black text-emerald-400 tabular-nums leading-none">
                        {formatTime(fastestWin.totalTimeMs)}
                      </p>
                    </div>

                    <div className="text-center px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-1">
                        سطح
                      </p>
                      <p className="font-heading text-sm font-black text-purple-400 leading-none">
                        {LEVEL_LABELS[fastestWin.level]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* تاریخ */}
                <div className="mt-4 flex items-center justify-center sm:justify-start gap-1.5 text-[10px] text-gray-500">
                  <Calendar size={10} />
                  {formatDate(fastestWin.finishedAt)}
                </div>
              </section>
            )}

            {/* ==================== خلاصه عملکرد ==================== */}
            <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                  <Medal size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Summary
                  </p>
                  <h2 className="font-heading text-base font-black text-white -mt-0.5">
                    خلاصه عملکرد
                  </h2>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: CheckCircle2,
                    label: "نرخ برد",
                    value: `${winRate.toLocaleString("fa-IR")}٪`,
                    color: "text-emerald-400",
                  },
                  {
                    icon: Flame,
                    label: "سطح محبوب",
                    value: favoriteLevel
                      ? LEVEL_LABELS[favoriteLevel.level as SoloLevel]
                      : "—",
                    color: "text-[var(--griffin-gold)]",
                  },
                  {
                    icon: Trophy,
                    label: "نسبت برد",
                    value: `${won.toLocaleString("fa-IR")} از ${total.toLocaleString("fa-IR")}`,
                    color: "text-purple-400",
                  },
                  {
                    icon: Zap,
                    label: "مجموع بازی",
                    value: total.toLocaleString("fa-IR"),
                    color: "text-blue-400",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.02] border border-white/5 p-3"
                    >
                      <span className="flex items-center gap-2 text-xs text-gray-400">
                        <Icon size={14} className={item.color} />
                        {item.label}
                      </span>
                      <span
                        className={`font-heading text-sm font-black tabular-nums ${item.color}`}
                      >
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ==================== دکمهها ==================== */}
            <section className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate("/solo/setup")}
                className="
                  group relative flex-1
                  inline-flex items-center justify-center gap-2
                  rounded-2xl
                  bg-gradient-to-l from-purple-500 to-purple-700
                  px-6 py-4
                  font-heading font-black text-white text-sm
                  shadow-lg shadow-purple-500/40
                  hover:shadow-xl hover:shadow-purple-500/60
                  hover:-translate-y-0.5
                  transition-all duration-300
                  overflow-hidden
                "
              >
                <span className="relative z-10 flex items-center gap-2">
                  <RotateCcw
                    size={16}
                    className="transition-transform group-hover:rotate-180 duration-500"
                  />
                  بازی جدید
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/solo/history")}
                className="
                  flex-1 inline-flex items-center justify-center gap-2
                  rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm
                  px-6 py-4
                  font-heading font-black text-gray-300 text-sm
                  hover:border-purple-500/40 hover:text-purple-400 hover:bg-purple-500/5
                  hover:-translate-y-0.5
                  transition-all duration-300
                "
              >
                <History size={16} />
                تاریخچه کامل
              </button>
            </section>
          </>
        )}

        {/* ==================== نکته ==================== */}
        <p className="text-center text-[11px] text-gray-600 leading-6 max-w-md mx-auto">
          بازیهای انفرادی روی ریتینگ آرنا اثری ندارن و فقط برای تمرین و بهبود
          سرعت پاسخدهی طراحی شدن.
        </p>
      </div>
    </main>
  );
};

export default SoloStats;
