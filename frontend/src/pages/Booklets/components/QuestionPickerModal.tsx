import { memo, useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  LoaderCircle,
  Plus,
  Search,
  X,
} from "lucide-react";
import MathText from "../../../components/questions/MathText";
import { getQuestions, type Question } from "../../../api/questionApi";
import { useDebounce } from "../../../hooks/useDebounce";

interface Props {
  open: boolean;
  currentQuestionIds: Set<string>;
  onClose: () => void;
  onAdd: (questions: Question[]) => Promise<void>;
  onError: (message: string) => void;
}

const QuestionCard = memo(
  ({
    question,
    isSelected,
    isAlreadyAdded,
    onToggle,
  }: {
    question: Question;
    isSelected: boolean;
    isAlreadyAdded: boolean;
    onToggle: (q: Question) => void;
  }) => (
    <button
      type="button"
      onClick={() => onToggle(question)}
      disabled={isAlreadyAdded}
      className={`
        group w-full rounded-2xl border p-4 text-right transition-all
        ${
          isSelected
            ? "border-[var(--griffin-gold)] bg-gradient-to-l from-[var(--griffin-gold)]/10 to-transparent shadow-md"
            : "border-gray-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] hover:border-[var(--griffin-gold)]/50 hover:bg-[var(--griffin-gold)]/5"
        }
        ${isAlreadyAdded ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:-translate-y-0.5"}
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            mt-1 w-6 h-6 shrink-0 rounded-md border-2
            flex items-center justify-center transition-all
            ${
              isSelected
                ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)] shadow-lg shadow-[var(--griffin-gold)]/40"
                : "border-gray-300 dark:border-white/20 group-hover:border-[var(--griffin-gold)]"
            }
          `}
        >
          {isSelected && (
            <Check size={14} className="text-white" strokeWidth={3} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/5 font-english text-gray-600 dark:text-gray-300">
              {question.code}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]">
              {question.lesson}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500">
              {question.chapter}
            </span>
            {isAlreadyAdded && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={9} />
                اضافه شده
              </span>
            )}
          </div>

          <div className="leading-7 text-sm text-gray-900 dark:text-white">
            <MathText content={question.questionText} />
          </div>
        </div>
      </div>
    </button>
  ),
);

QuestionCard.displayName = "QuestionCard";

const QuestionPickerModal = ({
  open,
  currentQuestionIds,
  onClose,
  onAdd,
  onError,
}: Props) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Question[]>([]);
  const [busy, setBusy] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected([]);
    setSearch("");
    setPage(1);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await getQuestions({
          page,
          limit: 8,
          search: debouncedSearch || undefined,
          status: "published",
          sort: "updatedAt",
          order: "desc",
        });
        if (cancelled) return;
        setQuestions(result.questions);
        setTotalPages(result.pagination.totalPages);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        if (!cancelled) onError("دریافت سؤال‌های منتشرشده انجام نشد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, debouncedSearch, page, onError]);

  const toggle = (question: Question) => {
    if (currentQuestionIds.has(question.id)) return;
    setSelected((current) =>
      current.some((q) => q.id === question.id)
        ? current.filter((q) => q.id !== question.id)
        : [...current, question],
    );
  };

  const handleAdd = async () => {
    if (!selected.length || busy) return;
    setBusy(true);
    try {
      await onAdd(selected);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 animate-[fadeIn_0.2s_ease-out]"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !busy) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0d14]/95 shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

        <div className="flex items-center justify-between gap-3 p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <FileQuestion size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Question Picker
              </p>
              <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                انتخاب سؤال
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                فقط سؤال‌های منتشرشده نمایش داده می‌شن
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-rose-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="relative">
            <Search
              size={17}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در کد، متن یا مبحث..."
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-3 pr-10 pl-3 text-sm outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
              <LoaderCircle
                size={20}
                className="animate-spin text-[var(--griffin-gold)]"
              />
              در حال دریافت سؤال‌ها...
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map((question) => {
                const isAlreadyAdded = currentQuestionIds.has(question.id);
                const isSelected = selected.some((q) => q.id === question.id);

                return (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    isSelected={isSelected || isAlreadyAdded}
                    isAlreadyAdded={isAlreadyAdded}
                    onToggle={toggle}
                  />
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <Search
                  size={28}
                  className="text-gray-400 dark:text-gray-500"
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                سؤال منتشرشده‌ای با این جستجو پیدا نشد.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 p-5 border-t border-gray-200/70 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] hover:border-[var(--griffin-gold)]/40 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={16} />
            </button>
            <span className="font-bold">
              صفحه {page.toLocaleString("fa-IR")} از{" "}
              {totalPages.toLocaleString("fa-IR")}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] hover:border-[var(--griffin-gold)]/40 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          <button
            disabled={!selected.length || busy}
            onClick={() => void handleAdd()}
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 disabled:opacity-40 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {busy ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  در حال افزودن...
                </>
              ) : (
                <>
                  <Plus size={16} strokeWidth={2.5} />
                  افزودن {selected.length > 0 && `${selected.length} `}سؤال
                </>
              )}
            </span>
            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionPickerModal;