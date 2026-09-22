import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileQuestion,
  LoaderCircle,
  MessageSquare,
  Shield,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import {
  formatCommentDate,
  getCommentStatusLabel,
  type CommentItem,
} from "../../api/commentApi";

interface CommentReviewModalProps {
  comment: CommentItem;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  loading?: boolean;
}

const CommentReviewModal = ({
  comment,
  onClose,
  onApprove,
  onReject,
  onDelete,
  loading = false,
}: CommentReviewModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0d14] shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* خط طلایی */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

        {/* هاله */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />

        {/* ==================== هدر ==================== */}
        <div className="relative flex items-start justify-between gap-3 p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <MessageSquare size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Review Comment
              </p>
              <h2 className="font-heading text-lg font-black text-white">
                بررسی نظر
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

        {/* ==================== محتوا ==================== */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* اطلاعات کاربر */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                {comment.author.isAdmin ? (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                    <Shield size={18} strokeWidth={2.3} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white font-heading font-black text-lg shadow-lg">
                    {comment.author.firstName.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-heading text-base font-black text-white">
                    {comment.author.firstName} {comment.author.lastName}
                  </p>
                  {comment.author.isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600 text-white text-[9px] font-black">
                      <BadgeCheck size={9} strokeWidth={2.5} />
                      مدیر
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5 font-english">
                  @{comment.author.username}
                </p>
              </div>
            </div>
          </div>

          {/* اطلاعات کامنت */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock3 size={11} className="text-[var(--griffin-gold)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  تاریخ
                </span>
              </div>
              <p className="text-[11px] font-bold text-white">
                {formatCommentDate(comment.createdAt)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield size={11} className="text-[var(--griffin-gold)]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                  وضعیت
                </span>
              </div>
              <p className="text-[11px] font-bold text-white">
                {getCommentStatusLabel(comment.status)}
              </p>
            </div>
          </div>

          {/* آزمون */}
          {comment.exam && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 flex items-center gap-2">
              <FileQuestion
                size={13}
                className="text-[var(--griffin-gold)] shrink-0"
              />
              <span className="text-[11px] font-bold text-white truncate">
                {comment.exam.title}
              </span>
            </div>
          )}

          {/* امتیاز */}
          {comment.rating !== null && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Star size={11} className="text-amber-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  امتیاز
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={
                      s <= comment.rating!
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-600"
                    }
                  />
                ))}
                <span className="mr-2 font-heading text-sm font-black text-amber-500 tabular-nums">
                  {comment.rating.toLocaleString("fa-IR")}
                </span>
              </div>
            </div>
          )}

          {/* محتوا */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare size={11} className="text-[var(--griffin-gold)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                متن نظر
              </span>
            </div>
            <p className="text-sm text-gray-200 leading-7 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          {/* آمار */}
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ThumbsUp size={13} />
              <span className="font-heading text-sm font-black tabular-nums">
                {comment.likes.toLocaleString("fa-IR")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-400">
              <ThumbsDown size={13} />
              <span className="font-heading text-sm font-black tabular-nums">
                {comment.dislikes.toLocaleString("fa-IR")}
              </span>
            </div>
            {comment.repliesCount > 0 && (
              <div className="flex items-center gap-1.5 text-[var(--griffin-gold)]">
                <MessageSquare size={13} />
                <span className="font-heading text-sm font-black tabular-nums">
                  {comment.repliesCount.toLocaleString("fa-IR")} پاسخ
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ==================== فوتر ==================== */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01] flex flex-wrap gap-2">
          {comment.status === "pending" && (
            <>
              <button
                type="button"
                onClick={onApprove}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-5 py-3 font-heading font-black text-white text-xs shadow-lg shadow-emerald-500/30 hover:shadow-xl disabled:opacity-40 transition-all"
              >
                {loading ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                تایید و انتشار
              </button>

              <button
                type="button"
                onClick={onReject}
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-5 py-3 font-heading font-black text-rose-500 text-xs hover:bg-rose-500/20 disabled:opacity-40 transition-all"
              >
                <XCircle size={14} />
                رد کردن
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onDelete}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 font-heading font-black text-gray-400 text-xs hover:border-rose-500/40 hover:text-rose-500 disabled:opacity-40 transition-all"
          >
            <Trash2 size={14} />
            حذف کامل
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentReviewModal;