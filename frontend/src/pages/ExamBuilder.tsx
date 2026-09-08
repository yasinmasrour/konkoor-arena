import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  addExamBooklets,
  createExam,
  deleteExam,
  getExam,
  getExams,
  removeExamBooklet,
  reorderExamBooklets,
  updateExam,
  type Exam,
  type ExamStatus,
} from "../api/examApi";
import { getBooklets, type Booklet } from "../api/bookletApi";

const statusLabels: Record<ExamStatus, string> = {
  draft: "پیش‌نویس",
  review: "در حال بررسی",
  published: "منتشرشده",
  archived: "آرشیو",
};

const statusClasses: Record<ExamStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200",
  review:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
  published:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
  archived: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const emptyForm = {
  title: "",
  examDate: "",
  startTime: "08:00",
  endTime: "10:30",
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const apiError = (error: unknown, fallback: string) => {
  const response = (
    error as { response?: { data?: { message?: string; errors?: string[] } } }
  )?.response;
  if (Array.isArray(response?.data?.errors) && response.data.errors.length)
    return response.data.errors.join("\n");
  return response?.data?.message || fallback;
};

const ExamBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id && id !== "new");
  const [exam, setExam] = useState<Exam | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedBookletIds, setSelectedBookletIds] = useState<string[]>([]);
  const [pendingBooklets, setPendingBooklets] = useState<Booklet[]>([]);
  const [loading, setLoading] = useState(editing);
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

  const currentIds = useMemo(
    () => new Set((exam?.booklets ?? []).map((item) => item.bookletId)),
    [exam],
  );
  const displayedBooklets = exam
    ? exam.booklets
    : pendingBooklets.map((booklet, index) => ({
        id: `pending-${booklet.id}`,
        examId: "",
        bookletId: booklet.id,
        order: index + 1,
        booklet: {
          ...booklet,
          questions: booklet.questions.map((question) => ({
            id: question.id,
            questionId: question.questionId,
            order: question.order,
            score: question.score,
          })),
        },
      }));

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!id) {
        try {
          const result = await getExams({
            page: 1,
            limit: 8,
            sort: "createdAt",
            order: "desc",
          });
          if (isMounted) setExams(result.exams);
        } catch (err) {
          if (isMounted) setError(apiError(err, "دریافت آزمون‌ها انجام نشد."));
        } finally {
          if (isMounted) setLoading(false);
        }
        return;
      }

      if (id === "new") {
        if (isMounted) {
          setExam(null);
          setForm(emptyForm);
          setSelectedBookletIds([]);
          setPendingBooklets([]);
          setError("");
          setLoading(false);
        }
        return;
      }

      try {
        const result = await getExam(id);
        if (isMounted) {
          setExam(result);
          setForm({
            title: result.title,
            examDate: result.examDate.slice(0, 16),
            startTime: result.startTime,
            endTime: result.endTime,
          });
        }
      } catch (err) {
        if (isMounted) setError(apiError(err, "دریافت آزمون انجام نشد."));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const loadPicker = async (page = pickerPage) => {
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
      setPickerBooklets(result.booklets);
      setPickerPage(result.pagination.page);
      setPickerTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError(apiError(err, "دریافت دفترچه‌های منتشرشده انجام نشد."));
    } finally {
      setPickerLoading(false);
    }
  };

  const openPicker = () => {
    setPickerSelected([]);
    setPickerOpen(true);
    void loadPicker(1);
  };

  const togglePicker = (booklet: Booklet) => {
    if (currentIds.has(booklet.id) || selectedBookletIds.includes(booklet.id)) {
      setPickerSelected((current) =>
        current.filter((item) => item !== booklet.id),
      );
      return;
    }
    setPickerSelected((current) =>
      current.includes(booklet.id)
        ? current.filter((item) => item !== booklet.id)
        : [...current, booklet.id],
    );
  };

  const addSelected = async () => {
    if (!pickerSelected.length || saving) return;
    setSaving(true);
    setError("");
    try {
      if (!exam) {
        const selected = pickerBooklets.filter((item) =>
          pickerSelected.includes(item.id),
        );
        setPendingBooklets((current) => [
          ...current,
          ...selected.filter(
            (item) => !current.some((existing) => existing.id === item.id),
          ),
        ]);
        setSelectedBookletIds((current) => [
          ...new Set([...current, ...pickerSelected]),
        ]);
      } else {
        setExam(
          await addExamBooklets(
            exam.id,
            pickerSelected.filter((item) => !currentIds.has(item)),
          ),
        );
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
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      if (!exam) {
        setPendingBooklets((current) =>
          current.filter((item) => item.id !== bookletId),
        );
        setSelectedBookletIds((current) =>
          current.filter((item) => item !== bookletId),
        );
      } else {
        setExam(await removeExamBooklet(exam.id, bookletId));
      }
    } catch (err) {
      setError(apiError(err, "حذف دفترچه از آزمون انجام نشد."));
    } finally {
      setSaving(false);
    }
  };

  const moveBooklet = async (from: number, to: number) => {
    if (from === to || saving || to < 0 || to >= displayedBooklets.length)
      return;
    const next = [...displayedBooklets];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    if (!exam) {
      const nextIds = next.map((item) => item.bookletId);
      setSelectedBookletIds(nextIds);
      setPendingBooklets(
        nextIds
          .map((bookletId) =>
            pendingBooklets.find((item) => item.id === bookletId),
          )
          .filter(Boolean) as Booklet[],
      );
      return;
    }
    setSaving(true);
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

  const save = async () => {
    if (form.title.trim().length < 3)
      return setError("عنوان آزمون را وارد کنید.");
    if (!form.examDate) return setError("تاریخ آزمون را مشخص کنید.");
    if (!form.startTime) return setError("زمان شروع را مشخص کنید.");
    if (!exam && !selectedBookletIds.length)
      return setError("حداقل یک دفترچه برای آزمون انتخاب کنید.");
    setSaving(true);
    setError("");
    try {
      if (!exam) {
        const created = await createExam({
          ...form,
          title: form.title.trim(),
          bookletIds: selectedBookletIds,
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
      setExam(await updateExam(exam.id, { status }));
    } catch (err) {
      setError(apiError(err, "تغییر وضعیت آزمون انجام نشد."));
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async () => {
    if (!exam) return;
    setError(
      "کپی آزمون هنوز Endpoint اختصاصی ندارد؛ از ساخت آزمون جدید و انتخاب همان دفترچه‌ها استفاده کنید.",
    );
  };

  const removeExam = async (item: Exam) => {
    if (!window.confirm("آیا از حذف این آزمون مطمئن هستید؟")) return;
    try {
      await deleteExam(item.id);
      setExams((current) =>
        current.filter((examItem) => examItem.id !== item.id),
      );
    } catch (err) {
      setError(apiError(err, "حذف آزمون انجام نشد."));
    }
  };

  if (loading)
    return (
      <main className="grid min-h-screen place-items-center bg-gray-50 dark:bg-[#080B12]">
        در حال دریافت آزمون...
      </main>
    );

  if (!id) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-[#080B12] sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">مدیریت آزمون</p>
              <h1 className="mt-1 text-3xl font-bold">آزمون‌ها</h1>
              <p className="mt-2 text-sm text-gray-500">
                آزمون بسازید، دفترچه‌ها را مرتب کنید و قبل از انتشار پیش‌نمایش
                بگیرید.
              </p>
            </div>
            <button
              onClick={() => navigate("/exam-builder/new")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-5 py-3 font-semibold text-white"
            >
              <Plus size={18} /> آزمون جدید
            </button>
          </header>
          {error && (
            <div className="whitespace-pre-line rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
              {error}
            </div>
          )}
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {exams.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">
                      {item.booklets.length} دفترچه · {item.questionCount ?? 0}{" "}
                      سؤال
                    </p>
                    <h2 className="mt-1 text-lg font-bold">{item.title}</h2>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[item.status]}`}
                  >
                    {statusLabels[item.status]}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
                    <p className="text-xs text-gray-500">تاریخ</p>
                    <p className="mt-1 font-semibold">
                      {formatDate(item.examDate)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 dark:bg-white/5">
                    <p className="text-xs text-gray-500">زمان</p>
                    <p className="mt-1 font-semibold">
                      {item.startTime} تا {item.endTime || "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/exam-builder/${item.id}`)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold dark:border-white/10"
                  >
                    <Pencil size={16} /> ویرایش
                  </button>
                  <button
                    onClick={() => void removeExam(item)}
                    className="rounded-xl border border-slate-200/70 px-3 py-2.5 text-gray-500 hover:text-red-500 dark:border-white/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </section>
          {!exams.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-gray-500 dark:border-white/10">
              هنوز آزمونی ساخته نشده است.
            </div>
          )}
        </div>
      </main>
    );
  }

  const questionCount = displayedBooklets.reduce(
    (sum, item) => sum + item.booklet.questions.length,
    0,
  );
  const duration = displayedBooklets.reduce(
    (sum, item) => sum + item.booklet.duration,
    0,
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-[#080B12] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              onClick={() => navigate("/exam-builder")}
              className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--griffin-gold)]"
            >
              <ArrowRight size={16} /> بازگشت به آزمون‌ها
            </button>
            <h1 className="text-3xl font-bold">
              {exam ? "ساخت و ویرایش آزمون" : "آزمون جدید"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              اطلاعات آزمون و دفترچه‌های آن را مدیریت کنید.
            </p>
          </div>
          {exam && (
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses[exam.status]}`}
              >
                {statusLabels[exam.status]}
              </span>
              <button
                onClick={() => setPreviewOpen(true)}
                className="rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 text-sm font-semibold dark:border-white/10 dark:bg-[#111722]"
              >
                پیش‌نمایش
              </button>
              <button
                onClick={() => void duplicate()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold dark:border-white/10"
              >
                <Copy size={16} /> کپی
              </button>
            </div>
          )}
        </header>
        {error && (
          <div className="whitespace-pre-line rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}
        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays
                  size={19}
                  className="text-[var(--griffin-gold)]"
                />
                <h2 className="font-semibold">اطلاعات آزمون</h2>
              </div>
              <div className="space-y-3">
                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      title: e.target.value,
                    }))
                  }
                  placeholder="عنوان آزمون *"
                  className="w-full rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]"
                />
                <label className="block text-xs text-gray-500">
                  تاریخ آزمون
                  <input
                    type="datetime-local"
                    value={form.examDate}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        examDate: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200/70 px-3 py-3 text-sm dark:border-white/10 dark:bg-[#111722]"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-gray-500">
                    شروع
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          startTime: e.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-[#111722]"
                    />
                  </label>
                  <label className="text-xs text-gray-500">
                    پایان
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) =>
                        setForm((current) => ({
                          ...current,
                          endTime: e.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-[#111722]"
                    />
                  </label>
                </div>
              </div>
              <button
                disabled={saving}
                onClick={() => void save()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                <Save size={18} />{" "}
                {saving ? "در حال ذخیره..." : "ذخیره اطلاعات"}
              </button>
            </div>
            {exam && (
              <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]">
                <h2 className="mb-3 font-semibold">وضعیت آزمون</h2>
                <div className="grid gap-2">
                  {exam.status === "draft" && (
                    <button
                      disabled={saving || !exam.booklets.length}
                      onClick={() => void changeStatus("review")}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold disabled:opacity-40 dark:border-white/10"
                    >
                      <Send size={16} /> ارسال برای بررسی
                    </button>
                  )}
                  {exam.status === "review" && (
                    <>
                      <button
                        disabled={saving}
                        onClick={() => void changeStatus("draft")}
                        className="rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-semibold disabled:opacity-40 dark:border-white/10"
                      >
                        بازگشت به پیش‌نویس
                      </button>
                      <button
                        disabled={saving || !exam.booklets.length}
                        onClick={() => void changeStatus("published")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                      >
                        <Check size={16} /> انتشار
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </aside>
          <section className="rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#111722]">
            <div className="flex flex-col gap-3 border-b border-slate-200/70 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">دفترچه‌های آزمون</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {displayedBooklets.length.toLocaleString("fa-IR")} دفترچه ·{" "}
                  {questionCount.toLocaleString("fa-IR")} سؤال · حدود{" "}
                  {duration.toLocaleString("fa-IR")} دقیقه
                </p>
              </div>
              <button
                disabled={saving || exam?.status === "published"}
                onClick={openPicker}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                <Plus size={17} /> افزودن دفترچه
              </button>
            </div>
            <div className="p-5">
              {displayedBooklets.length ? (
                <div className="space-y-3">
                  {displayedBooklets.map((item, index) => (
                    <div
                      key={item.id}
                      draggable={exam?.status !== "published"}
                      onDragStart={() => setDraggedIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedIndex !== null)
                          void moveBooklet(draggedIndex, index);
                        setDraggedIndex(null);
                      }}
                      className="rounded-2xl border border-slate-200/70 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
                    >
                      <div className="flex items-start gap-3">
                        <GripVertical
                          size={20}
                          className="mt-1 cursor-grab text-gray-400"
                        />
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-sm font-bold shadow-sm dark:bg-white/10">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            <span className="font-semibold">
                              {item.booklet.title}
                            </span>
                            <span>·</span>
                            <span>{item.booklet.lesson}</span>
                            <span>·</span>
                            <span>{item.booklet.grade}</span>
                            <span>·</span>
                            <span>{item.booklet.questions.length} سؤال</span>
                            <span>·</span>
                            <span>{item.booklet.duration} دقیقه</span>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            {item.booklet.major}
                          </p>
                        </div>
                        <button
                          disabled={saving || exam?.status === "published"}
                          onClick={() => void removeBooklet(item.bookletId)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-red-500 disabled:opacity-30 dark:hover:bg-white/10"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 text-center dark:border-white/10">
                  <div>
                    <Clock3 size={34} className="mx-auto text-gray-400" />
                    <p className="mt-3 font-semibold">
                      هنوز دفترچه‌ای انتخاب نشده است
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      برای ساخت آزمون، حداقل یک دفترچه منتشرشده انتخاب کنید.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>
        {pickerOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.currentTarget === e.target && !saving) setPickerOpen(false);
            }}
          >
            <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111722]">
              <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
                <div>
                  <h2 className="text-xl font-bold">انتخاب دفترچه</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    فقط دفترچه‌های منتشرشده نمایش داده می‌شوند.
                  </p>
                </div>
                <button
                  onClick={() => setPickerOpen(false)}
                  disabled={saving}
                  className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <X size={21} />
                </button>
              </div>
              <div className="border-b border-slate-200/70 p-5 dark:border-white/10">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search
                      size={17}
                      className="absolute right-3 top-3.5 text-gray-400"
                    />
                    <input
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void loadPicker(1);
                      }}
                      placeholder="جستجو در عنوان، درس یا مشخصات دفترچه..."
                      className="w-full rounded-xl border border-slate-200/70 py-3 pr-10 pl-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.03]"
                    />
                  </div>
                  <button
                    onClick={() => void loadPicker(1)}
                    className="rounded-xl border border-slate-200/70 px-4 font-semibold dark:border-white/10"
                  >
                    جستجو
                  </button>
                </div>
              </div>
              <div className="max-h-[55vh] overflow-y-auto p-5">
                {pickerLoading ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    در حال دریافت دفترچه‌ها...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pickerBooklets.map((booklet) => {
                      const selected =
                        pickerSelected.includes(booklet.id) ||
                        currentIds.has(booklet.id);
                      return (
                        <button
                          key={booklet.id}
                          type="button"
                          disabled={currentIds.has(booklet.id)}
                          onClick={() => togglePicker(booklet)}
                          className={`w-full rounded-2xl border p-4 text-right transition ${selected ? "border-[var(--griffin-gold)] bg-amber-50/50 dark:bg-amber-900/10" : "border-slate-200/70 hover:border-[var(--griffin-gold)]/50 dark:border-white/10"}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md border ${selected ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)] text-white" : "border-slate-300 dark:border-white/20"}`}
                            >
                              {selected && <Check size={15} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                <span className="font-semibold">
                                  {booklet.title}
                                </span>
                                <span>·</span>
                                <span>{booklet.lesson}</span>
                                <span>·</span>
                                <span>{booklet.grade}</span>
                                <span>·</span>
                                <span>{booklet.questions.length} سؤال</span>
                              </div>
                              <p className="mt-2 text-xs text-gray-500">
                                {booklet.duration} دقیقه · {booklet.major}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {!pickerLoading && !pickerBooklets.length && (
                  <div className="py-12 text-center text-sm text-gray-500">
                    دفترچه منتشرشده‌ای پیدا نشد.
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/70 px-5 py-4 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <button
                    disabled={pickerPage <= 1 || pickerLoading}
                    onClick={() => void loadPicker(pickerPage - 1)}
                    className="rounded-lg border border-slate-200/70 p-2 disabled:opacity-30 dark:border-white/10"
                  >
                    <ChevronRight size={17} />
                  </button>
                  <span>
                    صفحه {pickerPage.toLocaleString("fa-IR")} از{" "}
                    {pickerTotalPages.toLocaleString("fa-IR")}
                  </span>
                  <button
                    disabled={pickerPage >= pickerTotalPages || pickerLoading}
                    onClick={() => void loadPicker(pickerPage + 1)}
                    className="rounded-lg border border-slate-200/70 p-2 disabled:opacity-30 dark:border-white/10"
                  >
                    <ChevronLeft size={17} />
                  </button>
                </div>
                <button
                  disabled={!pickerSelected.length || saving}
                  onClick={() => void addSelected()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  <Plus size={16} /> افزودن{" "}
                  {pickerSelected.length
                    ? pickerSelected.length.toLocaleString("fa-IR")
                    : ""}{" "}
                  دفترچه
                </button>
              </div>
            </div>
          </div>
        )}
        {previewOpen && exam && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onMouseDown={(e) => {
              if (e.currentTarget === e.target) setPreviewOpen(false);
            }}
          >
            <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-[#111722]">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/70 bg-white/95 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-[#111722]/95">
                <div>
                  <h2 className="text-xl font-bold">پیش‌نمایش آزمون</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {exam.title} · {exam.booklets.length} دفترچه ·{" "}
                    {questionCount} سؤال
                  </p>
                </div>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <X size={21} />
                </button>
              </div>
              <div className="space-y-4 p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                    <p className="text-xs text-gray-500">تاریخ</p>
                    <p className="mt-1 font-semibold">
                      {formatDate(exam.examDate)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                    <p className="text-xs text-gray-500">زمان</p>
                    <p className="mt-1 font-semibold">
                      {exam.startTime} تا {exam.endTime || "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                    <p className="text-xs text-gray-500">مدت تقریبی</p>
                    <p className="mt-1 inline-flex items-center gap-1 font-semibold">
                      <Clock3 size={15} /> {duration} دقیقه
                    </p>
                  </div>
                </div>
                {exam.booklets.map((item, index) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200/70 p-5 dark:border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">
                          دفترچه {index + 1}
                        </p>
                        <h3 className="mt-1 font-bold">{item.booklet.title}</h3>
                      </div>
                      <span className="text-xs text-gray-500">
                        {item.booklet.questions.length} سؤال
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                      {item.booklet.lesson} · {item.booklet.grade} ·{" "}
                      {item.booklet.major} · {item.booklet.duration} دقیقه
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ExamBuilder;
