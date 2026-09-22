import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Compass,
  Eye,
  GraduationCap,
  LoaderCircle,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  adminCreatePlan,
  adminGetPlan,
  adminUpdatePlan,
  GRADE_OPTIONS,
  MAJOR_OPTIONS,
  type StrategyData,
} from "../../api/strategyApi";
import StrategyTable from "../../components/strategy/StrategyTable";

// ==================== Types ====================
interface FormState {
  title: string;
  description: string;
  grade: string;
  major: string;
  lessons: string[];
  exams: Array<{ title: string; cells: string[] }>;
}

const emptyForm: FormState = {
  title: "",
  description: "",
  grade: "12",
  major: "experimental",
  lessons: ["زیست"],
  exams: [{ title: "آزمون ۱", cells: [""] }],
};

const StrategyPlanEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // ==================== Load (اگه ویرایش) ====================
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { plan } = await adminGetPlan(id);
        setForm({
          title: plan.title,
          description: plan.description || "",
          grade: plan.grade,
          major: plan.major,
          lessons: plan.data.lessons,
          exams: plan.data.exams.map((e) => ({
            title: e.title,
            cells: [...e.cells],
          })),
        });
      } catch (err) {
        console.error("Failed to load plan:", err);
        setError("دریافت برنامه راهبردی انجام نشد.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  // ==================== Lessons (ستونها) ====================
  const addLesson = () => {
    setForm((f) => ({
      ...f,
      lessons: [...f.lessons, `درس ${f.lessons.length + 1}`],
      // 🆕 برای هر آزمون، یه خونه جدید اضافه کن
      exams: f.exams.map((e) => ({
        ...e,
        cells: [...e.cells, ""],
      })),
    }));
  };

  const removeLesson = (index: number) => {
    if (form.lessons.length <= 1) {
      setError("حداقل یک درس لازم است");
      return;
    }
    setForm((f) => ({
      ...f,
      lessons: f.lessons.filter((_, i) => i !== index),
      exams: f.exams.map((e) => ({
        ...e,
        cells: e.cells.filter((_, i) => i !== index),
      })),
    }));
  };

  const updateLesson = (index: number, value: string) => {
    setForm((f) => ({
      ...f,
      lessons: f.lessons.map((l, i) => (i === index ? value : l)),
    }));
  };

  // ==================== Exams (ردیفها) ====================
  const addExam = () => {
    setForm((f) => ({
      ...f,
      exams: [
        ...f.exams,
        {
          title: `آزمون ${f.exams.length + 1}`,
          cells: f.lessons.map(() => ""),
        },
      ],
    }));
  };

  const removeExam = (index: number) => {
    if (form.exams.length <= 1) {
      setError("حداقل یک آزمون لازم است");
      return;
    }
    setForm((f) => ({
      ...f,
      exams: f.exams.filter((_, i) => i !== index),
    }));
  };

  const updateExamTitle = (index: number, value: string) => {
    setForm((f) => ({
      ...f,
      exams: f.exams.map((e, i) => (i === index ? { ...e, title: value } : e)),
    }));
  };

  const updateCell = (examIndex: number, cellIndex: number, value: string) => {
    setForm((f) => ({
      ...f,
      exams: f.exams.map((e, i) =>
        i === examIndex
          ? {
              ...e,
              cells: e.cells.map((c, j) => (j === cellIndex ? value : c)),
            }
          : e,
      ),
    }));
  };

  // ==================== Save ====================
  const handleSave = async () => {
    setError("");
    setSuccess("");

    // 🔹 Validation
    if (!form.title.trim() || form.title.trim().length < 3) {
      setError("عنوان برنامه حداقل ۳ کاراکتر باشد");
      return;
    }
    if (form.lessons.some((l) => !l.trim())) {
      setError("نام همه درسها الزامی است");
      return;
    }
    if (form.exams.some((e) => !e.title.trim())) {
      setError("عنوان همه آزمون‌ها الزامی است");
      return;
    }
    // چک تعداد cells
    for (const exam of form.exams) {
      if (exam.cells.length !== form.lessons.length) {
        setError("تعداد ستونهای هر آزمون با تعداد درسها برابر نیست");
        return;
      }
    }

    const data: StrategyData = {
      lessons: form.lessons.map((l) => l.trim()),
      exams: form.exams.map((e) => ({
        title: e.title.trim(),
        cells: e.cells.map((c) => c.trim()),
      })),
    };

    setSaving(true);
    try {
      if (isEdit && id) {
        await adminUpdatePlan(id, {
          title: form.title.trim(),
          description: form.description.trim(),
          grade: form.grade,
          major: form.major,
          data,
        });
        setSuccess("برنامه راهبردی ویرایش شد");
      } else {
        await adminCreatePlan({
          title: form.title.trim(),
          description: form.description.trim(),
          grade: form.grade,
          major: form.major,
          data,
          isPublished: false,
        });
        setSuccess("برنامه راهبردی ساخته شد");
      }

      setTimeout(() => {
        navigate("/admin/strategy-plans");
      }, 1200);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ذخیره برنامه انجام نشد";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-3">
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
                  <LoaderCircle size={24} className="text-white animate-spin" />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                در حال دریافت برنامه...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==================== JSX ====================
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* ==================== Back ==================== */}
        <button
          type="button"
          onClick={() => navigate("/admin/strategy-plans")}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت به لیست
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
                  {isEdit ? "Edit Plan" : "New Plan"}
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                {isEdit ? "ویرایش برنامه راهبردی" : "ساخت برنامه راهبردی"}
              </h1>

              <p className="mt-1.5 text-sm text-gray-400">
                جدول آزمون‌های سال تحصیلی رو بساز و منتشر کن
              </p>
            </div>

            <div className="shrink-0 self-center sm:self-auto flex gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 backdrop-blur-sm px-4 py-2.5 font-black text-[var(--griffin-gold)] text-xs hover:bg-[var(--griffin-gold)]/10 transition-all"
              >
                <Eye size={13} />
                پیشنمایش
              </button>

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 font-black text-white text-xs shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 transition-all"
              >
                {saving ? (
                  <>
                    <LoaderCircle size={13} className="animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save size={13} />
                    {isEdit ? "ذخیره تغییرات" : "ساخت برنامه"}
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* ==================== پیامها ==================== */}
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

        {/* ==================== اطلاعات پایه ==================== */}
        <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

          <div className="p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                <Calendar size={15} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Basic Info
                </p>
                <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                  اطلاعات پایه
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* عنوان */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  عنوان برنامه
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="مثلاً: برنامه راهبردی کنکور ۱۴۰۴ - تجربی"
                  maxLength={200}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                />
              </div>

              {/* توضیحات */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  توضیحات (اختیاری)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  maxLength={1000}
                  placeholder="توضیحات اختیاری درباره برنامه..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all resize-none"
                />
              </div>

              {/* پایه */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  <GraduationCap size={10} />
                  پایه تحصیلی
                </label>
                <select
                  value={form.grade}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, grade: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* رشته */}
              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  <Compass size={10} />
                  رشته تحصیلی
                </label>
                <select
                  value={form.major}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, major: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                >
                  {MAJOR_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== درسها ==================== */}
        <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                  <Sparkles size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Lessons
                  </p>
                  <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                    درسها (ستونها)
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={addLesson}
                disabled={form.lessons.length >= 20}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 px-3 py-2 text-[10px] font-black text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 disabled:opacity-40 transition-all"
              >
                <Plus size={11} />
                افزودن درس
              </button>
            </div>
          </div>

          <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {form.lessons.map((lesson, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-2"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center text-[10px] font-black shrink-0 tabular-nums">
                  {(i + 1).toLocaleString("fa-IR")}
                </div>
                <input
                  type="text"
                  value={lesson}
                  onChange={(e) => updateLesson(i, e.target.value)}
                  maxLength={50}
                  placeholder={`درس ${i + 1}`}
                  className="flex-1 rounded-lg border-0 bg-transparent px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:bg-white/50 dark:focus:bg-white/5 transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeLesson(i)}
                  disabled={form.lessons.length <= 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-30 transition-all shrink-0"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== آزمون‌ها و جدول ==================== */}
        <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Calendar size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Schedule
                  </p>
                  <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                    جدول آزمون‌ها
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={addExam}
                disabled={form.exams.length >= 50}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 px-3 py-2 text-[10px] font-black text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 disabled:opacity-40 transition-all"
              >
                <Plus size={11} />
                افزودن آزمون
              </button>
            </div>
          </div>

          <div className="p-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-right">
              <thead>
                <tr>
                  <th className="px-2 pb-3 text-right min-w-[140px]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                      آزمون
                    </span>
                  </th>
                  {form.lessons.map((lesson, i) => (
                    <th key={i} className="px-2 pb-3 text-center min-w-[120px]">
                      <span className="font-heading text-xs font-black text-gray-900 dark:text-white">
                        {lesson || `درس ${i + 1}`}
                      </span>
                    </th>
                  ))}
                  <th className="px-2 pb-3 w-[60px]" />
                </tr>
              </thead>
              <tbody>
                {form.exams.map((exam, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-t border-gray-200/70 dark:border-white/5"
                  >
                    {/* عنوان آزمون */}
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={exam.title}
                        onChange={(e) =>
                          updateExamTitle(rowIndex, e.target.value)
                        }
                        maxLength={100}
                        placeholder={`آزمون ${rowIndex + 1}`}
                        className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-2.5 py-1.5 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                      />
                    </td>

                    {/* خونهها */}
                    {exam.cells.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-2 py-2">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) =>
                            updateCell(rowIndex, cellIndex, e.target.value)
                          }
                          maxLength={200}
                          placeholder="—"
                          className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-[var(--griffin-gold)] transition-all"
                        />
                      </td>
                    ))}

                    {/* حذف آزمون */}
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        onClick={() => removeExam(rowIndex)}
                        disabled={form.exams.length <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-30 transition-all mx-auto"
                        title="حذف آزمون"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ==================== دکمه ذخیره (پایین) ==================== */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/strategy-plans")}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-5 py-3 font-black text-gray-600 dark:text-gray-300 text-xs hover:border-rose-500/40 hover:text-rose-500 transition-all disabled:opacity-40"
          >
            انصراف
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3 font-black text-white text-xs shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 transition-all"
          >
            {saving ? (
              <>
                <LoaderCircle size={13} className="animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save size={13} />
                {isEdit ? "ذخیره تغییرات" : "ساخت برنامه"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==================== Modal پیشنمایش ==================== */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0d14] shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

            <div className="flex items-start justify-between gap-3 p-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                    <Eye size={20} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Preview
                  </p>
                  <h2 className="font-heading text-lg font-black text-white">
                    پیشنمایش جدول
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 hover:text-rose-400 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <StrategyTable
                  data={{
                    lessons: form.lessons.map((l) => l || "—"),
                    exams: form.exams.map((e) => ({
                      title: e.title || "—",
                      cells: e.cells.map((c) => c || "—"),
                    })),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default StrategyPlanEditor;
