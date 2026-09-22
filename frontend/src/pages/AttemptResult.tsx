import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Flame,
  LoaderCircle,
  MinusCircle,
  RotateCcw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";

import { getAttemptResult } from "../services/attemptService";
import type { AttemptResultResponse } from "../types/attempt";
import AIAnalysisSection from "./components/AIAnalysisSection";
import GriffinMascot from "../components/common/GriffinMascot";

// ==================== ابزار ====================
const getPerformanceLevel = (percentage: number) => {
  if (percentage >= 85)
    return {
      level: "excellent",
      label: "عالی",
      message: "فوق‌العاده بود! ادامه بده",
    };
  if (percentage >= 70)
    return {
      level: "good",
      label: "خوب",
      message: "خیلی خوب بود! چند قدم تا عالی مونده",
    };
  if (percentage >= 50)
    return {
      level: "average",
      label: "قابل قبول",
      message: "خوب بود ولی جا برای بهتر شدن هست",
    };
  if (percentage >= 30)
    return {
      level: "weak",
      label: "نیاز به تلاش",
      message: "با تمرین بیشتر بهتر می‌شی، ناامید نشو",
    };
  return {
    level: "poor",
    label: "نیاز به توجه",
    message: "پایه‌ات رو قوی کن، تحلیل AI می‌تونه کمکت کنه",
  };
};

const getSubjectColor = (percentage: number) => {
  if (percentage >= 75)
    return {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      bar: "from-emerald-500 to-emerald-400",
    };
  if (percentage >= 50)
    return {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      bar: "from-amber-500 to-amber-400",
    };
  return {
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/30",
    bar: "from-rose-500 to-rose-400",
  };
};

// ==================== Count-up animation ====================
const useCountUp = (target: number, duration = 1500) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame: number;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
};

// ==================== کامپوننت ====================
const AttemptResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<AttemptResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================== Fetch ====================
  useEffect(() => {
    if (!id) return;

    const fetchResult = async () => {
      try {
        const result = await getAttemptResult(id);
        setData(result);
      } catch (err) {
        console.error("GET ATTEMPT RESULT ERROR:", err);
        setError("دریافت نتیجه آزمون با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    void fetchResult();
  }, [id]);

  // ==================== Derived ====================
  const performance = useMemo(() => {
    if (!data) return null;
    return getPerformanceLevel(data.result.percentage);
  }, [data]);

  const animatedPercentage = useCountUp(
    data ? Math.round(data.result.percentage) : 0,
    1500,
  );

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <LoaderCircle size={28} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت نتیجه...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error || !data || !performance) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-4">
            {error || "نتیجه آزمون پیدا نشد"}
          </p>
          <button
            onClick={() => navigate("/dashboard?section=exams")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg"
          >
            <ArrowLeft size={13} />
            بازگشت به آزمون‌ها
          </button>
        </div>
      </main>
    );
  }

  const { exam, result } = data;

  // ==================== 🆕 mascot بر اساس نمره ====================
  const mascotVariant =
    result.percentage >= 70
      ? "testGood"
      : result.percentage >= 40
        ? "testMedium"
        : "testBad";

  const mascotGlow =
    result.percentage >= 70
      ? "emerald"
      : result.percentage >= 40
        ? "amber"
        : "rose";

  const mascotAnimation =
    result.percentage >= 70
      ? "bounce"
      : result.percentage >= 40
        ? "float"
        : "wiggle";

  // ==================== Palette based on performance ====================
  const perfPalette = {
    excellent: {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      gradient: "from-emerald-500/20 via-transparent to-emerald-500/5",
      ring: "stroke-emerald-500",
      glow: "bg-emerald-500",
      icon: Trophy,
    },
    good: {
      text: "text-[var(--griffin-gold)]",
      bg: "bg-[var(--griffin-gold)]/10",
      border: "border-[var(--griffin-gold)]/30",
      gradient: "from-[var(--griffin-gold)]/20 via-transparent to-purple-500/5",
      ring: "stroke-[var(--griffin-gold)]",
      glow: "bg-[var(--griffin-gold)]",
      icon: Award,
    },
    average: {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      gradient: "from-amber-500/20 via-transparent to-orange-500/5",
      ring: "stroke-amber-500",
      glow: "bg-amber-500",
      icon: Target,
    },
    weak: {
      text: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      gradient: "from-orange-500/20 via-transparent to-rose-500/5",
      ring: "stroke-orange-500",
      glow: "bg-orange-500",
      icon: TrendingUp,
    },
    poor: {
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      gradient: "from-rose-500/20 via-transparent to-rose-500/5",
      ring: "stroke-rose-500",
      glow: "bg-rose-500",
      icon: TrendingDown,
    },
  }[performance.level];

  const total = result.totalQuestions || 0;
  const correctPct = total > 0 ? (result.correctAnswers / total) * 100 : 0;
  const wrongPct = total > 0 ? (result.wrongAnswers / total) * 100 : 0;
  const unansweredPct =
    total > 0 ? (result.unansweredQuestions / total) * 100 : 0;

  // SVG circle
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (animatedPercentage / 100) * circumference;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* ==================== HERO با mascot ==================== */}
        <section
          className={`relative rounded-[2rem] overflow-hidden border ${perfPalette.border} bg-gradient-to-br ${perfPalette.gradient} backdrop-blur-sm p-6 sm:p-8`}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
          <div
            className={`absolute -top-32 -right-32 w-80 h-80 rounded-full ${perfPalette.glow}/20 blur-[100px] pointer-events-none`}
          />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />

          {/* ==================== grid دو ستونه ==================== */}
          <div className="relative grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            {/* ===== متن ===== */}
            <div className="text-center lg:text-right space-y-4 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2">
                <Sparkles
                  size={11}
                  className="text-[var(--griffin-gold)] animate-pulse"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Exam Result
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                نتیجه آزمون
              </h1>

              <p className="text-sm text-gray-600 dark:text-gray-300">
                {exam.title}
              </p>

              <div
                className={`inline-flex items-center gap-2 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm px-4 py-2 border ${perfPalette.border}`}
              >
                <div className="text-right">
                  <p
                    className={`text-[10px] font-black uppercase tracking-widest ${perfPalette.text}`}
                  >
                    {performance.label}
                  </p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                    {performance.message}
                  </p>
                </div>
              </div>
            </div>

            {/* ===== mascot ===== */}
            <div className="relative order-1 lg:order-2 flex items-center justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px]">
                <GriffinMascot
                  variant={mascotVariant}
                  size="xl"
                  animation={mascotAnimation}
                  glowColor={mascotGlow}
                  halo
                  particles
                  className="w-full h-auto"
                />
              </div>

              {/* برچسب شناور */}
              <div className="absolute top-2 right-2 animate-[float_3s_ease-in-out_infinite]">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-xl border border-[var(--griffin-gold)]/30 shadow-2xl">
                  <div
                    className={`w-7 h-7 rounded-xl bg-gradient-to-br ${perfPalette.gradient} flex items-center justify-center ${perfPalette.text}`}
                  >
                    <perfPalette.icon size={13} />
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                      Score
                    </p>
                    <p className="text-[10px] font-black text-gray-900 dark:text-white tabular-nums">
                      {result.percentage.toLocaleString("fa-IR", {
                        maximumFractionDigits: 0,
                      })}
                      ٪
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SCORE CIRCLE ==================== */}
        <section
          className={`relative rounded-3xl overflow-hidden border ${perfPalette.border} bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-6 sm:p-8`}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

          <div className="relative flex flex-col sm:flex-row items-center gap-6">
            {/* Circle */}
            <div className="relative shrink-0">
              <div
                className={`absolute inset-0 ${perfPalette.glow} blur-3xl opacity-30 rounded-full`}
              />
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                className="relative -rotate-90"
              >
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-gray-200 dark:text-white/10"
                />
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className={perfPalette.ring}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset,
                    transition: "stroke-dashoffset 0.1s linear",
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p
                  className={`font-heading text-5xl font-black tabular-nums ${perfPalette.text}`}
                >
                  {animatedPercentage.toLocaleString("fa-IR")}
                  <span className="text-2xl">٪</span>
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">
                  درصد
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 w-full grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Zap size={11} className="text-[var(--griffin-gold)]" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    نمره
                  </span>
                </div>
                <p className="font-heading text-3xl font-black text-[var(--griffin-gold)] tabular-nums">
                  {result.score.toLocaleString("fa-IR")}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  از {total.toLocaleString("fa-IR")}
                </p>
              </div>

              <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Flame size={11} className="text-purple-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                    نمره منفی
                  </span>
                </div>
                <p className="font-heading text-3xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
                  {result.negativeScore.toLocaleString("fa-IR")}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  کسر شده
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== STATS ==================== */}
        <section className="grid grid-cols-3 gap-3">
          {[
            {
              icon: CheckCircle2,
              label: "صحیح",
              value: result.correctAnswers,
              percentage: correctPct,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/30",
            },
            {
              icon: XCircle,
              label: "غلط",
              value: result.wrongAnswers,
              percentage: wrongPct,
              color: "text-rose-600 dark:text-rose-400",
              bg: "bg-rose-500/10",
              border: "border-rose-500/30",
            },
            {
              icon: MinusCircle,
              label: "نزده",
              value: result.unansweredQuestions,
              percentage: unansweredPct,
              color: "text-gray-600 dark:text-gray-400",
              bg: "bg-gray-500/10",
              border: "border-gray-500/30",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`group relative rounded-2xl overflow-hidden border ${stat.border} ${stat.bg} backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1`}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon size={18} className={stat.color} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p
                  className={`font-heading text-2xl font-black mt-1 tabular-nums ${stat.color}`}
                >
                  {stat.value.toLocaleString("fa-IR")}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 tabular-nums">
                  {Math.round(stat.percentage).toLocaleString("fa-IR")}٪ از کل
                </p>
              </div>
            );
          })}
        </section>

        {/* ==================== SUBJECTS ==================== */}
        {result.subjects && result.subjects.length > 0 && (
          <section className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

            <div className="relative p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                  <Target size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Subjects
                  </p>
                  <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white -mt-0.5">
                    تحلیل درسی
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                {result.subjects.map((subject) => {
                  const palette = getSubjectColor(subject.percentage);
                  const totalSubj =
                    subject.correct + subject.wrong + subject.unanswered;

                  return (
                    <div
                      key={subject.lesson}
                      className={`relative rounded-2xl overflow-hidden border ${palette.border} bg-white/60 dark:bg-white/[0.02] p-4 transition-all duration-300 hover:shadow-lg`}
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${palette.bar} opacity-60`}
                      />

                      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl ${palette.bg} border ${palette.border} flex items-center justify-center ${palette.text}`}
                          >
                            <Zap size={14} strokeWidth={2.3} />
                          </div>
                          <div>
                            <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                              {subject.lesson}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              {totalSubj.toLocaleString("fa-IR")} سوال
                            </p>
                          </div>
                        </div>

                        <p
                          className={`font-heading text-2xl font-black tabular-nums ${palette.text}`}
                        >
                          {Math.round(subject.percentage).toLocaleString(
                            "fa-IR",
                          )}
                          <span className="text-sm">٪</span>
                        </p>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10 mb-3">
                        <div
                          className={`h-full rounded-full bg-gradient-to-l ${palette.bar} transition-all duration-1000 shadow-lg`}
                          style={{
                            width: `${Math.min(Math.max(subject.percentage, 0), 100)}%`,
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 py-1.5 text-center">
                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            صحیح
                          </p>
                          <p className="font-heading text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {subject.correct.toLocaleString("fa-IR")}
                          </p>
                        </div>
                        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 py-1.5 text-center">
                          <p className="text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                            غلط
                          </p>
                          <p className="font-heading text-sm font-black text-rose-600 dark:text-rose-400 tabular-nums">
                            {subject.wrong.toLocaleString("fa-IR")}
                          </p>
                        </div>
                        <div className="rounded-lg bg-gray-500/10 border border-gray-500/20 py-1.5 text-center">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">
                            نزده
                          </p>
                          <p className="font-heading text-sm font-black text-gray-600 dark:text-gray-400 tabular-nums">
                            {subject.unanswered.toLocaleString("fa-IR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ==================== AI ANALYSIS ==================== */}
        <AIAnalysisSection attemptId={data.attemptId} />

        {/* ==================== ACTIONS ==================== */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(`/attempts/${data.attemptId}/review`)}
            className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-4 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <ArrowLeft size={17} />
              مرور پاسخ‌ها
            </span>
            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard?section=exams")}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm px-6 py-4 text-sm font-black text-gray-700 dark:text-gray-200 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] hover:-translate-y-0.5 transition-all"
          >
            <RotateCcw
              size={17}
              className="transition-transform group-hover:rotate-180 duration-500"
            />
            بازگشت به آزمون‌ها
          </button>
        </section>
      </div>
    </main>
  );
};

export default AttemptResult;
