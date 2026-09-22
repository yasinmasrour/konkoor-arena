import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  LoaderCircle,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import {
  createPersonalExam,
  deletePersonalExam,
  getPersonalExam,
} from "../../api/studyPlanApi";

// ==================== Types ====================
interface QuestionItem {
  id: string;
  code: string;
  questionText: string;
  lesson: string;
  chapter: string;
  difficulty: string;
  status: string;
}

interface SelectedQuestion {
  id: string;
  code: string;
  questionText: string;
  lesson: string;
  chapter: string;
  difficulty: string;
}

const difficultyLabels: Record<string, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
  tricky: "مفهومی",
};

// ==================== Component ====================
const PersonalExamBuilder = () => {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();

  const [examTitle, setExamTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState<number>(15);

  const [selectedQuestions, setSelectedQuestions] = useState<
    SelectedQuestion[]
  >([]);

  // 🔹 لیست سوالات بانک
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [search, setSearch] = useState("");
  const [lessonFilter, setLessonFilter] = useState("");
  const [chapterFilter, setChapterFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // 🔹 آزمون موجود
  const [existingExam, setExistingExam] = useState<{
    id: string;
    title: string;
    timeLimit: number;
    status: string;
  } | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==================== Load Existing Exam ====================
  useEffect(() => {
    if (!planId) return;
    const load = async () => {
      try {
        const result = await getPersonalExam(planId);
        const exam = result.exam as {
          id: string;
          title: string;
          timeLimit: number;
          status: string;
        } | null;
        if (exam) {
          setExistingExam(exam);
          setExamTitle(exam.title);
          setTimeLimit(exam.timeLimit);
        }
      } catch {
        // آزمون وجود نداره — مشکلی نیست
      } finally {
        setLoadingExisting(false);
      }
    };
    void load();
  }, [planId]);

  // ==================== Load Questions ====================
  const loadQuestions = async (page = 1) => {
    setLoadingQuestions(true);
    try {
      const res = await api.get("/questions", {
        params: {
          page,
          limit: pagination.limit,
          status: "published",
          search: search.trim() || undefined,
          lesson: lessonFilter.trim() || undefined,
          chapter: chapterFilter.trim() || undefined,
          difficulty: difficultyFilter || undefined,
        },
      });

      setQuestions(res.data.questions);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to load questions:", err);
      setError("دریافت سوالات انجام نشد.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadQuestions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== Actions ====================
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void loadQuestions(1);
  };

  const handleAddQuestion = (q: QuestionItem) => {
    if (selectedQuestions.find((s) => s.id === q.id)) return;
    if (selectedQuestions.length >= 100) {
      setError("حداکثر ۱۰۰ سوال می‌تونی انتخاب کنی");
      return;
    }
    setSelectedQuestions((prev) => [
      ...prev,
      {
        id: q.id,
        code: q.code,
        questionText: q.questionText,
        lesson: q.lesson,
        chapter: q.chapter,
        difficulty: q.difficulty,
      },
    ]);
    setError("");
  };

  const handleRemoveQuestion = (id: string) => {
    setSelectedQuestions((prev) => prev.filter((s) => s.id !== id));
  };

  // ==================== Save ====================
  const handleSave = async () => {
    if (!planId) return;
    setError("");
    setSuccess("");

    if (!examTitle.trim()) {
      setError("عنوان آزمون الزامی است");
      return;
    }
    if (selectedQuestions.length === 0) {
      setError("حداقل یه سوال انتخاب کن");
      return;
    }
    if (timeLimit < 1 || timeLimit > 300) {
      setError("زمان باید بین ۱ تا ۳۰۰ دقیقه باشد");
      return;
    }

    setSaving(true);
    try {
      // 🔹 اگه آزمون وجود داره، اول حذف کن
      if (existingExam) {
        if (
          !window.confirm("آزمون قبلی حذف و آزمون جدید ساخته میشه. ادامه میدی؟")
        ) {
          setSaving(false);
          return;
        }
        await deletePersonalExam(planId);
      }

      await createPersonalExam(planId, {
        title: examTitle.trim(),
        timeLimit,
        questionIds: selectedQuestions.map((q) => q.id),
      });

      setSuccess("آزمون شخصی ساخته شد");
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      console.error("Failed to save exam:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ذخیره انجام نشد";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!planId || !existingExam) return;
    if (!window.confirm("آیا از حذف آزمون شخصی مطمئنی؟")) return;

    try {
      await deletePersonalExam(planId);
      setExistingExam(null);
      setSelectedQuestions([]);
      setExamTitle("");
      setTimeLimit(15);
      setSuccess("آزمون حذف شد");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      console.error("Failed to delete:", err);
      setError("حذف انجام نشد");
    }
  };

  // ==================== Selected IDs ====================
  const selectedIds = useMemo(
    () => new Set(selectedQuestions.map((s) => s.id)),
    [selectedQuestions],
  );

  // ==================== Loading ====================
  if (loadingExisting) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <LoaderCircle size={32} className="text-blue-500 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت
        </button>

        {/* Hero */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-blue-600/25 blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative shrink-0 self-center sm:self-auto">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                <Target size={26} strokeWidth={2.3} />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                Personal Exam Builder
              </p>
              <h1 className="font-heading text-xl sm:text-2xl font-black text-white -mt-0.5">
                {existingExam ? "ویرایش آزمون شخصی" : "ساخت آزمون شخصی"}
              </h1>
            </div>

            <div className="shrink-0 self-center sm:self-auto flex gap-2">
              {existingExam && (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/5 px-4 py-2.5 font-black text-rose-500 text-xs hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 size={13} />
                  حذف آزمون
                </button>
              )}

              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-blue-500 to-blue-700 px-5 py-2.5 font-black text-white text-xs shadow-lg shadow-blue-500/40 hover:shadow-xl disabled:opacity-40 transition-all"
              >
                {saving ? (
                  <>
                    <LoaderCircle size={13} className="animate-spin" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    ذخیره آزمون
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Messages */}
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
            <CheckCircle2
              size={16}
              className="text-emerald-500 shrink-0 mt-0.5"
            />
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 leading-6">
              {success}
            </p>
          </div>
        )}

        {/* Exam Info */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Sparkles size={15} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Exam Settings
              </p>
              <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                تنظیمات آزمون
              </h2>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                عنوان آزمون *
              </label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="مثلاً: آزمون جبرانی زیست"
                maxLength={200}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                زمان (دقیقه) *
              </label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                min={1}
                max={300}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all tabular-nums"
              />
            </div>
          </div>
        </section>

        {/* Two Columns */}
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
          {/* Selected Questions */}
          <section className="rounded-2xl border border-blue-500/30 bg-blue-500/5 backdrop-blur-sm">
            <div className="p-5 border-b border-blue-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500">
                  <CheckCircle2 size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Selected
                  </p>
                  <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                    سوالات انتخاب‌شده (
                    {selectedQuestions.length.toLocaleString("fa-IR")})
                  </h2>
                </div>
              </div>
            </div>

            {selectedQuestions.length === 0 ? (
              <div className="p-8 text-center">
                <Target size={28} className="mx-auto text-gray-400 mb-3" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  از بانک سوال، سوالات ضعیف رو انتخاب کن
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
                {selectedQuestions.map((q, index) => (
                  <div
                    key={q.id}
                    className="flex items-start gap-2 p-3 rounded-xl bg-white/60 dark:bg-white/[0.03] border border-blue-500/20"
                  >
                    <div className="shrink-0 w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center font-heading text-xs font-black tabular-nums">
                      {(index + 1).toLocaleString("fa-IR")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-5">
                        {q.questionText}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[9px] text-gray-500">
                        <span className="font-english">{q.code}</span>
                        {q.lesson && <span>· {q.lesson}</span>}
                        {q.chapter && <span>· {q.chapter}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Question Bank */}
          <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
            <div className="p-5 border-b border-gray-200/70 dark:border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                  <BookOpen size={15} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Question Bank
                  </p>
                  <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                    بانک سوال
                  </h2>
                </div>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-500"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="جستجو..."
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-2 pr-9 pl-3 text-xs text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-500 px-4 py-2 text-xs font-black text-white hover:bg-purple-600 transition-all"
                >
                  جستجو
                </button>
              </form>

              {/* Filters */}
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={lessonFilter}
                  onChange={(e) => setLessonFilter(e.target.value)}
                  placeholder="درس"
                  className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-all"
                />
                <input
                  type="text"
                  value={chapterFilter}
                  onChange={(e) => setChapterFilter(e.target.value)}
                  placeholder="فصل"
                  className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-all"
                />
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-2.5 py-1.5 text-[11px] text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-all"
                >
                  <option value="">همه</option>
                  {Object.entries(difficultyLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Questions List */}
            {loadingQuestions ? (
              <div className="flex items-center justify-center py-12">
                <LoaderCircle
                  size={24}
                  className="text-purple-500 animate-spin"
                />
              </div>
            ) : questions.length === 0 ? (
              <div className="p-8 text-center">
                <Search size={28} className="mx-auto text-gray-400 mb-3" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  سوالی پیدا نشد
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
                {questions.map((q) => {
                  const isSelected = selectedIds.has(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`
                        group flex items-start gap-2 p-3 rounded-xl border transition-all
                        ${
                          isSelected
                            ? "bg-blue-500/10 border-blue-500/30"
                            : "bg-white/50 dark:bg-white/[0.02] border-gray-200 dark:border-white/10 hover:border-purple-500/40"
                        }
                      `}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-2 leading-5">
                          {q.questionText}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[9px] text-gray-500 flex-wrap">
                          <span className="font-english">{q.code}</span>
                          {q.lesson && <span>· {q.lesson}</span>}
                          {q.chapter && <span>· {q.chapter}</span>}
                          {q.difficulty && (
                            <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/5">
                              {difficultyLabels[q.difficulty] ?? q.difficulty}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          isSelected
                            ? handleRemoveQuestion(q.id)
                            : handleAddQuestion(q)
                        }
                        className={`
                          shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all
                          ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-white/5 text-gray-400 group-hover:bg-purple-500 group-hover:text-white"
                          }
                        `}
                      >
                        {isSelected ? (
                          <Check size={12} strokeWidth={3} />
                        ) : (
                          <Plus size={12} strokeWidth={3} />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 p-3 border-t border-gray-200/70 dark:border-white/5">
                <button
                  type="button"
                  disabled={pagination.page <= 1 || loadingQuestions}
                  onClick={() => void loadQuestions(pagination.page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-[10px] font-black text-gray-500 hover:text-purple-500 disabled:opacity-30 transition-all"
                >
                  قبلی
                </button>
                <span className="text-[10px] font-bold text-gray-500">
                  {pagination.page.toLocaleString("fa-IR")} /{" "}
                  {pagination.totalPages.toLocaleString("fa-IR")}
                </span>
                <button
                  type="button"
                  disabled={
                    pagination.page >= pagination.totalPages || loadingQuestions
                  }
                  onClick={() => void loadQuestions(pagination.page + 1)}
                  className="px-3 py-1.5 rounded-lg bg-purple-500 text-white text-[10px] font-black disabled:opacity-30 transition-all"
                >
                  بعدی
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default PersonalExamBuilder;
