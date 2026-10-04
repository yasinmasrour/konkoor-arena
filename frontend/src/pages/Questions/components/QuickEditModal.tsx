import { memo, useEffect, useState } from "react";
import { LoaderCircle, Pencil, Save, Swords, X } from "lucide-react";
import {
  updateQuestion,
  type Question,
  type QuestionDifficulty,
} from "../../../api/questionApi";

interface Props {
  question: Question | null;
  onClose: () => void;
  onSaved: (updated: Question) => void;
  onError: (message: string) => void;
}

const difficultyLabels: Record<QuestionDifficulty, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
  tricky: "مفهومی/چالشی",
};

interface FormState {
  lesson: string;
  grade: string;
  major: string;
  chapter: string;
  topic: string;
  difficulty: QuestionDifficulty;
  year: string;
  tags: string;
  isArena: boolean;
}

const emptyForm: FormState = {
  lesson: "",
  grade: "12",
  major: "math",
  chapter: "",
  topic: "",
  difficulty: "medium",
  year: "",
  tags: "",
  isArena: false,
};

const QuickEditModal = memo(
  ({ question, onClose, onSaved, onError }: Props) => {
    const [form, setForm] = useState<FormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [localError, setLocalError] = useState("");

    // 🆕 فقط وقتی question عوض شد، form رو پر کن
    useEffect(() => {
      if (!question) return;
      setForm({
        lesson: question.lesson ?? "",
        grade: question.grade ?? "12",
        major: question.major ?? "math",
        chapter: question.chapter ?? "",
        topic: question.topic ?? "",
        difficulty: question.difficulty ?? "medium",
        year: question.year ? String(question.year) : "",
        tags: (question.tags ?? []).join(", "),
        isArena: question.isArena ?? false,
      });
      setLocalError("");
    }, [question]);

    if (!question) return null;

    const handleSave = async () => {
      if (saving) return;
      if (!form.lesson.trim() || !form.chapter.trim()) {
        setLocalError("درس و فصل باید تکمیل شوند.");
        return;
      }

      const yearValue = form.year.trim() ? Number(form.year) : undefined;
      if (
        yearValue !== undefined &&
        (!Number.isInteger(yearValue) || yearValue < 1300 || yearValue > 2100)
      ) {
        setLocalError("سال واردشده معتبر نیست.");
        return;
      }

      setSaving(true);
      setLocalError("");
      try {
        const updated = await updateQuestion(question.id, {
          lesson: form.lesson.trim(),
          grade: form.grade,
          major: form.major,
          chapter: form.chapter.trim(),
          topic: form.topic.trim(),
          difficulty: form.difficulty,
          year: yearValue,
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          isArena: form.isArena,
        });
        onSaved(updated);
        onClose();
      } catch (err) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          "ویرایش سریع سؤال انجام نشد. وضعیت و سطح دسترسی را بررسی کنید.";
        onError(message);
        setLocalError(message);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div
        className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 animate-[fadeIn_0.2s_ease-out]"
        onClick={() => !saving && onClose()}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0d14] shadow-2xl animate-[fadeInUp_0.3s_ease-out]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

          <div className="relative flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200/70 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                    <Pencil size={20} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Quick Edit
                  </p>
                  <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                    ویرایش سریع
                  </h2>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {question.code}
                  </p>
                </div>
              </div>
              <button
                disabled={saving}
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-rose-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                    درس *
                  </span>
                  <input
                    value={form.lesson}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lesson: e.target.value }))
                    }
                    placeholder="مثلاً ریاضی"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                  />
                </label>

                <label className="block">
                  <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                    فصل *
                  </span>
                  <input
                    value={form.chapter}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, chapter: e.target.value }))
                    }
                    placeholder="مثلاً مشتق"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                  />
                </label>

                <label className="block">
                  <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                    مبحث
                  </span>
                  <input
                    value={form.topic}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, topic: e.target.value }))
                    }
                    placeholder="مثلاً قواعد مشتق"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                  />
                </label>

                <label className="block">
                  <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                    سال
                  </span>
                  <input
                    value={form.year}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, year: e.target.value }))
                    }
                    placeholder="۱۴۰۳"
                    inputMode="numeric"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                  />
                </label>

                <label className="block">
                  <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                    پایه
                  </span>
                  <select
                    value={form.grade}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, grade: e.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
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
                    onChange={(e) =>
                      setForm((f) => ({ ...f, major: e.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
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
                      setForm((f) => ({
                        ...f,
                        difficulty: e.target.value as QuestionDifficulty,
                      }))
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                  >
                    {Object.entries(difficultyLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block sm:col-span-2">
                  <span className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                    تگ‌ها (با کاما جدا کن)
                  </span>
                  <input
                    value={form.tags}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, tags: e.target.value }))
                    }
                    placeholder="مثلاً مشتق، قاعده زنجیره‌ای، ترکیبی"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                  />
                </label>

                {/* مناسب آرنا */}
                <label className="block sm:col-span-2">
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4">
                    <div className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.isArena}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, isArena: e.target.checked }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`
                          shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5
                          ${
                            form.isArena
                              ? "border-purple-500 bg-purple-500 shadow-lg shadow-purple-500/40"
                              : "border-gray-300 dark:border-white/20 group-hover:border-purple-500/50"
                          }
                        `}
                      >
                        {form.isArena && (
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white">
                          <Swords
                            size={13}
                            className="text-purple-600 dark:text-purple-400"
                          />
                          مناسب آرنا
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-5">
                          این سؤال برای استفاده در نبردهای آرنا علامت‌گذاری
                          می‌شود.
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {localError && (
                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    {localError}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200/70 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
              <button
                disabled={saving}
                onClick={onClose}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] disabled:opacity-50 transition-colors"
              >
                انصراف
              </button>
              <button
                disabled={saving}
                onClick={() => void handleSave()}
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 disabled:opacity-50 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {saving ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

QuickEditModal.displayName = "QuickEditModal";

export default QuickEditModal;
