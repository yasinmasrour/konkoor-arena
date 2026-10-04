import { useEffect, useState } from "react";
import {
  AlertCircle,
  Archive,
  CheckSquare,
  Eye,
  FileQuestion,
  Filter,
  Layers,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  Square,
  Swords,
  Trash2,
  Upload,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getQuestions,
  setQuestionStatus,
  submitQuestionForReview,
  duplicateQuestion,
  bulkSetQuestionStatus,
  exportQuestions,
  type Question,
  type QuestionDifficulty,
  type QuestionStatus,
} from "../../api/questionApi";
import MathText from "../../components/questions/MathText";
import QuickEditModal from "./components/QuickEditModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

// ==================== ثابت‌ها ====================
const statusLabels: Record<QuestionStatus, string> = {
  draft: "پیش‌نویس",
  review: "در حال بررسی",
  published: "منتشرشده",
  archived: "آرشیو",
};

const statusStyles: Record<
  QuestionStatus,
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

const difficultyLabels: Record<QuestionDifficulty, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
  tricky: "مفهومی/چالشی",
};

const difficultyStyles: Record<
  QuestionDifficulty,
  { bg: string; text: string }
> = {
  easy: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  hard: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
  },
  tricky: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
  },
};

type ArenaFilter = "all" | "arena" | "normal";

// 🆕 استایل مشترک برای select ها (رفع مشکل نمایش متن در دارک)
const selectClassName =
  "rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all";

// ==================== کامپوننت ====================
const QuestionBank = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ==================== State ====================
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
  const [isArenaFilter, setIsArenaFilter] = useState<ArenaFilter>("all");
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
        isArenaFilter: ArenaFilter;
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

  // 🆕 Modalها
  const [quickEditQuestion, setQuickEditQuestion] = useState<Question | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const isAdmin = user?.role?.name === "ADMIN";

  // ==================== توابع کمکی ====================
  const currentFilters = () => ({
    search,
    lesson,
    grade,
    major,
    chapter,
    difficulty,
    status,
    isArenaFilter,
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
    setIsArenaFilter(f.isArenaFilter || "all");
    setSort(f.sort);
    setOrder(f.order);
    window.setTimeout(() => void load(1), 0);
  };

  // ==================== Load ====================
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
        isArena:
          isArenaFilter === "arena"
            ? true
            : isArenaFilter === "normal"
              ? false
              : undefined,
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

  // 🆕 auto-hide پیام موفقیت
  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  // ==================== Actions ====================
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
      const params: Record<string, string | number | boolean | undefined> =
        selectedOnly
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

  // 🆕 باز کردن modal تأیید حذف
  const openDeleteConfirm = (question: Question) => {
    setError("");
    setSuccessMessage("");
    setDeleteTarget(question);
  };

  // ==================== JSX ====================
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ==================== HEADER ==================== */}
        <header className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                  <FileQuestion size={24} strokeWidth={2.3} />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-1.5">
                  <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Question Management
                  </span>
                </div>
                <h1 className="font-heading text-3xl font-black text-gray-900 dark:text-white">
                  بانک سؤال
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  سؤال‌ها رو جستجو، بررسی و مدیریت کن.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <div className="flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] overflow-hidden backdrop-blur-sm">
                <button
                  disabled={loading}
                  onClick={() => void handleExport("xlsx")}
                  className="px-3.5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)] disabled:opacity-50 transition-colors"
                >
                  Excel
                  {selectedIds.length > 0 && (
                    <span className="mr-1 text-[9px] text-[var(--griffin-gold)]">
                      ({selectedIds.length})
                    </span>
                  )}
                </button>
                <div className="w-px h-6 bg-gray-200 dark:bg-white/10" />
                <button
                  disabled={loading}
                  onClick={() => void handleExport("csv")}
                  className="px-3.5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)] disabled:opacity-50 transition-colors"
                >
                  CSV
                  {selectedIds.length > 0 && (
                    <span className="mr-1 text-[9px] text-[var(--griffin-gold)]">
                      ({selectedIds.length})
                    </span>
                  )}
                </button>
              </div>

              <button
                onClick={() => void load()}
                className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 backdrop-blur-sm hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)] transition-all"
              >
                <RefreshCw
                  size={16}
                  className="transition-transform group-hover:rotate-180 duration-500"
                />
                بروزرسانی
              </button>

              <button
                onClick={() => navigate("/question-analytics")}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 backdrop-blur-sm hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)] transition-all"
              >
                <Layers size={16} />
                آمار بانک
              </button>

              <button
                onClick={() => navigate("/question-import")}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 backdrop-blur-sm hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)] transition-all"
              >
                <Upload size={16} />
                ورود گروهی
              </button>

              <button
                onClick={() => navigate("/question-designer")}
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus size={17} strokeWidth={2.5} />
                  سؤال جدید
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </div>
        </header>

        {/* ==================== FILTERS ==================== */}
        <section className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

          <div className="relative p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center">
                  <Filter size={14} className="text-[var(--griffin-gold)]" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                    Filter
                  </p>
                  <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                    فیلتر و جستجو
                  </h3>
                </div>
              </div>

              {pagination.total > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 text-[10px] font-black text-[var(--griffin-gold)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)] animate-pulse" />
                  {pagination.total.toLocaleString("fa-IR")} سؤال
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
              <label className="relative lg:col-span-2">
                <Search
                  size={17}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو در کد، متن یا مبحث..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-3 pr-10 pl-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                />
              </label>

              <input
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                placeholder="درس"
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
              />

              {/* 🆕 select سختی با استایل دارک اصلاح‌شده */}
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className={selectClassName}
              >
                <option value="">همه سختی‌ها</option>
                {Object.entries(difficultyLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              {/* 🆕 select وضعیت با استایل دارک اصلاح‌شده */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={selectClassName}
              >
                <option value="">همه وضعیت‌ها</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                value={isArenaFilter}
                onChange={(e) =>
                  setIsArenaFilter(e.target.value as ArenaFilter)
                }
                className="rounded-xl border border-purple-500/30 bg-purple-500/5 px-3 py-3 text-sm font-bold text-purple-600 dark:text-purple-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all dark:bg-[#0a0d14]"
              >
                <option value="all">همه سؤال‌ها</option>
                <option value="arena">🔴 فقط آرنا</option>
                <option value="normal">⚪ غیرآرنا</option>
              </select>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setShowAdvancedFilters((value) => !value)}
                className={`
                  group inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all
                  ${
                    showAdvancedFilters
                      ? "border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]"
                      : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] text-gray-600 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                  }
                `}
              >
                <SlidersHorizontal
                  size={15}
                  className={showAdvancedFilters ? "rotate-90" : ""}
                />
                {showAdvancedFilters ? "بستن پیشرفته" : "فیلتر پیشرفته"}
              </button>

              <button
                onClick={() => void load(1)}
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/50 hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Wand2 size={14} />
                  اعمال فیلتر
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>

            {showAdvancedFilters && (
              <div className="mt-4 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/70 dark:bg-white/[0.02] p-4">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <input
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="پایه (۱۲)"
                    className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                  />
                  <input
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="رشته (math)"
                    className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                  />
                  <input
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="فصل"
                    className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                  />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0d14] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                  >
                    <option value="updatedAt">آخرین ویرایش</option>
                    <option value="createdAt">تاریخ ایجاد</option>
                    <option value="code">کد</option>
                    <option value="lesson">درس</option>
                    <option value="chapter">فصل</option>
                    <option value="difficulty">سختی</option>
                    <option value="status">وضعیت</option>
                    <option value="usageCount">استفاده</option>
                  </select>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="desc">نزولی</option>
                    <option value="asc">صعودی</option>
                  </select>
                  <input
                    value={savedFilterName}
                    onChange={(e) => setSavedFilterName(e.target.value)}
                    placeholder="نام فیلتر..."
                    className="min-w-52 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                  />
                  <button
                    onClick={saveCurrentFilter}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3.5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] transition-all"
                  >
                    <Save size={14} /> ذخیره فیلتر
                  </button>
                </div>

                {savedFilters.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200/70 dark:border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                      فیلترهای ذخیره‌شده
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {savedFilters.map((saved) => (
                        <div
                          key={saved.name}
                          className="inline-flex items-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden"
                        >
                          <button
                            onClick={() => applySavedFilter(saved)}
                            className="px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)] transition-colors"
                          >
                            {saved.name}
                          </button>
                          <div className="w-px h-4 bg-gray-200 dark:bg-white/10" />
                          <button
                            title="حذف"
                            onClick={() =>
                              persistSavedFilters(
                                savedFilters.filter(
                                  (item) => item.name !== saved.name,
                                ),
                              )
                            }
                            className="px-2.5 py-2 text-gray-400 hover:text-rose-500 hover:bg-rose-500/5 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ==================== BULK ACTIONS ==================== */}
        {selectedIds.length > 0 && (
          <section className="relative rounded-2xl overflow-hidden border border-[var(--griffin-gold)]/40 bg-gradient-to-l from-[var(--griffin-gold)]/10 via-amber-500/5 to-transparent backdrop-blur-sm animate-[fadeInUp_0.3s_ease-out]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                    <CheckSquare size={18} strokeWidth={2.5} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    انتخاب گروهی
                  </p>
                  <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                    {selectedIds.length.toLocaleString("fa-IR")} سؤال انتخاب شده
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <>
                    <button
                      disabled={bulkLoading}
                      onClick={() => void handleBulkStatus("published")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-all"
                    >
                      ✓ انتشار
                    </button>
                    <button
                      disabled={bulkLoading}
                      onClick={() => void handleBulkStatus("archived")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 disabled:opacity-50 transition-all"
                    >
                      <Archive size={13} /> آرشیو
                    </button>
                    <button
                      disabled={bulkLoading}
                      onClick={() => void handleBulkStatus("draft")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 disabled:opacity-50 transition-all"
                    >
                      <RotateCcw size={13} /> پیش‌نویس
                    </button>
                  </>
                )}
                <button
                  disabled={bulkLoading}
                  onClick={() => setSelectedIds([])}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 disabled:opacity-50 transition-all"
                >
                  <X size={13} /> لغو
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ==================== SUCCESS ==================== */}
        {successMessage && (
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-gradient-to-l from-emerald-500/10 to-transparent backdrop-blur-sm p-4 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <CheckSquare
                  size={16}
                  className="text-emerald-500"
                  strokeWidth={2.5}
                />
              </div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* ==================== ERROR ==================== */}
        {error && (
          <div className="relative rounded-2xl overflow-hidden border border-rose-500/30 bg-gradient-to-l from-rose-500/10 to-transparent backdrop-blur-sm p-4 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                <AlertCircle
                  size={16}
                  className="text-rose-500"
                  strokeWidth={2.5}
                />
              </div>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ==================== TABLE ==================== */}
        <section className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

          <div className="relative flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200/70 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                <FileQuestion size={16} />
              </div>
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                    Live
                  </span>
                </div>
                <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                  {pagination.total.toLocaleString("fa-IR")} سؤال
                </p>
              </div>
            </div>

            {loading && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 text-[10px] font-black text-[var(--griffin-gold)]">
                <RefreshCw size={11} className="animate-spin" />
                در حال دریافت...
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-right text-sm">
              <thead className="bg-gray-50/70 dark:bg-white/[0.02]">
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  <th className="w-12 px-4 py-3.5">
                    <button
                      title="انتخاب همه"
                      onClick={toggleAll}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--griffin-gold)]/10 hover:text-[var(--griffin-gold)] transition-colors"
                    >
                      {selectedIds.length === questions.length &&
                      questions.length > 0 ? (
                        <CheckSquare size={15} />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">کد</th>
                  <th className="px-4 py-3.5">سؤال</th>
                  <th className="px-4 py-3.5">درس / فصل</th>
                  <th className="px-4 py-3.5">سختی</th>
                  <th className="px-4 py-3.5">وضعیت</th>
                  <th className="px-4 py-3.5">آرنا</th>
                  <th className="px-4 py-3.5">استفاده</th>
                  <th className="px-4 py-3.5">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {questions.map((question) => {
                  const isSelected = selectedIds.includes(question.id);
                  const statusStyle = statusStyles[question.status];
                  const diffStyle = difficultyStyles[question.difficulty];

                  return (
                    <tr
                      key={question.id}
                      className={`
                        group transition-colors
                        ${
                          isSelected
                            ? "bg-[var(--griffin-gold)]/[0.06] border-r-2 border-r-[var(--griffin-gold)]"
                            : "hover:bg-gray-50/70 dark:hover:bg-white/[0.02]"
                        }
                      `}
                    >
                      <td className="px-4 py-4">
                        <button
                          title="انتخاب سؤال"
                          onClick={() => toggleSelected(question.id)}
                          className={`
                            w-7 h-7 rounded-lg flex items-center justify-center transition-colors
                            ${
                              isSelected
                                ? "text-[var(--griffin-gold)] bg-[var(--griffin-gold)]/10"
                                : "hover:bg-[var(--griffin-gold)]/10 hover:text-[var(--griffin-gold)]"
                            }
                          `}
                        >
                          {isSelected ? (
                            <CheckSquare size={15} strokeWidth={2.5} />
                          ) : (
                            <Square size={15} />
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 font-english text-[10px] font-black text-gray-600 dark:text-gray-300">
                          {question.code}
                        </span>
                      </td>

                      {/* 🆕 متن سؤال با MathText */}
                      <td className="max-w-[320px] px-4 py-4">
                        <div className="line-clamp-2 text-sm font-bold text-gray-900 dark:text-white">
                          <MathText content={question.questionText} />
                        </div>
                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                          {question.createdBy
                            ? `${question.createdBy.firstName} ${question.createdBy.lastName}`
                            : "—"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {question.lesson}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          {question.chapter}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black ${diffStyle.bg} ${diffStyle.text}`}
                        >
                          {difficultyLabels[question.difficulty]}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} ${
                              question.status === "published"
                                ? "animate-pulse"
                                : ""
                            }`}
                          />
                          {statusLabels[question.status]}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {question.isArena ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-black">
                            <Swords size={9} />
                            بله
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-[11px] font-black text-gray-600 dark:text-gray-300 tabular-nums">
                          {question.usageCount.toLocaleString("fa-IR")}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-1">
                          {[
                            {
                              title: "مشاهده",
                              icon: Eye,
                              onClick: () =>
                                navigate(`/question-designer/${question.id}`),
                              show: true,
                            },
                            {
                              title: "ویرایش سریع",
                              icon: SlidersHorizontal,
                              onClick: () => setQuickEditQuestion(question),
                              show: question.status !== "published" || isAdmin,
                            },
                            {
                              title: "کپی",
                              icon: Sparkles,
                              onClick: () => void handleDuplicate(question),
                              show: true,
                            },
                            {
                              title: "ویرایش",
                              icon: Pencil,
                              onClick: () =>
                                navigate(`/question-designer/${question.id}`),
                              show:
                                question.status === "draft" ||
                                (isAdmin && question.status === "review"),
                            },
                            {
                              title: "ارسال برای بررسی",
                              icon: Send,
                              onClick: () => void handleSubmitReview(question),
                              show: question.status === "draft" && !isAdmin,
                            },
                            {
                              title: "انتشار",
                              icon: Zap,
                              onClick: () =>
                                void handleStatus(question, "published"),
                              show: isAdmin && question.status === "review",
                            },
                            {
                              title: "آرشیو",
                              icon: Archive,
                              onClick: () =>
                                void handleStatus(question, "archived"),
                              show: isAdmin && question.status === "published",
                            },
                            {
                              title:
                                question.usageCount > 0
                                  ? "این سؤال در آزمون‌ها استفاده شده؛ به‌جای حذف، آن را آرشیو کنید"
                                  : "حذف",
                              icon: Trash2,
                              onClick: () => openDeleteConfirm(question),
                              show: isAdmin,
                              disabled: question.usageCount > 0,
                              danger: true,
                            },
                          ]
                            .filter((action) => action.show)
                            .map((action, i) => {
                              const Icon = action.icon;
                              const isDisabled =
                                "disabled" in action &&
                                action.disabled === true;
                              const isDanger =
                                "danger" in action && action.danger === true;

                              return (
                                <button
                                  key={i}
                                  title={action.title}
                                  onClick={action.onClick}
                                  disabled={isDisabled}
                                  className={`
                                    w-8 h-8 rounded-lg
                                    flex items-center justify-center
                                    border bg-white dark:bg-white/[0.03]
                                    transition-all duration-200
                                    ${
                                      isDisabled
                                        ? "border-gray-200 dark:border-white/10 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50"
                                        : isDanger
                                          ? "border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-rose-500/40 hover:bg-rose-500/5 hover:text-rose-500 hover:-translate-y-0.5"
                                          : "border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)] hover:-translate-y-0.5"
                                    }
                                  `}
                                >
                                  <Icon size={14} />
                                </button>
                              );
                            })}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && questions.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                          <Search
                            size={28}
                            className="text-gray-400 dark:text-gray-500"
                          />
                        </div>
                        <p className="font-heading font-black text-gray-700 dark:text-gray-300">
                          سؤالی با این فیلترها پیدا نشد
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          فیلترها رو تغییر بده یا سؤال جدید بساز
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-gray-200/70 dark:border-white/5 px-5 py-4">
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                صفحه{" "}
                <span className="font-heading font-black text-gray-900 dark:text-white">
                  {pagination.page.toLocaleString("fa-IR")}
                </span>{" "}
                از{" "}
                <span className="font-heading font-black text-gray-900 dark:text-white">
                  {pagination.totalPages.toLocaleString("fa-IR")}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => void load(pagination.page - 1)}
                  className="
                    group inline-flex items-center gap-1.5
                    rounded-xl border border-gray-200 dark:border-white/10
                    bg-white/60 dark:bg-white/[0.03]
                    px-4 py-2 text-xs font-bold
                    text-gray-600 dark:text-gray-300
                    hover:border-[var(--griffin-gold)]/40
                    hover:text-[var(--griffin-gold)]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all
                  "
                >
                  قبلی
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => void load(pagination.page + 1)}
                  className="
                    group relative inline-flex items-center gap-1.5
                    rounded-xl
                    bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                    px-4 py-2 text-xs font-black text-white
                    shadow-lg shadow-[var(--griffin-gold)]/30
                    hover:shadow-xl hover:shadow-[var(--griffin-gold)]/50
                    disabled:opacity-40 disabled:cursor-not-allowed
                    overflow-hidden
                  "
                >
                  <span className="relative z-10">بعدی</span>
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 🆕 MODALها */}
      <QuickEditModal
        question={quickEditQuestion}
        onClose={() => setQuickEditQuestion(null)}
        onSaved={(updated) => {
          setQuestions((current) =>
            current.map((item) => (item.id === updated.id ? updated : item)),
          );
          setSuccessMessage("ویرایش سریع با موفقیت ذخیره شد.");
        }}
        onError={setError}
      />

      <DeleteConfirmModal
        question={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={(msg) => {
          setSuccessMessage(msg);
          void load();
        }}
        onError={setError}
      />
    </main>
  );
};

export default QuestionBank;
