import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Eye,
  FileText,
  Image as ImageIcon,
  Layers,
  LoaderCircle,
  Save,
  Send,
  Sparkles,
  Swords,
  Tag,
  Target,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createQuestion,
  getQuestion,
  submitQuestionForReview,
  updateQuestion,
  type QuestionPayload,
  type QuestionDifficulty,
  type Question,
} from "../../api/questionApi";
import MathText from "../../components/questions/MathText";
import MathEditor from "../../components/questions/MathEditor";

// ==================== ثابت‌ها ====================
const emptyForm: QuestionPayload = {
  code: "",
  lesson: "",
  grade: "12",
  major: "math",
  chapter: "",
  topic: "",
  questionText: "",
  questionImage: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
  explanationPdf: "",
  source: "",
  author: "",
  difficulty: "medium",
  tags: [],
  isArena: false,
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
  easy: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-500" },
  hard: { bg: "bg-rose-500/10", text: "text-rose-500" },
  tricky: { bg: "bg-purple-500/10", text: "text-purple-500" },
};

const statusLabels: Record<string, string> = {
  draft: "پیش‌نویس",
  review: "در حال بررسی",
  published: "منتشرشده",
  archived: "بایگانی",
};

const statusStyles: Record<string, { bg: string; text: string; dot: string }> =
  {
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

// ==================== کامپوننت ====================
const QuestionDesigner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [form, setForm] = useState<QuestionPayload>(emptyForm);
  const [tagsText, setTagsText] = useState("");
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(id ?? null);
  const [preview, setPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<"student" | "review">(
    "student",
  );
  const [questionStatus, setQuestionStatus] =
    useState<Question["status"]>("draft");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const question = await getQuestion(id);
        setForm({
          code: question.code,
          lesson: question.lesson,
          grade: question.grade,
          major: question.major?.toLowerCase() || "math",
          chapter: question.chapter,
          topic: question.topic,
          questionText: question.questionText,
          questionImage: question.questionImage,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          explanationPdf: question.explanationPdf,
          source: question.source,
          author: question.author,
          year: question.year ?? undefined,
          difficulty: question.difficulty,
          tags: question.tags,
          isArena: question.isArena ?? false,
        });
        setTagsText(question.tags.join(", "));
        setQuestionStatus(question.status);
      } catch {
        setError("دریافت سؤال انجام نشد.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  const setField = <K extends keyof QuestionPayload>(
    key: K,
    value: QuestionPayload[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const updateOption = (index: number, value: string) =>
    setForm((current) => ({
      ...current,
      options: current.options.map((item, i) => (i === index ? value : item)),
    }));

  const payload = useMemo(
    () => ({
      ...form,
      tags: tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }),
    [form, tagsText],
  );

  const validate = () => {
    if (payload.code.trim().length < 2) return "کد سؤال را وارد کنید.";
    if (payload.lesson.trim().length < 2) return "درس را وارد کنید.";
    if (payload.chapter.trim().length < 2) return "فصل را وارد کنید.";
    if (payload.questionText.trim().length < 5)
      return "صورت سؤال کوتاه یا خالی است.";
    if (payload.options.some((option) => !option.trim()))
      return "هر چهار گزینه باید تکمیل شوند.";
    return "";
  };

  const save = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return null;
    }
    setSaving(true);
    setError("");
    try {
      const normalizedPayload = {
        ...payload,
        major: payload.major?.toLowerCase(),
        difficulty: payload.difficulty?.toLowerCase(),
      };

      const result =
        editing && savedId
          ? await updateQuestion(savedId, normalizedPayload)
          : await createQuestion(normalizedPayload);
      setSavedId(result.id);
      setQuestionStatus(result.status);
      if (!editing)
        navigate(`/question-designer/${result.id}`, { replace: true });
      return result.id;
    } catch (err) {
      console.error("SAVE ERROR:", err);
      const backendError = (
        err as { response?: { data?: { errors?: { message: string }[] } } }
      )?.response?.data?.errors?.[0]?.message;
      setError(
        backendError
          ? `خطا: ${backendError}`
          : "ذخیره سؤال انجام نشد. اطلاعات را بررسی کنید.",
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  const saveAndReview = async () => {
    if (saving || reviewing) return;
    setReviewing(true);
    try {
      const questionId = await save();
      if (!questionId) return;
      const updatedQuestion = await submitQuestionForReview(questionId);
      setQuestionStatus(updatedQuestion.status);
      navigate("/question-bank");
    } catch {
      setError(
        "سؤال ذخیره شد اما ارسال برای بررسی انجام نشد. اگر وضعیت سؤال تغییر کرده است، دوباره ارسال نکنید.",
      );
    } finally {
      setReviewing(false);
    }
  };

  const checklist = [
    { label: "کد سؤال تکمیل شده", ok: payload.code.trim().length >= 2 },
    {
      label: "درس و فصل مشخص شده",
      ok:
        payload.lesson.trim().length >= 2 && payload.chapter.trim().length >= 2,
    },
    {
      label: "صورت سؤال تکمیل شده",
      ok: payload.questionText.trim().length >= 5,
    },
    {
      label: "هر چهار گزینه تکمیل شده",
      ok:
        payload.options.length === 4 &&
        payload.options.every((option) => option.trim().length > 0),
    },
    {
      label: "پاسخ صحیح انتخاب شده",
      ok:
        Number.isInteger(payload.correctAnswer) &&
        payload.correctAnswer >= 0 &&
        payload.correctAnswer < 4,
    },
    { label: "توضیح تشریحی ثبت شده", ok: Boolean(payload.explanation?.trim()) },
    {
      label: "اطلاعات منبع یا مؤلف ثبت شده",
      ok: Boolean(payload.source?.trim() || payload.author?.trim()),
    },
  ];

  const checklistPassed = checklist.filter((item) => item.ok).length;
  const currentStatusStyle = statusStyles[questionStatus] ?? statusStyles.draft;

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
            در حال دریافت سؤال...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ==================== HEADER ==================== */}
        <header className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] p-6 sm:p-8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-50" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                  <Wand2 size={24} strokeWidth={2.3} />
                </div>
              </div>

              <div>
                <button
                  onClick={() => navigate("/question-bank")}
                  className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors mb-1"
                >
                  <ArrowRight
                    size={13}
                    className="transition-transform group-hover:translate-x-1 rotate-180"
                  />
                  بازگشت به بانک سؤال
                </button>

                <div className="inline-flex items-center gap-2 mb-1.5">
                  <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    {editing ? "Edit Question" : "New Question"}
                  </span>
                </div>

                <h1 className="font-heading text-3xl font-black text-gray-900 dark:text-white">
                  {editing ? "ویرایش سؤال" : "طراحی سؤال جدید"}
                </h1>

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black ${currentStatusStyle.bg} ${currentStatusStyle.text}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${currentStatusStyle.dot} ${
                        questionStatus === "published" ? "animate-pulse" : ""
                      }`}
                    />
                    {statusLabels[questionStatus] ?? questionStatus}
                  </span>
                  {form.isArena && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-purple-500/15 text-purple-600 dark:text-purple-400">
                      <Swords size={10} />
                      مناسب آرنا
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {checklistPassed} از {checklist.length} مورد آماده
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPreview(true)}
              className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:-translate-y-0.5 transition-transform overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Eye size={16} />
                پیش‌نمایش و بررسی
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </header>

        {/* ==================== ERROR ==================== */}
        {error && (
          <div className="relative rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
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

        {/* ==================== MAIN GRID ==================== */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* ==================== ستون اصلی ==================== */}
          <div className="space-y-5 lg:col-span-2">
            {/* اطلاعات سؤال */}
            <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

              <div className="relative p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                    <Layers size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Basic Info
                    </p>
                    <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                      اطلاعات سؤال
                    </h2>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      key: "code" as const,
                      label: "کد سؤال *",
                      placeholder: "مثلاً M-1403-001",
                      type: "text",
                    },
                    {
                      key: "lesson" as const,
                      label: "درس *",
                      placeholder: "مثلاً ریاضی",
                      type: "text",
                    },
                    {
                      key: "chapter" as const,
                      label: "فصل *",
                      placeholder: "مثلاً مشتق",
                      type: "text",
                    },
                    {
                      key: "topic" as const,
                      label: "مبحث",
                      placeholder: "مثلاً قواعد مشتق",
                      type: "text",
                    },
                  ].map((field) => (
                    <label key={field.key} className="block">
                      <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                        {field.label}
                      </span>
                      <input
                        type={field.type}
                        value={(form[field.key] as string) ?? ""}
                        onChange={(e) => setField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
                      />
                    </label>
                  ))}

                  <label className="block">
                    <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      پایه
                    </span>
                    <select
                      value={form.grade}
                      onChange={(e) => setField("grade", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0d14] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-colors"
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
                      onChange={(e) => setField("major", e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0d14] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-colors"
                    >
                      <option value="math">ریاضی</option>
                      <option value="experimental">تجربی</option>
                      <option value="humanities">انسانی</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      سختی
                    </span>
                    <select
                      value={form.difficulty}
                      onChange={(e) =>
                        setField(
                          "difficulty",
                          e.target.value as QuestionDifficulty,
                        )
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0d14] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-colors"
                    >
                      {Object.entries(difficultyLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      سال (اختیاری)
                    </span>
                    <input
                      type="number"
                      value={form.year ?? ""}
                      onChange={(e) =>
                        setField(
                          "year",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder="۱۴۰۳"
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* صورت سؤال - 🆕 با preview و toolbar */}
            <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

              <div className="relative p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                    <FileText size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Question Body
                    </p>
                    <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                      صورت سؤال
                    </h2>
                  </div>
                </div>

                <MathEditor
                  value={form.questionText}
                  onChange={(value) => setField("questionText", value)}
                  rows={7}
                  placeholder="متن سؤال را وارد کنید... *"
                  label="متن سؤال *"
                  showPreview={true}
                  showToolbar={true}
                />

                <label className="block mt-4">
                  <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                    آدرس تصویر سؤال (اختیاری)
                  </span>
                  <input
                    value={form.questionImage}
                    onChange={(e) => setField("questionImage", e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
                  />
                </label>

                {form.questionImage && (
                  <div className="mt-4 relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-2">
                    <img
                      src={form.questionImage}
                      alt="پیش‌نمایش تصویر سؤال"
                      className="max-h-72 w-full rounded-xl object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* گزینه‌ها - 🆕 بدون preview و بدون toolbar */}
            <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

              <div className="relative p-5">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                      <Target size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Answer Options
                      </p>
                      <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                        گزینه‌ها
                      </h2>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                    <Check size={10} strokeWidth={3} />
                    گزینه صحیح را انتخاب کن
                  </span>
                </div>

                <div className="space-y-4">
                  {form.options.map((option, index) => {
                    const isCorrect = form.correctAnswer === index;
                    return (
                      <div
                        key={index}
                        className={`
                          rounded-2xl border p-4 transition-colors
                          ${
                            isCorrect
                              ? "border-emerald-500/40 bg-emerald-500/5"
                              : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02]"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <label className="relative cursor-pointer">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={isCorrect}
                              onChange={() => setField("correctAnswer", index)}
                              className="sr-only"
                            />
                            <div
                              className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                ${
                                  isCorrect
                                    ? "border-emerald-500 bg-emerald-500"
                                    : "border-gray-300 dark:border-white/20 hover:border-[var(--griffin-gold)]"
                                }
                              `}
                            >
                              {isCorrect && (
                                <Check
                                  size={12}
                                  className="text-white"
                                  strokeWidth={3}
                                />
                              )}
                            </div>
                          </label>

                          <div
                            className={`
                              w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black
                              ${
                                isCorrect
                                  ? "bg-emerald-500 text-white"
                                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
                              }
                            `}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>

                          <span
                            className={`text-sm font-black ${
                              isCorrect
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            گزینه {String.fromCharCode(65 + index)}
                          </span>
                        </div>

                        <MathEditor
                          value={option}
                          onChange={(value) => updateOption(index, value)}
                          rows={2}
                          placeholder={`متن گزینه ${String.fromCharCode(65 + index)}`}
                          showPreview={false}
                          showToolbar={false}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ==================== ستون کنار ==================== */}
          <aside className="space-y-5">
            {/* توضیحات و منابع - 🆕 با preview */}
            <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

              <div className="relative p-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Explanation
                    </p>
                    <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                      توضیحات و منابع
                    </h2>
                  </div>
                </div>

                <MathEditor
                  value={form.explanation ?? ""}
                  onChange={(value) => setField("explanation", value)}
                  rows={7}
                  placeholder="پاسخ تشریحی / توضیح حل"
                  label="پاسخ تشریحی"
                  showPreview={true}
                  showToolbar={false}
                />

                <div className="space-y-3 mt-4">
                  <input
                    value={form.source}
                    onChange={(e) => setField("source", e.target.value)}
                    placeholder="منبع"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
                  />
                  <input
                    value={form.author}
                    onChange={(e) => setField("author", e.target.value)}
                    placeholder="نام مؤلف / منبع"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
                  />
                  <input
                    value={form.explanationPdf}
                    onChange={(e) => setField("explanationPdf", e.target.value)}
                    placeholder="آدرس PDF پاسخ (اختیاری)"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* برچسب‌ها */}
            <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

              <div className="relative p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                    <Tag size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Tags
                    </p>
                    <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                      برچسب‌ها
                    </h2>
                  </div>
                </div>

                <input
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="مثلاً حد، تابع، کنکور"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
                />
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                  برچسب‌ها را با ویرگول جدا کن.
                </p>
              </div>
            </div>

            {/* مناسب آرنا */}
            <div className="relative rounded-3xl border border-purple-500/30 bg-purple-500/5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

              <div className="relative p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Swords size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                      Arena
                    </p>
                    <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                      مناسب آرنا
                    </h2>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.isArena ?? false}
                    onChange={(e) => setField("isArena", e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`
                      shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors mt-0.5
                      ${
                        form.isArena
                          ? "border-purple-500 bg-purple-500"
                          : "border-gray-300 dark:border-white/20 group-hover:border-purple-500/50"
                      }
                    `}
                  >
                    {form.isArena && (
                      <Check size={13} className="text-white" strokeWidth={3} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      این سؤال برای نبردهای آرنا مناسبه
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-5">
                      فقط سؤال‌های «منتشرشده» که این گزینه براشون فعاله، توی
                      آرنا استفاده می‌شن.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* چک‌لیست */}
            <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

              <div className="relative p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                      <Award size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        Checklist
                      </p>
                      <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                        چک‌لیست
                      </h2>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-40" />
                    <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black">
                      {checklistPassed}/{checklist.length}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {checklist.map((item, i) => (
                    <div
                      key={i}
                      className={`
                        flex items-start gap-2.5 p-2.5 rounded-xl transition-colors
                        ${
                          item.ok
                            ? "bg-emerald-500/5 border border-emerald-500/20"
                            : "bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5"
                        }
                      `}
                    >
                      <div
                        className={`
                          w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5
                          ${
                            item.ok
                              ? "bg-emerald-500 text-white"
                              : "bg-gray-200 dark:bg-white/10 text-gray-400"
                          }
                        `}
                      >
                        {item.ok ? (
                          <Check size={11} strokeWidth={3} />
                        ) : (
                          <X size={11} strokeWidth={3} />
                        )}
                      </div>
                      <span
                        className={`
                          text-[11px] font-bold leading-5
                          ${
                            item.ok
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        `}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ذخیره */}
            <div className="relative rounded-3xl border border-[var(--griffin-gold)]/30 bg-[var(--griffin-gold)]/5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

              <div className="relative p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
                    <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                      <Save size={16} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                      Save
                    </p>
                    <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                      ذخیره سؤال
                    </h2>
                  </div>
                </div>

                <p className="text-[11px] leading-6 text-gray-500 dark:text-gray-400 mb-4">
                  ذخیره معمولی سؤال را به‌صورت{" "}
                  <strong className="text-gray-900 dark:text-white">
                    پیش‌نویس
                  </strong>{" "}
                  نگه می‌دارد.
                </p>

                <button
                  disabled={saving}
                  onClick={() => void save()}
                  className="group relative w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-3 font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-transform overflow-hidden"
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
                        ذخیره پیش‌نویس
                      </>
                    )}
                  </span>
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>

                {savedId && (
                  <button
                    disabled={saving || reviewing}
                    onClick={() => void saveAndReview()}
                    className="group relative w-full mt-2.5 inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/30 bg-white dark:bg-white/[0.03] px-4 py-3 font-black text-[var(--griffin-gold)] text-sm hover:bg-[var(--griffin-gold)]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {reviewing ? (
                      <>
                        <LoaderCircle size={15} className="animate-spin" />
                        در حال ارسال...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        ذخیره و ارسال برای بررسی
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>

      {/* ==================== PREVIEW MODAL ==================== */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => setPreview(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0d14] shadow-2xl flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

            {/* هدر مودال */}
            <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
                  <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                    <Eye size={18} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Preview
                  </p>
                  <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                    پیش‌نمایش و بررسی سؤال
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setPreview(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-rose-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* تب‌ها */}
            <div className="flex gap-2 p-5 pb-0">
              {[
                { key: "student" as const, label: "نمای دانش‌آموز", icon: Eye },
                {
                  key: "review" as const,
                  label: "نمای بررسی",
                  icon: CheckCircle2,
                },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = previewMode === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setPreviewMode(tab.key)}
                    className={`
                      inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-colors
                      ${
                        isActive
                          ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white"
                          : "border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-gray-600 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40"
                      }
                    `}
                  >
                    <TabIcon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* محتوای مودال */}
            <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_320px] gap-4 p-5">
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-6">
                {/* 🆕 کادر متن سوال با تصویر گوشه‌ی پایین-چپ */}
                <div className="relative mb-6 pb-32 sm:pb-40">
                  {/* متن سوال */}
                  <div className="text-lg font-bold leading-9 text-gray-900 dark:text-white">
                    <MathText
                      content={form.questionText || "متن سؤال وارد نشده است."}
                    />
                  </div>

                  {/* 🆕 تصویر سوال - گوشه‌ی پایین-چپ */}
                  {form.questionImage && (
                    <div
                      className="
                        absolute
                        bottom-0
                        left-0
                        w-32 h-32
                        sm:w-40 sm:h-40
                        rounded-xl
                        overflow-hidden
                        border border-gray-200 dark:border-white/10
                        bg-white dark:bg-white/[0.02]
                        p-1
                        shadow-sm
                        group
                      "
                    >
                      <img
                        src={form.questionImage}
                        alt="تصویر سؤال"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {form.options.map((option, index) => {
                    const isCorrectAnswer =
                      previewMode === "review" && form.correctAnswer === index;
                    return (
                      <div
                        key={index}
                        className={`
                          rounded-2xl border p-4 transition-colors
                          ${
                            isCorrectAnswer
                              ? "border-emerald-500/40 bg-emerald-500/5"
                              : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02]"
                          }
                        `}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`
                              w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0
                              ${
                                isCorrectAnswer
                                  ? "bg-emerald-500 text-white"
                                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
                              }
                            `}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="min-w-0 flex-1 leading-8 text-gray-900 dark:text-white">
                            <MathText content={option || "گزینه خالی"} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {previewMode === "review" && form.explanation && (
                  <div className="mt-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-white/[0.02] p-5">
                    <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white mb-3">
                      پاسخ تشریحی
                    </h3>
                    <div className="leading-8 text-gray-700 dark:text-gray-300">
                      <MathText content={form.explanation} />
                    </div>
                  </div>
                )}
              </div>

              <aside className="space-y-3">
                {previewMode === "review" ? (
                  <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Award
                          size={14}
                          className="text-[var(--griffin-gold)]"
                        />
                        <p className="font-heading text-xs font-black text-gray-900 dark:text-white">
                          چک‌لیست بررسی
                        </p>
                      </div>

                      <div
                        className={`
                          w-11 h-11 rounded-xl flex items-center justify-center font-heading font-black text-white
                          ${
                            checklistPassed === checklist.length
                              ? "bg-emerald-500"
                              : checklistPassed >= 5
                                ? "bg-[var(--griffin-gold)]"
                                : "bg-rose-500"
                          }
                        `}
                      >
                        {checklistPassed}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {checklist.map((item, i) => (
                        <div
                          key={i}
                          className={`
                            flex items-start gap-2 p-2 rounded-lg text-[11px]
                            ${item.ok ? "bg-emerald-500/5" : "bg-rose-500/5"}
                          `}
                        >
                          <div
                            className={`
                              w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5
                              ${item.ok ? "bg-emerald-500" : "bg-rose-500"}
                            `}
                          >
                            {item.ok ? (
                              <Check
                                size={9}
                                strokeWidth={3}
                                className="text-white"
                              />
                            ) : (
                              <X
                                size={9}
                                strokeWidth={3}
                                className="text-white"
                              />
                            )}
                          </div>
                          <span
                            className={`
                              font-bold leading-5
                              ${item.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}
                            `}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye size={14} className="text-emerald-500" />
                      <h3 className="font-heading text-xs font-black text-gray-900 dark:text-white">
                        نمای دانش‌آموز
                      </h3>
                    </div>
                    <p className="text-[11px] leading-6 text-gray-500 dark:text-gray-400">
                      در این حالت پاسخ صحیح و پاسخ تشریحی مخفی هستند.
                    </p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default QuestionDesigner;
