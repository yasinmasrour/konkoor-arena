import { useEffect, useState } from "react";
import {
  AlertCircle,
  Clock3,
  LoaderCircle,
  MessageSquare,
  Send,
  Star,
  X,
} from "lucide-react";
import {
  createComment,
  createReply,
  deleteComment,
  getExamComments,
  getExamCommentStats,
  getMyComments,
  type CommentItem as CommentItemType,
  type CommentStats,
} from "../../api/commentApi";
import { useAuth } from "../../context/AuthContext";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import CommentEditModal from "./CommentEditModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

interface CommentsSectionProps {
  examId: string;
}

const CommentsSection = ({ examId }: CommentsSectionProps) => {
  const { user, hasExamAccess } = useAuth();
  const [comments, setComments] = useState<CommentItemType[]>([]);
  const [myPendingComments, setMyPendingComments] = useState<CommentItemType[]>(
    [],
  );
  const [myPendingReplies, setMyPendingReplies] = useState<CommentItemType[]>(
    [],
  );
  const [stats, setStats] = useState<CommentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [showForm, setShowForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommentItemType | null>(null);
  const [editingComment, setEditingComment] = useState<CommentItemType | null>(
    null,
  );
  const [deletingComment, setDeletingComment] =
    useState<CommentItemType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [replyReloadCounter, setReplyReloadCounter] = useState(0);

  const isAuthenticated = !!user;

  // 🆕 دسترسی: کاربر با اشتراک exams یا خرید تکی این آزمون یا ADMIN
  const hasAccess = isAuthenticated && hasExamAccess(examId);

  // ==================== Load Comments ====================
  const load = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const [commentsData, statsData] = await Promise.all([
        getExamComments(examId, { page, limit: pagination.limit }),
        getExamCommentStats(examId),
      ]);
      setComments(commentsData.comments);
      setPagination(commentsData.pagination);
      setStats(statsData);

      if (isAuthenticated) {
        try {
          const myCommentsData = await getMyComments({ limit: 100 });

          const pendingRoots = myCommentsData.comments.filter(
            (c) =>
              c.exam?.id === examId && c.status === "pending" && !c.parentId,
          );

          const pendingReplies = myCommentsData.comments.filter(
            (c) =>
              c.exam?.id === examId && c.status === "pending" && !!c.parentId,
          );

          setMyPendingComments(pendingRoots);
          setMyPendingReplies(pendingReplies);
        } catch (err) {
          console.error("Failed to load my comments:", err);
        }
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
      setError("دریافت نظرات انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!examId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, isAuthenticated]);

  // ==================== Submit Root Comment ====================
  const handleSubmit = async (data: {
    content: string;
    rating?: number | null;
  }) => {
    const result = await createComment(examId, data);

    if (result.comment.status === "approved") {
      setComments((prev) => [result.comment, ...prev]);
      setStats((prev) =>
        prev
          ? {
              ...prev,
              totalComments: prev.totalComments + 1,
              ratingsCount:
                data.rating !== null && data.rating !== undefined
                  ? prev.ratingsCount + 1
                  : prev.ratingsCount,
            }
          : prev,
      );
    } else {
      const pendingComment: CommentItemType = {
        ...result.comment,
        exam: comments[0]?.exam,
      };
      setMyPendingComments((prev) => [pendingComment, ...prev]);
    }

    setShowForm(false);
  };

  // ==================== Submit Reply ====================
  const handleSubmitReply = async (data: { content: string }) => {
    if (!replyingTo) return;

    const result = await createReply(replyingTo.id, {
      content: data.content,
    });

    if (result.reply.status === "approved") {
      await load(pagination.page);
    } else {
      const pendingReply: CommentItemType = {
        ...result.reply,
        exam: comments[0]?.exam,
      };
      setMyPendingReplies((prev) => [pendingReply, ...prev]);
    }

    setReplyingTo(null);
  };

  // ==================== Edit Success ====================
  const handleEditSuccess = (updated: CommentItemType) => {
    if (updated.status === "approved") {
      setComments((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
    } else {
      setComments((prev) => prev.filter((c) => c.id !== updated.id));

      if (!updated.parentId) {
        setMyPendingComments((prev) => {
          const exists = prev.find((c) => c.id === updated.id);
          if (exists) {
            return prev.map((c) => (c.id === updated.id ? updated : c));
          }
          return [updated, ...prev];
        });
      } else {
        setMyPendingReplies((prev) => {
          const exists = prev.find((c) => c.id === updated.id);
          if (exists) {
            return prev.map((c) => (c.id === updated.id ? updated : c));
          }
          return [updated, ...prev];
        });
      }
    }

    setEditingComment(null);
  };

  // ==================== Delete Confirm ====================
  const handleDeleteConfirm = async () => {
    if (!deletingComment) return;
    const targetId = deletingComment.id;
    const isReply = !!deletingComment.parentId;
    setActionLoading(true);
    try {
      await deleteComment(targetId);

      setComments((prev) => prev.filter((c) => c.id !== targetId));
      setMyPendingComments((prev) => prev.filter((c) => c.id !== targetId));
      setMyPendingReplies((prev) => prev.filter((c) => c.id !== targetId));

      if (isReply) {
        setReplyReloadCounter((prev) => prev + 1);
      }

      setDeletingComment(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplyDelete = (replyId: string) => {
    setMyPendingReplies((prev) => prev.filter((r) => r.id !== replyId));
  };

  const getPendingRepliesFor = (parentId: string) =>
    myPendingReplies.filter((r) => r.parentId === parentId);

  // ==================== JSX ====================
  return (
    <section className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

      {/* ==================== هدر ==================== */}
      <div className="relative p-5 border-b border-gray-200/70 dark:border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
              <MessageSquare size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Comments
              </p>
              <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white -mt-0.5">
                نظرات و امتیازها
              </h2>
            </div>
          </div>

          {stats && (
            <div className="flex items-center gap-4 shrink-0">
              {stats.averageRating !== null && (
                <div className="text-center">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span className="font-heading text-xl font-black text-gray-900 dark:text-white tabular-nums">
                      {stats.averageRating.toLocaleString("fa-IR")}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
                    از {stats.ratingsCount.toLocaleString("fa-IR")} نظر
                  </p>
                </div>
              )}

              <div className="text-center">
                <p className="font-heading text-xl font-black text-gray-900 dark:text-white tabular-nums">
                  {stats.totalComments.toLocaleString("fa-IR")}
                </p>
                <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
                  نظر
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 🆕 دکمه ثبت — بر اساس hasExamAccess */}
        {isAuthenticated && hasAccess && !showForm && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 px-4 py-2.5 text-xs font-black text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 transition-all"
            >
              <Send size={13} />
              ثبت نظر
            </button>
          </div>
        )}

        {/* 🆕 پیام دسترسی نداشتن */}
        {isAuthenticated && !hasAccess && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
            <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 leading-5">
              برای ثبت نظر باید اشتراک فعال داشته باشید یا این آزمون را خریداری
              کنید
            </p>
          </div>
        )}

        {!isAuthenticated && (
          <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 flex items-start gap-2">
            <AlertCircle size={13} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 leading-5">
              برای ثبت نظر باید وارد حساب خود شوید
            </p>
          </div>
        )}
      </div>

      {/* ==================== فرم ثبت ==================== */}
      {showForm && (
        <div className="p-5 border-b border-gray-200/70 dark:border-white/5 bg-[var(--griffin-gold)]/5">
          <CommentForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            showRating
          />
        </div>
      )}

      {/* ==================== کامنت‌های در انتظار من ==================== */}
      {isAuthenticated && myPendingComments.length > 0 && (
        <div className="p-4 border-b border-gray-200/70 dark:border-white/5 bg-amber-500/5 space-y-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
            <Clock3 size={13} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 leading-5">
                {myPendingComments.length === 1
                  ? "۱ نظر شما در انتظار تایید است"
                  : `${myPendingComments.length.toLocaleString("fa-IR")} نظر شما در انتظار تایید است`}
              </p>
              <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70 leading-5 mt-0.5">
                نظرات شما پس از تایید توسط ادمین برای دیگران نمایش داده می‌شوند.
              </p>
            </div>
          </div>

          {myPendingComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isAuthenticated={isAuthenticated}
              hasSubscription={false}
              onEdit={(c) => setEditingComment(c)}
              onDelete={(c) => setDeletingComment(c)}
            />
          ))}
        </div>
      )}

      {/* ==================== لیست ==================== */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center space-y-3">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
                <LoaderCircle size={20} className="text-white animate-spin" />
              </div>
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              در حال دریافت نظرات...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <AlertCircle size={28} className="mx-auto text-rose-500 mb-3" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
            {error}
          </p>
        </div>
      ) : comments.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
            <MessageSquare
              size={28}
              className="text-gray-400 dark:text-gray-600"
            />
          </div>
          <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
            هنوز نظری ثبت نشده
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            اولین نفری باش که نظرش رو می‌نویسه!
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {comments.map((comment) => {
            const pendingReplies = getPendingRepliesFor(comment.id);

            return (
              <div key={comment.id} className="space-y-3">
                <CommentItem
                  comment={comment}
                  isAuthenticated={isAuthenticated}
                  hasSubscription={hasAccess}
                  onReply={(c) => setReplyingTo(c)}
                  onEdit={(c) => setEditingComment(c)}
                  onDelete={(c) => setDeletingComment(c)}
                  onReplyDelete={handleReplyDelete}
                  replyReloadTrigger={replyReloadCounter}
                />

                {pendingReplies.length > 0 && (
                  <div className="mr-12 space-y-2 pr-2 border-r-2 border-amber-500/30">
                    {pendingReplies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        depth={1}
                        isAuthenticated={isAuthenticated}
                        hasSubscription={false}
                        onEdit={(c) => setEditingComment(c)}
                        onDelete={(c) => setDeletingComment(c)}
                        onReplyDelete={handleReplyDelete}
                      />
                    ))}
                  </div>
                )}

                {replyingTo?.id === comment.id && (
                  <div className="mr-12 rounded-2xl border border-[var(--griffin-gold)]/30 bg-[var(--griffin-gold)]/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] font-black text-[var(--griffin-gold)]">
                        پاسخ به {comment.author.firstName}{" "}
                        {comment.author.lastName}
                      </p>
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center bg-white/5 text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                      >
                        <X size={11} />
                      </button>
                    </div>
                    <CommentForm
                      onSubmit={handleSubmitReply}
                      onCancel={() => setReplyingTo(null)}
                      showRating={false}
                      placeholder="پاسخ خودت رو بنویس..."
                      submitLabel="ثبت پاسخ"
                      compact
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== Pagination ==================== */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200/70 dark:border-white/5">
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
            صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
            {pagination.totalPages.toLocaleString("fa-IR")}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => void load(pagination.page - 1)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-all text-[10px] font-black"
            >
              قبلی
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => void load(pagination.page + 1)}
              className="px-3 py-2 rounded-lg bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30 disabled:opacity-30 transition-all text-[10px] font-black"
            >
              بعدی
            </button>
          </div>
        </div>
      )}

      {/* ==================== Modal ویرایش ==================== */}
      {editingComment && (
        <CommentEditModal
          comment={editingComment}
          onClose={() => setEditingComment(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* ==================== Modal حذف ==================== */}
      {deletingComment && (
        <ConfirmDeleteModal
          title="حذف نظر"
          message="آیا از حذف این نظر مطمئن هستی؟ این عمل قابل بازگشت نیست."
          onClose={() => setDeletingComment(null)}
          onConfirm={() => void handleDeleteConfirm()}
          loading={actionLoading}
        />
      )}
    </section>
  );
};

export default CommentsSection;
