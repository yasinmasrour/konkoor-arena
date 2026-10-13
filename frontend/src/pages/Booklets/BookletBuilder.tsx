import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  Clock3,
  Copy,
  Eye,
  FileQuestion,
  GripVertical,
  Layers,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Send,
  Sparkles,
  Trash2,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addBookletQuestions,
  createBooklet,
  deleteBooklet,
  duplicateBooklet,
  getBooklet,
  getBooklets,
  removeBookletQuestion,
  reorderBookletQuestions,
  setBookletStatus,
  updateBooklet,
  type Booklet,
  type BookletPayload,
  type BookletStatus,
} from "../../api/bookletApi";
import { type Question } from "../../api/questionApi";
import MathText from "../../components/questions/MathText";
import QuestionPickerModal from "./components/QuestionPickerModal";
import DateWheelPickerModal from "../../components/ui/DateWheelPickerModal";

// ==================== Helper: ISO (UTC) → Local "YYYY-MM-DDTHH:mm" ====================
function toLocalDateTimeString(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// ==================== ثابت‌ها ====================
const statusLabels: Record<BookletStatus, string> = {
  draft: "پیش‌نویس",
  review: "در حال بررسی",
  published: "منتشرشده",
  archived: "آرشیو",
};

const statusStyles: Record<
  BookletStatus,
  { bg: string; text: string; dot: string }
> = {
  draft: {
    bg: "bg-gray-500/10",
    text: "text-gray-500 dark:text-gray-400",
    dot: "bg-gray-400",
  },
  review: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  published: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  archived: {
    bg: "bg-slate-500/10",
    text: "text-slate-500 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

const emptyForm: BookletPayload = {
  title: "",
  lesson: "",
  grade: "12",
  major: "math",
  examDate: "",
  duration: 120,
  questionIds: [],
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const majorLabels: Record<string, string> = {
  math: "ریاضی",
  experimental: "تجربی",
  humanities: "انسانی",
};

const gradeLabels: Record<string, string> = {
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",
};

// ==================== کامپوننت ====================
const BookletBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id && id !== "new");

  // ==================== State ====================
  const [booklet, setBooklet] = useState<Booklet | null>(null);
  const [form, setForm] = useState<BookletPayload>(emptyForm);
  const [booklets, setBooklets] = useState<Booklet[]>([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingSelectedQuestions, setPendingSelectedQuestions] = useState<
    Question[]
  >([]);
  const [questionBusy, setQuestionBusy] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const currentQuestionIds = useMemo(
    () => new Set((booklet?.questions ?? []).map((item) => item.questionId)),
    [booklet],
  );

  // ==================== Load ====================
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!id) {
        void getBooklets({
          page: 1,
          limit: 30,
          sort: "updatedAt",
          order: "desc",
        })
          .then((result) => setBooklets(result.booklets))
          .catch(() => setError("دریافت دفترچه‌ها انجام نشد."))
          .finally(() => setLoading(false));
        return;
      }

      if (id === "new") {
        setBooklet(null);
        setForm({ ...emptyForm, questionIds: [] });
        setError("");
        setLoading(false);
        return;
      }

      void getBooklet(id)
        .then((result) => {
          setBooklet(result);
          setForm({
            title: result.title,
            lesson: result.lesson,
            grade: result.grade,
            major: result.major,
            // ✅ تبدیل ISO به local
            examDate: result.examDate
              ? toLocalDateTimeString(result.examDate)
              : "",
            duration: result.duration,
          });
        })
        .catch(() => setError("دریافت دفترچه انجام نشد."))
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [id]);

  // ==================== Helpers ====================
  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const response = (
      error as {
        response?: { data?: { message?: string; errors?: string[] } };
      }
    )?.response;
    const message = response?.data?.message;
    const errors = response?.data?.errors;
    if (Array.isArray(errors) && errors.length) return errors.join("\n");
    return message || fallback;
  };

  const removeBooklet = async (item: Booklet) => {
    if (
      !window.confirm(
        `آیا از حذف دفترچه «${item.title}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`,
      )
    )
      return;

    setDeletingId(item.id);
    setError("");
    try {
      await deleteBooklet(item.id);
      setBooklets((current) => current.filter((x) => x.id !== item.id));
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "حذف دفترچه انجام نشد. ممکنه این دفترچه در آزمونی استفاده شده باشه.",
        ),
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==================== Picker ====================
  const openPicker = () => {
    if (booklet?.status === "published" || questionBusy) return;
    setPickerOpen(true);
  };

  const handlePickerAdd = async (questions: Question[]) => {
    setQuestionBusy(true);
    setError("");
    try {
      if (!booklet) {
        const ids = questions.map((q) => q.id);

        setForm((current) => ({
          ...current,
          questionIds: [...new Set([...(current.questionIds ?? []), ...ids])],
        }));

        setPendingSelectedQuestions((current) => {
          const existingIds = new Set(current.map((q) => q.id));
          return [
            ...current,
            ...questions.filter((q) => !existingIds.has(q.id)),
          ];
        });

        setPickerOpen(false);
        return;
      }

      const ids = questions.map((q) => q.id);
      const updated = await addBookletQuestions(
        booklet.id,
        ids.filter((id) => !currentQuestionIds.has(id)),
      );
      setBooklet(updated);
      setPickerOpen(false);
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "افزودن سؤال‌ها انجام نشد. فقط سؤال‌های منتشرشده و غیرتکرار قابل افزودن هستند.",
        ),
      );
      throw error;
    } finally {
      setQuestionBusy(false);
    }
  };

  const removePendingQuestion = (questionId: string) => {
    setPendingSelectedQuestions((current) =>
      current.filter((item) => item.id !== questionId),
    );
    setForm((current) => ({
      ...current,
      questionIds: (current.questionIds ?? []).filter(
        (item) => item !== questionId,
      ),
    }));
  };

  // ==================== Save ====================
  const saveMetadata = async () => {
    const validationError =
      form.title.trim().length < 2
        ? "عنوان دفترچه را وارد کنید."
        : form.lesson.trim().length < 2
          ? "درس را وارد کنید."
          : !form.examDate
            ? "تاریخ دفترچه را مشخص کنید."
            : !Number.isInteger(form.duration) || form.duration < 1
              ? "مدت آزمون معتبر نیست."
              : "";

    if (validationError) {
      setError(validationError);
      return null;
    }

    setSaving(true);
    setError("");
    try {
      // ✅ تبدیل local → ISO
      const isoExamDate = form.examDate
        ? new Date(form.examDate).toISOString()
        : "";

      if (!booklet) {
        const created = await createBooklet({
          ...form,
          title: form.title.trim(),
          lesson: form.lesson.trim(),
          grade: form.grade.trim(),
          major: form.major.trim(),
          examDate: isoExamDate,
          duration: form.duration,
          questionIds: form.questionIds ?? [],
        });
        setBooklet(created);
        setForm((current) => ({ ...current, questionIds: undefined }));
        setPendingSelectedQuestions([]);
        navigate(`/booklet-builder/${created.id}`, { replace: true });
        return created;
      }
      const updated = await updateBooklet(booklet.id, {
        title: form.title.trim(),
        lesson: form.lesson.trim(),
        grade: form.grade,
        major: form.major,
        examDate: isoExamDate,
        duration: form.duration,
      });
      setBooklet(updated);
      return updated;
    } catch (error) {
      setError(getApiErrorMessage(error, "ذخیره اطلاعات دفترچه انجام نشد."));
      return null;
    } finally {
      setSaving(false);
    }
  };

  // ==================== Questions ====================
  const removeQuestion = async (questionId: string) => {
    if (!booklet || questionBusy) return;
    setQuestionBusy(true);
    try {
      const updated = await removeBookletQuestion(booklet.id, questionId);
      setBooklet(updated);
    } catch (error) {
      setError(getApiErrorMessage(error, "حذف سؤال از دفترچه انجام نشد."));
    } finally {
      setQuestionBusy(false);
    }
  };

  const moveQuestion = async (from: number, to: number) => {
    if (!booklet || from === to || questionBusy) return;
    const next = [...(booklet.questions ?? [])];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setBooklet((current) =>
      current ? { ...current, questions: next } : current,
    );
    setQuestionBusy(true);
    try {
      const updated = await reorderBookletQuestions(
        booklet.id,
        next.map((item) => item.questionId),
      );
      setBooklet(updated);
    } catch (error) {
      setError(getApiErrorMessage(error, "تغییر ترتیب سؤال‌ها انجام نشد."));
      const restored = await getBooklet(booklet.id).catch(() => null);
      if (restored) setBooklet(restored);
    } finally {
      setQuestionBusy(false);
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null) return;
    void moveQuestion(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  // ==================== Status ====================
  const changeStatus = async (status: BookletStatus) => {
    if (!booklet || saving) return;
    setSaving(true);
    setError("");
    try {
      const updated = await setBookletStatus(booklet.id, status);
      setBooklet(updated);
    } catch (error) {
      setError(
        getApiErrorMessage(
          error,
          "تغییر وضعیت دفترچه انجام نشد. دفترچه باید شرایط وضعیت جدید را داشته باشد.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async () => {
    if (!booklet) return;
    setSaving(true);
    try {
      const copy = await duplicateBooklet(booklet.id);
      navigate(`/booklet-builder/${copy.id}`);
    } catch (error) {
      setError(getApiErrorMessage(error, "کپی دفترچه انجام نشد."));
    } finally {
      setSaving(false);
    }
  };

  const pendingNewQuestions = (form.questionIds ?? []).length;
  const displayedQuestionCount = booklet
    ? (booklet.questions ?? []).length
    : pendingNewQuestions;

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
            در حال دریافت دفترچه...
          </p>
        </div>
      </main>
    );
  }

  // ==================== List View ====================
  if (!id) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <header className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60 animate-pulse" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                    <BookOpen size={24} strokeWidth={2.3} />
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 mb-1.5">
                    <Sparkles
                      size={11}
                      className="text-[var(--griffin-gold)]"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                      Booklet Management
                    </span>
                  </div>
                  <h1 className="font-heading text-3xl font-black text-gray-900 dark:text-white">
                    دفترچه‌ها
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    دفترچه بساز، سؤال‌های منتشرشده رو انتخاب کن و ترتیب رو
                    مدیریت کن.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/booklet-builder/new")}
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus size={17} strokeWidth={2.5} />
                  دفترچه جدید
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </header>

          {/* Error */}
          {error && (
            <div className="relative rounded-2xl overflow-hidden border border-rose-500/30 bg-gradient-to-l from-rose-500/10 to-transparent backdrop-blur-sm p-4">
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

          {/* Grid */}
          {booklets.length > 0 ? (
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {booklets.map((item, index) => {
                const statusStyle =
                  statusStyles[item.status] ?? statusStyles.draft;
                const isDeleting = deletingId === item.id;

                return (
                  <article
                    key={item.id}
                    style={{ animationDelay: `${index * 60}ms` }}
                    className={`group relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--griffin-gold)]/10 hover:border-[var(--griffin-gold)]/40 animate-[fadeInUp_0.5s_ease-out_both] ${
                      isDeleting ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                    <div className="relative p-5">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                            {gradeLabels[item.grade] ?? item.grade} ·{" "}
                            {majorLabels[item.major] ?? item.major}
                          </p>
                          <h2 className="mt-1 font-heading text-lg font-black text-gray-900 dark:text-white truncate">
                            {item.title}
                          </h2>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {item.lesson}
                          </p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${
                              item.status === "published" ? "animate-pulse" : ""
                            }`}
                          />
                          {statusLabels[item.status]}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="rounded-xl bg-gray-50/70 dark:bg-white/5 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <FileQuestion
                              size={11}
                              className="text-[var(--griffin-gold)]"
                            />
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                              سؤال
                            </span>
                          </div>
                          <p className="font-heading text-lg font-black text-gray-900 dark:text-white">
                            {(item._count?.questions ?? 0).toLocaleString(
                              "fa-IR",
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-gray-50/70 dark:bg-white/5 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock3
                              size={11}
                              className="text-[var(--griffin-gold)]"
                            />
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                              مدت
                            </span>
                          </div>
                          <p className="font-heading text-lg font-black text-gray-900 dark:text-white">
                            {item.duration.toLocaleString("fa-IR")}
                            <span className="text-[10px] mr-1 text-gray-400">
                              دقیقه
                            </span>
                          </p>
                        </div>
                      </div>

                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-3">
                        آخرین ویرایش: {formatDate(item.updatedAt)}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            navigate(`/booklet-builder/${item.id}`)
                          }
                          className="group/btn relative flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/50 transition-all overflow-hidden"
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            <Pencil size={15} />
                            ویرایش و ساخت
                          </span>
                          <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        </button>

                        <button
                          onClick={() => void removeBooklet(item)}
                          disabled={isDeleting}
                          className="shrink-0 w-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-50 transition-all"
                          title="حذف دفترچه"
                        >
                          {isDeleting ? (
                            <LoaderCircle size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                  <BookOpen
                    size={36}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </div>
                <p className="font-heading font-black text-lg text-gray-700 dark:text-gray-300">
                  هنوز دفترچه‌ای ساخته نشده!
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  اولین دفترچه‌ات رو بساز.
                </p>
                <button
                  onClick={() => navigate("/booklet-builder/new")}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl transition-all"
                >
                  <Plus size={16} />
                  دفترچه جدید
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ==================== Editor View ====================
  const currentStatusStyle = booklet
    ? (statusStyles[booklet.status] ?? statusStyles.draft)
    : statusStyles.draft;

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <header className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                  <Wand2 size={24} strokeWidth={2.3} />
                </div>
              </div>

              <div>
                <button
                  onClick={() => navigate("/booklets")}
                  className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors mb-1"
                >
                  <ArrowRight
                    size={13}
                    className="transition-transform group-hover:translate-x-1 rotate-180"
                  />
                  بازگشت به دفترچه‌ها
                </button>

                <div className="inline-flex items-center gap-2 mb-1.5">
                  <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    {booklet ? "Edit Booklet" : "New Booklet"}
                  </span>
                </div>

                <h1 className="font-heading text-3xl font-black text-gray-900 dark:text-white">
                  {booklet ? "ساخت و ویرایش دفترچه" : "دفترچه جدید"}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  اطلاعات دفترچه رو تنظیم کن و سؤال‌های منتشرشده رو اضافه کن.
                </p>
              </div>
            </div>

            {booklet && (
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-black ${currentStatusStyle.bg} ${currentStatusStyle.text}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${currentStatusStyle.dot} ${
                      booklet.status === "published" ? "animate-pulse" : ""
                    }`}
                  />
                  {statusLabels[booklet.status]}
                </span>

                <button
                  onClick={() => setPreviewOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 backdrop-blur-sm hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)] transition-all"
                >
                  <Eye size={16} />
                  پیش‌نمایش
                </button>

                <button
                  onClick={() => void duplicate()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 backdrop-blur-sm hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)] disabled:opacity-50 transition-all"
                >
                  <Copy size={16} />
                  کپی
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div className="relative rounded-2xl overflow-hidden border border-rose-500/30 bg-gradient-to-l from-rose-500/10 to-transparent backdrop-blur-sm p-4 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                <AlertCircle size={16} className="text-rose-500" />
              </div>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400 whitespace-pre-line">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* MAIN GRID */}
        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* SIDEBAR */}
          <aside className="space-y-5">
            <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

              <div className="relative p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Basic Info
                    </p>
                    <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                      اطلاعات دفترچه
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block">
                    <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      عنوان دفترچه *
                    </span>
                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          title: e.target.value,
                        }))
                      }
                      placeholder="مثلاً دفترچه ریاضی فصل ۱"
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      درس *
                    </span>
                    <input
                      value={form.lesson}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          lesson: e.target.value,
                        }))
                      }
                      placeholder="مثلاً ریاضی"
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                        پایه
                      </span>
                      <select
                        value={form.grade}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            grade: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-3 text-sm outline-none focus:border-[var(--griffin-gold)] transition-all"
                      >
                        <option value="10">دهم</option>
                        <option value="11">یازدهم</option>
                        <option value="12">دوازدهم</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                        رشته
                      </span>
                      <select
                        value={form.major}
                        onChange={(e) =>
                          setForm((current) => ({
                            ...current,
                            major: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-3 text-sm outline-none focus:border-[var(--griffin-gold)] transition-all"
                      >
                        <option value="math">ریاضی</option>
                        <option value="experimental">تجربی</option>
                        <option value="humanities">انسانی</option>
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      تاریخ دفترچه *
                    </span>
                    <DateWheelPickerModal
                      value={form.examDate}
                      onChange={(value) =>
                        setForm((current) => ({
                          ...current,
                          examDate: value,
                        }))
                      }
                      withTime
                      required
                      placeholder="انتخاب تاریخ و ساعت دفترچه"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      مدت (دقیقه) *
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={600}
                      value={form.duration}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          duration: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-3 text-sm outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                    />
                  </label>
                </div>

                <button
                  disabled={saving}
                  onClick={() => void saveMetadata()}
                  className="group relative mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-3 font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 disabled:opacity-50 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {saving ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        در حال ذخیره...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        ذخیره اطلاعات
                      </>
                    )}
                  </span>
                  {!saving && (
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}
                </button>
              </div>
            </div>

            {booklet && (
              <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

                <div className="relative p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                      <Zap size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Status
                      </p>
                      <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                        وضعیت دفترچه
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {booklet.status === "draft" && (
                      <button
                        disabled={saving || !(booklet.questions ?? []).length}
                        onClick={() => void changeStatus("review")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-black text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 disabled:opacity-40 transition-all"
                      >
                        <Send size={16} />
                        ارسال برای بررسی
                      </button>
                    )}
                    {booklet.status === "review" && (
                      <>
                        <button
                          disabled={saving}
                          onClick={() => void changeStatus("draft")}
                          className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm font-black text-gray-600 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 disabled:opacity-40 transition-all"
                        >
                          بازگشت به پیش‌نویس
                        </button>
                        <button
                          disabled={saving || !(booklet.questions ?? []).length}
                          onClick={() => void changeStatus("published")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl disabled:opacity-40 transition-all"
                        >
                          <Check size={16} strokeWidth={3} />
                          انتشار
                        </button>
                      </>
                    )}
                    {booklet.status === "published" && (
                      <button
                        disabled={saving}
                        onClick={() => void changeStatus("draft")}
                        className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm font-black text-gray-600 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 disabled:opacity-40 transition-all"
                      >
                        ویرایش مجدد
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* QUESTIONS */}
          <section className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

            <div className="relative flex flex-col gap-3 p-5 border-b border-gray-200/70 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                  <Layers size={16} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                      Questions
                    </span>
                  </div>
                  <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                    سؤال‌های دفترچه ·{" "}
                    {displayedQuestionCount.toLocaleString("fa-IR")}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    با Drag & Drop ترتیب رو تغییر بده
                  </p>
                </div>
              </div>

              <button
                disabled={
                  Boolean(booklet?.status === "published") || questionBusy
                }
                onClick={openPicker}
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 disabled:opacity-40 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus size={16} strokeWidth={2.5} />
                  افزودن سؤال
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>

            <div className="p-5">
              {!booklet && pendingNewQuestions > 0 && (
                <div className="mb-4 rounded-2xl border border-amber-500/30 bg-gradient-to-l from-amber-500/10 to-transparent backdrop-blur-sm p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                      <AlertCircle size={16} className="text-amber-500" />
                    </div>
                    <div>
                      <p className="font-heading text-sm font-black text-amber-700 dark:text-amber-300">
                        {pendingNewQuestions.toLocaleString("fa-IR")} سؤال
                        انتخاب شده
                      </p>
                      <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70">
                        قبل از ذخیره می‌تونی انتخاب‌ها رو بررسی یا حذف کنی.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {pendingSelectedQuestions.map((question, index) => (
                      <div
                        key={question.id}
                        className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-white/60 dark:bg-white/[0.03] p-3"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-xs font-black text-amber-600 dark:text-amber-400">
                          {(index + 1).toLocaleString("fa-IR")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-english truncate text-[11px] font-bold text-gray-700 dark:text-gray-200">
                            {question.code}
                          </p>
                          <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">
                            {question.lesson} · {question.chapter}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePendingQuestion(question.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(booklet?.questions ?? []).length > 0 ? (
                <div className="space-y-3">
                  {(booklet?.questions ?? []).map((item, index) => (
                    <div
                      key={item.id}
                      draggable={booklet?.status !== "published"}
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDrop(index)}
                      className="group relative rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.03] p-4 transition-all duration-200 hover:border-[var(--griffin-gold)]/40 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 cursor-grab text-gray-400 active:cursor-grabbing">
                          <GripVertical size={20} />
                        </div>

                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 text-white font-heading font-black text-sm shadow-lg shadow-[var(--griffin-gold)]/30">
                          {(index + 1).toLocaleString("fa-IR")}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 font-english text-gray-600 dark:text-gray-300">
                              {item.question.code}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]">
                              <BookOpen size={9} />
                              {item.question.lesson}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500">
                              <Layers size={9} />
                              {item.question.chapter}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">
                              <Award size={9} />
                              {item.score.toLocaleString("fa-IR")} امتیاز
                            </span>
                          </div>

                          <div className="leading-7 text-gray-900 dark:text-white text-sm">
                            <MathText content={item.question.questionText} />
                          </div>
                        </div>

                        <button
                          disabled={
                            questionBusy || booklet?.status === "published"
                          }
                          onClick={() => void removeQuestion(item.questionId)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-30 transition-colors shrink-0"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <BookOpen
                        size={36}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    <p className="font-heading font-black text-lg text-gray-700 dark:text-gray-300">
                      هنوز سؤالی اضافه نشده!
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      از بانک سؤال، سؤال‌های منتشرشده رو انتخاب کن.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>

      {/* PICKER MODAL (مستقل) */}
      <QuestionPickerModal
        open={pickerOpen}
        currentQuestionIds={currentQuestionIds}
        onClose={() => !questionBusy && setPickerOpen(false)}
        onAdd={handlePickerAdd}
        onError={setError}
      />

      {/* PREVIEW MODAL */}
      {previewOpen && booklet && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 animate-[fadeIn_0.2s_ease-out]"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setPreviewOpen(false);
          }}
        >
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0d14]/95 shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

            <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-200/70 dark:border-white/5">
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
                  <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                    پیش‌نمایش دفترچه
                  </h2>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {booklet.title} ·{" "}
                    {(booklet.questions ?? []).length.toLocaleString("fa-IR")}{" "}
                    سؤال
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-rose-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "درس",
                    value: booklet.lesson,
                    icon: BookOpen,
                  },
                  {
                    label: "تاریخ",
                    value: formatDate(booklet.examDate),
                    icon: Calendar,
                  },
                  {
                    label: "مدت",
                    value: `${booklet.duration.toLocaleString("fa-IR")} دقیقه`,
                    icon: Clock3,
                  },
                ].map((info, i) => {
                  const Icon = info.icon;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon
                          size={11}
                          className="text-[var(--griffin-gold)]"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                          {info.label}
                        </span>
                      </div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">
                        {info.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {(booklet.questions ?? []).map((item, index) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-5"
                >
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-xs">
                        {(index + 1).toLocaleString("fa-IR")}
                      </div>
                      <span className="font-heading font-black text-sm text-gray-900 dark:text-white">
                        سؤال {(index + 1).toLocaleString("fa-IR")}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] text-[10px] font-black">
                      <Award size={9} />
                      {item.score.toLocaleString("fa-IR")} امتیاز
                    </span>
                  </div>

                  <div className="leading-8 text-gray-900 dark:text-white">
                    <MathText content={item.question.questionText} />
                  </div>

                  {item.question.questionImage && (
                    <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
                      <img
                        src={item.question.questionImage}
                        alt="تصویر سؤال"
                        className="max-h-72 w-full object-contain"
                      />
                    </div>
                  )}

                  <div className="mt-4 grid gap-2">
                    {item.question.options.map((option, optionIndex) => (
                      <div
                        key={`${item.id}-${optionIndex}`}
                        className="rounded-xl bg-gray-50/70 dark:bg-white/5 p-3"
                      >
                        <div className="flex gap-3">
                          <span className="w-7 h-7 rounded-lg bg-white dark:bg-white/10 flex items-center justify-center text-xs font-black text-gray-600 dark:text-gray-300 shrink-0">
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          <div className="min-w-0 flex-1 text-sm leading-7 text-gray-900 dark:text-white">
                            <MathText content={option} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default BookletBuilder;
