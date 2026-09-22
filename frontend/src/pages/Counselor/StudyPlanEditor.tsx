import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  LoaderCircle,
  Plus,
  Save,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addTask,
  createPlan,
  deletePlan,
  deleteTask,
  getPlanById,
  updatePlan,
  PRIORITY_LABELS,
  type StudyTaskPriority,
} from "../../api/studyPlanApi";
import api from "../../api/axios";

// ==================== Types ====================
interface TaskForm {
  id?: string;
  title: string;
  description: string;
  lesson: string;
  chapter: string;
  priority: StudyTaskPriority;
  estimatedMinutes: string;
  dueDate: string;
  isNew?: boolean;
}

const emptyTask: TaskForm = {
  title: "",
  description: "",
  lesson: "",
  chapter: "",
  priority: "medium",
  estimatedMinutes: "",
  dueDate: "",
  isNew: true,
};

const priorityOptions: Array<{
  value: StudyTaskPriority;
  label: string;
  color: string;
}> = [
  { value: "high", label: "بالا", color: "text-rose-500" },
  { value: "medium", label: "متوسط", color: "text-amber-500" },
  { value: "low", label: "پایین", color: "text-emerald-500" },
];

const StudyPlanEditor = () => {
  const navigate = useNavigate();
  const { studentId, planId } = useParams<{
    studentId?: string;
    planId?: string;
  }>();

  const isEdit = !!planId;

  // ==================== State ====================
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examId, setExamId] = useState<string>("");
  const [endDate, setEndDate] = useState("");
  const [tasks, setTasks] = useState<TaskForm[]>([]);
  const [deletedTaskIds, setDeletedTaskIds] = useState<string[]>([]);

  const [studentName, setStudentName] = useState<string>("");
  const [exams, setExams] = useState<
    Array<{ id: string; title: string; examDate: string }>
  >([]);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==================== Load ====================
  useEffect(() => {
    const load = async () => {
      try {
        // 🔹 لیست آزمون‌ها (برای dropdown)
        const examsRes = await api.get("/exams", { params: { limit: 100 } });
        setExams(examsRes.data.exams || examsRes.data || []);

        if (isEdit && planId) {
          // 🔹 لود برنامه
          const result = await getPlanById(planId);
          const plan = result.plan;

          setTitle(plan.title);
          setDescription(plan.description ?? "");
          setExamId(plan.exam?.id ?? "");
          setEndDate(plan.endDate ? plan.endDate.slice(0, 10) : "");
          setTasks(
            (plan.tasks ?? []).map((t) => ({
              id: t.id,
              title: t.title,
              description: t.description,
              lesson: t.lesson ?? "",
              chapter: t.chapter ?? "",
              priority: t.priority,
              estimatedMinutes: t.estimatedMinutes
                ? String(t.estimatedMinutes)
                : "",
              dueDate: t.dueDate ? t.dueDate.slice(0, 10) : "",
              isNew: false,
            })),
          );
        } else if (studentId) {
          // 🔹 لود اسم دانش‌آموز
          const studentRes = await api.get(`/counselor/students/${studentId}`);
          const s = studentRes.data.student;
          setStudentName(`${s.firstName} ${s.lastName}`);
        }
      } catch (err) {
        console.error("Failed to load editor data:", err);
        setError("دریافت اطلاعات انجام نشد.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [isEdit, planId, studentId]);

  // ==================== Task Actions ====================
  const addNewTask = () => {
    setTasks((prev) => [...prev, { ...emptyTask }]);
  };

  const updateTaskField = (
    index: number,
    field: keyof TaskForm,
    value: string,
  ) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    );
  };

  const removeTask = (index: number) => {
    const task = tasks[index];
    if (task.id) {
      setDeletedTaskIds((prev) => [...prev, task.id!]);
    }
    setTasks((prev) => prev.filter((_, i) => i !== index));
  };

  // ==================== Save ====================
  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!title.trim() || title.trim().length < 3) {
      setError("عنوان برنامه حداقل ۳ کاراکتر باشه");
      return;
    }

    setSaving(true);
    try {
      if (isEdit && planId) {
        // 🔹 ویرایش برنامه
        await updatePlan(planId, {
          title: title.trim(),
          description: description.trim(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
        });

        // 🔹 حذف تسک‌ها
        for (const taskId of deletedTaskIds) {
          await deleteTask(planId, taskId);
        }

        // 🔹 افزودن تسک‌های جدید
        for (const task of tasks) {
          if (task.isNew && task.title.trim()) {
            await addTask(planId, {
              title: task.title.trim(),
              description: task.description.trim(),
              lesson: task.lesson.trim() || undefined,
              chapter: task.chapter.trim() || undefined,
              priority: task.priority,
              estimatedMinutes: task.estimatedMinutes
                ? Number(task.estimatedMinutes)
                : undefined,
              dueDate: task.dueDate
                ? new Date(task.dueDate).toISOString()
                : undefined,
            });
          }
        }

        setSuccess("برنامه ویرایش شد");
        setTimeout(
          () =>
            navigate(
              `/dashboard/counselor/students/${planId ? "" : studentId}`,
            ),
          1200,
        );
      } else if (studentId) {
        // 🔹 ساخت برنامه جدید
        const validTasks = tasks.filter((t) => t.title.trim());

        const result = await createPlan({
          studentId,
          examId: examId || undefined,
          title: title.trim(),
          description: description.trim(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
          tasks: validTasks.map((t) => ({
            title: t.title.trim(),
            description: t.description.trim(),
            lesson: t.lesson.trim() || undefined,
            chapter: t.chapter.trim() || undefined,
            priority: t.priority,
            estimatedMinutes: t.estimatedMinutes
              ? Number(t.estimatedMinutes)
              : undefined,
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
          })),
        });

        setSuccess("برنامه ساخته شد");
        setTimeout(() => {
          // 🔹 رفتن به صفحه ویرایش برنامه جدید (برای ساخت آزمون شخصی)
          navigate(`/dashboard/counselor/plans/${result.plan.id}/edit`);
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to save plan:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ذخیره انجام نشد";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ==================== Delete Plan ====================
  const handleDeletePlan = async () => {
    if (!planId) return;
    if (
      !window.confirm(
        "آیا از حذف این برنامه مطمئنی؟ تمام تسک‌ها و آزمون شخصی هم حذف میشن.",
      )
    )
      return;

    try {
      await deletePlan(planId);
      navigate(-1);
    } catch (err) {
      console.error("Failed to delete plan:", err);
      setError("حذف انجام نشد");
    }
  };

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <LoaderCircle
          size={32}
          className="text-[var(--griffin-gold)] animate-spin"
        />
      </main>
    );
  }

  // ==================== JSX ====================
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-5">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت
        </button>

        {/* Hero */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative shrink-0 self-center sm:self-auto">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                <Target size={26} strokeWidth={2.3} />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                {isEdit ? "Edit Plan" : "New Plan"}
              </p>
              <h1 className="font-heading text-xl sm:text-2xl font-black text-white -mt-0.5">
                {isEdit ? "ویرایش برنامه" : "برنامه جدید"}
              </h1>
              {studentName && (
                <p className="mt-1 text-xs text-gray-400">
                  برای: {studentName}
                </p>
              )}
            </div>

            <div className="shrink-0 self-center sm:self-auto flex gap-2">
              {isEdit && (
                <button
                  type="button"
                  onClick={() => void handleDeletePlan()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-2.5 font-black text-rose-500 text-xs hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 size={13} />
                  حذف
                </button>
              )}

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 font-black text-white text-xs shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl disabled:opacity-40 transition-all"
              >
                {saving ? (
                  <>
                    <LoaderCircle size={13} className="animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    ذخیره
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Messages */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-6">
              {error}
            </p>
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-2.5">
            <Check
              size={16}
              className="text-emerald-500 shrink-0 mt-0.5"
              strokeWidth={3}
            />
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-6">
              {success}
            </p>
          </div>
        )}

        {/* Basic Info */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
              <Sparkles size={15} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Basic Info
              </p>
              <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                اطلاعات پایه
              </h2>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              عنوان برنامه *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: برنامه رفع ضعف آزمون ۱۵ آبان"
              maxLength={200}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              توضیحات
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="توضیحات اختیاری..."
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Exam */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                <BookOpen size={10} />
                آزمون مرتبط
              </label>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                disabled={isEdit}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all disabled:opacity-60"
              >
                <option value="">بدون آزمون</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>

            {/* End Date */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                <Calendar size={10} />
                ددلاین
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
              />
            </div>
          </div>
        </section>

        {/* Tasks */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          <div className="p-5 border-b border-gray-200/70 dark:border-white/5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <Check size={15} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Tasks
                </p>
                <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                  تسک‌های مطالعاتی ({tasks.length.toLocaleString("fa-IR")})
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={addNewTask}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 px-3 py-2 text-[10px] font-black text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 transition-all"
            >
              <Plus size={11} />
              افزودن تسک
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <Check size={28} className="text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                هنوز تسکی اضافه نشده
              </p>
              <button
                onClick={addNewTask}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-purple-500 to-purple-700 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-purple-500/40 hover:shadow-xl transition-all"
              >
                <Plus size={13} />
                افزودن تسک
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {tasks.map((task, index) => (
                <TaskEditor
                  key={task.id ?? `new-${index}`}
                  task={task}
                  index={index}
                  onUpdate={(field, value) =>
                    updateTaskField(index, field, value)
                  }
                  onRemove={() => removeTask(index)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Personal Exam Notice */}
        {isEdit && (
          <section className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                  آزمون شخصی
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  برای این برنامه یه آزمون از بانک سوال بساز
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(`/dashboard/counselor/plans/${planId}/exam-builder`)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-500 to-blue-700 px-5 py-3 font-black text-white text-xs shadow-lg shadow-blue-500/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Plus size={13} />
              ساخت آزمون
            </button>
          </section>
        )}
      </div>
    </main>
  );
};

// ==================== TaskEditor ====================
interface TaskEditorProps {
  task: TaskForm;
  index: number;
  onUpdate: (field: keyof TaskForm, value: string) => void;
  onRemove: () => void;
}

const TaskEditor = ({ task, index, onUpdate, onRemove }: TaskEditorProps) => {
  return (
    <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-heading text-xs font-black tabular-nums">
            {(index + 1).toLocaleString("fa-IR")}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            {task.isNew ? "تسک جدید" : "تسک"}
          </span>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
        >
          <X size={13} />
        </button>
      </div>

      {/* Fields */}
      <div className="grid gap-3">
        {/* Title */}
        <input
          type="text"
          value={task.title}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="عنوان تسک * (مثلاً: فصل ۳ زیست)"
          maxLength={200}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
        />

        {/* Description */}
        <textarea
          value={task.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="توضیحات (اختیاری)"
          rows={2}
          maxLength={1000}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all resize-none"
        />

        {/* Row */}
        <div className="grid sm:grid-cols-4 gap-3">
          <input
            type="text"
            value={task.lesson}
            onChange={(e) => onUpdate("lesson", e.target.value)}
            placeholder="درس"
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
          />

          <input
            type="text"
            value={task.chapter}
            onChange={(e) => onUpdate("chapter", e.target.value)}
            placeholder="فصل"
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
          />

          <select
            value={task.priority}
            onChange={(e) => onUpdate("priority", e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
          >
            {priorityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={task.estimatedMinutes}
            onChange={(e) => onUpdate("estimatedMinutes", e.target.value)}
            placeholder="دقیقه"
            min={1}
            max={1440}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
          />
        </div>

        {/* Due Date */}
        <input
          type="date"
          value={task.dueDate}
          onChange={(e) => onUpdate("dueDate", e.target.value)}
          className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
        />
      </div>
    </div>
  );
};

export default StudyPlanEditor;
