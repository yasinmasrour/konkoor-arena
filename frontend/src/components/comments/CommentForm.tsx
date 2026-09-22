import { useState } from "react";
import { AlertCircle, LoaderCircle, Send } from "lucide-react";
import StarRating from "./StarRating";

interface CommentFormProps {
  onSubmit: (data: {
    content: string;
    rating?: number | null;
  }) => Promise<void>;
  onCancel?: () => void;
  showRating?: boolean;
  initialContent?: string;
  initialRating?: number | null;
  submitLabel?: string;
  placeholder?: string;
  compact?: boolean;
}

const CommentForm = ({
  onSubmit,
  onCancel,
  showRating = true,
  initialContent = "",
  initialRating = null,
  submitLabel = "ثبت نظر",
  placeholder = "نظر خودت رو بنویس...",
  compact = false,
}: CommentFormProps) => {
  const [content, setContent] = useState(initialContent);
  const [rating, setRating] = useState<number | null>(initialRating);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("متن نظر الزامی است");
      return;
    }

    if (content.trim().length < 3) {
      setError("نظر باید حداقل ۳ کاراکتر باشد");
      return;
    }

    if (content.trim().length > 1000) {
      setError("نظر باید حداکثر ۱۰۰۰ کاراکتر باشد");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        content: content.trim(),
        rating: showRating ? rating : undefined,
      });
      setContent("");
      setRating(null);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ثبت نظر انجام نشد";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* امتیاز */}
      {showRating && (
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
            امتیاز (اختیاری)
          </label>
          <StarRating value={rating} onChange={setRating} size={22} />
        </div>
      )}

      {/* متن */}
      <div>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError("");
          }}
          placeholder={placeholder}
          rows={compact ? 3 : 4}
          maxLength={1000}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all resize-none leading-7"
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {content.length.toLocaleString("fa-IR")} / ۱٬۰۰۰
          </span>
        </div>
      </div>

      {/* خطا */}
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5">
          <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-5">
            {error}
          </p>
        </div>
      )}

      {/* دکمهها */}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 font-heading font-black text-white text-xs shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            {loading ? (
              <>
                <LoaderCircle size={13} className="animate-spin" />
                در حال ثبت...
              </>
            ) : (
              <>
                <Send size={13} />
                {submitLabel}
              </>
            )}
          </span>
          {!loading && (
            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 py-2.5 text-xs font-black text-gray-600 dark:text-gray-400 hover:border-rose-500/40 hover:text-rose-500 transition-all disabled:opacity-40"
          >
            لغو
          </button>
        )}
      </div>
    </form>
  );
};

export default CommentForm;
