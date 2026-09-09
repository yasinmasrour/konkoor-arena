import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, Clock3,
  Copy, GripVertical, Pencil, Plus, Save, Search, Send, Trash2, X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addExamBooklets, changeExamStatus, createExam, deleteExam, duplicateExam,
  getExam, getExams, removeExamBooklet, reorderExamBooklets, updateExam,
  type Exam, type ExamStatus,
} from "../api/examApi";
import { getBooklets, type Booklet } from "../api/bookletApi";
import { useAuth } from "../context/AuthContext";

const emptyForm = { title: "", examDate: "", startTime: "08:00", endTime: "10:30" };
const statusLabels: Record<ExamStatus, string> = {
  draft: "پیش‌نویس", review: "در حال بررسی", published: "منتشرشده", archived: "آرشیو",
};
const statusClasses: Record<ExamStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200",
  review: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
  archived: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const apiError = (error: unknown, fallback: string) => {
  const response = (error as { response?: { data?: { message?: string; errors?: string[] } } })?.response;
  if (response?.data?.errors?.length) return response.data.errors.join("\n");
  return response?.data?.message || fallback;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" });
};

const bookletQuestionCount = (booklet: Booklet) => booklet.questions?.length ?? booklet._count?.questions ?? 0;
const isDraft = (exam: Exam | null) => !exam || exam.status === "draft";

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

  const currentIds = useMemo(() => new Set(displayedBooklets.map((item) => item.bookletId)), [displayedBooklets]);
  const editable = isDraft(exam);
  const questionCount = displayedBooklets.reduce((sum, item) => sum + bookletQuestionCount(item.booklet as Booklet), 0);
  const duration = displayedBooklets.reduce((sum, item) => sum + (item.booklet.duration || 0), 0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    if (isList) {
      getExams({ page: 1, limit: 8, sort: "createdAt", order: "desc" })
        .then((result) => { if (!cancelled) setExams(result.exams ?? []); })
        .catch((err) => { if (!cancelled) setError(apiError(err, "دریافت آزمون‌ها انجام نشد.")); })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }
    if (isNew) {
      setExam(null); setForm(emptyForm); setPendingBooklets([]); setPickerOpen(false);
      setPickerSelected([]); setLoading(false);
      return () => { cancelled = true; };
    }
    getExam(id)
      .then((result) => {
        if (cancelled) return;
        setExam(result);
        setForm({
          title: result.title ?? "",
          examDate: result.examDate ? result.examDate.slice(0, 16) : "",
          startTime: result.startTime ?? "08:00",
          endTime: result.endTime ?? "",
        });
      })
      .catch((err) => { if (!cancelled) setError(apiError(err, "دریافت آزمون انجام نشد.")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, isList, isNew]);

  const loadPicker = async (page = 1) => {
    setPickerLoading(true);
    try {
      const result = await getBooklets({ page, limit: 8, search: pickerSearch || undefined, status: "published", sort: "updatedAt", order: "desc" });
      setPickerBooklets(result.booklets ?? []);
      setPickerPage(result.pagination.page);
      setPickerTotalPages(Math.max(1, result.pagination.totalPages));
    } catch (err) {
      setError(apiError(err, "دریافت دفترچه‌های منتشرشده انجام نشد."));
    } finally { setPickerLoading(false); }
  };

  const openPicker = () => {
    if (!editable || saving) return;
    setPickerSelected([]); setPickerOpen(true); void loadPicker(1);
  };

  const togglePicker = (booklet: Booklet) => {
    if (currentIds.has(booklet.id)) return;
    setPickerSelected((current) => current.includes(booklet.id)
      ? current.filter((item) => item !== booklet.id)
      : [...current, booklet.id]);
  };

  const addSelected = async () => {
    if (!pickerSelected.length || saving || !editable) return;
    setSaving(true); setError("");
    try {
      if (exam) {
        setExam(await addExamBooklets(exam.id, pickerSelected.filter((item) => !currentIds.has(item))));
      } else {
        const selected = pickerBooklets.filter((item) => pickerSelected.includes(item.id));
        setPendingBooklets((current) => {
          const ids = new Set(current.map((item) => item.id));
          return [...current, ...selected.filter((item) => !ids.has(item.id))];
        });
      }
      setPickerSelected([]); setPickerOpen(false);
    } catch (err) { setError(apiError(err, "افزودن دفترچه به آزمون انجام نشد.")); }
    finally { setSaving(false); }
  };

  const removeBooklet = async (bookletId: string) => {
    if (saving || !editable) return;
    if (displayedBooklets.length <= 1) {
      setError("آزمون باید حداقل یک دفترچه داشته باشد.");
      return;
    }
    setSaving(true); setError("");
    try {
      if (exam) setExam(await removeExamBooklet(exam.id, bookletId));
      else setPendingBooklets((current) => current.filter((item) => item.id !== bookletId));
    } catch (err) { setError(apiError(err, "حذف دفترچه از آزمون انجام نشد.")); }
    finally { setSaving(false); }
  };

  const moveBooklet = async (from: number, to: number) => {
    if (from === to || saving || !editable || to < 0 || to >= displayedBooklets.length) return;
    const next = [...displayedBooklets];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    if (!exam) {
      const map = new Map(pendingBooklets.map((item) => [item.id, item]));
      setPendingBooklets(next.map((item) => map.get(item.bookletId)).filter(Boolean) as Booklet[]);
      return;
    }
    setSaving(true); setError("");
    try { setExam(await reorderExamBooklets(exam.id, next.map((item, index) => ({ id: item.bookletId, order: index + 1 })))); }
    catch (err) { setError(apiError(err, "تغییر ترتیب دفترچه‌ها انجام نشد.")); }
    finally { setSaving(false); }
  };

  const save = async () => {
    if (!editable || saving) return;
    if (form.title.trim().length < 3) return setError("عنوان آزمون را وارد کنید.");
    if (!form.examDate) return setError("تاریخ آزمون را مشخص کنید.");
    if (!form.startTime) return setError("زمان شروع را مشخص کنید.");
    if (!displayedBooklets.length) return setError("حداقل یک دفترچه برای آزمون انتخاب کنید.");
    setSaving(true); setError("");
    try {
      if (!exam) {
        const created = await createExam({ ...form, title: form.title.trim(), bookletIds: displayedBooklets.map((item) => item.bookletId) });
        setExam(created); navigate(`/exam-builder/${created.id}`, { replace: true });
      } else {
        setExam(await updateExam(exam.id, { title: form.title.trim(), examDate: form.examDate, startTime: form.startTime, endTime: form.endTime }));
      }
    } catch (err) { setError(apiError(err, "ذخیره آزمون انجام نشد.")); }
    finally { setSaving(false); }
  };

  const changeStatus = async (status: ExamStatus) => {
    if (!exam || saving) return;
    setSaving(true); setError("");
    try { setExam(await changeExamStatus(exam.id, status)); }
    catch (err) { setError(apiError(err, "تغییر وضعیت آزمون انجام نشد.")); }
    finally { setSaving(false); }
  };

  const duplicate = async () => {
    if (!exam || saving) return;
    setSaving(true); setError("");
    try { const copy = await duplicateExam(exam.id); navigate(`/exam-builder/${copy.id}`); }
    catch (err) { setError(apiError(err, "کپی آزمون انجام نشد.")); }
    finally { setSaving(false); }
  };

  const removeExam = async (item: Exam) => {
    if (!window.confirm("آیا از حذف این آزمون مطمئن هستید؟")) return;
    try { await deleteExam(item.id); setExams((current) => current.filter((x) => x.id !== item.id)); }
    catch (err) { setError(apiError(err, "حذف آزمون انجام نشد.")); }
  };

  if (loading) return <main className="grid min-h-screen place-items-center bg-gray-50 dark:bg-[#080B12]">در حال دریافت آزمون...</main>;

  if (isList) return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-[#080B12] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm text-gray-500">مدیریت آزمون</p><h1 className="mt-1 text-3xl font-bold">آزمون‌ها</h1><p className="mt-2 text-sm text-gray-500">آزمون بسازید، دفترچه‌ها را مرتب کنید و قبل از انتشار پیش‌نمایش بگیرید.</p></div>
          <button onClick={() => navigate("/exam-builder/new")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-5 py-3 font-semibold text-white"><Plus size={18} /> آزمون جدید</button>
        </header>
        {error && <ErrorBox message={error} />}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {exams.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs text-gray-500">{item.booklets?.length ?? 0} دفترچه · {item.questionCount ?? 0} سؤال</p><h2 className="mt-1 text-lg font-bold">{item.title}</h2></div><StatusBadge status={item.status} /></div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><Info label="تاریخ" value={formatDate(item.examDate)} /><Info label="زمان" value={`${item.startTime} تا ${item.endTime || "—"}`} /></div>
            <div className="mt-4 flex gap-2"><button onClick={() => navigate(`/exam-builder/${item.id}`)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold dark:border-white/10"><Pencil size={16} /> مشاهده</button><button onClick={() => void removeExam(item)} className="rounded-xl border border-slate-200/70 px-3 py-2.5 text-gray-500 hover:text-red-500 dark:border-white/10"><Trash2 size={16} /></button></div>
          </article>)}
        </section>
        {!exams.length && <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-gray-500 dark:border-white/10">هنوز آزمونی ساخته نشده است.</div>}
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-[#080B12] sm:px-6"><div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><button onClick={() => navigate("/exam-builder")} className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--griffin-gold)]"><ArrowRight size={16} /> بازگشت به آزمون‌ها</button><h1 className="text-3xl font-bold">{exam ? "ساخت و ویرایش آزمون" : "آزمون جدید"}</h1><p className="mt-2 text-sm text-gray-500">اطلاعات آزمون و دفترچه‌های آن را مدیریت کنید.</p></div>{exam && <div className="flex flex-wrap items-center gap-2"><StatusBadge status={exam.status} /><button onClick={() => setPreviewOpen(true)} className="rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 text-sm font-semibold dark:border-white/10 dark:bg-[#111722]">پیش‌نمایش</button><button disabled={saving} onClick={() => void duplicate()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold disabled:opacity-40 dark:border-white/10"><Copy size={16} /> کپی</button></div>}</header>
      {error && <ErrorBox message={error} />}
      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]"><div className="mb-4 flex items-center gap-2"><CalendarDays size={19} className="text-[var(--griffin-gold)]" /><h2 className="font-semibold">اطلاعات آزمون</h2></div><div className="space-y-3"><input disabled={!editable} value={form.title} onChange={(e) => setForm((x) => ({ ...x, title: e.target.value }))} placeholder="عنوان آزمون *" className="w-full rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.02]" /><label className="block text-xs text-gray-500">تاریخ آزمون<input disabled={!editable} type="datetime-local" value={form.examDate} onChange={(e) => setForm((x) => ({ ...x, examDate: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200/70 px-3 py-3 text-sm disabled:opacity-60 dark:border-white/10 dark:bg-[#111722]" /></label><div className="grid grid-cols-2 gap-3"><label className="text-xs text-gray-500">شروع<input disabled={!editable} type="time" value={form.startTime} onChange={(e) => setForm((x) => ({ ...x, startTime: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200/70 px-3 py-3 disabled:opacity-60 dark:border-white/10 dark:bg-[#111722]" /></label><label className="text-xs text-gray-500">پایان<input disabled={!editable} type="time" value={form.endTime} onChange={(e) => setForm((x) => ({ ...x, endTime: e.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200/70 px-3 py-3 disabled:opacity-60 dark:border-white/10 dark:bg-[#111722]" /></label></div></div><button disabled={saving || !editable} onClick={() => void save()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-3 font-semibold text-white disabled:opacity-50"><Save size={18} /> {saving ? "در حال ذخیره..." : "ذخیره اطلاعات"}</button></section>
          {exam && <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]"><h2 className="mb-3 font-semibold">وضعیت آزمون</h2><div className="grid gap-2">{exam.status === "draft" && <button disabled={saving || !exam.booklets?.length} onClick={() => void changeStatus("review")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold disabled:opacity-40 dark:border-white/10"><Send size={16} /> ارسال برای بررسی</button>}{exam.status === "review" && <><button disabled={saving} onClick={() => void changeStatus("draft")} className="rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold disabled:opacity-40 dark:border-white/10">بازگشت به پیش‌نویس</button>{user?.role === "ADMIN" && <button disabled={saving || !exam.booklets?.length} onClick={() => void changeStatus("published")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><Check size={16} /> انتشار</button>}</>}</div></section>}
        </aside>
        <section className="rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#111722]"><div className="flex flex-col gap-3 border-b border-slate-200/70 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10"><div><h2 className="font-semibold">دفترچه‌های آزمون</h2><p className="mt-1 text-xs text-gray-500">{displayedBooklets.length.toLocaleString("fa-IR")} دفترچه · {questionCount.toLocaleString("fa-IR")} سؤال · حدود {duration.toLocaleString("fa-IR")} دقیقه</p></div><button disabled={saving || !editable} onClick={openPicker} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><Plus size={17} /> افزودن دفترچه</button></div><div className="p-5">{displayedBooklets.length ? <div className="space-y-3">{displayedBooklets.map((item, index) => <div key={item.id} draggable={editable} onDragStart={() => setDraggedIndex(index)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (draggedIndex !== null) void moveBooklet(draggedIndex, index); setDraggedIndex(null); }} className="rounded-2xl border border-slate-200/70 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"><div className="flex items-start gap-3"><GripVertical size={20} className={`mt-1 text-gray-400 ${editable ? "cursor-grab" : "opacity-30"}`} /><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-sm font-bold shadow-sm dark:bg-white/10">{index + 1}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2 text-xs text-gray-500"><span className="font-semibold">{item.booklet.title}</span><span>·</span><span>{item.booklet.lesson}</span><span>·</span><span>{item.booklet.grade}</span><span>·</span><span>{bookletQuestionCount(item.booklet as Booklet)} سؤال</span><span>·</span><span>{item.booklet.duration} دقیقه</span></div><p className="mt-2 text-sm text-gray-500">{item.booklet.major}</p></div><button disabled={saving || !editable || displayedBooklets.length <= 1} onClick={() => void removeBooklet(item.bookletId)} className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-red-500 disabled:opacity-30 dark:hover:bg-white/10"><Trash2 size={17} /></button></div></div>)}</div> : <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 text-center dark:border-white/10"><div><Clock3 size={34} className="mx-auto text-gray-400" /><p className="mt-3 font-semibold">هنوز دفترچه‌ای انتخاب نشده است</p><p className="mt-1 text-sm text-gray-500">برای ساخت آزمون، حداقل یک دفترچه منتشرشده انتخاب کنید.</p></div></div>}</div></section>
      </section>

      {pickerOpen && <Modal title="انتخاب دفترچه" onClose={() => !saving && setPickerOpen(false)}><p className="mb-4 text-xs text-gray-500">فقط دفترچه‌های منتشرشده نمایش داده می‌شوند.</p><div className="flex gap-2"><div className="relative flex-1"><Search size={17} className="absolute right-3 top-3.5 text-gray-400" /><input value={pickerSearch} onChange={(e) => setPickerSearch(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void loadPicker(1); }} placeholder="جستجو در عنوان، درس یا مشخصات دفترچه..." className="w-full rounded-xl border border-slate-200/70 py-3 pr-10 pl-3 dark:border-white/10 dark:bg-white/[0.03]" /></div><button onClick={() => void loadPicker(1)} className="rounded-xl border border-slate-200/70 px-4 font-semibold dark:border-white/10">جستجو</button></div><div className="mt-4 max-h-[50vh] overflow-y-auto space-y-3">{pickerLoading ? <div className="py-12 text-center text-sm text-gray-500">در حال دریافت دفترچه‌ها...</div> : pickerBooklets.map((booklet) => { const selected = pickerSelected.includes(booklet.id) || currentIds.has(booklet.id); return <button key={booklet.id} type="button" disabled={currentIds.has(booklet.id)} onClick={() => togglePicker(booklet)} className={`w-full rounded-2xl border p-4 text-right ${selected ? "border-[var(--griffin-gold)] bg-amber-50/50 dark:bg-amber-900/10" : "border-slate-200/70 dark:border-white/10"}`}><div className="flex items-start gap-3"><div className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md border ${selected ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)] text-white" : "border-slate-300 dark:border-white/20"}`}>{selected && <Check size={15} />}</div><div><div className="flex flex-wrap gap-2 text-xs text-gray-500"><span className="font-semibold">{booklet.title}</span><span>·</span><span>{booklet.lesson}</span><span>·</span><span>{booklet.grade}</span></div><p className="mt-2 text-xs text-gray-500">{bookletQuestionCount(booklet)} سؤال · {booklet.duration} دقیقه · {booklet.major}</p></div></div></button>})}{!pickerLoading && !pickerBooklets.length && <div className="py-12 text-center text-sm text-gray-500">دفترچه منتشرشده‌ای پیدا نشد.</div>}</div><div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-4 dark:border-white/10"><div className="flex items-center gap-2 text-xs text-gray-500"><button disabled={pickerPage <= 1 || pickerLoading} onClick={() => void loadPicker(pickerPage - 1)} className="rounded-lg border p-2 disabled:opacity-30 dark:border-white/10"><ChevronRight size={17} /></button><span>صفحه {pickerPage.toLocaleString("fa-IR")} از {pickerTotalPages.toLocaleString("fa-IR")}</span><button disabled={pickerPage >= pickerTotalPages || pickerLoading} onClick={() => void loadPicker(pickerPage + 1)} className="rounded-lg border p-2 disabled:opacity-30 dark:border-white/10"><ChevronLeft size={17} /></button></div><button disabled={!pickerSelected.length || saving} onClick={() => void addSelected()} className="inline-flex items-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><Plus size={16} /> افزودن {pickerSelected.length ? pickerSelected.length.toLocaleString("fa-IR") : ""} دفترچه</button></div></Modal>}

      {previewOpen && exam && <Modal title="پیش‌نمایش آزمون" onClose={() => setPreviewOpen(false)}><div className="grid gap-3 sm:grid-cols-3"><Info label="تاریخ" value={formatDate(exam.examDate)} /><Info label="زمان" value={`${exam.startTime} تا ${exam.endTime || "—"}`} /><Info label="مدت تقریبی" value={`${duration} دقیقه`} /></div><div className="mt-5 space-y-3">{displayedBooklets.map((item, index) => <article key={item.id} className="rounded-2xl border border-slate-200/70 p-5 dark:border-white/10"><p className="text-xs text-gray-500">دفترچه {index + 1}</p><h3 className="mt-1 font-bold">{item.booklet.title}</h3><p className="mt-3 text-sm text-gray-500">{item.booklet.lesson} · {item.booklet.grade} · {item.booklet.major} · {item.booklet.duration} دقیقه · {bookletQuestionCount(item.booklet as Booklet)} سؤال</p></article>)}</div></Modal>}
    </div></main>
  );
}

function ErrorBox({ message }: { message: string }) { return <div className="whitespace-pre-line rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">{message}</div>; }
function StatusBadge({ status }: { status: ExamStatus }) { return <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses[status]}`}>{statusLabels[status]}</span>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"><div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-200/70 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#111722]"><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5"><X size={21} /></button></div>{children}</div></div>; }
