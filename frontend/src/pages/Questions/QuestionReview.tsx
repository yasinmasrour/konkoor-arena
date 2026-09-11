import { useEffect, useState } from "react";
import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileQuestion,
  RefreshCw,
  Search,
  Send,
  XCircle,
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

const difficultyLabels: Record<string, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
  tricky: "مفهومی/چالشی",
};
const decisionLabels: Record<string, string> = {
  approved: "تأیید و انتشار",
  changes_requested: "نیازمند اصلاح",
  archived: "آرشیو",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const QuestionReview = () => {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ReviewQuestion | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [note, setNote] = useState("");

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

  if (user?.role?.name !== "ADMIN") {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-[#080B12]">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8 text-center dark:border-red-900/40 dark:bg-[#111722]">
          <h1 className="text-2xl font-bold">دسترسی مجاز نیست</h1>
          <p className="mt-2 text-sm text-gray-500">
            این بخش فقط برای مدیر سیستم در دسترس است.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-[#080B12] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Griffin Academy · Question Review
            </p>
            <h1 className="mt-1 text-3xl font-bold">صف بررسی سؤال‌ها</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              سؤال‌های ارسال‌شده توسط طراحان را بررسی و تعیین تکلیف کنید.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/question-bank")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-[#111722]"
            >
              <FileQuestion size={17} /> بانک سؤال
            </button>
            <button
              onClick={() => void load(pagination.page)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 text-sm dark:border-white/10 dark:bg-[#111722] disabled:opacity-50"
            >
              <RefreshCw size={17} /> بروزرسانی
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#111722]">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void load(1);
                }}
                placeholder="جستجو در کد، متن سؤال یا موضوع..."
                className="w-full rounded-xl border border-slate-200 bg-gray-50 py-3 pr-10 pl-4 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/5"
              />
            </div>
            <button
              onClick={() => void load(1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-5 py-3 font-semibold text-white"
            >
              <Search size={17} /> جستجو
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#111722]">
          <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
            <div>
              <h2 className="font-semibold">سؤال‌های در انتظار بررسی</h2>
              <p className="mt-1 text-xs text-gray-500">
                {pagination.total.toLocaleString("fa-IR")} سؤال
              </p>
            </div>
          </div>
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500">
              در حال دریافت صف بررسی...
            </div>
          ) : questions.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              در حال حاضر سؤالی در صف بررسی نیست.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-right text-sm">
                <thead className="bg-gray-50 text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                  <tr>
                    <th className="px-5 py-3">کد</th>
                    <th className="px-5 py-3">درس / فصل</th>
                    <th className="px-5 py-3">پایه / رشته</th>
                    <th className="px-5 py-3">سختی</th>
                    <th className="px-5 py-3">طراح</th>
                    <th className="px-5 py-3">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
                  {questions.map((question) => (
                    <tr
                      key={question.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4 font-mono text-xs">
                        {question.code}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium">{question.lesson}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {question.chapter}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>{question.grade}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {question.major}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {difficultyLabels[question.difficulty] ??
                          question.difficulty}
                      </td>
                      <td className="px-5 py-4">
                        {question.createdBy
                          ? `${question.createdBy.firstName} ${question.createdBy.lastName}`
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => void openQuestion(question)}
                          disabled={detailLoading}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"
                        >
                          <Eye size={15} /> بررسی
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-200/70 px-5 py-4 dark:border-white/10">
            <span className="text-xs text-gray-500">
              صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
              {pagination.totalPages.toLocaleString("fa-IR")}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => void load(pagination.page - 1)}
                className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-white/10"
              >
                <ChevronRight size={17} />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => void load(pagination.page + 1)}
                className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-white/10"
              >
                <ChevronLeft size={17} />
              </button>
            </div>
          </div>
        </section>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && !decisionLoading)
              setSelected(null);
          }}
        >
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200/70 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111722]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/70 bg-white/95 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-[#111722]/95">
              <div>
                <p className="text-xs text-gray-500">کد سؤال</p>
                <h2 className="font-mono text-lg font-bold">{selected.code}</h2>
              </div>
              <button
                disabled={decisionLoading}
                onClick={() => setSelected(null)}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <XCircle size={22} />
              </button>
            </div>
            <div className="space-y-6 p-6">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  ["درس", selected.lesson],
                  ["فصل", selected.chapter],
                  ["پایه", selected.grade],
                  ["رشته", selected.major],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-gray-50 p-3 dark:bg-white/5"
                  >
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="mt-1 text-sm font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="mb-3 font-semibold">متن سؤال</h3>
                <div className="rounded-2xl border border-slate-200/70 p-5 leading-8 dark:border-white/10">
                  {selected.questionText}
                </div>
              </div>
              {selected.questionImage && (
                <img
                  src={selected.questionImage}
                  alt="تصویر سؤال"
                  className="max-h-80 rounded-2xl object-contain"
                />
              )}
              <div>
                <h3 className="mb-3 font-semibold">گزینه‌ها</h3>
                <div className="grid gap-3">
                  {selected.options.map((option, index) => (
                    <div
                      key={`${selected.id}-option-${index}`}
                      className={`rounded-xl border p-4 ${index === selected.correctAnswer ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)]/10" : "border-slate-200/70 dark:border-white/10"}`}
                    >
                      <span className="ml-2 font-semibold">{index + 1}.</span>
                      {option}
                      {index === selected.correctAnswer && (
                        <span className="mr-2 text-xs font-semibold text-[var(--griffin-gold)]">
                          پاسخ صحیح
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {selected.explanation && (
                <div>
                  <h3 className="mb-3 font-semibold">توضیح</h3>
                  <div className="rounded-2xl bg-gray-50 p-5 leading-8 dark:bg-white/5">
                    {selected.explanation}
                  </div>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500">سطح دشواری</p>
                  <p className="mt-1 text-sm font-semibold">
                    {difficultyLabels[selected.difficulty] ??
                      selected.difficulty}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">طراح</p>
                  <p className="mt-1 text-sm font-semibold">
                    {selected.createdBy
                      ? `${selected.createdBy.firstName} ${selected.createdBy.lastName}`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">آخرین ویرایش</p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatDate(selected.updatedAt)}
                  </p>
                </div>
              </div>
              {selected.reviews.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold">سوابق بررسی</h3>
                  <div className="space-y-3">
                    {selected.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-xl border border-slate-200/70 p-4 dark:border-white/10"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold">
                            {decisionLabels[review.decision] ?? review.decision}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        {review.reviewer && (
                          <p className="mt-1 text-xs text-gray-500">
                            بررسی‌کننده: {review.reviewer.firstName}{" "}
                            {review.reviewer.lastName}
                          </p>
                        )}
                        {review.note && (
                          <p className="mt-3 text-sm leading-6">
                            {review.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-2xl border border-slate-200/70 p-5 dark:border-white/10">
                <h3 className="font-semibold">تصمیم بررسی</h3>
                <p className="mt-1 text-xs text-gray-500">
                  در صورت درخواست اصلاح، یادداشت بررسی را برای طراح ثبت کنید.
                </p>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  disabled={decisionLoading}
                  placeholder="یادداشت بررسی (برای درخواست اصلاح الزامی است)"
                  rows={4}
                  className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-gray-50 p-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/5"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    disabled={decisionLoading}
                    onClick={() => void handleDecision("approved")}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <CheckCircle2 size={17} /> تأیید و انتشار
                  </button>
                  <button
                    disabled={decisionLoading}
                    onClick={() => void handleDecision("changes_requested")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold disabled:opacity-50 dark:border-white/10"
                  >
                    <Send size={17} /> درخواست اصلاح
                  </button>
                  <button
                    disabled={decisionLoading}
                    onClick={() => void handleDecision("archived")}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold disabled:opacity-50 dark:border-white/10"
                  >
                    <Archive size={17} /> آرشیو
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
