import { useState } from "react";
import { AlertCircle, LoaderCircle, Pencil, X } from "lucide-react";
import {
  updateComment,
  type CommentItem as CommentItemType,
} from "../../api/commentApi";
import StarRating from "./StarRating";

interface CommentEditModalProps {
  comment: CommentItemType;
  onClose: () => void;
  onSuccess: (updated: CommentItemType) => void;
}

const CommentEditModal = ({
  comment,
  onClose,
  onSuccess,
}: CommentEditModalProps) => {
  const [content, setContent] = useState(comment.content);
  const [rating, setRating] = useState<number | null>(comment.rating);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const showRating = !comment.parentId; // فقط ریشه

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
      const result = await updateComment(comment.id, {
        content: content.trim(),
        rating: showRating ? rating : undefined,
      });
      onSuccess(result.comment);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ویرایش انجام نشد";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0d14] shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* خط طلایی */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

        {/* هدر */}
        <div className="relative flex items-start justify-between gap-3 p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <Pencil size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Edit Comment
              </p>
              <h2 className="font-heading text-lg font-black text-white">
                ویرایش نظر
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 hover:text-rose-400 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* محتوا */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {/* هشدار: بعد ویرایش نیاز به تایید */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
            <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 leading-5">
              بعد از ویرایش، نظر شما دوباره نیاز به تایید ادمین دارد
            </p>
          </div>

          {/* امتیاز */}
          {showRating && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                امتیاز
              </label>
              <StarRating value={rating} onChange={setRating} size={22} />
            </div>
          )}

          {/* متن */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              متن نظر
            </label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError("");
              }}
              rows={5}
              maxLength={1000}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all resize-none leading-7"
            />
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-gray-500">
                {content.length.toLocaleString("fa-IR")} / ۱٬۰۰۰
              </span>
            </div>
          </div>

          {/* خطا */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5">
              <AlertCircle
                size={15}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <p className="text-[11px] font-bold text-rose-400 leading-5">
                {error}
              </p>
            </div>
          )}
        </form>

        {/* فوتر */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-black text-gray-400 hover:border-rose-500/40 hover:text-rose-500 disabled:opacity-40 transition-all"
          >
            لغو
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-3 font-heading font-black text-white text-xs shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl disabled:opacity-40 transition-all"
          >
            {loading ? (
              <>
                <LoaderCircle size={13} className="animate-spin" />
                در حال ذخیره...
              </>
            ) : (
              <>
                <Pencil size={13} />
                ذخیره تغییرات
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentEditModal;
