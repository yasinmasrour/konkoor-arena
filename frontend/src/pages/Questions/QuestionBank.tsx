import { useEffect, useState } from "react";
import {
  FileQuestion,
  Filter,
  Plus,
  RefreshCw,
  Search,
  Send,
  Archive,
  Upload,
  Pencil,
  SlidersHorizontal,
  Eye,
  CheckSquare,
  Square,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getQuestions,
  setQuestionStatus,
  submitQuestionForReview,
  duplicateQuestion,
  bulkSetQuestionStatus,
  updateQuestion,
  exportQuestions,
  type Question,
  type QuestionDifficulty,
  type QuestionStatus,
} from "../../api/questionApi";

const statusLabels: Record<QuestionStatus, string> = {
  draft: "پیش‌نویس",
  review: "در حال بررسی",
  published: "منتشرشده",
  archived: "آرشیو",
};

const difficultyLabels: Record<QuestionDifficulty, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
  tricky: "مفهومی/چالشی",
};

const QuestionBank = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [lesson, setLesson] = useState("");
  const [grade, setGrade] = useState("");
  const [major, setMajor] = useState("");
  const [chapter, setChapter] = useState("");
  const [sort, setSort] = useState("updatedAt");
  const [order, setOrder] = useState("desc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [savedFilterName, setSavedFilterName] = useState("");
  const [savedFilters, setSavedFilters] = useState<
    Array<{
      name: string;
      filters: {
        search: string;
        lesson: string;
        grade: string;
        major: string;
        chapter: string;
        difficulty: string;
        status: string;
        sort: string;
        order: string;
      };
    }>
  >(() => {
    try {
      const raw = localStorage.getItem("griffin-question-bank-filters");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [quickEditQuestion, setQuickEditQuestion] = useState<Question | null>(
    null,
  );
  const [quickEditSaving, setQuickEditSaving] = useState(false);
  const [quickEditForm, setQuickEditForm] = useState({
    lesson: "",
    grade: "12",
    major: "math",
    chapter: "",
    topic: "",
    difficulty: "medium" as QuestionDifficulty,
    year: "",
    tags: "",
  });
  const isAdmin = user?.role?.name === "ADMIN";

  const currentFilters = () => ({
    search,
    lesson,
    grade,
    major,
    chapter,
    difficulty,
    status,
    sort,
    order,
  });

  const persistSavedFilters = (next: typeof savedFilters) => {
    setSavedFilters(next);
    localStorage.setItem("griffin-question-bank-filters", JSON.stringify(next));
  };

  const saveCurrentFilter = () => {
    const name = savedFilterName.trim();
    if (!name) {
      setError("برای ذخیره فیلتر، یک نام وارد کنید.");
      return;
    }
    const next = [
      ...savedFilters.filter((item) => item.name !== name),
      { name, filters: currentFilters() },
    ];
    persistSavedFilters(next);
    setSavedFilterName("");
    setError("");
  };

  const applySavedFilter = (saved: (typeof savedFilters)[number]) => {
    const f = saved.filters;
    setSearch(f.search);
    setLesson(f.lesson);
    setGrade(f.grade);
    setMajor(f.major);
    setChapter(f.chapter);
    setDifficulty(f.difficulty);
    setStatus(f.status);
    setSort(f.sort);
    setOrder(f.order);
    window.setTimeout(() => void load(1), 0);
  };

  const load = async (page = pagination.page) => {
    setLoading(true);
    setError("");
    try {
      const result = await getQuestions({
        page,
        limit: pagination.limit,
        search: search || undefined,
        status: status || undefined,
        difficulty: difficulty || undefined,
        lesson: lesson || undefined,
        grade: grade || undefined,
        major: major || undefined,
        chapter: chapter || undefined,
        sort,
        order,
      });
      setQuestions(result.questions);
      setPagination(result.pagination);
      setSelectedIds([]);
    } catch {
      setError("دریافت بانک سؤال انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitReview = async (question: Question) => {
    try {
      await submitQuestionForReview(question.id);
      await load();
    } catch {
      setError("ارسال سؤال برای بررسی انجام نشد.");
    }
  };

  const handleStatus = async (
    question: Question,
    nextStatus: QuestionStatus,
  ) => {
    try {
      await setQuestionStatus(question.id, nextStatus);
      await load();
    } catch {
      setError("تغییر وضعیت سؤال انجام نشد.");
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((current) =>
      current.length === questions.length
        ? []
        : questions.map((question) => question.id),
    );
  };

  const handleBulkStatus = async (nextStatus: QuestionStatus) => {
    if (!selectedIds.length || bulkLoading) return;
    setBulkLoading(true);
    setError("");
    try {
      await bulkSetQuestionStatus(selectedIds, nextStatus);
      await load();
    } catch {
      setError(
        "تغییر وضعیت گروهی انجام نشد. وضعیت سؤال‌های انتخاب‌شده را بررسی کنید.",
      );
    } finally {
      setBulkLoading(false);
    }
  };

  const openQuickEdit = (question: Question) => {
    setError("");
    setQuickEditQuestion(question);
    setQuickEditForm({
      lesson: question.lesson,
      grade: question.grade,
      major: question.major,
      chapter: question.chapter,
      topic: question.topic ?? "",
      difficulty: question.difficulty,
      year: question.year ? String(question.year) : "",
      tags: (question.tags ?? []).join(", "),
    });
  };

  const handleQuickEdit = async () => {
    if (!quickEditQuestion || quickEditSaving) return;
    if (!quickEditForm.lesson.trim() || !quickEditForm.chapter.trim()) {
      setError("درس و فصل باید تکمیل شوند.");
      return;
    }
    const yearValue = quickEditForm.year.trim()
      ? Number(quickEditForm.year)
      : undefined;
    if (
      yearValue !== undefined &&
      (!Number.isInteger(yearValue) || yearValue < 1300 || yearValue > 2100)
    ) {
      setError("سال واردشده معتبر نیست.");
      return;
    }
    setQuickEditSaving(true);
    setError("");
    try {
      const updated = await updateQuestion(quickEditQuestion.id, {
        lesson: quickEditForm.lesson.trim(),
        grade: quickEditForm.grade,
        major: quickEditForm.major,
        chapter: quickEditForm.chapter.trim(),
        topic: quickEditForm.topic.trim(),
        difficulty: quickEditForm.difficulty,
        year: yearValue,
        tags: quickEditForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      setQuestions((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setQuickEditQuestion(null);
    } catch {
      setError(
        "ویرایش سریع سؤال انجام نشد. وضعیت و سطح دسترسی سؤال را بررسی کنید.",
      );
    } finally {
      setQuickEditSaving(false);
    }
  };

  const handleDuplicate = async (question: Question) => {
    try {
      const duplicated = await duplicateQuestion(question.id);
      navigate(`/question-designer/${duplicated.id}`);
    } catch {
      setError("کپی سؤال انجام نشد.");
    }
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    if (loading) return;
    try {
      const selectedOnly = selectedIds.length > 0;
      const params: Record<string, string | number | undefined> = selectedOnly
        ? { ids: selectedIds.join(","), format }
        : { ...currentFilters(), format };
      const result = await exportQuestions(params);
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `griffin-questions-${format}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      setError("");
    } catch {
      setError("خروجی گرفتن از سؤال‌ها انجام نشد.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#080B12] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Griffin Academy · Question Management
            </p>
            <h1 className="mt-1 text-3xl font-bold">بانک سؤال</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              سؤال‌ها را جستجو، بررسی و مدیریت کنید.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={loading}
              onClick={() => void handleExport("xlsx")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-[#111722] dark:hover:bg-white/5"
            >
              Excel {selectedIds.length > 0 ? "منتخب" : "فیلترشده"}
            </button>
            <button
              disabled={loading}
              onClick={() => void handleExport("csv")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-[#111722] dark:hover:bg-white/5"
            >
              CSV {selectedIds.length > 0 ? "منتخب" : "فیلترشده"}
            </button>
            <button
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 hover:opacity-80 dark:border-white/10 dark:bg-[#111722]"
            >
              <RefreshCw size={17} /> بروزرسانی
            </button>
            <button
              onClick={() => navigate("/question-analytics")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 hover:bg-gray-50 dark:border-white/10 dark:bg-[#111722] dark:hover:bg-white/5"
            >
              آمار بانک
            </button>
            <button
              onClick={() => navigate("/question-import")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 font-semibold hover:bg-gray-50 dark:border-white/10 dark:bg-[#111722] dark:hover:bg-white/5"
            >
              <Upload size={17} /> ورود گروهی
            </button>
            <button
              onClick={() => navigate("/question-designer")}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-2.5 font-semibold text-white hover:opacity-90"
            >
              <Plus size={18} /> سؤال جدید
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#111722]">
          <div className="mb-4 flex items-center gap-2 font-semibold">
            <Filter size={18} /> فیلتر و جستجو
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <label className="relative lg:col-span-2">
              <Search
                size={17}
                className="absolute right-3 top-3.5 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="کد، متن یا مبحث سؤال..."
                className="w-full rounded-xl border border-slate-200/70 bg-transparent py-3 pr-10 pl-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10"
              />
            </label>
            <input
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="درس"
              className="rounded-xl border border-slate-200/70 bg-transparent px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10"
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-xl border border-slate-200/70 bg-transparent px-3 py-3 outline-none dark:border-white/10 dark:bg-[#111722]"
            >
              <option value="">همه سختی‌ها</option>
              {Object.entries(difficultyLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200/70 bg-transparent px-3 py-3 outline-none dark:border-white/10 dark:bg-[#111722]"
            >
              <option value="">همه وضعیت‌ها</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setShowAdvancedFilters((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
            >
              <SlidersHorizontal size={16} />{" "}
              {showAdvancedFilters
                ? "بستن فیلترهای پیشرفته"
                : "فیلترهای پیشرفته"}
            </button>
            <button
              onClick={() => void load(1)}
              className="rounded-xl bg-[var(--griffin-gold)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              اعمال فیلتر
            </button>
          </div>
          {showAdvancedFilters && (
            <div className="mt-4 rounded-2xl border border-slate-200/70 bg-gray-50/70 p-4 dark:border-white/10 dark:bg-white/[0.02]">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <input
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="پایه (مثلاً 12)"
                  className="rounded-xl border border-slate-200/70 bg-white px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-[#111722]"
                />
                <input
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="رشته (مثلاً math)"
                  className="rounded-xl border border-slate-200/70 bg-white px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-[#111722]"
                />
                <input
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  placeholder="فصل"
                  className="rounded-xl border border-slate-200/70 bg-white px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-[#111722]"
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-xl border border-slate-200/70 bg-white px-3 py-3 dark:border-white/10 dark:bg-[#111722]"
                >
                  <option value="updatedAt">آخرین ویرایش</option>
                  <option value="createdAt">تاریخ ایجاد</option>
                  <option value="code">کد</option>
                  <option value="lesson">درس</option>
                  <option value="chapter">فصل</option>
                  <option value="difficulty">سختی</option>
                  <option value="status">وضعیت</option>
                  <option value="usageCount">تعداد استفاده</option>
                </select>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="rounded-xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm dark:border-white/10 dark:bg-[#111722]"
                >
                  <option value="desc">نزولی</option>
                  <option value="asc">صعودی</option>
                </select>
                <input
                  value={savedFilterName}
                  onChange={(e) => setSavedFilterName(e.target.value)}
                  placeholder="نام فیلتر ذخیره‌شده"
                  className="min-w-52 rounded-xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-[#111722]"
                />
                <button
                  onClick={saveCurrentFilter}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm font-medium dark:border-white/10 dark:bg-[#111722]"
                >
                  <Save size={16} /> ذخیره فیلتر
                </button>
              </div>
              {savedFilters.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {savedFilters.map((saved) => (
                    <div
                      key={saved.name}
                      className="inline-flex items-center overflow-hidden rounded-xl border border-slate-200/70 bg-white dark:border-white/10 dark:bg-[#111722]"
                    >
                      <button
                        onClick={() => applySavedFilter(saved)}
                        className="px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5"
                      >
                        {saved.name}
                      </button>
                      <button
                        title="حذف فیلتر"
                        onClick={() =>
                          persistSavedFilters(
                            savedFilters.filter(
                              (item) => item.name !== saved.name,
                            ),
                          )
                        }
                        className="border-r border-slate-200/70 px-2.5 py-2 text-gray-500 hover:text-red-500 dark:border-white/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {selectedIds.length > 0 && (
          <section className="flex flex-col gap-3 rounded-2xl border border-[var(--griffin-gold)]/40 bg-amber-50/60 p-4 dark:border-[var(--griffin-gold)]/30 dark:bg-amber-900/10 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CheckSquare size={18} /> {selectedIds.length} سؤال انتخاب شده
            </div>
            <div className="flex flex-wrap gap-2">
              {isAdmin && (
                <button
                  disabled={bulkLoading}
                  onClick={() => void handleBulkStatus("published")}
                  className="rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-[#111722] dark:hover:bg-white/5"
                >
                  انتشار گروهی
                </button>
              )}
              {isAdmin && (
                <button
                  disabled={bulkLoading}
                  onClick={() => void handleBulkStatus("archived")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-[#111722] dark:hover:bg-white/5"
                >
                  <Archive size={15} /> آرشیو گروهی
                </button>
              )}
              {isAdmin && (
                <button
                  disabled={bulkLoading}
                  onClick={() => void handleBulkStatus("draft")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/70 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-[#111722] dark:hover:bg-white/5"
                >
                  <RotateCcw size={15} /> بازگردانی به پیش‌نویس
                </button>
              )}
              <button
                disabled={bulkLoading}
                onClick={() => setSelectedIds([])}
                className="rounded-xl border border-slate-200/70 px-3 py-2 text-sm hover:bg-white disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                لغو انتخاب
              </button>
            </div>
          </section>
        )}

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#111722]">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
            <div className="flex items-center gap-2 font-semibold">
              <FileQuestion size={19} /> {pagination.total} سؤال
            </div>
            {loading && (
              <span className="text-sm text-gray-500">در حال دریافت...</span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-right text-sm">
              <thead className="bg-gray-50 text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                <tr>
                  <th className="w-12 px-5 py-3">
                    <button
                      title="انتخاب همه"
                      onClick={toggleAll}
                      className="rounded-md p-1 hover:bg-gray-200 dark:hover:bg-white/10"
                    >
                      {selectedIds.length === questions.length &&
                      questions.length > 0 ? (
                        <CheckSquare size={17} />
                      ) : (
                        <Square size={17} />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-3">کد</th>
                  <th className="px-5 py-3">سؤال</th>
                  <th className="px-5 py-3">درس / فصل</th>
                  <th className="px-5 py-3">سختی</th>
                  <th className="px-5 py-3">وضعیت</th>
                  <th className="px-5 py-3">استفاده</th>
                  <th className="px-5 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
                {questions.map((question) => (
                  <tr
                    key={question.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <button
                        title="انتخاب سؤال"
                        onClick={() => toggleSelected(question.id)}
                        className="rounded-md p-1 hover:bg-gray-200 dark:hover:bg-white/10"
                      >
                        {selectedIds.includes(question.id) ? (
                          <CheckSquare size={17} />
                        ) : (
                          <Square size={17} />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs">
                      {question.code}
                    </td>
                    <td className="max-w-[320px] px-5 py-4">
                      <p className="truncate font-medium">
                        {question.questionText}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {question.createdBy
                          ? `${question.createdBy.firstName} ${question.createdBy.lastName}`
                          : "—"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div>{question.lesson}</div>
                      <div className="text-xs text-gray-500">
                        {question.chapter}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {difficultyLabels[question.difficulty]}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs dark:bg-white/10">
                        {statusLabels[question.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">{question.usageCount}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5">
                        <button
                          title="مشاهده"
                          onClick={() =>
                            navigate(`/question-designer/${question.id}`)
                          }
                          className="rounded-lg border border-slate-200/70 p-2 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                        >
                          <Eye size={16} />
                        </button>
                        {(question.status !== "published" || isAdmin) && (
                          <button
                            title="ویرایش سریع"
                            onClick={() => openQuickEdit(question)}
                            className="rounded-lg border border-slate-200/70 p-2 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                          >
                            <SlidersHorizontal size={16} />
                          </button>
                        )}
                        <button
                          title="کپی سؤال"
                          onClick={() => void handleDuplicate(question)}
                          className="rounded-lg border border-slate-200/70 p-2 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                        >
                          ⧉
                        </button>
                        {(question.status === "draft" ||
                          (isAdmin && question.status === "review")) && (
                          <button
                            title="ویرایش"
                            onClick={() =>
                              navigate(`/question-designer/${question.id}`)
                            }
                            className="rounded-lg border border-slate-200/70 p-2 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        {question.status === "draft" && !isAdmin && (
                          <button
                            title="ارسال برای بررسی"
                            onClick={() => void handleSubmitReview(question)}
                            className="rounded-lg border border-slate-200/70 p-2 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                          >
                            <Send size={16} />
                          </button>
                        )}
                        {isAdmin && question.status === "review" && (
                          <button
                            title="انتشار"
                            onClick={() =>
                              void handleStatus(question, "published")
                            }
                            className="rounded-lg border border-slate-200/70 p-2 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                          >
                            ✓
                          </button>
                        )}
                        {isAdmin && question.status === "published" && (
                          <button
                            title="آرشیو"
                            onClick={() =>
                              void handleStatus(question, "archived")
                            }
                            className="rounded-lg border border-slate-200/70 p-2 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5"
                          >
                            <Archive size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && questions.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-14 text-center text-gray-500"
                    >
                      سؤالی با این فیلترها پیدا نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200/70 px-5 py-4 text-sm dark:border-white/10">
              <span>
                صفحه {pagination.page} از {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => void load(pagination.page - 1)}
                  className="rounded-lg border border-slate-200/70 px-3 py-2 disabled:opacity-40 dark:border-white/10"
                >
                  قبلی
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => void load(pagination.page + 1)}
                  className="rounded-lg border border-slate-200/70 px-3 py-2 disabled:opacity-40 dark:border-white/10"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {quickEditQuestion && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => !quickEditSaving && setQuickEditQuestion(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-slate-200/70 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#111722]"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">ویرایش سریع سؤال</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {quickEditQuestion.code} · فقط اطلاعات مدیریتی سؤال تغییر
                  می‌کند.
                </p>
              </div>
              <button
                disabled={quickEditSaving}
                onClick={() => setQuickEditQuestion(null)}
                className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-white/10"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={quickEditForm.lesson}
                onChange={(e) =>
                  setQuickEditForm((f) => ({ ...f, lesson: e.target.value }))
                }
                placeholder="درس *"
                className="rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]"
              />
              <input
                value={quickEditForm.chapter}
                onChange={(e) =>
                  setQuickEditForm((f) => ({ ...f, chapter: e.target.value }))
                }
                placeholder="فصل *"
                className="rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]"
              />
              <select
                value={quickEditForm.grade}
                onChange={(e) =>
                  setQuickEditForm((f) => ({ ...f, grade: e.target.value }))
                }
                className="rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-[#111722]"
              >
                <option value="10">دهم</option>
                <option value="11">یازدهم</option>
                <option value="12">دوازدهم</option>
              </select>
              <select
                value={quickEditForm.major}
                onChange={(e) =>
                  setQuickEditForm((f) => ({ ...f, major: e.target.value }))
                }
                className="rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-[#111722]"
              >
                <option value="math">ریاضی</option>
                <option value="experimental">تجربی</option>
                <option value="humanities">انسانی</option>
              </select>
              <input
                value={quickEditForm.topic}
                onChange={(e) =>
                  setQuickEditForm((f) => ({ ...f, topic: e.target.value }))
                }
                placeholder="مبحث"
                className="rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]"
              />
              <select
                value={quickEditForm.difficulty}
                onChange={(e) =>
                  setQuickEditForm((f) => ({
                    ...f,
                    difficulty: e.target.value as QuestionDifficulty,
                  }))
                }
                className="rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-[#111722]"
              >
                {Object.entries(difficultyLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                value={quickEditForm.year}
                onChange={(e) =>
                  setQuickEditForm((f) => ({ ...f, year: e.target.value }))
                }
                placeholder="سال"
                inputMode="numeric"
                className="rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]"
              />
              <input
                value={quickEditForm.tags}
                onChange={(e) =>
                  setQuickEditForm((f) => ({ ...f, tags: e.target.value }))
                }
                placeholder="تگ‌ها، با کاما جدا کنید"
                className="rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                disabled={quickEditSaving}
                onClick={() => setQuickEditQuestion(null)}
                className="rounded-xl border border-slate-200/70 px-4 py-2.5 dark:border-white/10"
              >
                انصراف
              </button>
              <button
                disabled={quickEditSaving}
                onClick={() => void handleQuickEdit()}
                className="rounded-xl bg-[var(--griffin-gold)] px-5 py-2.5 font-semibold text-white disabled:opacity-50"
              >
                {quickEditSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default QuestionBank;
