import { useEffect, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileQuestion,
  Layers,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Shield,
  Sparkles,
  Swords,
  Target,
  User,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getQuestionReview,
  getReviewQueue,
  reviewQuestion,
  type ReviewDecision,
  type ReviewQuestion,
} from "../../api/questionReviewApi";
import type { Question } from "../../api/questionApi";
import { useAuth } from "../../context/AuthContext";
import MathText from "../../components/questions/MathText";

// ==================== ثابت‌ها ====================
const difficultyLabels: Record<string, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
  tricky: "مفهومی/چالشی",
};

const difficultyStyles: Record<string, { bg: string; text: string }> = {
  easy: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-500" },
  hard: { bg: "bg-rose-500/10", text: "text-rose-500" },
  tricky: { bg: "bg-purple-500/10", text: "text-purple-500" },
};

const decisionLabels: Record<string, string> = {
  approved: "تأیید و انتشار",
  changes_requested: "نیازمند اصلاح",
  archived: "آرشیو",
};

const decisionStyles: Record<
  string,
  { bg: string; text: string; icon: typeof Check }
> = {
  approved: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  changes_requested: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    icon: MessageSquare,
  },
  archived: {
    bg: "bg-slate-500/10",
    text: "text-slate-500 dark:text-slate-400",
    icon: Archive,
  },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

// ==================== کامپوننت ====================
const QuestionReview = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ReviewQuestion | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [note, setNote] = useState("");

  // ==================== Load ====================
  const load = async (page = pagination.page) => {
    setLoading(true);
    setError("");
    try {
      const result = await getReviewQueue({
        page,
        limit: pagination.limit,
        search: search || undefined,
      });
      setQuestions(result.questions);
      setPagination(result.pagination);
    } catch {
      setError("دریافت صف بررسی سؤال‌ها انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(1);
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== Actions ====================
  const openQuestion = async (question: Question) => {
    setDetailLoading(true);
    setError("");
    try {
      setSelected(await getQuestionReview(question.id));
      setNote("");
    } catch {
      setError("دریافت جزئیات سؤال انجام نشد.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDecision = async (decision: ReviewDecision) => {
    if (!selected || decisionLoading) return;
    if (decision === "changes_requested" && !note.trim()) {
      setError("برای درخواست اصلاح، ثبت یادداشت بررسی الزامی است.");
      return;
    }

    setDecisionLoading(true);
    setError("");
    try {
      await reviewQuestion(selected.id, decision, note.trim() || undefined);
      setSelected(null);
      setNote("");
      await load(pagination.page);
    } catch {
      setError(
        "تصمیم بررسی ثبت نشد. ممکن است سؤال قبلاً توسط بررسی‌کننده دیگری تعیین تکلیف شده باشد.",
      );
    } finally {
      setDecisionLoading(false);
    }
  };

  // ==================== Access Control ====================
  if (user?.role?.name !== "ADMIN") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-2xl">
              <Shield size={28} className="text-white" />
            </div>
          </div>
          <h1 className="font-heading text-2xl font-black text-gray-900 dark:text-white">
            دسترسی مجاز نیست
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            این بخش فقط برای مدیر سیستم در دسترس است.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl transition-all"
          >
            <ArrowRight size={16} className="rotate-180" />
            بازگشت به خانه
          </button>
        </div>
      </main>
    );
  }

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
                  <CheckCircle2 size={24} strokeWidth={2.3} />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 mb-1.5">
                  <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Question Review
                  </span>
                </div>
                <h1 className="font-heading text-3xl font-black text-gray-900 dark:text-white">
                  صف بررسی سؤال‌ها
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  سؤال‌های ارسال‌شده توسط طراحان رو بررسی و تعیین تکلیف کن.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                onClick={() => navigate("/question-bank")}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 backdrop-blur-sm hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)] transition-all"
              >
                <FileQuestion size={16} />
                بانک سؤال
              </button>

              <button
                onClick={() => void load(pagination.page)}
                disabled={loading}
                className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 backdrop-blur-sm hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 hover:text-[var(--griffin-gold)] disabled:opacity-50 transition-all"
              >
                <RefreshCw
                  size={16}
                  className="transition-transform group-hover:rotate-180 duration-500"
                />
                بروزرسانی
              </button>
            </div>
          </div>
        </header>

        {/* ==================== ERROR ==================== */}
        {error && (
          <div className="relative rounded-2xl overflow-hidden border border-rose-500/30 bg-gradient-to-l from-rose-500/10 to-transparent backdrop-blur-sm p-4 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                <AlertCircle size={16} className="text-rose-500" />
              </div>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ==================== SEARCH ==================== */}
        <section className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

          <div className="relative p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void load(1);
                  }}
                  placeholder="جستجو در کد، متن سؤال یا موضوع..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-3 pr-10 pl-4 text-sm outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                />
              </div>

              <button
                onClick={() => void load(1)}
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3 font-black text-white text-sm shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Wand2 size={16} />
                  جستجو
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </div>
        </section>

        {/* ==================== TABLE ==================== */}
        <section className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

          {/* هدر جدول */}
          <div className="relative flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200/70 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                <Layers size={16} />
              </div>
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                    Pending Review
                  </span>
                </div>
                <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                  {pagination.total.toLocaleString("fa-IR")} سؤال در انتظار
                </p>
              </div>
            </div>

            {loading && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 text-[10px] font-black text-[var(--griffin-gold)]">
                <LoaderCircle size={11} className="animate-spin" />
                در حال دریافت...
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <LoaderCircle
                  size={32}
                  className="text-[var(--griffin-gold)] animate-spin"
                />
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                  در حال دریافت صف بررسی...
                </p>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-emerald-500" />
                </div>
                <p className="font-heading font-black text-gray-700 dark:text-gray-300">
                  صف بررسی خالیه!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  همه سؤال‌ها بررسی شدن. آفرین!
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-right text-sm">
                <thead className="bg-gray-50/70 dark:bg-white/[0.02]">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    <th className="px-4 py-3.5">کد</th>
                    <th className="px-4 py-3.5">درس / فصل</th>
                    <th className="px-4 py-3.5">پایه / رشته</th>
                    <th className="px-4 py-3.5">سختی</th>
                    <th className="px-4 py-3.5">آرنا</th>
                    <th className="px-4 py-3.5">طراح</th>
                    <th className="px-4 py-3.5">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {questions.map((question) => {
                    const diffStyle =
                      difficultyStyles[question.difficulty] ??
                      difficultyStyles.medium;

                    return (
                      <tr
                        key={question.id}
                        className="group hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 font-english text-[10px] font-black text-gray-600 dark:text-gray-300">
                            {question.code}
                          </span>
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
                          <p className="font-bold text-gray-900 dark:text-white">
                            {question.grade}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {question.major}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black ${diffStyle.bg} ${diffStyle.text}`}
                          >
                            {difficultyLabels[question.difficulty] ??
                              question.difficulty}
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
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-[10px] font-black">
                              {question.createdBy?.firstName?.charAt(0) || "?"}
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {question.createdBy
                                ? `${question.createdBy.firstName} ${question.createdBy.lastName}`
                                : "—"}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => void openQuestion(question)}
                            disabled={detailLoading}
                            className="
                              group/btn inline-flex items-center gap-2
                              rounded-xl
                              bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                              px-3.5 py-2 text-xs font-black text-white
                              shadow-lg shadow-[var(--griffin-gold)]/30
                              hover:shadow-xl hover:shadow-[var(--griffin-gold)]/50
                              hover:-translate-y-0.5
                              disabled:opacity-50
                              transition-all
                              overflow-hidden
                            "
                          >
                            <span className="relative z-10 flex items-center gap-1.5">
                              <Eye size={14} />
                              بررسی
                            </span>
                            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => void load(pagination.page - 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] text-gray-600 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages || loading}
                  onClick={() => void load(pagination.page + 1)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ==================== DETAIL MODAL ==================== */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && !decisionLoading)
              setSelected(null);
          }}
        >
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-2xl shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

            {/* هدر */}
            <div className="relative flex items-start justify-between gap-3 p-5 border-b border-gray-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                    <Eye size={20} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Review Question
                  </p>
                  <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                    بررسی سؤال
                  </h2>
                  <p className="font-english text-[11px] text-gray-500 dark:text-gray-400">
                    {selected.code}
                  </p>
                </div>
              </div>
              <button
                disabled={decisionLoading}
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-rose-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* محتوای اسکرول‌شونده */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* اطلاعات پایه */}
              <div className="grid gap-3 sm:grid-cols-5">
                {[
                  { label: "درس", value: selected.lesson, icon: BookOpen },
                  { label: "فصل", value: selected.chapter, icon: Layers },
                  { label: "پایه", value: selected.grade, icon: Award },
                  { label: "رشته", value: selected.major, icon: Target },
                  {
                    label: "آرنا",
                    value: selected.isArena ? "مناسب آرنا" : "عادی",
                    icon: Swords,
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-3.5"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon
                          size={11}
                          className="text-[var(--griffin-gold)]"
                        />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                          {item.label}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* متن سؤال */}
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                    <FileQuestion size={14} />
                  </div>
                  <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white">
                    متن سؤال
                  </h3>
                </div>
                <div className="leading-8 text-gray-900 dark:text-white">
                  <MathText content={selected.questionText} />
                </div>
              </div>

              {/* تصویر */}
              {selected.questionImage && (
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-3 overflow-hidden">
                  <img
                    src={selected.questionImage}
                    alt="تصویر سؤال"
                    className="max-h-80 w-full rounded-xl object-contain"
                  />
                </div>
              )}

              {/* گزینه‌ها */}
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                    <Target size={14} />
                  </div>
                  <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white">
                    گزینه‌ها
                  </h3>
                </div>

                <div className="space-y-3">
                  {selected.options.map((option, index) => {
                    const isCorrect = index === selected.correctAnswer;
                    return (
                      <div
                        key={`${selected.id}-option-${index}`}
                        className={`
                          rounded-2xl border p-4 transition-all
                          ${
                            isCorrect
                              ? "border-emerald-500/40 bg-gradient-to-l from-emerald-500/10 via-emerald-500/5 to-transparent"
                              : "border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]"
                          }
                        `}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`
                              w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0
                              ${
                                isCorrect
                                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
                              }
                            `}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="min-w-0 flex-1 leading-8 text-gray-900 dark:text-white">
                            <MathText content={option} />
                          </div>
                          {isCorrect && (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500 text-white text-[9px] font-black shadow-lg">
                              <Check size={9} strokeWidth={3} />
                              صحیح
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* توضیحات */}
              {selected.explanation && (
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                      <Sparkles size={14} />
                    </div>
                    <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white">
                      پاسخ تشریحی
                    </h3>
                  </div>
                  <div className="leading-8 text-gray-700 dark:text-gray-300">
                    <MathText content={selected.explanation} />
                  </div>
                </div>
              )}

              {/* اطلاعات تکمیلی */}
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "سطح دشواری",
                    value:
                      difficultyLabels[selected.difficulty] ??
                      selected.difficulty,
                    icon: Zap,
                  },
                  {
                    label: "طراح",
                    value: selected.createdBy
                      ? `${selected.createdBy.firstName} ${selected.createdBy.lastName}`
                      : "—",
                    icon: User,
                  },
                  {
                    label: "آخرین ویرایش",
                    value: formatDate(selected.updatedAt),
                    icon: Clock3,
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-3.5"
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon
                          size={11}
                          className="text-[var(--griffin-gold)]"
                        />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                          {item.label}
                        </p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-xs">
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* سوابق بررسی */}
              {selected.reviews.length > 0 && (
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                      <MessageSquare size={14} />
                    </div>
                    <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white">
                      سوابق بررسی
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {selected.reviews.map((review) => {
                      const decStyle =
                        decisionStyles[review.decision] ??
                        decisionStyles.changes_requested;
                      const DecIcon = decStyle.icon;
                      return (
                        <div
                          key={review.id}
                          className={`
                            rounded-2xl border p-4
                            ${decStyle.bg.replace("bg-", "border-")}
                            ${decStyle.bg}
                          `}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${decStyle.bg} ${decStyle.text}`}
                            >
                              <DecIcon size={11} />
                              {decisionLabels[review.decision] ??
                                review.decision}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          {review.reviewer && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                              بررسی‌کننده: {review.reviewer.firstName}{" "}
                              {review.reviewer.lastName}
                            </p>
                          )}
                          {review.note && (
                            <p className="text-xs leading-6 text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-white/5 rounded-lg p-3">
                              {review.note}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* تصمیم‌گیری */}
              <div className="relative rounded-3xl border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 backdrop-blur-sm p-5 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60 animate-pulse" />
                    <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                      Decision
                    </p>
                    <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                      تصمیم بررسی
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      در صورت درخواست اصلاح، یادداشت را برای طراح ثبت کن.
                    </p>
                  </div>
                </div>

                <label className="block mb-4">
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    disabled={decisionLoading}
                    placeholder="یادداشت بررسی (برای درخواست اصلاح الزامی است)"
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-4 text-sm outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all disabled:opacity-50"
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  <button
                    disabled={decisionLoading}
                    onClick={() => void handleDecision("approved")}
                    className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-5 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/60 hover:-translate-y-0.5 disabled:opacity-50 transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {decisionLoading ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      تأیید و انتشار
                    </span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>

                  <button
                    disabled={decisionLoading}
                    onClick={() => void handleDecision("changes_requested")}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 text-sm font-black text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 transition-all"
                  >
                    <Send size={16} />
                    درخواست اصلاح
                  </button>

                  <button
                    disabled={decisionLoading}
                    onClick={() => void handleDecision("archived")}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-5 py-3 text-sm font-black text-gray-600 dark:text-gray-300 hover:border-rose-400/40 hover:text-rose-500 hover:bg-rose-500/5 disabled:opacity-50 transition-all"
                  >
                    <Archive size={16} />
                    آرشیو
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default QuestionReview;
