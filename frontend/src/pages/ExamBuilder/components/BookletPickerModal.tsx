import { memo, useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileQuestion,
  Layers,
  LoaderCircle,
  Plus,
  Search,
  X,
} from "lucide-react";
import { getBooklets, type Booklet } from "../../../api/bookletApi";
import { useDebounce } from "../../../hooks/useDebounce";

interface Props {
  open: boolean;
  currentIds: Set<string>;
  onClose: () => void;
  onAdd: (booklets: Booklet[]) => Promise<void>;
  onError: (message: string) => void;
}

const bookletQuestionCount = (b: Booklet) =>
  b.questions?.length ?? b._count?.questions ?? 0;

// 🆕 کارت دفترچه — memo شده
const BookletCard = memo(
  ({
    booklet,
    isSelected,
    isCurrent,
    onToggle,
  }: {
    booklet: Booklet;
    isSelected: boolean;
    isCurrent: boolean;
    onToggle: (b: Booklet) => void;
  }) => (
    <button
      type="button"
      disabled={isCurrent}
      onClick={() => onToggle(booklet)}
      className={`
        w-full rounded-2xl border p-3.5 text-right transition-all
        ${
          isSelected
            ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)]/5 shadow-md shadow-[var(--griffin-gold)]/10"
            : "border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] hover:border-[var(--griffin-gold)]/40"
        }
        ${isCurrent ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            mt-0.5 shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
            ${
              isSelected
                ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)] text-white"
                : "border-gray-300 dark:border-white/20"
            }
          `}
        >
          {isSelected && <Check size={13} strokeWidth={3} />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
            {booklet.title || booklet.lesson}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            <span className="font-bold text-[var(--griffin-gold)]">
              {booklet.lesson}
            </span>
            <span>·</span>
            <span>
              {booklet.grade} | {booklet.major}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <FileQuestion size={9} />
              {bookletQuestionCount(booklet).toLocaleString("fa-IR")} سوال
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={9} />
              {booklet.duration.toLocaleString("fa-IR")} دقیقه
            </span>
          </div>
          {isCurrent && (
            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ✓ قبلاً به این آزمون اضافه شده
            </p>
          )}
        </div>
      </div>
    </button>
  ),
);

BookletCard.displayName = "BookletCard";

const BookletPickerModal = ({
  open,
  currentIds,
  onClose,
  onAdd,
  onError,
}: Props) => {
  const [booklets, setBooklets] = useState<Booklet[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Booklet[]>([]);
  const [busy, setBusy] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  // 🆕 فقط وقتی open تغییر کنه reset میشه
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected([]);
    setSearch("");
    setPage(1);
  }, [open]);

  // 🆕 واکنش به search / page
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const result = await getBooklets({
          page,
          limit: 8,
          search: debouncedSearch || undefined,
          status: "published",
          sort: "updatedAt",
          order: "desc",
        });
        if (cancelled) return;
        setBooklets(result.booklets ?? []);
        setTotalPages(Math.max(1, result.pagination.totalPages));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        if (!cancelled) onError("دریافت دفترچه‌های منتشرشده انجام نشد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, debouncedSearch, page, onError]);

  const toggle = (booklet: Booklet) => {
    if (currentIds.has(booklet.id)) return;
    setSelected((current) =>
      current.some((b) => b.id === booklet.id)
        ? current.filter((b) => b.id !== booklet.id)
        : [...current, booklet],
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
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0d14]/95 shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

        <div className="relative p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                  <Layers size={18} />
                </div>
              </div>
              <div>
                <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                  انتخاب دفترچه
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  فقط دفترچه‌های منتشرشده
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-rose-500/15 hover:text-rose-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="relative">
            <Search
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در عنوان، درس یا مشخصات..."
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-3 pr-10 pl-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
            />
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="py-12 text-center">
              <LoaderCircle
                size={24}
                className="mx-auto text-[var(--griffin-gold)] animate-spin mb-2"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                در حال دریافت...
              </p>
            </div>
          ) : booklets.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                دفترچه منتشرشده‌ای پیدا نشد.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {booklets.map((booklet) => {
                const isCurrent = currentIds.has(booklet.id);
                const isSelected = selected.some((b) => b.id === booklet.id);

                return (
                  <BookletCard
                    key={booklet.id}
                    booklet={booklet}
                    isSelected={isSelected || isCurrent}
                    isCurrent={isCurrent}
                    onToggle={toggle}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-0 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200/70 dark:border-white/5 p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-all"
            >
              <ChevronRight size={14} />
            </button>
            <span className="font-bold tabular-nums">
              صفحه {page.toLocaleString("fa-IR")} از{" "}
              {totalPages.toLocaleString("fa-IR")}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={14} />
            </button>
          </div>

          <button
            disabled={!selected.length || busy}
            onClick={() => void handleAdd()}
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl disabled:opacity-40 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {busy ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" />
                  در حال افزودن...
                </>
              ) : (
                <>
                  <Plus size={15} />
                  افزودن {selected.length > 0 && `${selected.length} `}دفترچه
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

export default BookletPickerModal;