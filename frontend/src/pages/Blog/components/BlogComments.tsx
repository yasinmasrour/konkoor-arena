import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MessageSquare,
  MoreVertical,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  createComment,
  createReply,
  deleteComment,
  getCommentReplies,
  getPostComments,
  updateComment,
  formatBlogDate,
  type BlogComment,
} from "../../../api/blogApi";
import { useAuth } from "../../../context/AuthContext";

interface BlogCommentsProps {
  postId: string;
}

const BlogComments = ({ postId }: BlogCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const isAuthenticated = !!user;

  // ==================== Load ====================
  const load = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await getPostComments(postId, { page, limit: 20 });
      setComments(result.comments);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setError("دریافت نظرات انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // ==================== Submit ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const result = await createComment(postId, newComment.trim());
      if (result.comment.status === "approved") {
        setComments((prev) => [result.comment, ...prev]);
      } else {
        // pending — به لیست اضافه کن
        setComments((prev) => [result.comment, ...prev]);
      }
      setNewComment("");
    } catch (err) {
      console.error("Failed to submit comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== JSX ====================
  return (
    <section className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

      {/* ==================== هدر ==================== */}
      <div className="relative p-5 border-b border-gray-200/70 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
            <MessageSquare size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Comments
            </p>
            <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white -mt-0.5">
              نظرات
              <span className="text-xs text-gray-400 font-bold mr-2">
                ({pagination.total.toLocaleString("fa-IR")})
              </span>
            </h2>
          </div>
        </div>
      </div>

      {/* ==================== فرم ==================== */}
      {isAuthenticated ? (
        <form
          onSubmit={handleSubmit}
          className="p-5 border-b border-gray-200/70 dark:border-white/5 bg-[var(--griffin-gold)]/5"
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="نظر خودت رو بنویس..."
            rows={3}
            maxLength={2000}
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all resize-none leading-7"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {newComment.length.toLocaleString("fa-IR")} / ۲٬۰۰۰
            </span>
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={13} className="animate-spin" />
                  در حال ثبت...
                </>
              ) : (
                <>
                  <Send size={13} />
                  ثبت نظر
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 flex items-start gap-2">
            <AlertCircle size={13} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 leading-5">
              برای ثبت نظر باید وارد حساب خودت بشی
            </p>
          </div>
        </div>
      )}

      {/* ==================== لیست ==================== */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
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
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              isAuthenticated={isAuthenticated}
              onUpdate={(updated) => {
                setComments((prev) =>
                  prev.map((c) => (c.id === updated.id ? updated : c)),
                );
              }}
              onDelete={(id) => {
                setComments((prev) => prev.filter((c) => c.id !== id));
              }}
            />
          ))}
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
    </section>
  );
};

// ==================== CommentItem ====================
interface CommentItemProps {
  comment: BlogComment;
  postId: string;
  isAuthenticated: boolean;
  onUpdate: (comment: BlogComment) => void;
  onDelete: (id: string) => void;
}

const CommentItem = ({
  comment,
  isAuthenticated,
  onUpdate,
  onDelete,
}: CommentItemProps) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<BlogComment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [deleting, setDeleting] = useState(false);

  const isPending = comment.status === "pending";
  const isApproved = comment.status === "approved";

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
      setRepliesLoaded(true);
    } catch (err) {
      console.error("Failed to load replies:", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  // ==================== Submit Reply ====================
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      const result = await createReply(comment.id, replyContent.trim());
      setReplies((prev) => [...prev, result.reply]);
      setReplyContent("");
      setShowReplyForm(false);
    } catch (err) {
      console.error("Failed to submit reply:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  // ==================== Edit ====================
  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    try {
      const result = await updateComment(comment.id, editContent.trim());
      onUpdate({ ...comment, ...result.comment });
      setEditing(false);
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  // ==================== Delete ====================
  const handleDelete = async () => {
    if (!window.confirm("آیا از حذف این نظر مطمئنی؟")) return;
    setDeleting(true);
    try {
      await deleteComment(comment.id);
      onDelete(comment.id);
    } catch (err) {
      console.error("Failed to delete:", err);
      setDeleting(false);
    }
  };

  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden border p-4
        ${
          comment.author.isOwner || false
            ? "border-[var(--griffin-gold)]/30 bg-[var(--griffin-gold)]/5"
            : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]"
        }
        ${isPending ? "border-dashed border-amber-500/40 bg-amber-500/5" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center text-white font-heading font-black text-sm shadow-lg shrink-0">
          {comment.author.firstName.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-heading text-sm font-black text-gray-900 dark:text-white">
                  {comment.author.firstName} {comment.author.lastName}
                </span>
                {isPending && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-black">
                    <Clock3 size={9} />
                    در انتظار تایید
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                <span>@{comment.author.username}</span>
                <span>·</span>
                <span>{formatBlogDate(comment.createdAt)}</span>
              </div>
            </div>

            {/* Menu */}
            {comment.isOwner && !isPending && (
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
                          setEditing(true);
                          setEditContent(comment.content);
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
                          void handleDelete();
                        }}
                        disabled={deleting}
                        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 disabled:opacity-40 transition-colors border-t border-gray-100 dark:border-white/5"
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

          {/* Content */}
          {editing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                maxLength={2000}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all resize-none leading-7"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleSaveEdit()}
                  disabled={!editContent.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-2 text-[10px] font-black hover:bg-emerald-500/20 disabled:opacity-40 transition-all"
                >
                  <CheckCircle2 size={11} />
                  ذخیره
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 px-3 py-2 text-[10px] font-black hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                  <X size={11} />
                  لغو
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm leading-7 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!editing && isApproved && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
                >
                  پاسخ
                </button>
              )}
              {(comment.repliesCount ?? 0) > 0 && (
                <button
                  type="button"
                  onClick={() => void toggleReplies()}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 transition-all"
                >
                  {showReplies
                    ? "بستن"
                    : `${(comment.repliesCount ?? 0).toLocaleString("fa-IR")} پاسخ`}
                </button>
              )}
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleSubmitReply} className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="پاسخ خودت رو بنویس..."
                rows={2}
                maxLength={2000}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all resize-none leading-7"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submittingReply || !replyContent.trim()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-3 py-2 text-[10px] font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 disabled:opacity-40 transition-all"
                >
                  {submittingReply ? (
                    <LoaderCircle size={11} className="animate-spin" />
                  ) : (
                    <Send size={11} />
                  )}
                  ثبت پاسخ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500 px-3 py-2 text-[10px] font-black hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                >
                  <X size={11} />
                  لغو
                </button>
              </div>
            </form>
          )}

          {/* Replies */}
          {showReplies && (
            <div className="mt-3 space-y-2 pr-3 border-r-2 border-gray-200 dark:border-white/5">
              {loadingReplies ? (
                <div className="flex items-center justify-center py-4">
                  <LoaderCircle
                    size={18}
                    className="text-[var(--griffin-gold)] animate-spin"
                  />
                </div>
              ) : (
                replies.map((reply) => (
                  <div
                    key={reply.id}
                    className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-3"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white font-heading font-black text-[10px] shrink-0">
                        {reply.author.firstName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-heading text-xs font-black text-gray-900 dark:text-white">
                            {reply.author.firstName} {reply.author.lastName}
                          </span>
                          {reply.status === "pending" && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-black">
                              <Clock3 size={8} />
                              در انتظار
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 leading-6 whitespace-pre-wrap break-words">
                          {reply.content}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-500 dark:text-gray-400">
                          <span>@{reply.author.username}</span>
                          <span>·</span>
                          <span>{formatBlogDate(reply.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogComments;
