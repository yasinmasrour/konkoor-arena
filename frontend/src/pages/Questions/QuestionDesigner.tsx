import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  Image as ImageIcon,
  Save,
  Send,
  X,
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
};

const difficultyLabels: Record<QuestionDifficulty, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
  tricky: "مفهومی/چالشی",
};

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
          major: question.major,
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
      const result =
        editing && savedId
          ? await updateQuestion(savedId, payload)
          : await createQuestion(payload);
      setSavedId(result.id);
      setQuestionStatus(result.status);
      if (!editing)
        navigate(`/question-designer/${result.id}`, { replace: true });
      return result.id;
    } catch {
      setError("ذخیره سؤال انجام نشد. اطلاعات را بررسی کنید.");
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

  if (loading)
    return (
      <main className="min-h-screen grid place-items-center bg-gray-50 dark:bg-[#080B12]">
        در حال دریافت سؤال...
      </main>
    );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#080B12] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate("/question-bank")}
              className="mb-2 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--griffin-gold)]"
            >
              <ArrowRight size={16} /> بازگشت به بانک سؤال
            </button>
            <h1 className="text-3xl font-bold">
              {editing ? "ویرایش سؤال" : "طراحی سؤال جدید"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              سؤال را تکمیل کنید و به‌صورت پیش‌نویس ذخیره کنید. وضعیت فعلی:{" "}
              <span className="font-medium">
                {questionStatus === "draft"
                  ? "پیش‌نویس"
                  : questionStatus === "review"
                    ? "در حال بررسی"
                    : questionStatus === "published"
                      ? "منتشرشده"
                      : "بایگانی"}
              </span>
            </p>
          </div>
          <button
            onClick={() => setPreview(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200/70 bg-white px-4 py-2.5 dark:border-white/10 dark:bg-[#111722]"
          >
            <Eye size={17} /> پیش‌نمایش و بررسی
          </button>
        </header>

        {error && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]">
              <h2 className="mb-4 font-semibold">اطلاعات سؤال</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={form.code}
                  onChange={(e) => setField("code", e.target.value)}
                  placeholder="کد سؤال *"
                  className="rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]"
                />
                <input
                  value={form.lesson}
                  onChange={(e) => setField("lesson", e.target.value)}
                  placeholder="درس *"
                  className="rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]"
                />
                <select
                  value={form.grade}
                  onChange={(e) => setField("grade", e.target.value)}
                  className="rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-[#111722]"
                >
                  <option value="10">دهم</option>
                  <option value="11">یازدهم</option>
                  <option value="12">دوازدهم</option>
                </select>
                <select
                  value={form.major}
                  onChange={(e) => setField("major", e.target.value)}
                  className="rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-[#111722]"
                >
                  <option value="math">ریاضی</option>
                  <option value="experimental">تجربی</option>
                  <option value="humanities">انسانی</option>
                </select>
                <input
                  value={form.chapter}
                  onChange={(e) => setField("chapter", e.target.value)}
                  placeholder="فصل *"
                  className="rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]"
                />
                <input
                  value={form.topic}
                  onChange={(e) => setField("topic", e.target.value)}
                  placeholder="مبحث"
                  className="rounded-xl border border-slate-200/70 px-3 py-3 outline-none focus:border-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/[0.02]"
                />
                <select
                  value={form.difficulty}
                  onChange={(e) =>
                    setField("difficulty", e.target.value as QuestionDifficulty)
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
                  type="number"
                  value={form.year ?? ""}
                  onChange={(e) =>
                    setField(
                      "year",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  placeholder="سال (اختیاری)"
                  className="rounded-xl border border-slate-200/70 px-3 py-3 outline-none dark:border-white/10 dark:bg-white/[0.02]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]">
              <h2 className="mb-4 font-semibold">صورت سؤال</h2>
              <MathEditor
                value={form.questionText}
                onChange={(value) => setField("questionText", value)}
                rows={7}
                placeholder="متن سؤال را وارد کنید... *"
                label="متن سؤال *"
              />
              <input
                value={form.questionImage}
                onChange={(e) => setField("questionImage", e.target.value)}
                placeholder="آدرس تصویر سؤال (اختیاری)"
                className="mt-3 w-full rounded-xl border border-slate-200/70 px-3 py-3 outline-none dark:border-white/10 dark:bg-white/[0.02]"
              />
              {form.questionImage && (
                <img
                  src={form.questionImage}
                  alt="پیش‌نمایش تصویر سؤال"
                  className="mt-3 max-h-72 rounded-xl border object-contain dark:border-white/10"
                />
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">گزینه‌ها</h2>
                <span className="text-xs text-gray-500">
                  گزینه صحیح را انتخاب کنید
                </span>
              </div>
              <div className="space-y-4">
                {form.options.map((option, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border p-3 dark:border-white/10 ${form.correctAnswer === index ? "border-[var(--griffin-gold)] bg-amber-50/50 dark:bg-amber-900/10" : ""}`}
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={form.correctAnswer === index}
                        onChange={() => setField("correctAnswer", index)}
                      />
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gray-100 text-sm font-bold dark:bg-white/10">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">
                        گزینه {index + 1}
                      </span>
                    </div>
                    <MathEditor
                      value={option}
                      onChange={(value) => updateOption(index, value)}
                      rows={2}
                      placeholder={`متن گزینه ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]">
              <h2 className="mb-4 font-semibold">توضیحات و منابع</h2>
              <MathEditor
                value={form.explanation ?? ""}
                onChange={(value) => setField("explanation", value)}
                rows={7}
                placeholder="پاسخ تشریحی / توضیح حل"
                label="پاسخ تشریحی"
              />
              <input
                value={form.source}
                onChange={(e) => setField("source", e.target.value)}
                placeholder="منبع"
                className="mt-3 w-full rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-white/[0.02]"
              />
              <input
                value={form.author}
                onChange={(e) => setField("author", e.target.value)}
                placeholder="نام مؤلف / منبع"
                className="mt-3 w-full rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-white/[0.02]"
              />
              <input
                value={form.explanationPdf}
                onChange={(e) => setField("explanationPdf", e.target.value)}
                placeholder="آدرس PDF پاسخ (اختیاری)"
                className="mt-3 w-full rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-white/[0.02]"
              />
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]">
              <h2 className="mb-4 font-semibold">برچسب‌ها</h2>
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="مثلاً حد، تابع، کنکور"
                className="w-full rounded-xl border border-slate-200/70 px-3 py-3 dark:border-white/10 dark:bg-white/[0.02]"
              />
              <p className="mt-2 text-xs text-gray-500">
                برچسب‌ها را با ویرگول جدا کنید.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111722]">
              <h2 className="mb-3 font-semibold">ذخیره</h2>
              <p className="mb-4 text-sm leading-6 text-gray-500">
                ذخیره معمولی سؤال را به‌صورت پیش‌نویس نگه می‌دارد. بعداً
                می‌توانید آن را برای بررسی ارسال کنید.
              </p>
              <button
                disabled={saving}
                onClick={() => void save()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                <Save size={18} />{" "}
                {saving ? "در حال ذخیره..." : "ذخیره پیش‌نویس"}
              </button>
              {savedId && (
                <button
                  disabled={saving || reviewing}
                  onClick={() => void saveAndReview()}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/70 px-4 py-3 font-semibold hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <Send size={18} />{" "}
                  {reviewing ? "در حال ارسال..." : "ذخیره و ارسال برای بررسی"}
                </button>
              )}
            </div>
          </aside>
        </section>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPreview(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-4 flex max-h-[92vh] max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#111722]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-white/10">
              <div>
                <h2 className="text-xl font-bold">پیش‌نمایش و بررسی سؤال</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {form.code || "بدون کد"} ·{" "}
                  {difficultyLabels[form.difficulty ?? "medium"]}
                </p>
              </div>
              <button
                onClick={() => setPreview(false)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex shrink-0 gap-2 border-b border-slate-200/70 px-5 py-3 dark:border-white/10">
              <button
                onClick={() => setPreviewMode("student")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${previewMode === "student" ? "bg-[var(--griffin-gold)] text-white" : "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-200"}`}
              >
                نمای دانش‌آموز
              </button>
              <button
                onClick={() => setPreviewMode("review")}
                className={`rounded-xl px-4 py-2 text-sm font-medium ${previewMode === "review" ? "bg-[var(--griffin-gold)] text-white" : "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-200"}`}
              >
                نمای بررسی
              </button>
            </div>

            <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium dark:bg-white/10">
                    {form.lesson || "درس نامشخص"}
                  </span>
                  {form.year && (
                    <span className="text-xs text-gray-500">
                      سال {form.year}
                    </span>
                  )}
                </div>

                <div className="mb-6 text-lg font-medium leading-9">
                  <MathText
                    content={form.questionText || "متن سؤال وارد نشده است."}
                  />
                </div>

                {form.questionImage && (
                  <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-white/10">
                    <img
                      src={form.questionImage}
                      alt="تصویر سؤال"
                      className="max-h-96 w-full object-contain"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  {form.options.map((option, index) => (
                    <div
                      key={index}
                      className={`rounded-xl border p-4 ${previewMode === "review" && form.correctAnswer === index ? "border-[var(--griffin-gold)] bg-amber-50/50 dark:bg-amber-900/10" : "border-slate-200/70 dark:border-white/10"}`}
                    >
                      <div className="flex gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gray-100 text-sm font-bold dark:bg-white/10">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1 leading-8">
                          <MathText content={option || "گزینه خالی"} />
                        </div>
                        {previewMode === "review" &&
                          form.correctAnswer === index && (
                            <Check
                              className="mt-1 shrink-0 text-[var(--griffin-gold)]"
                              size={19}
                            />
                          )}
                      </div>
                    </div>
                  ))}
                </div>

                {previewMode === "review" && form.explanation && (
                  <div className="mt-6 rounded-2xl border border-slate-200/70 bg-gray-50 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <h3 className="mb-2 font-semibold">پاسخ تشریحی</h3>
                    <div className="leading-8">
                      <MathText content={form.explanation} />
                    </div>
                  </div>
                )}
              </div>

              <aside className="border-t border-slate-200/70 bg-gray-50/70 p-5 dark:border-white/10 dark:bg-white/[0.02] lg:border-l lg:border-t-0">
                {previewMode === "review" ? (
                  <div>
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">چک‌لیست بررسی</h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {checklistPassed} از {checklist.length} مورد آماده است
                        </p>
                      </div>
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold shadow-sm dark:bg-white/10">
                        {checklistPassed}
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {checklist.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-start gap-2 rounded-xl bg-white p-3 text-sm dark:bg-white/5"
                        >
                          <span
                            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${item.ok ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-500/15 text-red-600 dark:text-red-400"}`}
                          >
                            {item.ok ? <Check size={13} /> : <X size={13} />}
                          </span>
                          <span className="leading-6">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-200/70 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                      <h3 className="mb-3 text-sm font-semibold">
                        اطلاعات سؤال
                      </h3>
                      <dl className="space-y-2 text-xs">
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-500">درس</dt>
                          <dd className="font-medium">{form.lesson || "—"}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-500">پایه</dt>
                          <dd className="font-medium">{form.grade || "—"}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-500">رشته</dt>
                          <dd className="font-medium">{form.major || "—"}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-500">فصل</dt>
                          <dd className="font-medium">{form.chapter || "—"}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-500">مبحث</dt>
                          <dd className="font-medium">{form.topic || "—"}</dd>
                        </div>
                        <div className="flex justify-between gap-3">
                          <dt className="text-gray-500">وضعیت</dt>
                          <dd className="font-medium">{questionStatus}</dd>
                        </div>
                      </dl>
                    </div>

                    {form.source && (
                      <p className="mt-4 text-xs leading-6 text-gray-500">
                        منبع: {form.source}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                      <div className="mb-3 flex items-center gap-2">
                        <Eye size={18} />
                        <h3 className="font-semibold">نمای دانش‌آموز</h3>
                      </div>
                      <p className="text-sm leading-7 text-gray-500">
                        در این حالت پاسخ صحیح و پاسخ تشریحی مخفی هستند؛ این
                        نزدیک‌ترین حالت به نمایش سؤال برای دانش‌آموز است.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                      <div className="mb-3 flex items-center gap-2">
                        <ImageIcon size={18} />
                        <h3 className="font-semibold">وضعیت تصویر</h3>
                      </div>
                      <p className="text-sm leading-7 text-gray-500">
                        {form.questionImage
                          ? "تصویر برای پیش‌نمایش ثبت شده است."
                          : "برای این سؤال تصویری ثبت نشده است."}
                      </p>
                    </div>
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
