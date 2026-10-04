import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock3,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  adminApproveComment,
  adminDeleteComment,
  adminListComments,
  adminRejectComment,
  formatBlogDate,
  type BlogComment,
  type BlogCommentStatus,
} from "../../api/blogApi";
import ConfirmDeleteModal from "../../components/comments/ConfirmDeleteModal";

type FilterTab = "all" | BlogCommentStatus;

const AdminBlogComments = () => {
  const navigate = useNavigate();

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterTab>("pending");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deletingComment, setDeletingComment] = useState<BlogComment | null>(
    null,
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // ==================== Load ====================
  const load = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await adminListComments({
        status: filter === "all" ? undefined : filter,
        page,
        limit: pagination.limit,
      });
      setComments(result.comments);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load comments:", err);
      setError("دریافت کامنت‌ها انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ==================== Actions ====================
  const handleApprove = async (comment: BlogComment) => {
    setActionLoading(comment.id);
    try {
      await adminApproveComment(comment.id);
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id ? { ...c, status: "approved" } : c,
        ),
      );
    } catch (err) {
      console.error("Failed to approve:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (comment: BlogComment) => {
    const note = window.prompt("دلیل رد (اختیاری):");
    if (note === null) return;

    setActionLoading(comment.id);
    try {
      await adminRejectComment(comment.id, note);
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id ? { ...c, status: "rejected" } : c,
        ),
      );
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingComment) return;
    setActionLoading(deletingComment.id);
    try {
      await adminDeleteComment(deletingComment.id);
      setComments((prev) => prev.filter((c) => c.id !== deletingComment.id));
      setDeletingComment(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ==================== Filter (client-side) ====================
  const filteredComments = search.trim()
    ? comments.filter((c) => {
        const q = search.trim().toLowerCase();
        return (
          c.content.toLowerCase().includes(q) ||
          c.author.firstName.toLowerCase().includes(q) ||
          c.author.lastName.toLowerCase().includes(q) ||
          c.author.username.toLowerCase().includes(q)
        );
      })
    : comments;

  // ==================== Tabs ====================
  const tabs: { key: FilterTab; label: string; icon: typeof Clock3 }[] = [
    { key: "pending", label: "در انتظار", icon: Clock3 },
    { key: "approved", label: "تایید شده", icon: Check },
    { key: "rejected", label: "رد شده", icon: XCircle },
    { key: "all", label: "همه", icon: MessageSquare },
  ];

  // ==================== JSX ====================
  return (
    <>
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl space-y-5">
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/admin/blog")}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
          >
            <ArrowLeft
              size={13}
              className="transition-transform group-hover:-translate-x-1"
            />
            بازگشت به مدیریت وبلاگ
          </button>

          {/* Hero */}
          <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-purple-600/15 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/25 blur-[100px]" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0 self-center sm:self-auto">
                <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                  <MessageSquare size={32} strokeWidth={2.3} />
                </div>
              </div>

              <div className="flex-1 text-center sm:text-right">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Admin Panel
                  </span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                  مدیریت کامنت‌های وبلاگ
                </h1>

                <p className="mt-1.5 text-sm text-gray-400">
                  {pagination.total > 0
                    ? `${pagination.total.toLocaleString("fa-IR")} کامنت`
                    : "کامنت‌ها رو مدیریت کن"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void load(pagination.page)}
                disabled={loading}
                className="shrink-0 self-center sm:self-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 backdrop-blur-sm px-4 py-2.5 font-black text-[var(--griffin-gold)] text-xs hover:bg-[var(--griffin-gold)]/10 disabled:opacity-40 transition-all"
              >
                <RefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
                بروزرسانی
              </button>
            </div>
          </section>

          {/* Filters */}
          <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
            <div className="p-4 border-b border-gray-200/70 dark:border-white/5 space-y-3">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = filter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setFilter(tab.key)}
                      className={`
                        inline-flex items-center gap-1.5 rounded-xl px-3 py-2
                        text-[11px] font-black transition-all
                        ${
                          isActive
                            ? "bg-gradient-to-l from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30"
                            : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-emerald-500/40 hover:text-emerald-500"
                        }
                      `}
                    >
                      <Icon size={12} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="relative">
                <Search
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو در محتوا یا نام کاربر..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-2.5 pr-10 pl-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                />
              </div>
            </div>

            {/* List */}
            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center space-y-3">
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-50 animate-pulse" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                      <LoaderCircle
                        size={24}
                        className="text-white animate-spin"
                      />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    در حال دریافت...
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
            ) : filteredComments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                  <MessageSquare
                    size={28}
                    className="text-gray-400 dark:text-gray-600"
                  />
                </div>
                <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
                  {search.trim()
                    ? "کامنتی پیدا نشد"
                    : filter === "pending"
                      ? "کامنت در انتظاری نیست"
                      : "کامنتی در این وضعیت نیست"}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onApprove={() => void handleApprove(comment)}
                    onReject={() => void handleReject(comment)}
                    onDelete={() => setDeletingComment(comment)}
                    actionLoading={actionLoading === comment.id}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
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
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-emerald-500/40 hover:text-emerald-500 disabled:opacity-30 transition-all text-[10px] font-black"
                  >
                    قبلی
                  </button>
                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                    onClick={() => void load(pagination.page + 1)}
                    className="px-3 py-2 rounded-lg bg-gradient-to-l from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 disabled:opacity-30 transition-all text-[10px] font-black"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {deletingComment && (
        <ConfirmDeleteModal
          title="حذف کامنت"
          message="آیا از حذف این کامنت مطمئنی؟"
          onClose={() => setDeletingComment(null)}
          onConfirm={() => void handleDeleteConfirm()}
          loading={actionLoading === deletingComment.id}
        />
      )}
    </>
  );
};

// ==================== CommentCard ====================
interface CommentCardProps {
  comment: BlogComment;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  actionLoading: boolean;
}

const CommentCard = ({
  comment,
  onApprove,
  onReject,
  onDelete,
  actionLoading,
}: CommentCardProps) => {
  const isPending = comment.status === "pending";
  const isApproved = comment.status === "approved";

  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden border p-4 transition-all
        ${
          isPending
            ? "border-dashed border-amber-500/40 bg-amber-500/5"
            : isApproved
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-rose-500/30 bg-rose-500/5"
        }
      `}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center text-white font-heading font-black text-base shadow-lg shrink-0">
          {comment.author.firstName.charAt(0)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black
                ${
                  isPending
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : isApproved
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                }
              `}
            >
              {isPending
                ? "در انتظار تایید"
                : isApproved
                  ? "تایید شده"
                  : "رد شده"}
            </span>
            {comment.parentId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-black">
                پاسخ
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-heading text-sm font-black text-gray-900 dark:text-white">
              {comment.author.firstName} {comment.author.lastName}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              @{comment.author.username}
            </span>
          </div>

          <p className="mt-2 text-sm leading-7 text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          <div className="mt-2 flex items-center gap-3 flex-wrap text-[10px] text-gray-500 dark:text-gray-400">
            <span>{formatBlogDate(comment.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex sm:flex-col items-center gap-1 self-start">
          {isPending && (
            <>
              <button
                type="button"
                onClick={onApprove}
                disabled={actionLoading}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-40 transition-all"
                title="تایید"
              >
                {actionLoading ? (
                  <LoaderCircle size={13} className="animate-spin" />
                ) : (
                  <Check size={13} strokeWidth={3} />
                )}
              </button>
              <button
                type="button"
                onClick={onReject}
                disabled={actionLoading}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 disabled:opacity-40 transition-all"
                title="رد"
              >
                <X size={13} />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onDelete}
            disabled={actionLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-rose-500/15 hover:text-rose-500 disabled:opacity-40 transition-all"
            title="حذف"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogComments;
