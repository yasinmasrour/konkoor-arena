import { useEffect, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Clock3,
  LoaderCircle,
  MoreVertical,
  Pencil,
  Shield,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import {
  formatCommentDate,
  getCommentReplies,
  reactToComment,
  removeReaction,
  type CommentItem as CommentItemType,
  type ReactionType,
} from "../../api/commentApi";
import StarRating from "./StarRating";

interface CommentItemProps {
  comment: CommentItemType;
  depth?: number;
  maxDepth?: number;
  isAuthenticated: boolean;
  hasSubscription?: boolean;
  onReply?: (comment: CommentItemType) => void;
  onEdit?: (comment: CommentItemType) => void;
  onDelete?: (comment: CommentItemType) => void;
  onReplyDelete?: (replyId: string) => void;
  replyReloadTrigger?: number;
}

const CommentItem = ({
  comment,
  depth = 0,
  maxDepth = 5,
  isAuthenticated,
  hasSubscription = false,
  onReply,
  onEdit,
  onDelete,
  onReplyDelete,
  replyReloadTrigger = 0,
}: CommentItemProps) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentItemType[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [localRepliesCount, setLocalRepliesCount] = useState(
    comment.repliesCount,
  );
  const [reaction, setReaction] = useState<ReactionType | null>(
    comment.myReaction,
  );
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);
  const [showMenu, setShowMenu] = useState(false);

  // ==================== Helpers ====================
  const isPending = comment.status === "pending";
  const isRejected = comment.status === "rejected";
  const isDeleted = comment.status === "deleted";
  const isApproved = comment.status === "approved";

  const canInteract = isApproved && isAuthenticated && hasSubscription;
  const canReply = canInteract && depth < maxDepth;

  // ==================== Reload Replies on Trigger ====================
  useEffect(() => {
    if (!showReplies || !repliesLoaded) return;
    if (replyReloadTrigger === 0) return;

    const reload = async () => {
      try {
        const result = await getCommentReplies(comment.id);
        setReplies(result.replies);
        setLocalRepliesCount(result.replies.length);
        if (result.replies.length === 0) {
          setShowReplies(false);
        }
      } catch (err) {
        console.error("Failed to reload replies:", err);
      }
    };
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replyReloadTrigger]);

  // ==================== Load Replies ====================
  const toggleReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    setShowReplies(true);

    if (repliesLoaded) return;

    setLoadingReplies(true);
    try {
      const result = await getCommentReplies(comment.id);
      setReplies(result.replies);
      setLocalRepliesCount(result.replies.length);
      setRepliesLoaded(true);
    } catch (err) {
      console.error("Failed to load replies:", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  // 🆕 حذف یه reply از لیست داخلی
  const handleReplyDelete = (replyId: string) => {
    setReplies((prev) => {
      const newReplies = prev.filter((r) => r.id !== replyId);
      // اگه دیگه پاسخی نموند، لیست رو ببند
      if (newReplies.length === 0) {
        setShowReplies(false);
      }
      return newReplies;
    });
    setLocalRepliesCount((prev) => Math.max(0, prev - 1));
    onReplyDelete?.(replyId);
  };

  // ==================== React ====================
  const handleReact = async (type: ReactionType) => {
    if (!canInteract) return;

    try {
      if (reaction === type) {
        const result = await removeReaction(comment.id);
        setLikes(result.likes);
        setDislikes(result.dislikes);
        setReaction(null);
      } else {
        const result = await reactToComment(comment.id, type);
        setLikes(result.likes);
        setDislikes(result.dislikes);
        setReaction(result.myReaction);
      }
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  // ==================== Author Info ====================
  const authorName = `${comment.author.firstName} ${comment.author.lastName}`;
  const initial = comment.author.firstName.charAt(0);

  // ==================== JSX ====================
  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden
        ${
          comment.author.isAdmin
            ? "border border-[var(--griffin-gold)]/40 bg-gradient-to-br from-[var(--griffin-gold)]/8 via-transparent to-transparent"
            : isPending
              ? "border border-dashed border-amber-500/40 bg-amber-500/5"
              : isRejected
                ? "border border-rose-500/30 bg-rose-500/5"
                : "border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03]"
        }
        backdrop-blur-sm p-4
      `}
    >
      {comment.author.isAdmin && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
      )}

      {isPending && !comment.author.isAdmin && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      )}

      <div className="relative flex items-start gap-3">
        {/* آواتار */}
        <div className="relative shrink-0">
          {comment.author.isAdmin ? (
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-50" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                <Shield size={16} strokeWidth={2.3} />
              </div>
            </div>
          ) : (
            <div
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                text-white font-heading font-black text-sm shadow-lg
                ${
                  isPending
                    ? "bg-gradient-to-br from-amber-500 to-amber-700 opacity-60"
                    : "bg-gradient-to-br from-gray-500 to-gray-700 dark:from-gray-600 dark:to-gray-800"
                }
              `}
            >
              {initial}
            </div>
          )}
        </div>

        {/* محتوا */}
        <div className="flex-1 min-w-0">
          {/* هدر */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
                  {authorName}
                </span>

                {comment.author.isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600 text-white text-[9px] font-black shadow-sm">
                    <BadgeCheck size={9} strokeWidth={2.5} />
                    مدیر
                  </span>
                )}

                {isPending && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-black">
                    <Clock3 size={9} strokeWidth={2.5} />
                    در انتظار تایید
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[9px] font-black">
                    رد شده
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  @{comment.author.username}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-600">
                  ·
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {formatCommentDate(comment.createdAt)}
                </span>
              </div>
            </div>

            {/* منوی ویرایش/حذف */}
            {comment.isOwner && !isDeleted && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  <MoreVertical size={13} />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute left-0 top-8 z-20 min-w-[120px] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0d14] shadow-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onEdit?.(comment);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <Pencil size={12} />
                        ویرایش
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onDelete?.(comment);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 transition-colors border-t border-gray-100 dark:border-white/5"
                      >
                        <Trash2 size={12} />
                        حذف
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* امتیاز */}
          {!comment.parentId && comment.rating !== null && (
            <div className="mt-2">
              <StarRating value={comment.rating} readonly size={14} />
            </div>
          )}

          {/* محتوا */}
          {isDeleted ? (
            <p className="mt-2 text-xs italic text-gray-400 dark:text-gray-600">
              [این کامنت حذف شده است]
            </p>
          ) : (
            <p
              className={`
                mt-2 text-sm leading-7 whitespace-pre-wrap break-words
                ${
                  isPending
                    ? "text-gray-500 dark:text-gray-500"
                    : "text-gray-700 dark:text-gray-300"
                }
              `}
            >
              {comment.content}
            </p>
          )}

          {/* پیام pending */}
          {isPending && comment.isOwner && (
            <div className="mt-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 flex items-start gap-2">
              <Clock3 size={11} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 leading-5">
                نظر شما پس از تایید توسط ادمین برای دیگران نمایش داده می‌شود
              </p>
            </div>
          )}

          {/* پیام rejected */}
          {isRejected && comment.isOwner && (
            <div className="mt-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2 flex items-start gap-2">
              <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 leading-5">
                این نظر توسط ادمین رد شده است
              </p>
            </div>
          )}

          {/* اکشنها */}
          {isApproved && (
            <div className="mt-3 flex items-center gap-1 flex-wrap">
              <button
                type="button"
                disabled={!canInteract}
                onClick={() => void handleReact("like")}
                className={`
                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                  text-[11px] font-bold transition-all
                  ${
                    reaction === "like"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                  }
                `}
              >
                <ThumbsUp
                  size={12}
                  className={reaction === "like" ? "fill-emerald-500" : ""}
                />
                {likes > 0 && likes.toLocaleString("fa-IR")}
              </button>

              <button
                type="button"
                disabled={!canInteract}
                onClick={() => void handleReact("dislike")}
                className={`
                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                  text-[11px] font-bold transition-all
                  ${
                    reaction === "dislike"
                      ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                  }
                `}
              >
                <ThumbsDown
                  size={12}
                  className={reaction === "dislike" ? "fill-rose-500" : ""}
                />
                {dislikes > 0 && dislikes.toLocaleString("fa-IR")}
              </button>

              {canReply && (
                <button
                  type="button"
                  onClick={() => onReply?.(comment)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  پاسخ
                </button>
              )}

              {/* 🆕 دکمه نمایش پاسخها — فقط اگه پاسخ داره */}
              {localRepliesCount > 0 && (
                <button
                  type="button"
                  onClick={() => void toggleReplies()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 transition-all"
                >
                  {showReplies ? (
                    <>
                      <ChevronUp size={12} />
                      بستن
                    </>
                  ) : (
                    <>
                      <ChevronDown size={12} />
                      {localRepliesCount.toLocaleString("fa-IR")} پاسخ
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* لیست پاسخها */}
          {showReplies && isApproved && (
            <div className="mt-3 space-y-2 pr-2 border-r-2 border-gray-200 dark:border-white/5">
              {loadingReplies ? (
                <div className="flex items-center justify-center py-4">
                  <LoaderCircle
                    size={18}
                    className="text-[var(--griffin-gold)] animate-spin"
                  />
                </div>
              ) : (
                replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                    isAuthenticated={isAuthenticated}
                    hasSubscription={hasSubscription}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReplyDelete={handleReplyDelete}
                    replyReloadTrigger={replyReloadTrigger}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;