import {
  Award,
  Brain,
  Flame,
  Gauge,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

interface InsightStats {
  totalQuestions: number;
  correct: number;
  wrong: number;
  timeout: number;
  averageResponseTimeMs: number | null;
  opponent: {
    correct: number;
    wrong: number;
    timeout: number;
    averageResponseTimeMs: number | null;
  };
  roundsWon: number;
  opponentRoundsWon: number;
}

interface PerformanceInsightsProps {
  stats: InsightStats;
}

const PerformanceInsights = ({ stats }: PerformanceInsightsProps) => {
  const total = stats.totalQuestions;
  const accuracy = total ? Math.round((stats.correct / total) * 100) : 0;
  const opponentAccuracy = total
    ? Math.round((stats.opponent.correct / total) * 100)
    : 0;
  const speedAdvantage =
    stats.averageResponseTimeMs !== null &&
    stats.opponent.averageResponseTimeMs !== null
      ? stats.averageResponseTimeMs < stats.opponent.averageResponseTimeMs
      : null;

  const insights = [
    {
      icon: Target,
      title: "دقت",
      value: `${accuracy.toLocaleString("fa-IR")}٪`,
      rawValue: accuracy,
      detail:
        accuracy > opponentAccuracy
          ? `دقت تو ${(accuracy - opponentAccuracy).toLocaleString("fa-IR")}٪ بیشتر از حریف بود.`
          : accuracy < opponentAccuracy
            ? `دقت حریف ${(opponentAccuracy - accuracy).toLocaleString("fa-IR")}٪ بیشتر بود.`
            : "دقت دو بازیکن برابر بود.",
      isPositive: accuracy >= opponentAccuracy,
      isStrong: accuracy - opponentAccuracy > 20,
      color: "emerald",
    },
    {
      icon: Zap,
      title: "سرعت",
      value:
        stats.averageResponseTimeMs === null
          ? "—"
          : `${(stats.averageResponseTimeMs / 1000).toFixed(2)}s`,
      rawValue: stats.averageResponseTimeMs ?? 0,
      detail:
        speedAdvantage === true
          ? "میانگین پاسخ‌گویی تو از حریف سریع‌تر بود."
          : speedAdvantage === false
            ? "میانگین پاسخ‌گویی حریف سریع‌تر بود."
            : "برای مقایسه سرعت، زمان پاسخ کافی ثبت نشده است.",
      isPositive: speedAdvantage === true,
      isStrong:
        speedAdvantage === true &&
        stats.averageResponseTimeMs !== null &&
        stats.opponent.averageResponseTimeMs !== null &&
        stats.opponent.averageResponseTimeMs - stats.averageResponseTimeMs >
          2000,
      color: "amber",
    },
    {
      icon: ShieldCheck,
      title: "کنترل راندها",
      value: `${stats.roundsWon.toLocaleString("fa-IR")}-${stats.opponentRoundsWon.toLocaleString("fa-IR")}`,
      rawValue: stats.roundsWon,
      detail:
        stats.roundsWon > stats.opponentRoundsWon
          ? "تو راندهای بیشتری را بردی."
          : stats.roundsWon < stats.opponentRoundsWon
            ? "حریف راندهای بیشتری را برد."
            : "تعداد راندهای برده برابر بود.",
      isPositive: stats.roundsWon >= stats.opponentRoundsWon,
      isStrong: stats.roundsWon - stats.opponentRoundsWon >= 2,
      color: "gold",
    },
  ];

  const headline =
    stats.roundsWon > stats.opponentRoundsWon
      ? "برتری اصلی این Match در برد راندها بود."
      : accuracy > opponentAccuracy
        ? "دقت پاسخ‌گویی تو مهم‌ترین برتری آماری بود."
        : speedAdvantage === true
          ? "سرعت پاسخ‌گویی تو نسبت به حریف بهتر بود."
          : stats.roundsWon === stats.opponentRoundsWon &&
              accuracy === opponentAccuracy
            ? "عملکرد دو بازیکن از نظر شاخص‌های اصلی نزدیک بود."
            : "نتیجه Match حاصل ترکیب چند شاخص عملکردی بود.";

  // 🔹 محاسبه امتیاز کلی عملکرد (0-100)
  const overallScore = Math.round(
    accuracy * 0.5 +
      (stats.roundsWon /
        Math.max(1, stats.roundsWon + stats.opponentRoundsWon)) *
        100 *
        0.3 +
      (speedAdvantage === true ? 100 : speedAdvantage === false ? 40 : 70) *
        0.2,
  );

  const scoreTier =
    overallScore >= 80
      ? { label: "عالی", color: "emerald", icon: Trophy }
      : overallScore >= 60
        ? { label: "خوب", color: "amber", icon: Award }
        : { label: "قابل بهبود", color: "rose", icon: TrendingUp };

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-sm">
      {/* 🔹 گرادیان طلایی بالای کارت */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

      {/* 🔹 هاله‌های تزئینی */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      <div className="relative p-5 sm:p-6">
        {/* ==================== هدر ==================== */}
        <div className="flex items-start gap-3 mb-6">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-50 animate-pulse" />
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg shadow-[var(--griffin-gold)]/30">
              <Brain className="h-5 w-5" strokeWidth={2.3} />
            </div>
          </div>
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 mb-1">
              <Sparkles size={11} className="text-[var(--griffin-gold)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--griffin-gold)]">
                Post-Match Insights
              </p>
            </div>
            <h3 className="font-heading text-lg font-black text-white">
              تحلیل هوشمند عملکرد
            </h3>
            <p className="mt-1.5 text-xs leading-6 text-gray-400">{headline}</p>
          </div>

          {/* امتیاز کلی */}
          <div className="shrink-0 text-center">
            <div
              className={`
                relative w-16 h-16 rounded-2xl
                flex flex-col items-center justify-center
                ${
                  overallScore >= 80
                    ? "bg-emerald-500/10 border border-emerald-500/30"
                    : overallScore >= 60
                      ? "bg-amber-500/10 border border-amber-500/30"
                      : "bg-rose-500/10 border border-rose-500/30"
                }
              `}
            >
              <span
                className={`
                  font-heading text-xl font-black leading-none
                  ${
                    overallScore >= 80
                      ? "text-emerald-500"
                      : overallScore >= 60
                        ? "text-amber-500"
                        : "text-rose-500"
                  }
                `}
              >
                {overallScore.toLocaleString("fa-IR")}
              </span>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                امتیاز
              </span>
            </div>
            <p
              className={`
                mt-1.5 text-[9px] font-black
                ${
                  overallScore >= 80
                    ? "text-emerald-500"
                    : overallScore >= 60
                      ? "text-amber-500"
                      : "text-rose-500"
                }
              `}
            >
              {scoreTier.label}
            </p>
          </div>
        </div>

        {/* ==================== کارت‌های Insight ==================== */}
        <div className="grid gap-3 md:grid-cols-3">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            const colors = {
              emerald: {
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
                icon: "text-emerald-500",
                text: "text-emerald-500",
              },
              amber: {
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
                icon: "text-amber-500",
                text: "text-amber-500",
              },
              gold: {
                bg: "bg-[var(--griffin-gold)]/10",
                border: "border-[var(--griffin-gold)]/20",
                icon: "text-[var(--griffin-gold)]",
                text: "text-[var(--griffin-gold)]",
              },
            }[insight.color];

            return (
              <div
                key={i}
                className={`
                  group relative rounded-2xl overflow-hidden
                  border backdrop-blur-sm p-4
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-lg
                  ${
                    insight.isPositive
                      ? `${colors.border} ${colors.bg}`
                      : "border-white/10 bg-white/[0.02]"
                  }
                `}
              >
                {/* خط طلایی بالا */}
                <div
                  className={`
                    absolute top-0 left-0 right-0 h-0.5
                    ${
                      insight.isStrong
                        ? "bg-gradient-to-r from-transparent via-current to-transparent opacity-60"
                        : "opacity-0"
                    }
                    ${colors.text}
                  `}
                />

                {/* هدر */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-2">
                    <div
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        transition-transform duration-300
                        group-hover:scale-110 group-hover:rotate-3
                        ${insight.isPositive ? colors.bg : "bg-white/5"}
                      `}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          insight.isPositive ? colors.icon : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span className="text-xs font-black text-gray-400">
                      {insight.title}
                    </span>
                  </div>

                  {/* بج «برتری» برای موارد قوی */}
                  {insight.isStrong && insight.isPositive && (
                    <span
                      className={`
                        inline-flex items-center gap-1
                        px-2 py-0.5 rounded-full
                        text-[8px] font-black
                        ${colors.bg} ${colors.text}
                        animate-pulse
                      `}
                    >
                      <Flame size={8} />
                      برتری
                    </span>
                  )}
                </div>

                {/* مقدار بزرگ */}
                <p
                  className={`
                    font-heading text-2xl font-black leading-none
                    ${insight.isPositive ? colors.text : "text-gray-200"}
                  `}
                >
                  {insight.value}
                </p>

                {/* توضیحات */}
                <p className="mt-2 text-[11px] font-bold leading-5 text-gray-400">
                  {insight.detail}
                </p>
              </div>
            );
          })}
        </div>

        {/* ==================== نکته پایین ==================== */}
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--griffin-gold)]/10 flex items-center justify-center text-[var(--griffin-gold)] shrink-0">
            <Gauge className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-bold leading-6 text-gray-400">
            این تحلیل فقط بر اساس داده‌های ثبت‌شده در همین Match است و نتیجه را
            تغییر نمی‌دهد.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceInsights;
