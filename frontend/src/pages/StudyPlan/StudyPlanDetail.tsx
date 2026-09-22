import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock3,
  Flame,
  LoaderCircle,
  PlayCircle,
  Sparkles,
  Square,
  Target,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMyPlan,
  toggleTask,
  formatPlanDate,
  getProgressPercent,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type StudyPlan,
  type StudyTask,
} from "../../api/studyPlanApi";

const StudyPlanDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  // ==================== Load ====================
  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const result = await getMyPlan(id);
      setPlan(result.plan);
    } catch (err) {
      console.error("Failed to load plan:", err);
      setError("دریافت برنامه انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ==================== Toggle Task ====================
  const handleToggleTask = async (task: StudyTask) => {
    if (!id || togglingTaskId) return;
    setTogglingTaskId(task.id);

    // 🔹 UI آنی
    setPlan((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks?.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    isCompleted: !t.isCompleted,
                    completedAt: !t.isCompleted
                      ? new Date().toISOString()
                      : null,
                  }
                : t,
            ),
            completedTasks: !task.isCompleted
              ? prev.completedTasks + 1
              : prev.completedTasks - 1,
          }
        : prev,
    );

    try {
      await toggleTask(id, task.id);
      // 🔹 دوباره لود کن که status plan آپدیت بشه
      await load();
    } catch (err) {
      console.error("Failed to toggle task:", err);
    //   rollback
      await load();
    } finally {
      setTogglingTaskId(null);
    }
  };

  // ==================== Loading / Error ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-3">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <LoaderCircle size={24} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت برنامه...
          </p>
        </div>
      </main>
    );
  }

  if (error || !plan) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-4">
            {error || "برنامه پیدا نشد"}
          </p>
          <button
            onClick={() => navigate("/dashboard/study-plans")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-purple-500 to-purple-700 px-4 py-2.5 text-xs font-black text-white shadow-lg"
          >
            <ArrowLeft size={13} />
            بازگشت
          </button>
        </div>
      </main>
    );
  }

  const progress = getProgressPercent(plan);
  const statusStyle = STATUS_COLORS[plan.status];
  const tasks = plan.tasks ?? [];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/dashboard/study-plans")}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-purple-500 transition-colors"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت به برنامه‌ها
        </button>

        {/* Hero */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/25 blur-[100px] pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black ${statusStyle.bg} ${statusStyle.text}`}
              >
                {STATUS_LABELS[plan.status]}
              </span>
              {plan.exam && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black">
                  <Target size={10} />
                  {plan.exam.title}
                </span>
              )}
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white mb-3">
              {plan.title}
            </h1>

            {plan.description && (
              <p className="text-sm text-gray-400 leading-7 mb-4">
                {plan.description}
              </p>
            )}

            <div className="flex items-center gap-3 flex-wrap text-[11px] text-gray-400">
              {plan.counselor && (
                <span className="inline-flex items-center gap-1.5">
                  <User size={11} />
                  مشاور: {plan.counselor.firstName} {plan.counselor.lastName}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={11} />
                شروع: {formatPlanDate(plan.startDate)}
              </span>
              {plan.endDate && (
                <span className="inline-flex items-center gap-1.5 text-amber-400">
                  <Clock3 size={11} />
                  ددلاین: {formatPlanDate(plan.endDate)}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Progress + Personal Exam */}
        <section className="grid gap-3 md:grid-cols-2">
          {/* Progress */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <BookOpen size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Progress
                </p>
                <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                  پیشرفت تسک‌ها
                </h3>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {plan.completedTasks.toLocaleString("fa-IR")} از{" "}
                {plan.totalTasks.toLocaleString("fa-IR")}
              </span>
              <span className="font-heading text-xl font-black text-purple-500 tabular-nums">
                {progress.toLocaleString("fa-IR")}٪
              </span>
            </div>

            <div className="h-3 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-l from-purple-500 to-purple-400 transition-all duration-1000 shadow-lg shadow-purple-500/30"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Personal Exam */}
          {plan.personalExam && (
            <div
              className={`
                rounded-2xl border p-5 backdrop-blur-sm
                ${
                  plan.personalExam.status === "completed"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-amber-500/30 bg-amber-500/5"
                }
              `}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${
                      plan.personalExam.status === "completed"
                        ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                        : "bg-amber-500/10 border border-amber-500/20 text-amber-500"
                    }
                  `}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Personal Exam
                  </p>
                  <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                    آزمون شخصی
                  </h3>
                </div>
              </div>

              {plan.personalExam.status === "completed" ? (
                <div className="text-center">
                  <p className="font-heading text-2xl font-black text-emerald-500 tabular-nums">
                    {plan.personalExam.score.toLocaleString("fa-IR")} از{" "}
                    {plan.personalExam.totalScore.toLocaleString("fa-IR")}
                  </p>
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/personal-exams/${plan.personalExam?.id}/result`,
                      )
                    }
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-4 py-2 text-xs font-black hover:bg-emerald-500/25 transition-all"
                  >
                    <CheckCircle2 size={13} />
                    مشاهده نتیجه
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    یه آزمون شخصی برای رفع ضعف‌هات آماده‌ست
                  </p>
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/personal-exams/${plan.personalExam?.id}`,
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-700 px-5 py-3 text-xs font-black text-white shadow-lg shadow-amber-500/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    <PlayCircle size={15} />
                    شروع آزمون
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Tasks */}
        <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                <CheckSquare size={16} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Tasks
                </p>
                <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                  تسک‌های مطالعاتی
                </h3>
              </div>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <BookOpen
                  size={28}
                  className="text-gray-400 dark:text-gray-600"
                />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                هنوز تسکی برای این برنامه اضافه نشده
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => void handleToggleTask(task)}
                  loading={togglingTaskId === task.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

// ==================== TaskItem ====================
interface TaskItemProps {
  task: StudyTask;
  onToggle: () => void;
  loading: boolean;
}

const TaskItem = ({ task, onToggle, loading }: TaskItemProps) => {
  const priorityStyle = PRIORITY_COLORS[task.priority];

  return (
    <div
      className={`
        group relative rounded-2xl overflow-hidden border p-4
        transition-all duration-300
        ${
          task.isCompleted
            ? "border-emerald-500/30 bg-emerald-500/5 opacity-75"
            : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:border-purple-500/40"
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={onToggle}
          disabled={loading}
          className="shrink-0 mt-0.5 disabled:opacity-50"
        >
          {task.isCompleted ? (
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
              <CheckCircle2 size={14} strokeWidth={3} />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-lg border-2 border-gray-300 dark:border-gray-600 group-hover:border-purple-500 transition-colors flex items-center justify-center">
              <Square
                size={12}
                className="text-transparent group-hover:text-purple-500/50"
              />
            </div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h4
              className={`
                font-heading text-sm font-black
                ${
                  task.isCompleted
                    ? "text-gray-400 dark:text-gray-500 line-through"
                    : "text-gray-900 dark:text-white"
                }
              `}
            >
              {task.title}
            </h4>

            <span
              className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                text-[9px] font-black border
                ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}
              `}
            >
              {task.priority === "high" && <Flame size={9} />}
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>

          {task.description && (
            <p
              className={`
                text-xs leading-6 mb-2
                ${
                  task.isCompleted
                    ? "text-gray-400 dark:text-gray-500"
                    : "text-gray-600 dark:text-gray-400"
                }
              `}
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-3 flex-wrap text-[10px] text-gray-500 dark:text-gray-400">
            {task.lesson && (
              <span className="inline-flex items-center gap-1">
                <BookOpen size={10} />
                {task.lesson}
                {task.chapter && ` · ${task.chapter}`}
              </span>
            )}
            {task.estimatedMinutes && (
              <span className="inline-flex items-center gap-1">
                <Clock3 size={10} />
                {task.estimatedMinutes.toLocaleString("fa-IR")} دقیقه
              </span>
            )}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Calendar size={10} />
                {formatPlanDate(task.dueDate)}
              </span>
            )}
            {task.isCompleted && task.completedAt && (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={10} />
                انجام شد در {formatPlanDate(task.completedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanDetail;