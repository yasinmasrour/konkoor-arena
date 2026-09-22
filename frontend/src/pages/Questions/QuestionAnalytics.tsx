import { useEffect, useState } from "react";
import { BarChart3, FileQuestion, RefreshCw, TriangleAlert, CheckCircle2, Archive, Clock3, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getQuestionAnalytics, type QuestionAnalytics as QuestionAnalyticsData } from "../../api/questionAnalyticsApi";

const statusLabels: Record<string, string> = { draft: "پیش‌نویس", review: "در حال بررسی", published: "منتشرشده", archived: "آرشیو" };
const difficultyLabels: Record<string, string> = { easy: "آسان", medium: "متوسط", hard: "سخت", tricky: "مفهومی/چالشی" };
const gradeLabels: Record<string, string> = { "10": "دهم", "11": "یازدهم", "12": "دوازدهم" };
const majorLabels: Record<string, string> = { math: "ریاضی", experimental: "تجربی", humanities: "انسانی" };

const AnalyticsList = ({ items, label }: { items: Array<{ name: string; count: number }>; label: string }) => {
  const max = Math.max(...items.map((item) => item.count), 1);
  return (
    <div className="space-y-3">
      {items.length === 0 ? <p className="text-sm text-gray-500">داده‌ای وجود ندارد.</p> : items.map((item) => (
        <div key={item.name}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm"><span className="truncate">{item.name || "بدون مقدار"}</span><span className="font-semibold">{item.count}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10"><div className="h-full rounded-full bg-[var(--griffin-gold)]" style={{ width: `${(item.count / max) * 100}%` }} /></div>
        </div>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, note }: { title: string; value: number; icon: typeof FileQuestion; note?: string }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]">
    <div className="flex items-start justify-between gap-3"><div><p className="text-sm text-gray-500 dark:text-gray-400">{title}</p><p className="mt-2 text-3xl font-bold">{value.toLocaleString("fa-IR")}</p>{note && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{note}</p>}</div><div className="rounded-xl bg-[var(--griffin-gold)]/10 p-3 text-[var(--griffin-gold)]"><Icon size={21} /></div></div>
  </div>
);

const QuestionAnalytics = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<QuestionAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setData(await getQuestionAnalytics()); } catch { setError("دریافت آمار بانک سؤال انجام نشد."); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (loading && !data) return <main className="min-h-screen px-4 py-10"><div className="mx-auto max-w-7xl text-center text-gray-500">در حال دریافت آمار...</div></main>;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm text-gray-500 dark:text-gray-400">Griffin Academy · Question Analytics</p><h1 className="mt-1 text-3xl font-bold">آمار بانک سؤال</h1><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">وضعیت و توزیع سؤال‌ها را سریع بررسی کنید.</p></div>
          <div className="flex gap-2"><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-[#111722] disabled:opacity-50"><RefreshCw size={17} /> بروزرسانی</button><button onClick={() => navigate("/question-bank")} className="inline-flex items-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-2.5 text-sm font-semibold text-white"><FileQuestion size={17} /> بانک سؤال</button></div>
        </header>

        {error && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">{error}</div>}

        {data && <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="کل سؤال‌ها" value={data.totals.total} icon={FileQuestion} />
            <StatCard title="منتشرشده" value={data.totals.published} icon={CheckCircle2} />
            <StatCard title="نیازمند بررسی" value={data.totals.review} icon={TriangleAlert} note={`${data.totals.publishedUnused.toLocaleString("fa-IR")} سؤال منتشرشده بدون استفاده`} />
            <StatCard title="کل دفعات استفاده" value={data.totals.totalUsage} icon={Activity} note={`${data.totals.unused.toLocaleString("fa-IR")} سؤال هنوز استفاده نشده`} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]"><div className="mb-5 flex items-center gap-2 font-semibold"><BarChart3 size={19} /> وضعیت سؤال‌ها</div><AnalyticsList label="وضعیت" items={data.status.map((item) => ({ name: statusLabels[item.status] ?? item.status, count: item.count }))} /></div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]"><div className="mb-5 flex items-center gap-2 font-semibold"><Activity size={19} /> سطح دشواری</div><AnalyticsList label="سطح دشواری" items={data.difficulty.map((item) => ({ name: difficultyLabels[item.difficulty] ?? item.difficulty, count: item.count }))} /></div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]"><div className="mb-5 flex items-center gap-2 font-semibold"><FileQuestion size={19} /> توزیع دروس</div><AnalyticsList label="دروس" items={data.lessons.map((item) => ({ name: item.lesson, count: item.count }))} /></div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]"><div className="mb-5 flex items-center gap-2 font-semibold"><Archive size={19} /> پایه و رشته</div><div className="grid gap-6 sm:grid-cols-2"><AnalyticsList label="پایه" items={data.grades.map((item) => ({ name: gradeLabels[item.grade] ?? item.grade, count: item.count }))} /><AnalyticsList label="رشته" items={data.majors.map((item) => ({ name: majorLabels[item.major] ?? item.major, count: item.count }))} /></div></div>
          </section>

          <section className="rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#111722]">
            <div className="flex items-center gap-2 border-b border-slate-200/70 px-5 py-4 font-semibold dark:border-white/10"><Clock3 size={19} /> آخرین سؤال‌های ویرایش‌شده</div>
            <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-right text-sm"><thead className="bg-gray-50 text-gray-500 dark:bg-white/[0.03] dark:text-gray-400"><tr><th className="px-5 py-3">کد</th><th className="px-5 py-3">درس</th><th className="px-5 py-3">سختی</th><th className="px-5 py-3">وضعیت</th><th className="px-5 py-3">استفاده</th><th className="px-5 py-3">آخرین ویرایش</th></tr></thead><tbody className="divide-y divide-slate-200/70 dark:divide-white/10">{data.recentQuestions.map((question) => <tr key={question.id}><td className="px-5 py-3 font-mono text-xs">{question.code}</td><td className="px-5 py-3">{question.lesson}</td><td className="px-5 py-3">{difficultyLabels[question.difficulty] ?? question.difficulty}</td><td className="px-5 py-3">{statusLabels[question.status] ?? question.status}</td><td className="px-5 py-3">{question.usageCount}</td><td className="px-5 py-3 text-gray-500">{new Date(question.updatedAt).toLocaleDateString("fa-IR")}</td></tr>)}</tbody></table></div>
          </section>
        </>}
      </div>
    </main>
  );
};

export default QuestionAnalytics;
