import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  FileQuestion,
  Flame,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getMyPlans,
  formatPlanDate,
  getProgressPercent,
  STATUS_COLORS,
  STATUS_LABELS,
  type StudyPlan,
  type StudyPlanStatus,
} from "../../api/studyPlanApi";
import RevealOnScroll from "../../components/common/RevealOnScroll";

type FilterTab = "all" | StudyPlanStatus;

const MyStudyPlans = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // ==================== Load ====================
  const load = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await getMyPlans({
        status: filter === "all" ? undefined : filter,
        page,
        limit: pagination.limit,
      });
      setPlans(result.plans);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load plans:", err);
      setError("دریافت برنامه‌ها انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ==================== Tabs ====================
  const tabs: { key: FilterTab; label: string; icon: typeof ClipboardList }[] =
    [
      { key: "all", label: "همه", icon: ClipboardList },
      { key: "active", label: "فعال", icon: Flame },
      { key: "completed", label: "تکمیل‌شده", icon: CheckCircle2 },
    ];

  // ==================== JSX ====================
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت به داشبورد
        </button>

        {/* Hero */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/25 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative shrink-0 self-center sm:self-auto">
              <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                <Target size={32} strokeWidth={2.3} />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-right">
              <div className="inline-flex items-center gap-2 mb-2">
                <Sparkles
                  size={12}
                  className="text-[var(--griffin-gold)] animate-pulse"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Study Plans
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                برنامه‌های مطالعاتی
              </h1>

              <p className="mt-1.5 text-sm text-gray-400">
                {pagination.total > 0
                  ? `${pagination.total.toLocaleString("fa-IR")} برنامه`
                  : "هنوز برنامه‌ای نداری"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void load(pagination.page)}
              disabled={loading}
              className="shrink-0 self-center sm:self-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 backdrop-blur-sm px-4 py-2.5 font-black text-[var(--griffin-gold)] text-xs hover:bg-[var(--griffin-gold)]/10 disabled:opacity-40 transition-all"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              بروزرسانی
            </button>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          <div className="p-4 border-b border-gray-200/70 dark:border-white/5">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = filter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={`
                      inline-flex items-center gap-1.5 rounded-xl px-3 py-2
                      text-[11px] font-black transition-all
                      ${
                        isActive
                          ? "bg-gradient-to-l from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/30"
                          : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-purple-500/40 hover:text-purple-500"
                      }
                    `}
                  >
                    <Icon size={12} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center space-y-3">
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-50 animate-pulse" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                    <LoaderCircle
                      size={24}
                      className="text-white animate-spin"
                    />
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  در حال دریافت...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle size={28} className="mx-auto text-rose-500 mb-3" />
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {error}
              </p>
            </div>
          ) : plans.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <Target
                  size={28}
                  className="text-gray-400 dark:text-gray-600"
                />
              </div>
              <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
                {filter === "all"
                  ? "هنوز برنامه‌ای نداری"
                  : filter === "active"
                    ? "برنامه فعالی نداری"
                    : "برنامه تکمیل‌شده‌ای نداری"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                مشاورت بعد از آزمون‌ها برات برنامه می‌سازه
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {plans.map((plan, index) => (
                <RevealOnScroll key={plan.id} delay={index * 50}>
                  <PlanCard
                    plan={plan}
                    onView={() => navigate(`/dashboard/study-plans/${plan.id}`)}
                  />
                </RevealOnScroll>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200/70 dark:border-white/5">
              <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
                {pagination.totalPages.toLocaleString("fa-IR")}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => void load(pagination.page - 1)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-purple-500/40 hover:text-purple-500 disabled:opacity-30 transition-all text-[10px] font-black"
                >
                  قبلی
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages || loading}
                  onClick={() => void load(pagination.page + 1)}
                  className="px-3 py-2 rounded-lg bg-gradient-to-l from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/30 disabled:opacity-30 transition-all text-[10px] font-black"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

// ==================== PlanCard ====================
interface PlanCardProps {
  plan: StudyPlan;
  onView: () => void;
}

const PlanCard = ({ plan, onView }: PlanCardProps) => {
  const progress = getProgressPercent(plan);
  const statusStyle = STATUS_COLORS[plan.status];

  return (
    <button
      type="button"
      onClick={onView}
      className="
        group relative w-full text-right
        rounded-2xl overflow-hidden
        border border-gray-200 dark:border-white/10
        bg-white/50 dark:bg-white/[0.02]
        hover:bg-purple-500/5 hover:border-purple-500/30
        p-5 transition-all duration-300 hover:-translate-y-1
      "
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${statusStyle.bg} ${statusStyle.text}`}
            >
              {STATUS_LABELS[plan.status]}
            </span>

            {plan.exam && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black">
                <FileQuestion size={10} />
                {plan.exam.title}
              </span>
            )}

            {plan.personalExam && (
              <span
                className={`
                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black
                  ${
                    plan.personalExam.status === "completed"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : plan.personalExam.status === "in_progress"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  }
                `}
              >
                <Sparkles size={10} />
                {plan.personalExam.status === "completed"
                  ? `آزمون: ${plan.personalExam.score} از ${plan.personalExam.totalScore}`
                  : plan.personalExam.status === "in_progress"
                    ? "آزمون در حال انجام"
                    : "آزمون شخصی آماده"}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-heading text-base font-black text-gray-900 dark:text-white line-clamp-1 group-hover:text-purple-500 transition-colors">
            {plan.title}
          </h3>

          {plan.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-6">
              {plan.description}
            </p>
          )}

          {/* Meta */}
          <div className="mt-3 flex items-center gap-3 flex-wrap text-[10px] text-gray-500 dark:text-gray-400">
            {plan.counselor && (
              <span className="inline-flex items-center gap-1">
                <User size={10} />
                {plan.counselor.firstName} {plan.counselor.lastName}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar size={10} />
              {formatPlanDate(plan.startDate)}
            </span>
            {plan.endDate && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Clock3 size={10} />
                ددلاین: {formatPlanDate(plan.endDate)}
              </span>
            )}
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400">
                <BookOpen size={10} />
                پیشرفت تسک‌ها
              </span>
              <span className="font-heading text-sm font-black text-purple-500 tabular-nums">
                {plan.completedTasks.toLocaleString("fa-IR")} /{" "}
                {plan.totalTasks.toLocaleString("fa-IR")}
                <span className="text-[10px] text-gray-400 font-bold mr-2">
                  ({progress.toLocaleString("fa-IR")}٪)
                </span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-l from-purple-500 to-purple-400 transition-all duration-1000 shadow-lg shadow-purple-500/30"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="shrink-0 self-center">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
            <Eye size={18} />
          </div>
        </div>
      </div>
    </button>
  );
};

export default MyStudyPlans;
