import { Brain, Gauge, ShieldCheck, Target, Zap } from "lucide-react";

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
  const opponentAccuracy = total ? Math.round((stats.opponent.correct / total) * 100) : 0;
  const speedAdvantage =
    stats.averageResponseTimeMs !== null && stats.opponent.averageResponseTimeMs !== null
      ? stats.averageResponseTimeMs < stats.opponent.averageResponseTimeMs
      : null;

  const insights = [
    {
      icon: Target,
      title: "دقت",
      value: `${accuracy}%`,
      detail:
        accuracy > opponentAccuracy
          ? `دقت تو ${accuracy - opponentAccuracy}% بیشتر از حریف بود.`
          : accuracy < opponentAccuracy
            ? `دقت حریف ${opponentAccuracy - accuracy}% بیشتر بود.`
            : "دقت دو بازیکن برابر بود.",
      tone: accuracy >= opponentAccuracy ? "positive" : "neutral",
    },
    {
      icon: Zap,
      title: "سرعت",
      value:
        stats.averageResponseTimeMs === null
          ? "—"
          : `${(stats.averageResponseTimeMs / 1000).toFixed(2)}s`,
      detail:
        speedAdvantage === true
          ? "میانگین پاسخ‌گویی تو از حریف سریع‌تر بود."
          : speedAdvantage === false
            ? stats.averageResponseTimeMs !== null && stats.opponent.averageResponseTimeMs !== null
              ? "میانگین پاسخ‌گویی حریف سریع‌تر بود."
              : "برای مقایسه سرعت، زمان پاسخ کافی ثبت نشده است."
            : "برای مقایسه سرعت، زمان پاسخ کافی ثبت نشده است.",
      tone: speedAdvantage === true ? "positive" : "neutral",
    },
    {
      icon: ShieldCheck,
      title: "کنترل راندها",
      value: `${stats.roundsWon}-${stats.opponentRoundsWon}`,
      detail:
        stats.roundsWon > stats.opponentRoundsWon
          ? "تو راندهای بیشتری را بردی."
          : stats.roundsWon < stats.opponentRoundsWon
            ? "حریف راندهای بیشتری را برد."
            : "تعداد راندهای برده برابر بود.",
      tone: stats.roundsWon >= stats.opponentRoundsWon ? "positive" : "neutral",
    },
  ];

  const headline =
    stats.roundsWon > stats.opponentRoundsWon
      ? "برتری اصلی این Match در برد راندها بود."
      : accuracy > opponentAccuracy
        ? "دقت پاسخ‌گویی تو مهم‌ترین برتری آماری بود."
        : speedAdvantage === true
          ? "سرعت پاسخ‌گویی تو نسبت به حریف بهتر بود."
          : stats.roundsWon === stats.opponentRoundsWon && accuracy === opponentAccuracy
            ? "عملکرد دو بازیکن از نظر شاخص‌های اصلی نزدیک بود."
            : "نتیجه Match حاصل ترکیب چند شاخص عملکردی بود.";

  return (
    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/75 p-4 dark:border-white/10 dark:bg-white/[0.025] sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--griffin-gold)]">POST-MATCH INSIGHTS</p>
          <h3 className="mt-1 text-lg font-black">تحلیل عملکرد</h3>
          <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">{headline}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {insights.map(({ icon: Icon, title, value, detail, tone }) => (
          <div key={title} className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/[0.02]">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-black text-slate-500 dark:text-slate-400">
                <Icon className="h-4 w-4 text-[var(--griffin-gold)]" />
                {title}
              </span>
              <span className={`text-sm font-black ${tone === "positive" ? "text-emerald-500" : "text-slate-700 dark:text-slate-200"}`}>
                {value}
              </span>
            </div>
            <p className="mt-3 text-[11px] font-bold leading-5 text-slate-500 dark:text-slate-400">{detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2 text-[11px] font-bold text-slate-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-400">
        <Gauge className="h-4 w-4 shrink-0 text-[var(--griffin-gold)]" />
        این تحلیل فقط بر اساس داده‌های ثبت‌شده در همین Match است و نتیجه را تغییر نمی‌دهد.
      </div>
    </div>
  );
};

export default PerformanceInsights;
