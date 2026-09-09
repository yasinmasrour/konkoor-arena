import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  GripVertical,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addBookletQuestions,
  createBooklet,
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
import { getQuestions, type Question } from "../../api/questionApi";
import MathText from "../../components/questions/MathText";

const statusLabels: Record<BookletStatus, string> = {
  draft: "پیش‌نویس",
  review: "در حال بررسی",
  published: "منتشرشده",
  archived: "آرشیو",
};

const statusClasses: Record<BookletStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200",
  review: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
  archived: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
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
  return date.toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" });
};

const BookletBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id && id !== "new");
  const [booklet, setBooklet] = useState<Booklet | null>(null);
  const [form, setForm] = useState<BookletPayload>(emptyForm);
  const [booklets, setBooklets] = useState<Booklet[]>([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pickerQuestions, setPickerQuestions] = useState<Question[]>([]);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerPage, setPickerPage] = useState(1);
  const [pickerTotalPages, setPickerTotalPages] = useState(1);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSelected, setPickerSelected] = useState<string[]>([]);
  const [pendingSelectedQuestions, setPendingSelectedQuestions] = useState<Question[]>([]);
  const [questionBusy, setQuestionBusy] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const currentQuestionIds = useMemo(() => new Set((booklet?.questions ?? []).map((item) => item.questionId)), [booklet]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!id) {
        void getBooklets({ page: 1, limit: 8, sort: "updatedAt", order: "desc" })
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
            examDate: result.examDate.slice(0, 16),
            duration: result.duration,
          });
        })
        .catch(() => setError("دریافت دفترچه انجام نشد."))
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [id]);

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    const response = (error as { response?: { data?: { message?: string; errors?: string[] } } })?.response;
    const message = response?.data?.message;
    const errors = response?.data?.errors;
    if (Array.isArray(errors) && errors.length) return errors.join("\n");
    return message || fallback;
  };

  const loadPicker = async (page = pickerPage) => {
    setPickerLoading(true);
    try {
      const result = await getQuestions({
        page,
        limit: 8,
        search: pickerSearch || undefined,
        status: "published",
        sort: "updatedAt",
        order: "desc",
      });
      setPickerQuestions(result.questions);
      setPickerTotalPages(result.pagination.totalPages);
      setPickerPage(result.pagination.page);
    } catch (error) {
      setError(getApiErrorMessage(error, "دریافت سؤال‌های منتشرشده انجام نشد."));
    } finally {
      setPickerLoading(false);
    }
  };

  const openPicker = () => {
    setPickerSelected([]);
    setPickerOpen(true);
    window.setTimeout(() => void loadPicker(1), 0);
  };

  const togglePickerQuestion = (question: Question) => {
    if (currentQuestionIds.has(question.id)) return;

    setPickerSelected((current) => {
      const selected = current.includes(question.id);
      return selected
        ? current.filter((item) => item !== question.id)
        : [...current, question.id];
    });
    setPendingSelectedQuestions((current) => current.some((item) => item.id === question.id)
      ? current.filter((item) => item.id !== question.id)
      : [...current, question]);
  };

  const removePendingQuestion = (questionId: string) => {
    setPickerSelected((current) => current.filter((item) => item !== questionId));
    setPendingSelectedQuestions((current) => current.filter((item) => item.id !== questionId));
    setForm((current) => ({
      ...current,
      questionIds: (current.questionIds ?? []).filter((item) => item !== questionId),
    }));
  };

  const saveMetadata = async () => {
    const validationError =
      form.title.trim().length < 2 ? "عنوان دفترچه را وارد کنید."
        : form.lesson.trim().length < 2 ? "درس را وارد کنید."
          : !form.examDate ? "تاریخ دفترچه را مشخص کنید."
            : !Number.isInteger(form.duration) || form.duration < 1 ? "مدت آزمون معتبر نیست."
              : "";

    if (validationError) {
      setError(validationError);
      return null;
    }

    setSaving(true);
    setError("");
    try {
      if (!booklet) {
        const created = await createBooklet({
          ...form,
          title: form.title.trim(),
          lesson: form.lesson.trim(),
          grade: form.grade.trim(),
          major: form.major.trim(),
          examDate: form.examDate,
          duration: form.duration,
          questionIds: form.questionIds ?? [],
        });
        setBooklet(created);
        setForm((current) => ({ ...current, questionIds: undefined }));
        navigate(`/booklet-builder/${created.id}`, { replace: true });
        return created;
      }
      const updated = await updateBooklet(booklet.id, {
        title: form.title.trim(),
        lesson: form.lesson.trim(),
        grade: form.grade,
        major: form.major,
        examDate: form.examDate,
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

  const addSelectedQuestions = async () => {
    if (!pickerSelected.length || questionBusy) return;
    setQuestionBusy(true);
    setError("");
    try {
      if (!booklet) {
        setForm((current) => ({
          ...current,
          questionIds: [...new Set([...(current.questionIds ?? []), ...pickerSelected])],
        }));
        setPendingSelectedQuestions([]);
        setPickerSelected([]);
        setPickerOpen(false);
        return;
      }
      const updated = await addBookletQuestions(booklet.id, pickerSelected.filter((questionId) => !currentQuestionIds.has(questionId)));
      setBooklet(updated);
      setPendingSelectedQuestions([]);
      setPickerSelected([]);
      setPickerOpen(false);
    } catch (error) {
      setError(getApiErrorMessage(error, "افزودن سؤال‌ها انجام نشد. فقط سؤال‌های منتشرشده و غیرتکراری قابل افزودن هستند."));
    } finally {
      setQuestionBusy(false);
    }
  };

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
    setBooklet((current) => current ? { ...current, questions: next } : current);
    setQuestionBusy(true);
    try {
      const updated = await reorderBookletQuestions(booklet.id, next.map((item) => item.questionId));
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

  const changeStatus = async (status: BookletStatus) => {
    if (!booklet || saving) return;
    setSaving(true);
    setError("");
    try {
      const updated = await setBookletStatus(booklet.id, status);
      setBooklet(updated);
    } catch (error) {
      setError(getApiErrorMessage(error, "تغییر وضعیت دفترچه انجام نشد. دفترچه باید شرایط وضعیت جدید را داشته باشد."));
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
  const displayedQuestionCount = booklet ? (booklet.questions ?? []).length : pendingNewQuestions;

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-gray-50 dark:bg-[#080B12]">در حال دریافت دفترچه...</main>;
  }

  if (!id) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-[#080B12] sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">مدیریت محتوای آزمون</p>
              <h1 className="mt-1 text-3xl font-bold">دفترچه‌ها</h1>
              <p className="mt-2 text-sm text-gray-500">دفترچه بسازید، سؤال‌های منتشرشده را انتخاب کنید و ترتیب آن‌ها را مدیریت کنید.</p>
            </div>
            <button onClick={() => navigate("/booklet-builder/new")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-5 py-3 font-semibold text-white"><Plus size={18} /> دفترچه جدید</button>
          </header>
          {error && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">{error}</div>}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {booklets.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]">
                <div className="flex items-start justify-between gap-3"><div><p className="text-xs text-gray-500">{item.lesson} · {item.grade} · {item.major}</p><h2 className="mt-1 text-lg font-bold">{item.title}</h2></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[item.status]}`}>{statusLabels[item.status]}</span></div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5"><p className="text-xs text-gray-500">سؤال</p><p className="mt-1 font-semibold">{item._count?.questions ?? 0}</p></div><div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5"><p className="text-xs text-gray-500">مدت</p><p className="mt-1 font-semibold">{item.duration} دقیقه</p></div></div>
                <p className="mt-4 text-xs text-gray-500">آخرین ویرایش: {formatDate(item.updatedAt)}</p>
                <button onClick={() => navigate(`/booklet-builder/${item.id}`)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"><Pencil size={16} /> ویرایش و ساخت</button>
              </article>
            ))}
          </section>
          {!booklets.length && <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-gray-500 dark:border-white/10">هنوز دفترچه‌ای ساخته نشده است.</div>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-[#080B12] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button onClick={() => navigate("/booklets")} className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--griffin-gold)]"><ArrowRight size={16} /> بازگشت به دفترچه‌ها</button>
            <h1 className="text-3xl font-bold">{booklet ? "ساخت و ویرایش دفترچه" : "دفترچه جدید"}</h1>
            <p className="mt-2 text-sm text-gray-500">اطلاعات دفترچه را تنظیم کنید و سؤال‌های منتشرشده را به آن اضافه کنید.</p>
          </div>
          {booklet && <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses[booklet.status]}`}>{statusLabels[booklet.status]}</span><button onClick={() => setPreviewOpen(true)} className="rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 text-sm font-semibold dark:border-white/10 dark:bg-[#111722]">پیش‌نمایش</button><button onClick={() => void duplicate()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold disabled:opacity-50 dark:border-white/10"><Copy size={16} /> کپی</button></div>}
        </header>

        {error && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">{error}</div>}

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]">
              <div className="mb-4 flex items-center gap-2"><BookOpen size={19} className="text-[var(--griffin-gold)]" /><h2 className="font-semibold">اطلاعات دفترچه</h2></div>
              <div className="space-y-3">
                <input value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} placeholder="عنوان دفترچه *" className="w-full rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]" />
                <input value={form.lesson} onChange={(e) => setForm((current) => ({ ...current, lesson: e.target.value }))} placeholder="درس *" className="w-full rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]" />
                <div className="grid grid-cols-2 gap-3"><select value={form.grade} onChange={(e) => setForm((current) => ({ ...current, grade: e.target.value }))} className="rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-[#111722]"><option value="10">دهم</option><option value="11">یازدهم</option><option value="12">دوازدهم</option></select><select value={form.major} onChange={(e) => setForm((current) => ({ ...current, major: e.target.value }))} className="rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-[#111722]"><option value="math">ریاضی</option><option value="experimental">تجربی</option><option value="humanities">انسانی</option></select></div>
                <label className="block text-xs text-gray-500">تاریخ دفترچه<input type="datetime-local" value={form.examDate} onChange={(e) => setForm((current) => ({ ...current, examDate: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200/70 px-3 py-3 text-sm dark:border-white/10 dark:bg-[#111722]" /></label>
                <label className="block text-xs text-gray-500">مدت (دقیقه)<input type="number" min={1} max={600} value={form.duration} onChange={(e) => setForm((current) => ({ ...current, duration: Number(e.target.value) }))} className="mt-2 w-full rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-white/[0.02]" /></label>
              </div>
              <button disabled={saving} onClick={() => void saveMetadata()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-3 font-semibold text-white disabled:opacity-50"><Save size={18} /> {saving ? "در حال ذخیره..." : "ذخیره اطلاعات"}</button>
            </div>

            {booklet && <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]"><h2 className="mb-3 font-semibold">وضعیت دفترچه</h2><div className="grid gap-2">{booklet.status === "draft" && <button disabled={saving || !(booklet.questions ?? []).length} onClick={() => void changeStatus("review")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold disabled:opacity-40 dark:border-white/10"><Send size={16} /> ارسال برای بررسی</button>}{booklet.status === "review" && <button disabled={saving} onClick={() => void changeStatus("draft")} className="rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold disabled:opacity-40 dark:border-white/10">بازگشت به پیش‌نویس</button>}{booklet.status === "review" && <button disabled={saving || !(booklet.questions ?? []).length} onClick={() => void changeStatus("published")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><Check size={16} /> انتشار</button>}{booklet.status === "published" && <button disabled={saving} onClick={() => void changeStatus("draft")} className="rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold disabled:opacity-40 dark:border-white/10">ویرایش مجدد</button>}</div></div>}
          </aside>

          <section className="rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#111722]">
            <div className="flex flex-col gap-3 border-b border-slate-200/70 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">سؤال‌های دفترچه</h2><p className="mt-1 text-xs text-gray-500">{displayedQuestionCount.toLocaleString("fa-IR")} سؤال · با Drag & Drop ترتیب را تغییر دهید.</p></div><button disabled={Boolean(booklet?.status === "published") || questionBusy} onClick={openPicker} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><Plus size={17} /> افزودن سؤال</button></div>
            <div className="p-5">
              {!booklet && pendingNewQuestions > 0 && <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{pendingNewQuestions} سؤال برای ایجاد دفترچه انتخاب شده</p>
                    <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-300/80">قبل از ذخیره هم می‌توانید انتخاب‌ها را بررسی یا حذف کنید.</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {pendingSelectedQuestions.map((question, index) => <div key={question.id} className="flex items-center gap-3 rounded-xl border border-amber-200/80 bg-white/70 p-3 dark:border-amber-900/30 dark:bg-white/[0.03]">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-100 text-xs font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{question.code}</p>
                      <p className="truncate text-xs text-gray-500">{question.lesson} · {question.chapter}</p>
                    </div>
                    <button type="button" onClick={() => removePendingQuestion(question.id)} className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-red-500 dark:hover:bg-white/10"><Trash2 size={16} /></button>
                  </div>)}
                </div>
              </div>}
              {(booklet?.questions ?? []).length ? <div className="space-y-3">{(booklet?.questions ?? []).map((item, index) => <div key={item.id} draggable={booklet?.status !== "published"} onDragStart={() => setDraggedIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => handleDrop(index)} className="rounded-2xl border border-slate-200/70 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"><div className="flex items-start gap-3"><div className="mt-1 cursor-grab text-gray-400"><GripVertical size={20} /></div><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-sm font-bold shadow-sm dark:bg-white/10">{index + 1}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2 text-xs text-gray-500"><span className="font-mono">{item.question.code}</span><span>·</span><span>{item.question.lesson}</span><span>·</span><span>{item.question.chapter}</span><span>·</span><span>{item.score} امتیاز</span></div><div className="mt-2 leading-7"><MathText content={item.question.questionText} /></div></div><button disabled={questionBusy || booklet?.status === "published"} onClick={() => void removeQuestion(item.questionId)} className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-red-500 disabled:opacity-30 dark:hover:bg-white/10"><Trash2 size={17} /></button></div></div>)}</div> : <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 text-center dark:border-white/10"><div><BookOpen size={34} className="mx-auto text-gray-400" /><p className="mt-3 font-semibold">هنوز سؤالی اضافه نشده است</p><p className="mt-1 text-sm text-gray-500">از بانک سؤال، سؤال‌های منتشرشده را انتخاب کنید.</p></div></div>}
            </div>
          </section>
        </section>
      </div>

      {pickerOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target && !questionBusy) setPickerOpen(false); }}><div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111722]"><div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/10"><div><h2 className="text-xl font-bold">انتخاب سؤال</h2><p className="mt-1 text-xs text-gray-500">فقط سؤال‌های منتشرشده نمایش داده می‌شوند؛ برای پیدا کردن سؤال، از جستجو استفاده کنید.</p></div><button onClick={() => setPickerOpen(false)} disabled={questionBusy} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5"><X size={21} /></button></div><div className="border-b border-slate-200/70 p-5 dark:border-white/10"><div className="flex gap-2"><div className="relative flex-1"><Search size={17} className="absolute right-3 top-3.5 text-gray-400" /><input value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void loadPicker(1); }} placeholder="جستجو در کد، متن یا مبحث سؤال..." className="w-full rounded-xl border border-slate-200/70 py-3 pr-10 pl-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.03]" /></div><button onClick={() => void loadPicker(1)} className="rounded-xl border border-slate-200/70 px-4 font-semibold dark:border-white/10">جستجو</button></div></div><div className="max-h-[55vh] overflow-y-auto p-5">{pickerLoading ? <div className="py-12 text-center text-sm text-gray-500">در حال دریافت سؤال‌ها...</div> : <div className="space-y-3">{pickerQuestions.map((question) => { const selected = pickerSelected.includes(question.id) || currentQuestionIds.has(question.id); return <button key={question.id} type="button" onClick={() => togglePickerQuestion(question)} className={`w-full rounded-2xl border p-4 text-right transition ${selected ? "border-[var(--griffin-gold)] bg-amber-50/50 dark:bg-amber-900/10" : "border-slate-200/70 hover:border-[var(--griffin-gold)]/50 dark:border-white/10"}`}><div className="flex items-start gap-3"><div className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md border ${selected ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)] text-white" : "border-slate-300 dark:border-white/20"}`}>{selected && <Check size={15} />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2 text-xs text-gray-500"><span className="font-mono">{question.code}</span><span>·</span><span>{question.lesson}</span><span>·</span><span>{question.chapter}</span><span>·</span><span>{question.difficulty}</span></div><div className="mt-2 leading-7"><MathText content={question.questionText} /></div></div></div></button>; })}</div>}{!pickerLoading && !pickerQuestions.length && <div className="py-12 text-center text-sm text-gray-500">سؤال منتشرشده‌ای با این جستجو پیدا نشد.</div>}</div><div className="flex items-center justify-between border-t border-slate-200/70 px-5 py-4 dark:border-white/10"><div className="flex items-center gap-2 text-xs text-gray-500"><button disabled={pickerPage <= 1 || pickerLoading} onClick={() => void loadPicker(pickerPage - 1)} className="rounded-lg border border-slate-200/70 p-2 disabled:opacity-30 dark:border-white/10"><ChevronRight size={17} /></button><span>صفحه {pickerPage.toLocaleString("fa-IR")} از {pickerTotalPages.toLocaleString("fa-IR")}</span><button disabled={pickerPage >= pickerTotalPages || pickerLoading} onClick={() => void loadPicker(pickerPage + 1)} className="rounded-lg border border-slate-200/70 p-2 disabled:opacity-30 dark:border-white/10"><ChevronLeft size={17} /></button></div><button disabled={!pickerSelected.length || questionBusy} onClick={() => void addSelectedQuestions()} className="inline-flex items-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><Plus size={16} /> افزودن {pickerSelected.length ? pickerSelected.length.toLocaleString("fa-IR") : ""} سؤال</button></div></div></div>}

      {previewOpen && booklet && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.currentTarget === event.target) setPreviewOpen(false); }}><div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-[#111722]"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/70 bg-white/95 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-[#111722]/95"><div><h2 className="text-xl font-bold">پیش‌نمایش دفترچه</h2><p className="mt-1 text-xs text-gray-500">{booklet.title} · {(booklet.questions ?? []).length} سؤال · {booklet.duration} دقیقه</p></div><button onClick={() => setPreviewOpen(false)} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5"><XCircle size={22} /></button></div><div className="space-y-6 p-6"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5"><p className="text-xs text-gray-500">درس</p><p className="mt-1 font-semibold">{booklet.lesson}</p></div><div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5"><p className="text-xs text-gray-500">تاریخ</p><p className="mt-1 font-semibold">{formatDate(booklet.examDate)}</p></div><div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5"><p className="text-xs text-gray-500">مدت</p><p className="mt-1 inline-flex items-center gap-1 font-semibold"><Clock3 size={15} /> {booklet.duration} دقیقه</p></div></div>{(booklet.questions ?? []).map((item, index) => <article key={item.id} className="rounded-2xl border border-slate-200/70 p-5 dark:border-white/10"><div className="mb-3 flex items-center justify-between text-xs text-gray-500"><span>سؤال {index + 1}</span><span>{item.score} امتیاز</span></div><div className="leading-8"><MathText content={item.question.questionText} /></div>{item.question.questionImage && <img src={item.question.questionImage} alt="تصویر سؤال" className="mt-4 max-h-72 rounded-xl object-contain" />}<div className="mt-4 grid gap-2">{item.question.options.map((option, optionIndex) => <div key={`${item.id}-${optionIndex}`} className="rounded-xl bg-gray-50 p-3 dark:bg-white/5"><span className="ml-2 font-semibold">{optionIndex + 1}.</span><MathText content={option} /></div>)}</div></article>)}</div></div></div>}
    </main>
  );
};

export default BookletBuilder;
