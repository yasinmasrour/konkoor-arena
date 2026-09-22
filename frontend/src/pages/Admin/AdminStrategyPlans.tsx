import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  Edit3,
  Eye,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  adminDeletePlan,
  adminListPlans,
  adminPublishPlan,
  adminUnpublishPlan,
  GRADE_LABELS,
  GRADE_OPTIONS,
  MAJOR_LABELS,
  MAJOR_OPTIONS,
  type StrategyPlan,
} from "../../api/strategyApi";
import ConfirmDeleteModal from "../../components/comments/ConfirmDeleteModal";

type FilterTab = "all" | "published" | "draft";

const AdminStrategyPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<StrategyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [majorFilter, setMajorFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<StrategyPlan | null>(null);
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
      const result = await adminListPlans({
        grade: gradeFilter || undefined,
        major: majorFilter || undefined,
        isPublished: filter === "all" ? undefined : filter === "published",
        page,
        limit: pagination.limit,
      });
      setPlans(result.plans);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load strategy plans:", err);
      setError("دریافت برنامه‌های راهبردی انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, gradeFilter, majorFilter]);

  // ==================== Actions ====================
  const handlePublish = async (plan: StrategyPlan) => {
    if (plan.isPublished) return;
    setActionLoading(plan.id);
    try {
      await adminPublishPlan(plan.id);
      setPlans((prev) =>
        prev.map((p) => {
          if (p.id === plan.id) return { ...p, isPublished: true };
          // 🔹 اگه هم grade/major بود، قبلیها رو unpublish کن
          if (p.grade === plan.grade && p.major === plan.major) {
            return { ...p, isPublished: false };
          }
          return p;
        }),
      );
    } catch (err) {
      console.error("Failed to publish:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (plan: StrategyPlan) => {
    if (!plan.isPublished) return;
    setActionLoading(plan.id);
    try {
      await adminUnpublishPlan(plan.id);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isPublished: false } : p)),
      );
    } catch (err) {
      console.error("Failed to unpublish:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPlan) return;
    setActionLoading(deletingPlan.id);
    try {
      await adminDeletePlan(deletingPlan.id);
      setPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
      setDeletingPlan(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ==================== Tabs ====================
  const tabs: { key: FilterTab; label: string; icon: typeof FileText }[] = [
    { key: "all", label: "همه", icon: FileText },
    { key: "published", label: "منتشرشده", icon: CheckCircle2 },
    { key: "draft", label: "پیشنویس", icon: Clock3 },
  ];

  return (
    <>
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl space-y-5">
          {/* ==================== Back ==================== */}
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

          {/* ==================== HERO ==================== */}
          <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/25 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />

            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0 self-center sm:self-auto">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                  <Compass size={32} strokeWidth={2.3} />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-right">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Sparkles
                    size={12}
                    className="text-[var(--griffin-gold)] animate-pulse"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Admin Panel
                  </span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                  مدیریت برنامه‌های راهبردی
                </h1>

                <p className="mt-1.5 text-sm text-gray-400">
                  ساخت، ویرایش و انتشار جدول آزمون‌های سال تحصیلی
                </p>
              </div>

              <div className="shrink-0 self-center sm:self-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => void load(pagination.page)}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 backdrop-blur-sm px-4 py-2.5 font-black text-[var(--griffin-gold)] text-xs hover:bg-[var(--griffin-gold)]/10 disabled:opacity-40 transition-all"
                >
                  <RefreshCw
                    size={13}
                    className={loading ? "animate-spin" : ""}
                  />
                  بروزرسانی
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/strategy-plans/new")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 font-black text-white text-xs shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <Plus size={13} />
                  برنامه جدید
                </button>
              </div>
            </div>
          </section>

          {/* ==================== Filters ==================== */}
          <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
            <div className="p-4 border-b border-gray-200/70 dark:border-white/5 space-y-3">
              {/* Tabs */}
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
                            ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                            : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                        }
                      `}
                    >
                      <Icon size={12} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Grade / Major */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                >
                  <option value="">همه پایهها</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>

                <select
                  value={majorFilter}
                  onChange={(e) => setMajorFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                >
                  <option value="">همه رشتهها</option>
                  {MAJOR_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ==================== لیست ==================== */}
            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center space-y-3">
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
                      <LoaderCircle
                        size={24}
                        className="text-white animate-spin"
                      />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    در حال دریافت برنامهها...
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
                  <Compass
                    size={28}
                    className="text-gray-400 dark:text-gray-600"
                  />
                </div>
                <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
                  {filter === "all"
                    ? "هنوز برنامهای ساخته نشده"
                    : filter === "published"
                      ? "برنامه منتشرشدهای وجود ندارد"
                      : "پیشنویسی وجود ندارد"}
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/admin/strategy-plans/new")}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl transition-all"
                >
                  <Plus size={13} />
                  ساخت برنامه جدید
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={() =>
                      navigate(`/admin/strategy-plans/${plan.id}/edit`)
                    }
                    onView={() => navigate(`/strategy?preview=${plan.id}`)}
                    onPublish={() => void handlePublish(plan)}
                    onUnpublish={() => void handleUnpublish(plan)}
                    onDelete={() => setDeletingPlan(plan)}
                    actionLoading={actionLoading === plan.id}
                  />
                ))}
              </div>
            )}

            {/* ==================== Pagination ==================== */}
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
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-all text-[10px] font-black"
                  >
                    قبلی
                  </button>
                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                    onClick={() => void load(pagination.page + 1)}
                    className="px-3 py-2 rounded-lg bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30 disabled:opacity-30 transition-all text-[10px] font-black"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ==================== Modal حذف ==================== */}
      {deletingPlan && (
        <ConfirmDeleteModal
          title="حذف برنامه راهبردی"
          message={`آیا از حذف "${deletingPlan.title}" مطمئن هستی؟ این عمل قابل بازگشت نیست.`}
          onClose={() => setDeletingPlan(null)}
          onConfirm={() => void handleDeleteConfirm()}
          loading={actionLoading === deletingPlan.id}
        />
      )}
    </>
  );
};

// ==================== PlanCard ====================
interface PlanCardProps {
  plan: StrategyPlan;
  onEdit: () => void;
  onView: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onDelete: () => void;
  actionLoading: boolean;
}

const PlanCard = ({
  plan,
  onEdit,
  onView,
  onPublish,
  onUnpublish,
  onDelete,
  actionLoading,
}: PlanCardProps) => {
  const examCount = plan.data?.exams?.length ?? 0;
  const lessonCount = plan.data?.lessons?.length ?? 0;

  return (
    <div
      className={`
        group relative rounded-2xl overflow-hidden border p-4 transition-all duration-300
        ${
          plan.isPublished
            ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent"
            : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]"
        }
        hover:border-[var(--griffin-gold)]/40
      `}
    >
      {plan.isPublished && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        {/* محتوا */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black
                ${
                  plan.isPublished
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }
              `}
            >
              {plan.isPublished ? (
                <>
                  <CheckCircle2 size={10} />
                  منتشرشده
                </>
              ) : (
                <>
                  <Clock3 size={10} />
                  پیشنویس
                </>
              )}
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black">
              <Calendar size={10} />
              {GRADE_LABELS[plan.grade] ?? plan.grade}
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black">
              {MAJOR_LABELS[plan.major] ?? plan.major}
            </span>
          </div>

          <h3 className="font-heading text-base font-black text-gray-900 dark:text-white truncate">
            {plan.title}
          </h3>

          {plan.description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {plan.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <FileText size={10} />
              {examCount.toLocaleString("fa-IR")} آزمون
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
              <Users size={10} />
              {lessonCount.toLocaleString("fa-IR")} درس
            </span>
          </div>
        </div>

        {/* دکمهها */}
        <div className="shrink-0 flex items-center gap-1 self-start flex-wrap">
          <button
            type="button"
            onClick={onView}
            disabled={actionLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/15 hover:text-[var(--griffin-gold)] disabled:opacity-40 transition-all"
            title="مشاهده"
          >
            <Eye size={13} />
          </button>

          <button
            type="button"
            onClick={onEdit}
            disabled={actionLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-blue-500/15 hover:text-blue-500 disabled:opacity-40 transition-all"
            title="ویرایش"
          >
            <Edit3 size={13} />
          </button>

          {plan.isPublished ? (
            <button
              type="button"
              onClick={onUnpublish}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 disabled:opacity-40 transition-all text-[10px] font-black"
              title="لغو انتشار"
            >
              {actionLoading ? (
                <LoaderCircle size={11} className="animate-spin" />
              ) : (
                <Clock3 size={11} />
              )}
              لغو
            </button>
          ) : (
            <button
              type="button"
              onClick={onPublish}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-all text-[10px] font-black"
              title="انتشار"
            >
              {actionLoading ? (
                <LoaderCircle size={11} className="animate-spin" />
              ) : (
                <Check size={11} strokeWidth={2.5} />
              )}
              انتشار
            </button>
          )}

          <button
            type="button"
            onClick={onDelete}
            disabled={actionLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-rose-500/15 hover:text-rose-500 disabled:opacity-40 transition-all"
            title="حذف"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStrategyPlans;
