import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Crown,
  Flame,
  Lightbulb,
  LoaderCircle,
  Lock,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { generateAIAnalysis } from "../../api/aiAnalysisApi";
import type {
  AIAnalysisData,
  AIAnalysisComparisonWithAverage,
} from "../../api/aiAnalysisApi";
import { useAuth } from "../../context/AuthContext";

interface AIAnalysisSectionProps {
  attemptId: string;
}

const AIAnalysisSection = ({ attemptId }: AIAnalysisSectionProps) => {
  const { hasFeature, user } = useAuth();
  const [analysis, setAnalysis] = useState<AIAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasAccess = !!user && hasFeature("ai-analysis");

  const handleGenerate = async () => {
    if (loading || analysis) return;

    setLoading(true);
    setError("");

    try {
      const result = await generateAIAnalysis(attemptId);
      setAnalysis(result.analysis);
    } catch (requestError) {
      console.error("AI ANALYSIS ERROR:", requestError);
      setError(
        "دریافت تحلیل هوش مصنوعی با مشکل مواجه شد. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 🆕 اگه دسترسی نداره → LockedAIAnalysis
  if (!hasAccess) {
    return <LockedAIAnalysis />;
  }

  return (
    <section className="relative mt-6 rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

      <div className="relative p-6 sm:p-8">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60 animate-pulse" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <BrainCircuit size={24} strokeWidth={2.3} />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 mb-1.5">
                <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  AI-Powered
                </span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                تحلیل هوش مصنوعی
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-gray-500 dark:text-gray-400 max-w-xl">
                عملکردت در این آزمون رو با کمک هوش مصنوعی بررسی می‌کنیم و
                پیشنهادهای مطالعه اختصاصی ارائه می‌دیم.
              </p>
            </div>
          </div>

          {!analysis && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    در حال تحلیل...
                  </>
                ) : (
                  <>
                    <Wand2 size={17} />
                    دریافت تحلیل
                  </>
                )}
              </span>
              {!loading && (
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
            </button>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="relative mt-6 rounded-2xl overflow-hidden border border-rose-500/30 bg-gradient-to-l from-rose-500/10 to-transparent backdrop-blur-sm p-4 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                <AlertCircle size={16} className="text-rose-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="group mt-2 inline-flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400 hover:underline underline-offset-4"
                >
                  <RefreshCw
                    size={12}
                    className="transition-transform group-hover:rotate-180 duration-500"
                  />
                  تلاش مجدد
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ANALYSIS */}
        {analysis && (
          <div className="mt-8 space-y-6">
            <OverallCard overall={analysis.overall} />

            {analysis.comparison && (
              <ComparisonCard
                withAverage={analysis.comparison.withAverage}
                interpretation={analysis.comparison.interpretation}
              />
            )}

            {analysis.strengths.length > 0 && (
              <AnalysisList
                title="نقاط قوت"
                subtitle="چیزهایی که خوب عمل کردی"
                icon={<CheckCircle2 size={16} />}
                color="emerald"
                items={analysis.strengths.map((s) => ({
                  title: s.title,
                  description: s.evidence,
                  extra: s.why,
                  extraLabel: "چرا؟",
                }))}
              />
            )}

            {analysis.weaknesses.length > 0 && (
              <AnalysisList
                title="نقاط قابل بهبود"
                subtitle="جایی که می‌تونی بهتر بشی"
                icon={<Target size={16} />}
                color="rose"
                items={analysis.weaknesses.map((w) => ({
                  title: w.title,
                  description: w.evidence,
                  extra: w.possibleCause || undefined,
                  extraLabel: "علت احتمالی",
                }))}
              />
            )}

            {Object.keys(analysis.subjectAnalysis).length > 0 && (
              <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

                <div className="relative p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Subjects
                      </p>
                      <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white -mt-0.5">
                        تحلیل دروس
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(analysis.subjectAnalysis).map(
                      ([subject, subjectData]) => (
                        <SubjectCard
                          key={subject}
                          subject={subject}
                          data={subjectData}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}

            {analysis.priorities.length > 0 && (
              <PrioritiesList priorities={analysis.priorities} />
            )}

            {analysis.recommendations.length > 0 && (
              <AnalysisList
                title="پیشنهادهای هوش مصنوعی"
                subtitle="راهکارهای عملی"
                icon={<Lightbulb size={16} />}
                color="gold"
                items={analysis.recommendations.map((r) => ({
                  title: r.title,
                  description: r.description,
                }))}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AIAnalysisSection;

// ==================== 🆕 LockedAIAnalysis ====================
const LockedAIAnalysis = () => {
  const navigate = useNavigate();

  return (
    <section className="relative mt-6 rounded-[2rem] overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 backdrop-blur-sm p-8 sm:p-12 text-center">
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/15 blur-[100px] pointer-events-none" />

      <div className="relative space-y-5">
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
            <Lock size={36} strokeWidth={2.3} />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30">
          <Crown size={12} className="text-[var(--griffin-gold)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
            نیاز به اشتراک
          </span>
        </div>

        <h2 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          تحلیل هوشمند AI
        </h2>

        <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto rounded-full" />

        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-7">
          برای مشاهده تحلیل هوشمند عملکردت، نیاز به اشتراک{" "}
          <span className="font-black text-[var(--griffin-gold)]">
            طلایی (VIP)
          </span>{" "}
          داری.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate("/subscriptions")}
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Crown size={16} />
              مشاهده پلن‌ها
            </span>
            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

// ==================== OverallCard ====================
interface OverallCardProps {
  overall: {
    summary: string;
    keyTakeaway: string;
    performanceLevel: string | null;
  };
}

const OverallCard = ({ overall }: OverallCardProps) => {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-amber-500/5 to-transparent backdrop-blur-sm p-5">
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[var(--griffin-gold)]/15 blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30 flex items-center justify-center text-[var(--griffin-gold)]">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Summary
              </p>
              <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                جمع‌بندی عملکرد
              </h3>
            </div>
          </div>

          {overall.performanceLevel && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30 px-3 py-1.5 text-[11px] font-black text-[var(--griffin-gold)]">
              {overall.performanceLevel}
            </span>
          )}
        </div>

        <p className="text-sm leading-7 text-gray-700 dark:text-gray-200">
          {overall.summary}
        </p>

        <div className="mt-4 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 p-3">
          <div className="flex items-start gap-2">
            <Flame
              size={13}
              className="text-[var(--griffin-gold)] shrink-0 mt-0.5"
            />
            <p className="text-xs leading-6 font-bold text-gray-700 dark:text-gray-200">
              {overall.keyTakeaway}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== ComparisonCard ====================
interface ComparisonCardProps {
  withAverage: AIAnalysisComparisonWithAverage;
  interpretation: string;
}

const ComparisonCard = ({
  withAverage,
  interpretation,
}: ComparisonCardProps) => {
  const {
    yourScore,
    averageScore,
    difference,
    participantsCount,
    level,
    percentile,
  } = withAverage;

  const levelPalette = {
    بالاتر: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-600 dark:text-emerald-400",
      icon: "text-emerald-500",
      label: "بالاتر از میانگین",
    },
    پایین‌تر: {
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      text: "text-rose-600 dark:text-rose-400",
      icon: "text-rose-500",
      label: "پایین‌تر از میانگین",
    },
    برابر: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-600 dark:text-amber-400",
      icon: "text-amber-500",
      label: "نزدیک به میانگین",
    },
  }[level] || {
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
    text: "text-gray-600 dark:text-gray-400",
    icon: "text-gray-500",
    label: "—",
  };

  const formatDiff = (d: number) => {
    const abs = Math.abs(d);
    const sign = d > 0 ? "+" : d < 0 ? "−" : "";
    return `${sign}${abs.toLocaleString("fa-IR")}`;
  };

  return (
    <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

      <div className="relative p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
            <BarChart3 size={18} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Comparison
            </p>
            <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white -mt-0.5">
              مقایسه با میانگین
            </h3>
          </div>

          <span
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black ${levelPalette.bg} ${levelPalette.text} border ${levelPalette.border}`}
          >
            {levelPalette.label}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <StatBox
            label="نمره تو"
            value={yourScore.toLocaleString("fa-IR")}
            color="text-[var(--griffin-gold)]"
            bg="bg-[var(--griffin-gold)]/10"
          />
          <StatBox
            label="میانگین"
            value={averageScore.toLocaleString("fa-IR")}
            color="text-blue-600 dark:text-blue-400"
            bg="bg-blue-500/10"
          />
          <StatBox
            label="تفاوت"
            value={formatDiff(difference)}
            color={levelPalette.text}
            bg={levelPalette.bg}
          />
          <StatBox
            label="شرکت‌کنندگان"
            value={participantsCount.toLocaleString("fa-IR")}
            color="text-purple-600 dark:text-purple-400"
            bg="bg-purple-500/10"
          />
        </div>

        {percentile !== null && (
          <div className="mb-4 rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/70 dark:border-white/5 p-3">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                جایگاه تقریبی
              </span>
              <span className="text-xs font-black text-gray-900 dark:text-white tabular-nums">
                {percentile.toLocaleString("fa-IR")}٪
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-l ${levelPalette.bg.replace(
                  "/10",
                  "",
                )} ${levelPalette.text.replace("text-", "bg-")} transition-all duration-1000`}
                style={{
                  width: `${percentile}%`,
                }}
              />
            </div>
            <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">
              {percentile >= 50
                ? `از ${percentile.toLocaleString("fa-IR")}٪ شرکت‌کنندگان عملکرد بهتری داشتی`
                : `${(100 - percentile).toLocaleString("fa-IR")}٪ شرکت‌کنندگان عملکرد بهتری داشتن`}
            </p>
          </div>
        )}

        <div
          className={`rounded-xl ${levelPalette.bg} border ${levelPalette.border} p-3.5`}
        >
          <p className="text-xs leading-6 text-gray-700 dark:text-gray-200">
            {interpretation}
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== StatBox ====================
interface StatBoxProps {
  label: string;
  value: string;
  color: string;
  bg: string;
}

const StatBox = ({ label, value, color, bg }: StatBoxProps) => (
  <div className={`rounded-xl ${bg} py-2.5 text-center`}>
    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-0.5">
      {label}
    </p>
    <p className={`font-heading text-base font-black tabular-nums ${color}`}>
      {value}
    </p>
  </div>
);

// ==================== AnalysisList ====================
interface AnalysisListItem {
  title: string;
  description: string;
  extra?: string;
  extraLabel?: string;
}

interface AnalysisListProps {
  title: string;
  subtitle?: string;
  items: AnalysisListItem[];
  icon: ReactNode;
  color: "emerald" | "rose" | "amber" | "gold";
}

const AnalysisList = ({
  title,
  subtitle,
  items,
  icon,
  color,
}: AnalysisListProps) => {
  const palette = {
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-600 dark:text-emerald-400",
      icon: "text-emerald-500",
    },
    rose: {
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      text: "text-rose-600 dark:text-rose-400",
      icon: "text-rose-500",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-600 dark:text-amber-400",
      icon: "text-amber-500",
    },
    gold: {
      bg: "bg-[var(--griffin-gold)]/10",
      border: "border-[var(--griffin-gold)]/30",
      text: "text-[var(--griffin-gold)]",
      icon: "text-[var(--griffin-gold)]",
    },
  }[color];

  return (
    <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

      <div className="relative p-5">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`relative w-10 h-10 rounded-2xl flex items-center justify-center ${palette.bg} ${palette.icon} border ${palette.border}`}
          >
            {icon}
          </div>
          <div>
            <p
              className={`text-[10px] font-black uppercase tracking-widest ${palette.text}`}
            >
              {title}
            </p>
            {subtitle && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 -mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <ul className="space-y-3">
          {items.map((item, i) => (
            <li
              key={i}
              className={`group relative rounded-xl p-4 ${palette.bg} border ${palette.border} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`w-6 h-6 rounded-full shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-black ${palette.bg} ${palette.text} border ${palette.border}`}
                >
                  {(i + 1).toLocaleString("fa-IR")}
                </span>
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs leading-6 text-gray-700 dark:text-gray-300">
                    {item.description}
                  </p>
                  {item.extra && (
                    <div className="rounded-lg bg-black/5 dark:bg-white/5 border border-white/5 p-2.5">
                      {item.extraLabel && (
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                          {item.extraLabel}
                        </p>
                      )}
                      <p className="text-[11px] leading-5 text-gray-600 dark:text-gray-300">
                        {item.extra}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// ==================== PrioritiesList ====================
interface Priority {
  topic: string;
  priority: "بالا" | "متوسط" | "پایین";
  reason: string;
}

interface PrioritiesListProps {
  priorities: Priority[];
}

const PrioritiesList = ({ priorities }: PrioritiesListProps) => {
  const priorityColors = {
    بالا: {
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      text: "text-rose-600 dark:text-rose-400",
    },
    متوسط: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-600 dark:text-amber-400",
    },
    پایین: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-600 dark:text-emerald-400",
    },
  };

  return (
    <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

      <div className="relative p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Flame size={16} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
              اولویت‌های مطالعه
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 -mt-0.5">
              چی رو اول بخون
            </p>
          </div>
        </div>

        <ul className="space-y-3">
          {priorities.map((p, i) => {
            const colors =
              priorityColors[p.priority] || priorityColors["متوسط"];

            return (
              <li
                key={i}
                className={`group rounded-xl p-4 ${colors.bg} border ${colors.border} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-heading text-sm font-black text-gray-900 dark:text-white flex-1">
                    {p.topic}
                  </p>
                  <span
                    className={`shrink-0 inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black ${colors.bg} ${colors.text} border ${colors.border}`}
                  >
                    {p.priority}
                  </span>
                </div>
                <p className="text-xs leading-6 text-gray-700 dark:text-gray-300">
                  {p.reason}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

// ==================== SubjectCard ====================
interface SubjectCardProps {
  subject: string;
  data: {
    correct: number;
    wrong: number;
    unanswered: number;
    total: number;
    percentage: number;
    notes: string;
    dataQualityIssues: string[];
  };
}

const SubjectCard = ({ subject, data }: SubjectCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const percentage = Math.min(Math.max(data.percentage, 0), 100);

  const getPercentageColor = (pct: number) => {
    if (pct >= 75) return "emerald";
    if (pct >= 50) return "amber";
    return "rose";
  };

  const color = getPercentageColor(percentage);

  const palette = {
    emerald: {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      bar: "from-emerald-500 to-emerald-400",
    },
    amber: {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      bar: "from-amber-500 to-amber-400",
    },
    rose: {
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      bar: "from-rose-500 to-rose-400",
    },
  }[color];

  const hasDetails =
    (data.notes && data.notes.trim().length > 0) ||
    (data.dataQualityIssues && data.dataQualityIssues.length > 0);

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden border ${palette.border} bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm transition-all duration-300 hover:shadow-lg`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${palette.bar} opacity-60`}
      />

      <div className="relative p-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl ${palette.bg} border ${palette.border} flex items-center justify-center ${palette.text}`}
            >
              <Zap size={16} strokeWidth={2.3} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                درس
              </p>
              <p className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                {subject}
              </p>
            </div>
          </div>

          <div className="text-left">
            <p className={`font-heading text-3xl font-black ${palette.text}`}>
              {percentage.toLocaleString("fa-IR")}
              <span className="text-sm font-black">٪</span>
            </p>
          </div>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-l ${palette.bar} transition-all duration-1000 shadow-lg`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            {
              label: "کل",
              value: data.total,
              color: "text-gray-600 dark:text-gray-300",
              bg: "bg-gray-500/10",
            },
            {
              label: "صحیح",
              value: data.correct,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              label: "غلط",
              value: data.wrong,
              color: "text-rose-600 dark:text-rose-400",
              bg: "bg-rose-500/10",
            },
            {
              label: "نزده",
              value: data.unanswered,
              color: "text-gray-600 dark:text-gray-300",
              bg: "bg-gray-500/10",
            },
          ].map((stat, i) => (
            <div key={i} className={`rounded-xl ${stat.bg} py-2 text-center`}>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-0.5">
                {stat.label}
              </p>
              <p className={`font-heading text-base font-black ${stat.color}`}>
                {stat.value.toLocaleString("fa-IR")}
              </p>
            </div>
          ))}
        </div>

        {hasDetails && (
          <>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="group/btn mt-3 inline-flex items-center gap-1.5 text-[11px] font-black text-[var(--griffin-gold)] hover:underline underline-offset-4"
            >
              <ChevronDown
                size={12}
                className={`transition-transform duration-300 ${
                  showDetails ? "rotate-180" : ""
                }`}
              />
              {showDetails ? "بستن جزئیات" : "مشاهده جزئیات"}
            </button>

            {showDetails && (
              <div className="mt-3 space-y-3 animate-[fadeInUp_0.3s_ease-out]">
                {data.notes && (
                  <div className="rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/70 dark:border-white/5 p-3">
                    <p className="text-xs leading-6 text-gray-600 dark:text-gray-300">
                      {data.notes}
                    </p>
                  </div>
                )}

                {data.dataQualityIssues &&
                  data.dataQualityIssues.length > 0 && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <AlertCircle size={11} className="text-amber-500" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                          نکات کیفیت داده
                        </p>
                      </div>
                      <ul className="space-y-1">
                        {data.dataQualityIssues.map((issue, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-1.5 text-[11px] leading-5 text-amber-700 dark:text-amber-300"
                          >
                            <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
