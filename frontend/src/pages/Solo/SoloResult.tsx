import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock3,
  Crown,
  Flame,
  Heart,
  Home,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Swords,
  Target,
  Trophy,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSoloStatus,
  LEVEL_LABELS,
  type SoloInfo,
  type SoloStatus,
} from "../../api/soloApi";

const SoloResult = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [solo, setSolo] = useState<SoloInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================== Load ====================
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getSoloStatus(id);
        setSolo(result.solo);
      } catch (err) {
        console.error("Failed to load solo result:", err);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "دریافت نتیجه انجام نشد";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

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
            در حال دریافت نتیجه...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error || !solo) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <AlertCircle size={28} className="text-rose-500" />
          </div>
          <p className="font-bold text-rose-500">{error || "نتیجه پیدا نشد"}</p>
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
  const {
    status,
    level,
    correctAnswers,
    wrongAnswers,
    timeouts,
    livesRemaining,
    totalQuestions,
    answeredCount,
    totalTimeMs,
    league,
  } = solo;

  const totalWrong = wrongAnswers + timeouts;
  const score = correctAnswers;
  const maxScore = totalQuestions;
  const scorePercent = Math.round((score / maxScore) * 100);

  const isWon = status === "won";
  const isLost = status === "lost";
  const isAbandoned = status === "abandoned";

  const formatTime = (ms: number | null) => {
    if (!ms) return "—";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toLocaleString("fa-IR")}:${String(secs).padStart(2, "0")}`;
  };

  // ==================== JSX ====================
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14 bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
      {/* پسزمینه تزئینی */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`
            absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px]
            ${
              isWon
                ? "bg-emerald-500/25"
                : isAbandoned
                  ? "bg-gray-500/20"
                  : "bg-rose-500/25"
            }
          `}
        />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto space-y-6">
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

        {/* ==================== کارت اصلی نتیجه ==================== */}
        <section
          className={`
            relative rounded-[2rem] overflow-hidden border-2 backdrop-blur-xl p-8 sm:p-12 text-center
            ${
              isWon
                ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent shadow-[0_30px_100px_-20px_rgba(16,185,129,0.4)]"
                : isAbandoned
                  ? "border-gray-500/40 bg-gradient-to-br from-gray-500/10 via-transparent to-transparent"
                  : "border-rose-500/40 bg-gradient-to-br from-rose-500/15 via-transparent to-transparent shadow-[0_30px_100px_-20px_rgba(244,63,94,0.4)]"
            }
          `}
        >
          {/* خط بالا */}
          <div
            className={`
              absolute top-0 left-0 right-0 h-1
              ${
                isWon
                  ? "bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                  : isAbandoned
                    ? "bg-gradient-to-r from-transparent via-gray-500 to-transparent"
                    : "bg-gradient-to-r from-transparent via-rose-500 to-transparent"
              }
            `}
          />

          {/* آیکون بزرگ */}
          <div className="relative inline-flex mb-6">
            <div
              className={`
                absolute inset-0 blur-3xl opacity-60 animate-pulse
                ${isWon ? "bg-emerald-500" : isAbandoned ? "bg-gray-500" : "bg-rose-500"}
              `}
            />
            <div
              className={`
                relative w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/20
                ${
                  isWon
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                    : isAbandoned
                      ? "bg-gradient-to-br from-gray-500 to-gray-700"
                      : "bg-gradient-to-br from-rose-500 to-rose-700"
                }
              `}
            >
              {isWon ? (
                <Trophy size={44} strokeWidth={2.3} />
              ) : isAbandoned ? (
                <X size={44} strokeWidth={2.3} />
              ) : (
                <XCircle size={44} strokeWidth={2.3} />
              )}
            </div>

            {/* بجهای تزئینی */}
            {isWon && (
              <>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-[var(--griffin-gold)] flex items-center justify-center shadow-lg rotate-12 border-2 border-[#080B12]">
                  <Crown size={14} fill="white" className="text-white" />
                </span>
                <span className="absolute -bottom-2 -left-2 w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg -rotate-12 border-2 border-[#080B12]">
                  <Sparkles size={14} className="text-white" />
                </span>
              </>
            )}
          </div>

          {/* تیتر */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
            <span
              className={`
                w-1.5 h-1.5 rounded-full animate-pulse
                ${isWon ? "bg-emerald-500" : isAbandoned ? "bg-gray-500" : "bg-rose-500"}
              `}
            />
            <span
              className={`
                text-[10px] font-black uppercase tracking-widest
                ${
                  isWon
                    ? "text-emerald-400"
                    : isAbandoned
                      ? "text-gray-400"
                      : "text-rose-400"
                }
              `}
            >
              {isWon ? "Victory" : isAbandoned ? "Abandoned" : "Defeat"}
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-black leading-tight mb-3">
            {isWon ? (
              <>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-400 to-emerald-300">
                  برنده شدی!
                </span>
              </>
            ) : isAbandoned ? (
              <>
                <span className="text-gray-400">انصراف دادی</span>
              </>
            ) : (
              <>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-rose-400 to-rose-300">
                  باختی
                </span>
              </>
            )}
          </h1>

          <p className="text-sm text-gray-400 leading-7 max-w-md mx-auto">
            {isWon
              ? `با ${livesRemaining.toLocaleString("fa-IR")} جان باقیمانده، ۵ سوال رو با موفقیت پشت سر گذاشتی!`
              : isAbandoned
                ? "این بازی بهعنوان باخت ثبت شد. دفعه بعد تا آخر بمون!"
                : "جانها تموم شد. دفعه بعد بهتر میتونی!"}
          </p>

          {/* اطلاعات لیگ */}
          <div className="mt-5 inline-flex items-center gap-2 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm text-[10px] font-black text-gray-300">
              <Swords size={11} />
              {league.title}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm text-[10px] font-black text-gray-300">
              <Target size={11} />
              {LEVEL_LABELS[level]}
            </span>
          </div>
        </section>

        {/* ==================== کارتهای آماری ==================== */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: CheckCircle2,
              label: "درست",
              value: correctAnswers,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
            },
            {
              icon: XCircle,
              label: "غلط",
              value: wrongAnswers,
              color: "text-rose-400",
              bg: "bg-rose-500/10",
              border: "border-rose-500/20",
            },
            {
              icon: Clock3,
              label: "تایماوت",
              value: timeouts,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
            },
            {
              icon: Heart,
              label: "جان باقی",
              value: livesRemaining,
              color: "text-purple-400",
              bg: "bg-purple-500/10",
              border: "border-purple-500/20",
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
                    w-10 h-10 mx-auto rounded-xl ${stat.bg}
                    flex items-center justify-center mb-3
                    transition-transform duration-300 group-hover:scale-110
                  `}
                >
                  <Icon size={18} className={stat.color} strokeWidth={2.4} />
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

        {/* ==================== خلاصه ==================== */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Summary
              </p>
              <h2 className="font-heading text-base font-black text-white -mt-0.5">
                خلاصه بازی
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {/* امتیاز */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.02] border border-white/5 p-3">
              <span className="flex items-center gap-2 text-xs text-gray-400">
                <Target size={13} className="text-purple-400" />
                امتیاز
              </span>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-black text-purple-400 tabular-nums">
                  {score.toLocaleString("fa-IR")} /{" "}
                  {maxScore.toLocaleString("fa-IR")}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-400 text-[10px] font-black tabular-nums">
                  {scorePercent.toLocaleString("fa-IR")}٪
                </span>
              </div>
            </div>

            {/* پیشرفت */}
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <Flame size={13} className="text-[var(--griffin-gold)]" />
                  پیشرفت
                </span>
                <span className="text-[10px] font-black text-gray-500 tabular-nums">
                  {answeredCount.toLocaleString("fa-IR")} /{" "}
                  {totalQuestions.toLocaleString("fa-IR")}
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`
                    h-full rounded-full transition-all duration-1000
                    ${
                      isWon
                        ? "bg-gradient-to-l from-emerald-500 to-emerald-400"
                        : "bg-gradient-to-l from-rose-500 to-rose-400"
                    }
                  `}
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
            </div>

            {/* زمان */}
            {totalTimeMs && totalTimeMs > 0 && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.02] border border-white/5 p-3">
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock3 size={13} className="text-blue-400" />
                  زمان کل
                </span>
                <span className="font-heading text-sm font-black text-blue-400 tabular-nums">
                  {formatTime(totalTimeMs)}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* ==================== دکمهها ==================== */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* بازی جدید */}
          <button
            type="button"
            onClick={() => navigate("/solo/setup")}
            className="
              group relative
              inline-flex items-center justify-center gap-2
              rounded-2xl
              bg-gradient-to-l from-purple-500 to-purple-700
              px-4 py-4
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

          {/* تاریخچه */}
          <button
            type="button"
            onClick={() => navigate("/solo/history")}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm
              px-4 py-4
              font-heading font-black text-gray-300 text-sm
              hover:border-purple-500/40 hover:text-purple-400 hover:bg-purple-500/5
              hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            <Calendar size={16} />
            تاریخچه
          </button>

          {/* آمار */}
          <button
            type="button"
            onClick={() => navigate("/solo/stats")}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm
              px-4 py-4
              font-heading font-black text-gray-300 text-sm
              hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5
              hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            <BarChart3 size={16} />
            آمار
          </button>

          {/* آرنا */}
          <button
            type="button"
            onClick={() => navigate("/arena")}
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm
              px-4 py-4
              font-heading font-black text-gray-300 text-sm
              hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/5
              hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            <Home size={16} />
            آرنا
          </button>
        </section>

        {/* ==================== نکته ==================== */}
        <p className="text-center text-[11px] text-gray-600 leading-6 max-w-md mx-auto">
          بازی انفرادی روی ریتینگ آرنا اثری نداره و فقط برای تمرین و بهبود سرعت
          پاسخدهی طراحی شده.
        </p>
      </div>
    </main>
  );
};

export default SoloResult;
