import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  FileQuestion,
  GripVertical,
  Layers,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  Sparkles,
  Target,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addExamBooklets,
  changeExamStatus,
  createExam,
  deleteExam,
  duplicateExam,
  getExam,
  getExams,
  removeExamBooklet,
  reorderExamBooklets,
  updateExam,
  type Exam,
  type ExamStatus,
} from "../api/examApi";
import { getBooklets, type Booklet } from "../api/bookletApi";
import { useAuth } from "../context/AuthContext";

// ==================== ثابت‌ها ====================
const emptyForm = {
  title: "",
  examDate: "",
  startTime: "08:00",
  endTime: "10:30",
};

const statusLabels: Record<ExamStatus, string> = {
  draft: "پیش‌نویس",
  review: "در حال بررسی",
  published: "منتشرشده",
  archived: "آرشیو",
};

const statusStyles: Record<
  ExamStatus,
  { bg: string; text: string; dot: string; icon: typeof Check }
> = {
  draft: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
    icon: Pencil,
  },
  review: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    icon: Clock3,
  },
  published: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  archived: {
    bg: "bg-slate-500/10",
    text: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
    icon: FileQuestion,
  },
};

const apiError = (error: unknown, fallback: string) => {
  const response = (
    error as { response?: { data?: { message?: string; errors?: string[] } } }
  )?.response;
  if (response?.data?.errors?.length) return response.data.errors.join("\n");
  return response?.data?.message || fallback;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("fa-IR", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const bookletQuestionCount = (booklet: Booklet) =>
  booklet.questions?.length ?? booklet._count?.questions ?? 0;

const isDraft = (exam: Exam | null) => !exam || exam.status === "draft";

// ==================== کامپوننت اصلی ====================
export default function ExamBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isList = !id;
  const isNew = id === "new";

  const [exam, setExam] = useState<Exam | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [pendingBooklets, setPendingBooklets] = useState<Booklet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerBooklets, setPickerBooklets] = useState<Booklet[]>([]);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerPage, setPickerPage] = useState(1);
  const [pickerTotalPages, setPickerTotalPages] = useState(1);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const displayedBooklets = useMemo(() => {
    if (exam) return exam.booklets ?? [];
    return pendingBooklets.map((booklet, index) => ({
      id: `pending-${booklet.id}`,
      examId: "",
      bookletId: booklet.id,
      order: index + 1,
      booklet: { ...booklet, questions: booklet.questions ?? [] },
    }));
  }, [exam, pendingBooklets]);

  const currentIds = useMemo(
    () => new Set(displayedBooklets.map((item) => item.bookletId)),
    [displayedBooklets],
  );
  const editable = isDraft(exam);
  const questionCount = displayedBooklets.reduce(
    (sum, item) => sum + bookletQuestionCount(item.booklet as Booklet),
    0,
  );
  const duration = displayedBooklets.reduce(
    (sum, item) => sum + (item.booklet.duration || 0),
    0,
  );

  // ==================== Load ====================
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      if (isList) {
        try {
          const result = await getExams({
            page: 1,
            limit: 30,
            sort: "createdAt",
            order: "desc",
          });
          if (!cancelled) setExams(result.exams ?? []);
        } catch (err) {
          if (!cancelled) setError(apiError(err, "دریافت آزمون‌ها انجام نشد."));
        } finally {
          if (!cancelled) setLoading(false);
        }
        return;
      }

      if (isNew) {
        if (!cancelled) {
          setExam(null);
          setForm(emptyForm);
          setPendingBooklets([]);
          setPickerOpen(false);
          setPickerSelected([]);
          setLoading(false);
        }
        return;
      }

      try {
        const result = await getExam(id);
        if (cancelled) return;
        setExam(result);
        setForm({
          title: result.title ?? "",
          examDate: result.examDate ? result.examDate.slice(0, 16) : "",
          startTime: result.startTime ?? "08:00",
          endTime: result.endTime ?? "",
        });
      } catch (err) {
        if (!cancelled) setError(apiError(err, "دریافت آزمون انجام نشد."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, isList, isNew]);

  // ==================== Picker ====================
  const loadPicker = async (page = 1) => {
    setPickerLoading(true);
    try {
      const result = await getBooklets({
        page,
        limit: 8,
        search: pickerSearch || undefined,
        status: "published",
        sort: "updatedAt",
        order: "desc",
      });
      setPickerBooklets(result.booklets ?? []);
      setPickerPage(result.pagination.page);
      setPickerTotalPages(Math.max(1, result.pagination.totalPages));
    } catch (err) {
      setError(apiError(err, "دریافت دفترچه‌های منتشرشده انجام نشد."));
    } finally {
      setPickerLoading(false);
    }
  };

  const openPicker = () => {
    if (!editable || saving) return;
    setPickerSelected([]);
    setPickerOpen(true);
    void loadPicker(1);
  };

  const togglePicker = (booklet: Booklet) => {
    if (currentIds.has(booklet.id)) return;
    setPickerSelected((current) =>
      current.includes(booklet.id)
        ? current.filter((item) => item !== booklet.id)
        : [...current, booklet.id],
    );
  };

  const addSelected = async () => {
    if (!pickerSelected.length || saving || !editable) return;
    setSaving(true);
    setError("");
    try {
      if (exam) {
        setExam(
          await addExamBooklets(
            exam.id,
            pickerSelected.filter((item) => !currentIds.has(item)),
          ),
        );
      } else {
        const selected = pickerBooklets.filter((item) =>
          pickerSelected.includes(item.id),
        );
        setPendingBooklets((current) => {
          const ids = new Set(current.map((item) => item.id));
          return [...current, ...selected.filter((item) => !ids.has(item.id))];
        });
      }
      setPickerSelected([]);
      setPickerOpen(false);
    } catch (err) {
      setError(apiError(err, "افزودن دفترچه به آزمون انجام نشد."));
    } finally {
      setSaving(false);
    }
  };

  const removeBooklet = async (bookletId: string) => {
    if (saving || !editable) return;
    if (displayedBooklets.length <= 1) {
      setError("آزمون باید حداقل یک دفترچه داشته باشد.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (exam) setExam(await removeExamBooklet(exam.id, bookletId));
      else
        setPendingBooklets((current) =>
          current.filter((item) => item.id !== bookletId),
        );
    } catch (err) {
      setError(apiError(err, "حذف دفترچه از آزمون انجام نشد."));
    } finally {
      setSaving(false);
    }
  };

  const moveBooklet = async (from: number, to: number) => {
    if (
      from === to ||
      saving ||
      !editable ||
      to < 0 ||
      to >= displayedBooklets.length
    )
      return;
    const next = [...displayedBooklets];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    if (!exam) {
      const map = new Map(pendingBooklets.map((item) => [item.id, item]));
      setPendingBooklets(
        next
          .map((item) => map.get(item.bookletId))
          .filter(Boolean) as Booklet[],
      );
      return;
    }
    setSaving(true);
    setError("");
    try {
      setExam(
        await reorderExamBooklets(
          exam.id,
          next.map((item, index) => ({ id: item.bookletId, order: index + 1 })),
        ),
      );
    } catch (err) {
      setError(apiError(err, "تغییر ترتیب دفترچه‌ها انجام نشد."));
    } finally {
      setSaving(false);
    }
  };

  // ==================== Save / Status ====================
  const save = async () => {
    if (!editable || saving) return;
    if (form.title.trim().length < 3)
      return setError("عنوان آزمون را وارد کنید.");
    if (!form.examDate) return setError("تاریخ آزمون را مشخص کنید.");
    if (!form.startTime) return setError("زمان شروع را مشخص کنید.");
    if (!displayedBooklets.length)
      return setError("حداقل یک دفترچه برای آزمون انتخاب کنید.");
    setSaving(true);
    setError("");
    try {
      if (!exam) {
        const created = await createExam({
          ...form,
          title: form.title.trim(),
          bookletIds: displayedBooklets.map((item) => item.bookletId),
        });
        setExam(created);
        navigate(`/exam-builder/${created.id}`, { replace: true });
      } else {
        setExam(
          await updateExam(exam.id, {
            title: form.title.trim(),
            examDate: form.examDate,
            startTime: form.startTime,
            endTime: form.endTime,
          }),
        );
      }
    } catch (err) {
      setError(apiError(err, "ذخیره آزمون انجام نشد."));
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (status: ExamStatus) => {
    if (!exam || saving) return;
    setSaving(true);
    setError("");
    try {
      setExam(await changeExamStatus(exam.id, status));
    } catch (err) {
      setError(apiError(err, "تغییر وضعیت آزمون انجام نشد."));
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async () => {
    if (!exam || saving) return;
    setSaving(true);
    setError("");
    try {
      const copy = await duplicateExam(exam.id);
      navigate(`/exam-builder/${copy.id}`);
    } catch (err) {
      setError(apiError(err, "کپی آزمون انجام نشد."));
    } finally {
      setSaving(false);
    }
  };

  const removeExam = async (item: Exam) => {
    if (!window.confirm("آیا از حذف این آزمون مطمئن هستید؟")) return;
    try {
      await deleteExam(item.id);
      setExams((current) => current.filter((x) => x.id !== item.id));
    } catch (err) {
      setError(apiError(err, "حذف آزمون انجام نشد."));
    }
  };

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <LoaderCircle size={28} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت...
          </p>
        </div>
      </main>
    );
  }

  // ==================== لیست ====================
  if (isList) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl space-y-5">
          {/* HERO */}
          <section className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/10 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

            <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:justify-between">
              <div className="flex items-start gap-4 min-w-0">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60 animate-pulse" />
                  <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                    <FileQuestion size={28} strokeWidth={2.3} />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <Sparkles
                      size={11}
                      className="text-[var(--griffin-gold)]"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                      Exam Builder
                    </span>
                  </div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                    مدیریت آزمون‌ها
                  </h1>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    آزمون بساز، دفترچه‌ها رو مرتب کن و منتشر کن
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/exam-builder/new")}
                className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden shrink-0"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus size={17} />
                  آزمون جدید
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-l from-rose-500/10 to-transparent p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                  <AlertCircle size={16} className="text-rose-500" />
                </div>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400 whitespace-pre-line">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* لیست */}
          {exams.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-sm p-12 text-center">
              <div className="relative inline-flex mb-5">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-40" />
                <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center">
                  <FileQuestion
                    size={28}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
              </div>

              <h3 className="font-heading text-xl font-black text-gray-900 dark:text-white mb-2">
                هنوز آزمونی نساختی
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-md mx-auto">
                برای شروع، اولین آزمونت رو بساز و دفترچه‌هاش رو انتخاب کن.
              </p>

              <button
                onClick={() => navigate("/exam-builder/new")}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-sm font-black text-white shadow-lg"
              >
                <Plus size={15} />
                ساخت آزمون جدید
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {exams.map((item, index) => {
                const status = statusStyles[item.status];
                const StatusIcon = status.icon;
                const bookletCount = item.booklets?.length ?? 0;
                const qCount = item.questionCount ?? 0;

                return (
                  <article
                    key={item.id}
                    style={{
                      animationDelay: `${Math.min(index * 50, 400)}ms`,
                    }}
                    className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/10 hover:border-[var(--griffin-gold)]/40 animate-[fadeInUp_0.4s_ease-out_both]"
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

                    {/* هدر */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-base font-black text-gray-900 dark:text-white truncate group-hover:text-[var(--griffin-gold)] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                          {bookletCount.toLocaleString("fa-IR")} دفترچه ·{" "}
                          {qCount.toLocaleString("fa-IR")} سوال
                        </p>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${status.bg} ${status.text}`}
                      >
                        <StatusIcon size={10} />
                        {statusLabels[item.status]}
                      </span>
                    </div>

                    {/* اطلاعات */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/70 dark:border-white/5 p-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <CalendarDays
                            size={10}
                            className="text-[var(--griffin-gold)]"
                          />
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            تاریخ
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate">
                          {formatDate(item.examDate)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/70 dark:border-white/5 p-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Clock3
                            size={10}
                            className="text-[var(--griffin-gold)]"
                          />
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            زمان
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-900 dark:text-white truncate tabular-nums">
                          {item.startTime} - {item.endTime || "—"}
                        </p>
                      </div>
                    </div>

                    {/* دکمه‌ها */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/exam-builder/${item.id}`)}
                        className="group/btn flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-[var(--griffin-gold)]/30 hover:shadow-lg transition-all overflow-hidden relative"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <Pencil size={13} />
                          ویرایش
                        </span>
                        <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                      </button>

                      <button
                        onClick={() => void removeExam(item)}
                        className="shrink-0 w-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    );
  }

  // ==================== ادیت ====================
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* BACK */}
        <button
          onClick={() => navigate("/exam-builder")}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
        >
          <ArrowRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5"
          />
          بازگشت به آزمون‌ها
        </button>

        {/* HERO */}
        <section className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/10 blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-5 lg:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                  <FileQuestion size={24} strokeWidth={2.3} />
                </div>
              </div>

              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 mb-1.5">
                  <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    {exam ? "Edit Exam" : "New Exam"}
                  </span>
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  {exam ? "ویرایش آزمون" : "آزمون جدید"}
                </h1>
                {exam && (
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <StatusBadge status={exam.status} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {displayedBooklets.length.toLocaleString("fa-IR")} دفترچه
                      · {questionCount.toLocaleString("fa-IR")} سوال ·{" "}
                      {duration.toLocaleString("fa-IR")} دقیقه
                    </span>
                  </div>
                )}
              </div>
            </div>

            {exam && (
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm px-4 py-2.5 text-xs font-black text-gray-700 dark:text-gray-200 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] transition-all"
                >
                  <Target size={14} />
                  پیش‌نمایش
                </button>
                <button
                  disabled={saving}
                  onClick={() => void duplicate()}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-sm px-4 py-2.5 text-xs font-black text-gray-700 dark:text-gray-200 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-40 transition-all"
                >
                  <Copy size={14} />
                  کپی
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-l from-rose-500/10 to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                <AlertCircle size={16} className="text-rose-500" />
              </div>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 whitespace-pre-line">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* گرید ادیت */}
        <section className="grid gap-5 lg:grid-cols-[340px_1fr]">
          {/* ستون چپ */}
          <aside className="space-y-4">
            {/* اطلاعات آزمون */}
            <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Basic Info
                    </p>
                    <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                      اطلاعات آزمون
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block">
                    <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      عنوان آزمون *
                    </span>
                    <input
                      disabled={!editable}
                      value={form.title}
                      onChange={(e) =>
                        setForm((x) => ({ ...x, title: e.target.value }))
                      }
                      placeholder="مثلاً آزمون ۱۷ مهر ریاضی"
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 disabled:opacity-60 transition-all"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      تاریخ آزمون *
                    </span>
                    <input
                      disabled={!editable}
                      type="datetime-local"
                      value={form.examDate}
                      onChange={(e) =>
                        setForm((x) => ({ ...x, examDate: e.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 disabled:opacity-60 transition-all"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                        شروع
                      </span>
                      <input
                        disabled={!editable}
                        type="time"
                        value={form.startTime}
                        onChange={(e) =>
                          setForm((x) => ({ ...x, startTime: e.target.value }))
                        }
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 disabled:opacity-60 transition-all tabular-nums"
                      />
                    </label>

                    <label className="block">
                      <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                        پایان
                      </span>
                      <input
                        disabled={!editable}
                        type="time"
                        value={form.endTime}
                        onChange={(e) =>
                          setForm((x) => ({ ...x, endTime: e.target.value }))
                        }
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 disabled:opacity-60 transition-all tabular-nums"
                      />
                    </label>
                  </div>
                </div>

                <button
                  disabled={saving || !editable}
                  onClick={() => void save()}
                  className="group relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl disabled:opacity-40 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {saving ? (
                      <>
                        <LoaderCircle size={16} className="animate-spin" />
                        در حال ذخیره...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        ذخیره اطلاعات
                      </>
                    )}
                  </span>
                  {!saving && editable && (
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}
                </button>
              </div>
            </div>

            {/* وضعیت آزمون */}
            {exam && (
              <div className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                      <Zap size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Status
                      </p>
                      <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                        وضعیت آزمون
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {exam.status === "draft" && (
                      <button
                        disabled={saving || !exam.booklets?.length}
                        onClick={() => void changeStatus("review")}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl disabled:opacity-40 transition-all"
                      >
                        <Send size={15} />
                        ارسال برای بررسی
                      </button>
                    )}

                    {exam.status === "review" && (
                      <>
                        <button
                          disabled={saving}
                          onClick={() => void changeStatus("draft")}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-3 text-sm font-black text-gray-700 dark:text-gray-200 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-40 transition-all"
                        >
                          بازگشت به پیش‌نویس
                        </button>

                        {user?.role?.name === "ADMIN" && (
                          <button
                            disabled={saving || !exam.booklets?.length}
                            onClick={() => void changeStatus("published")}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-4 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl disabled:opacity-40 transition-all"
                          >
                            <Check size={15} />
                            انتشار
                          </button>
                        )}
                      </>
                    )}

                    {exam.status === "published" && (
                      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-center">
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          این آزمون منتشر شده است
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* ستون راست: دفترچه‌ها */}
          <section className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

            <div className="flex flex-col gap-3 p-5 border-b border-gray-200/70 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                  <Layers size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Booklets
                  </p>
                  <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                    دفترچه‌های آزمون
                  </h2>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {displayedBooklets.length.toLocaleString("fa-IR")} دفترچه ·{" "}
                    {questionCount.toLocaleString("fa-IR")} سوال ·{" "}
                    {duration.toLocaleString("fa-IR")} دقیقه
                  </p>
                </div>
              </div>

              <button
                disabled={saving || !editable}
                onClick={openPicker}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-[var(--griffin-gold)]/30 hover:shadow-lg disabled:opacity-40 transition-all shrink-0"
              >
                <Plus size={14} />
                افزودن دفترچه
              </button>
            </div>

            <div className="p-5">
              {displayedBooklets.length ? (
                <div className="space-y-2.5">
                  {displayedBooklets.map((item, index) => (
                    <div
                      key={item.id}
                      draggable={editable}
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedIndex !== null)
                          void moveBooklet(draggedIndex, index);
                        setDraggedIndex(null);
                      }}
                      className={`
                        group relative rounded-2xl border border-gray-200 dark:border-white/10
                        bg-white/60 dark:bg-white/[0.02] backdrop-blur-sm p-4
                        transition-all duration-300
                        hover:border-[var(--griffin-gold)]/40 hover:shadow-md
                        ${draggedIndex === index ? "opacity-50 scale-95" : ""}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {/* Drag Handle */}
                        <div
                          className={`
                            shrink-0 w-6 flex items-center justify-center
                            ${editable ? "cursor-grab active:cursor-grabbing text-gray-400 hover:text-[var(--griffin-gold)]" : "opacity-30 text-gray-300"}
                            transition-colors
                          `}
                        >
                          <GripVertical size={16} />
                        </div>

                        {/* شماره */}
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-md opacity-30" />
                          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-base shadow-lg">
                            {(index + 1).toLocaleString("fa-IR")}
                          </div>
                        </div>

                        {/* اطلاعات */}
                        <div className="min-w-0 flex-1">
                          <p className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
                            {item.booklet.title ||
                              item.booklet.lesson ||
                              "بدون عنوان"}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                            <span className="font-bold text-[var(--griffin-gold)]">
                              {item.booklet.lesson}
                            </span>
                            <span>·</span>
                            <span>
                              {item.booklet.grade} | {item.booklet.major}
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <FileQuestion size={10} />
                              {bookletQuestionCount(
                                item.booklet as Booklet,
                              ).toLocaleString("fa-IR")}{" "}
                              سوال
                            </span>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 size={10} />
                              {item.booklet.duration.toLocaleString(
                                "fa-IR",
                              )}{" "}
                              دقیقه
                            </span>
                          </div>
                        </div>

                        {/* دکمه حذف */}
                        <button
                          disabled={
                            saving || !editable || displayedBooklets.length <= 1
                          }
                          onClick={() => void removeBooklet(item.bookletId)}
                          className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-rose-500/15 hover:text-rose-500 disabled:opacity-30 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                  <div className="text-center px-6">
                    <div className="relative inline-flex mb-4">
                      <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-30" />
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center">
                        <Layers
                          size={24}
                          className="text-gray-400 dark:text-gray-500"
                        />
                      </div>
                    </div>
                    <p className="font-heading text-sm font-black text-gray-900 dark:text-white mb-1">
                      هنوز دفترچه‌ای انتخاب نشده
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      برای ساخت آزمون، حداقل یک دفترچه منتشرشده انتخاب کن.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>

      {/* ==================== PICKER MODAL ==================== */}
      {pickerOpen && (
        <Modal
          title="انتخاب دفترچه"
          subtitle="فقط دفترچه‌های منتشرشده"
          onClose={() => !saving && setPickerOpen(false)}
        >
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
              />
              <input
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void loadPicker(1);
                }}
                placeholder="جستجو در عنوان، درس یا مشخصات..."
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-3 pr-10 pl-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
              />
            </div>
            <button
              onClick={() => void loadPicker(1)}
              className="shrink-0 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 text-sm font-black text-white shadow-md shadow-[var(--griffin-gold)]/30"
            >
              جستجو
            </button>
          </div>

          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            {pickerLoading ? (
              <div className="py-12 text-center">
                <LoaderCircle
                  size={24}
                  className="mx-auto text-[var(--griffin-gold)] animate-spin mb-2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  در حال دریافت...
                </p>
              </div>
            ) : pickerBooklets.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  دفترچه منتشرشده‌ای پیدا نشد.
                </p>
              </div>
            ) : (
              pickerBooklets.map((booklet) => {
                const isCurrent = currentIds.has(booklet.id);
                const isSelected = pickerSelected.includes(booklet.id);
                const selected = isSelected || isCurrent;

                return (
                  <button
                    key={booklet.id}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => togglePicker(booklet)}
                    className={`
                      w-full rounded-2xl border p-3.5 text-right transition-all
                      ${
                        selected
                          ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)]/5 shadow-md shadow-[var(--griffin-gold)]/10"
                          : "border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] hover:border-[var(--griffin-gold)]/40"
                      }
                      ${isCurrent ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                          mt-0.5 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                          ${
                            selected
                              ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)] text-white"
                              : "border-gray-300 dark:border-white/20"
                          }
                        `}
                      >
                        {selected && <Check size={13} strokeWidth={3} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
                          {booklet.title || booklet.lesson}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                          <span className="font-bold text-[var(--griffin-gold)]">
                            {booklet.lesson}
                          </span>
                          <span>·</span>
                          <span>
                            {booklet.grade} | {booklet.major}
                          </span>
                          <span>·</span>
                          <span>
                            {bookletQuestionCount(booklet).toLocaleString(
                              "fa-IR",
                            )}{" "}
                            سوال
                          </span>
                          <span>·</span>
                          <span>
                            {booklet.duration.toLocaleString("fa-IR")} دقیقه
                          </span>
                        </div>
                        {isCurrent && (
                          <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mt-1">
                            ✓ قبلاً به این آزمون اضافه شده
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination + Actions */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200/70 dark:border-white/5 pt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <button
                disabled={pickerPage <= 1 || pickerLoading}
                onClick={() => void loadPicker(pickerPage - 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-all"
              >
                <ChevronRight size={14} />
              </button>
              <span className="font-bold tabular-nums">
                صفحه {pickerPage.toLocaleString("fa-IR")} از{" "}
                {pickerTotalPages.toLocaleString("fa-IR")}
              </span>
              <button
                disabled={pickerPage >= pickerTotalPages || pickerLoading}
                onClick={() => void loadPicker(pickerPage + 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={14} />
              </button>
            </div>

            <button
              disabled={!pickerSelected.length || saving}
              onClick={() => void addSelected()}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl disabled:opacity-40 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Plus size={15} />
                افزودن{" "}
                {pickerSelected.length > 0 &&
                  `${pickerSelected.length.toLocaleString("fa-IR")} `}
                دفترچه
              </span>
              {pickerSelected.length > 0 && (
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
            </button>
          </div>
        </Modal>
      )}

      {/* ==================== PREVIEW MODAL ==================== */}
      {previewOpen && exam && (
        <Modal title="پیش‌نمایش آزمون" onClose={() => setPreviewOpen(false)}>
          <div className="grid gap-3 sm:grid-cols-3 mb-5">
            <InfoBox
              icon={CalendarDays}
              label="تاریخ"
              value={formatDate(exam.examDate)}
            />
            <InfoBox
              icon={Clock3}
              label="زمان"
              value={`${exam.startTime} تا ${exam.endTime || "—"}`}
            />
            <InfoBox
              icon={Clock3}
              label="مدت تقریبی"
              value={`${duration.toLocaleString("fa-IR")} دقیقه`}
            />
          </div>

          <div className="space-y-2.5">
            {displayedBooklets.map((item, index) => (
              <article
                key={item.id}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)] font-heading font-black text-sm">
                    {(index + 1).toLocaleString("fa-IR")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                      {item.booklet.title || item.booklet.lesson}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.booklet.lesson} · {item.booklet.grade} ·{" "}
                      {item.booklet.major} ·{" "}
                      {bookletQuestionCount(
                        item.booklet as Booklet,
                      ).toLocaleString("fa-IR")}{" "}
                      سوال · {item.booklet.duration.toLocaleString("fa-IR")}{" "}
                      دقیقه
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Modal>
      )}
    </main>
  );
}

// ==================== کامپوننت‌های کوچک ====================
function StatusBadge({ status }: { status: ExamStatus }) {
  const style = statusStyles[status];
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black ${style.bg} ${style.text}`}
    >
      <Icon size={11} />
      {statusLabels[status]}
    </span>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-gray-50/70 dark:bg-white/[0.02] border border-gray-200/70 dark:border-white/5 p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={12} className="text-[var(--griffin-gold)]" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {label}
        </p>
      </div>
      <p className="text-sm font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-2xl shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

        {/* Header */}
        <div className="relative p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                  <Sparkles size={18} />
                </div>
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-rose-500/15 hover:text-rose-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
