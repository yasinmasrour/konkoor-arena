import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Flame,
  LoaderCircle,
  PenTool,
  Plus,
  Sparkles,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axios";

interface DesignerStats {
  questions: {
    total: number;
    published: number;
    draft: number;
    pending: number;
    rejected: number;
    today: number;
  };
  reviews: {
    total: number;
    approved: number;
    approvalRate: number;
  };
}

interface QuestionItem {
  id: string;
  code: string;
  lesson: string;
  grade: string;
  chapter: string;
  difficulty: string;
  status: string;
  usageCount: number;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  draft: "پیش‌نویس",
  pending: "در انتظار",
  published: "منتشرشده",
  rejected: "ردشده",
};

const statusColors: Record<string, string> = {
  draft: "text-gray-600 dark:text-gray-400 bg-gray-500/10",
  pending: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  published: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  rejected: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
};

const difficultyLabels: Record<string, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fa-IR", { dateStyle: "medium" });

const DesignerHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DesignerStats | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [statsRes, questionsRes] = await Promise.all([
          api.get("/designer/stats"),
          api.get("/designer/questions", { params: { limit: 5 } }),
        ]);
        if (cancelled) return;
        setStats(statsRes.data);
        setQuestions(questionsRes.data.questions);
      } catch (err) {
        console.error("Failed to load designer data:", err);
        if (!cancelled) setError("دریافت اطلاعات انجام نشد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <LoaderCircle size={24} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت اطلاعات...
          </p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
        <p className="text-sm font-bold text-rose-500 dark:text-rose-400">
          {error || "اطلاعات پیدا نشد"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ==================== HERO ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/25 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="relative shrink-0 self-center lg:self-auto">
            <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-70 animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/20">
              <PenTool size={36} strokeWidth={2.3} />
            </div>
            <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white border-2 border-[#080B12] shadow-lg">
              <Sparkles size={14} />
            </span>
          </div>

          <div className="flex-1 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 mb-2">
              <Zap
                size={12}
                className="text-[var(--griffin-gold)] animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Designer Dashboard
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
              خوش آمدی، طراح!
            </h1>

            <p className="mt-2 text-sm text-gray-400 leading-7">
              سوالاتت رو مدیریت کن و به بانک سوال اضافه کن
            </p>
          </div>
        </div>
      </section>

      {/* ==================== کارت‌های آماری ==================== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: FileQuestion,
            label: "کل سوالات",
            value: stats.questions.total,
            sub: `${stats.questions.today} امروز`,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
          {
            icon: CheckCircle2,
            label: "منتشرشده",
            value: stats.questions.published,
            sub: "تایید نهایی",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            icon: Clock3,
            label: "در انتظار",
            value: stats.questions.pending,
            sub: "منتظر بررسی",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            icon: XCircle,
            label: "ردشده",
            value: stats.questions.rejected,
            sub: "نیاز به اصلاح",
            color: "text-rose-500",
            bg: "bg-rose-500/10",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
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
                className={`font-heading text-xl font-black mt-1 tabular-nums ${stat.color}`}
              >
                {stat.value.toLocaleString("fa-IR")}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                {stat.sub}
              </p>
            </div>
          );
        })}
      </section>

      {/* ==================== دسترسی سریع ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="inline-flex items-center gap-2">
            <Flame size={13} className="text-[var(--griffin-gold)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
              Quick Actions
            </span>
          </div>
          <h2 className="font-heading text-base font-black text-gray-900 dark:text-white mt-1">
            دسترسی سریع
          </h2>
        </div>

        <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Plus,
              label: "طراحی سوال جدید",
              desc: "افزودن به بانک",
              href: "/question-designer",
              color: "from-purple-500 to-purple-700",
            },
            {
              icon: FileQuestion,
              label: "بانک سوالات",
              desc: "مرور همه سوالات",
              href: "/question-bank",
              color: "from-blue-500 to-blue-700",
            },
            {
              icon: BookOpen,
              label: "دفترچه‌ها",
              desc: "ساخت دفترچه",
              href: "/booklets",
              color: "from-[var(--griffin-gold)] to-amber-700",
            },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => navigate(action.href)}
                className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-4 text-right transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                  <ArrowLeft
                    size={14}
                    className="text-gray-400 dark:text-gray-600 transition-transform group-hover:-translate-x-1 group-hover:text-[var(--griffin-gold)] rotate-180 shrink-0 mt-1"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================== آخرین سوالات ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-200/70 dark:border-white/5">
          <div>
            <div className="inline-flex items-center gap-2">
              <TrendingUp size={13} className="text-[var(--griffin-gold)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Recent Questions
              </span>
            </div>
            <h2 className="font-heading text-base font-black text-gray-900 dark:text-white mt-1">
              آخرین سوالات من
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate("/question-bank")}
            className="text-[10px] font-black text-[var(--griffin-gold)] hover:underline"
          >
            مشاهده همه →
          </button>
        </div>

        {questions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <FileQuestion
                size={28}
                className="text-gray-400 dark:text-gray-600"
              />
            </div>
            <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
              هنوز سوالی نساختی
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/70 dark:divide-white/5">
            {questions.map((q) => (
              <div
                key={q.id}
                className="group p-4 hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                    <FileQuestion size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                        {q.code}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black ${
                          statusColors[q.status] || statusColors.draft
                        }`}
                      >
                        {statusLabels[q.status] || q.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                      <span>{q.lesson}</span>
                      <span>پایه {q.grade}</span>
                      <span>
                        {difficultyLabels[q.difficulty] || q.difficulty}
                      </span>
                      <span>{formatDate(q.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DesignerHome;
