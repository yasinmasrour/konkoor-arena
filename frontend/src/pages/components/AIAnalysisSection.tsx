import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
  Target,
} from "lucide-react";

import { generateAIAnalysis } from "../../api/aiAnalysisApi";
import type { AIAnalysisData } from "../../api/aiAnalysisApi";

interface AIAnalysisSectionProps {
  attemptId: string;
}

const AIAnalysisSection = ({ attemptId }: AIAnalysisSectionProps) => {
  const [analysis, setAnalysis] = useState<AIAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (loading || analysis) return;

    setLoading(true);
    setError("");

    try {
      const result = await generateAIAnalysis(attemptId);
      setAnalysis(result.analysis);
    } catch (requestError) {
      console.error("AI ANALYSIS ERROR:", requestError);
      setError("دریافت تحلیل هوش مصنوعی با مشکل مواجه شد. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="
        mt-6
        overflow-hidden
        rounded-3xl
        border border-white/20
        bg-white/40
        shadow-lg
        backdrop-blur-xl
        dark:bg-white/10
      "
    >
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)]">
              <BrainCircuit className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-xl font-bold dark:text-white">
                تحلیل هوش مصنوعی
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                عملکرد شما در این آزمون را با کمک هوش مصنوعی بررسی می‌کنیم و
                پیشنهادهای مطالعه ارائه می‌دهیم.
              </p>
            </div>
          </div>

          {!analysis && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-[var(--griffin-gold)]
                px-5
                py-3
                text-sm
                font-bold
                text-white
                shadow-md
                transition
                hover:-translate-y-0.5
                hover:shadow-lg
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  در حال تحلیل...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  دریافت تحلیل هوش مصنوعی
                </>
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p>{error}</p>
              <button
                type="button"
                onClick={handleGenerate}
                className="mt-2 font-bold underline underline-offset-4"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        )}

        {analysis && (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-[var(--griffin-gold)]/20 bg-[var(--griffin-gold)]/5 p-5">
              <div className="flex items-center gap-2 text-[var(--griffin-gold)]">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-bold">جمع‌بندی عملکرد</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-gray-700 dark:text-gray-200">
                {analysis.overall}
              </p>
            </div>

            {analysis.strengths.length > 0 && (
              <AnalysisList
                title="نقاط قوت"
                items={analysis.strengths}
                icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
              />
            )}

            {analysis.weaknesses.length > 0 && (
              <AnalysisList
                title="نقاط قابل بهبود"
                items={analysis.weaknesses}
                icon={<Target className="h-5 w-5 text-red-500" />}
              />
            )}

            {Object.keys(analysis.subjectAnalysis).length > 0 && (
              <div>
                <h3 className="text-lg font-bold dark:text-white">تحلیل دروس</h3>
                <div className="mt-4 space-y-4">
                  {Object.entries(analysis.subjectAnalysis).map(
                    ([subject, subjectData]) => (
                      <div
                        key={subject}
                        className="rounded-2xl border border-white/20 bg-white/30 p-5 dark:bg-white/[0.04]"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-bold dark:text-white">{subject}</span>
                          <span className="font-bold text-[var(--griffin-gold)]">
                            {subjectData.percentage}%
                          </span>
                        </div>

                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-[var(--griffin-gold)] transition-all duration-700"
                            style={{
                              width: `${Math.min(Math.max(subjectData.percentage, 0), 100)}%`,
                            }}
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            صحیح: <strong className="text-green-500">{subjectData.correct}</strong>
                          </span>
                          <span>
                            غلط: <strong className="text-red-500">{subjectData.wrong}</strong>
                          </span>
                          <span>
                            نزده: <strong className="dark:text-gray-200">{subjectData.unanswered}</strong>
                          </span>
                        </div>

                        {subjectData.notes && (
                          <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                            {subjectData.notes}
                          </p>
                        )}

                        {subjectData.dataQualityIssues && subjectData.dataQualityIssues.length > 0 && (
                          <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-50/60 p-4 dark:bg-amber-400/10">
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                              نکات مربوط به کیفیت داده
                            </p>
                            <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-800 dark:text-amber-200">
                              {subjectData.dataQualityIssues.map((issue) => (
                                <li key={issue}>• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {analysis.priorities.length > 0 && (
              <AnalysisList
                title="اولویت‌های مطالعه"
                items={analysis.priorities}
                icon={<Target className="h-5 w-5 text-[var(--griffin-gold)]" />}
              />
            )}

            {analysis.recommendations.length > 0 && (
              <AnalysisList
                title="پیشنهادهای هوش مصنوعی"
                items={analysis.recommendations}
                icon={<Sparkles className="h-5 w-5 text-[var(--griffin-gold)]" />}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

interface AnalysisListProps {
  title: string;
  items: string[];
  icon: ReactNode;
}

const AnalysisList = ({ title, items, icon }: AnalysisListProps) => (
  <div>
    <div className="flex items-center gap-2">
      {icon}
      <h3 className="text-lg font-bold dark:text-white">{title}</h3>
    </div>
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-xl border border-white/20 bg-white/25 px-4 py-3 text-sm leading-6 text-gray-700 dark:bg-white/[0.04] dark:text-gray-200"
        >
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default AIAnalysisSection;
