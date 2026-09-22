import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  FileQuestion,
  Filter,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  adminApproveComment,
  adminDeleteComment,
  adminListComments,
  adminRejectComment,
  formatCommentDate,
  getCommentStatusLabel,
  type CommentItem,
  type CommentStatus,
} from "../../api/commentApi";
import CommentReviewModal from "../../components/admin/CommentReviewModal";

type FilterTab = "ALL" | CommentStatus;

const statusStyles: Record<
  CommentStatus,
  { bg: string; text: string; icon: typeof CheckCircle2 }
> = {
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    icon: Clock3,
  },
  approved: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  rejected: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    icon: XCircle,
  },
  deleted: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    icon: Trash2,
  },
};

const AdminComments = () => {
  const navigate = useNavigate();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterTab>("pending");
  const [search, setSearch] = useState("");
  const [selectedComment, setSelectedComment] = useState<CommentItem | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState<string | null>(null);
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
        status: filter === "ALL" ? undefined : filter,
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

  // ==================== آمار ====================
  const stats = useMemo(() => {
    const pending = comments.filter((c) => c.status === "pending").length;
    const approved = comments.filter((c) => c.status === "approved").length;
    const rejected = comments.filter((c) => c.status === "rejected").length;
    return { pending, approved, rejected };
  }, [comments]);

  // ==================== فیلتر جستجو ====================
  const filteredComments = useMemo(() => {
    if (!search.trim()) return comments;
    const q = search.trim().toLowerCase();
    return comments.filter(
      (c) =>
        c.content.toLowerCase().includes(q) ||
        c.author.firstName.toLowerCase().includes(q) ||
        c.author.lastName.toLowerCase().includes(q) ||
        c.author.username.toLowerCase().includes(q),
    );
  }, [comments, search]);

  // ==================== Actions ====================
  const handleApprove = async (comment: CommentItem) => {
    setActionLoading(comment.id);
    try {
      await adminApproveComment(comment.id);
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id ? { ...c, status: "approved" } : c,
        ),
      );
      setSelectedComment(null);
    } catch (err) {
      console.error("Failed to approve:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (comment: CommentItem) => {
    setActionLoading(comment.id);
    try {
      await adminRejectComment(comment.id);
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id ? { ...c, status: "rejected" } : c,
        ),
      );
      setSelectedComment(null);
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (comment: CommentItem) => {
    if (!window.confirm("آیا از حذف این کامنت مطمئن هستی؟")) return;
    setActionLoading(comment.id);
    try {
      await adminDeleteComment(comment.id);
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
      setSelectedComment(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setActionLoading(null);
    }
  };

  // ==================== Tabs ====================
const tabs: { key: FilterTab; label: string; icon: typeof Clock3 }[] = [
  { key: "pending", label: "در انتظار", icon: Clock3 },
  { key: "approved", label: "تایید شده", icon: CheckCircle2 },
  { key: "rejected", label: "رد شده", icon: XCircle },
  { key: "ALL", label: "همه", icon: Filter },
];

  // ==================== JSX ====================
  return (
    <>
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl space-y-5">
          {/* ==================== Back ==================== */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
          >
            <ArrowLeft
              size={13}
              className="transition-transform group-hover:-translate-x-1"
            />
            بازگشت به داشبورد
          </button>

          {/* ==================== HERO ==================== */}
          <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/25 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />

            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0 self-center sm:self-auto">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                  <MessageSquare size={32} strokeWidth={2.3} />
                </div>
                {stats.pending > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-6 min-w-[24px] px-1.5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black shadow-lg border-2 border-[#080B12] animate-pulse">
                    {stats.pending.toLocaleString("fa-IR")}
                  </span>
                )}
              </div>

              <div className="flex-1 text-center sm:text-right">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Sparkles
                    size={12}
                    className="text-[var(--griffin-gold)] animate-pulse"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Admin Panel
                  </span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                  مدیریت نظرات
                </h1>

                <p className="mt-1.5 text-sm text-gray-400">
                  {stats.pending > 0
                    ? `${stats.pending.toLocaleString("fa-IR")} نظر در انتظار تایید`
                    : "همه نظرات بررسی شده"}
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

          {/* ==================== ۳ کارت آمار ==================== */}
          <section className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Clock3,
                label: "در انتظار",
                value: stats.pending,
                color: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-500/10",
              },
              {
                icon: CheckCircle2,
                label: "تایید شده",
                value: stats.approved,
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                icon: XCircle,
                label: "رد شده",
                value: stats.rejected,
                color: "text-rose-600 dark:text-rose-400",
                bg: "bg-rose-500/10",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon size={16} className={stat.color} />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p
                    className={`font-heading text-2xl font-black mt-1 tabular-nums ${stat.color}`}
                  >
                    {stat.value.toLocaleString("fa-IR")}
                  </p>
                </div>
              );
            })}
          </section>

          {/* ==================== Filters ==================== */}
          <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
            <div className="p-4 border-b border-gray-200/70 dark:border-white/5">
              <div className="flex flex-wrap gap-2 mb-3">
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
                            ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                            : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
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
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو در محتوا، نام یا نام کاربری..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-2.5 pr-10 pl-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                />
              </div>
            </div>

            {/* ==================== لیست ==================== */}
            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center space-y-3">
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
                      <LoaderCircle
                        size={24}
                        className="text-white animate-spin"
                      />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    در حال دریافت نظرات...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center mb-3">
                  <AlertCircle size={24} className="text-rose-500" />
                </div>
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
                    ? "نظری با این جستجو پیدا نشد"
                    : filter === "pending"
                      ? "نظری در انتظار تایید نیست"
                      : "نظری در این وضعیت نیست"}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    onView={() => setSelectedComment(comment)}
                    onApprove={() => void handleApprove(comment)}
                    onReject={() => void handleReject(comment)}
                    onDelete={() => void handleDelete(comment)}
                    actionLoading={actionLoading === comment.id}
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
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                    onClick={() => void load(pagination.page + 1)}
                    className="px-3 py-2 rounded-lg bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30 disabled:opacity-30 transition-all text-[10px] font-black"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ==================== Modal ==================== */}
      {selectedComment && (
        <CommentReviewModal
          comment={selectedComment}
          onClose={() => setSelectedComment(null)}
          onApprove={() => void handleApprove(selectedComment)}
          onReject={() => void handleReject(selectedComment)}
          onDelete={() => void handleDelete(selectedComment)}
          loading={actionLoading === selectedComment.id}
        />
      )}
    </>
  );
};

// ==================== CommentCard ====================
interface CommentCardProps {
  comment: CommentItem;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  actionLoading: boolean;
}

const CommentCard = ({
  comment,
  onView,
  onApprove,
  onReject,
  onDelete,
  actionLoading,
}: CommentCardProps) => {
  const statusStyle = statusStyles[comment.status] ?? statusStyles.pending;
  const StatusIcon = statusStyle.icon;

  return (
    <div
      className={`
        group relative rounded-2xl overflow-hidden border
        ${
          comment.author.isAdmin
            ? "border-[var(--griffin-gold)]/40 bg-gradient-to-br from-[var(--griffin-gold)]/8 via-transparent to-transparent"
            : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]"
        }
        p-4 hover:border-[var(--griffin-gold)]/40 transition-all duration-300
      `}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* محتوا */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {/* آواتار */}
            <div className="relative shrink-0">
              {comment.author.isAdmin ? (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-md">
                  <Shield size={13} strokeWidth={2.3} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white font-heading font-black text-xs">
                  {comment.author.firstName.charAt(0)}
                </div>
              )}
            </div>

            <span className="font-heading text-xs font-black text-gray-900 dark:text-white">
              {comment.author.firstName} {comment.author.lastName}
            </span>

            {comment.author.isAdmin && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600 text-white text-[8px] font-black">
                <BadgeCheck size={8} strokeWidth={2.5} />
                مدیر
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black ${statusStyle.bg} ${statusStyle.text}`}
            >
              <StatusIcon size={8} />
              {getCommentStatusLabel(comment.status)}
            </span>

            {comment.parentId && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] font-black">
                پاسخ
              </span>
            )}
          </div>

          {/* محتوا */}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-7 line-clamp-3 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* اطلاعات */}
          <div className="flex items-center gap-3 mt-2 flex-wrap text-[10px] text-gray-500 dark:text-gray-400">
            {comment.exam && (
              <span className="inline-flex items-center gap-1">
                <FileQuestion size={10} />
                {comment.exam.title}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Calendar size={10} />
              {formatCommentDate(comment.createdAt)}
            </span>
            {comment.rating !== null && (
              <span className="inline-flex items-center gap-1">
                <Star size={10} className="fill-amber-400 text-amber-400" />
                {comment.rating.toLocaleString("fa-IR")}
              </span>
            )}
          </div>

          {/* آمار */}
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <ThumbsUp size={10} />
              {comment.likes.toLocaleString("fa-IR")}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
              <ThumbsDown size={10} />
              {comment.dislikes.toLocaleString("fa-IR")}
            </span>
            {comment.repliesCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--griffin-gold)]">
                <MessageSquare size={10} />
                {comment.repliesCount.toLocaleString("fa-IR")} پاسخ
              </span>
            )}
          </div>
        </div>

        {/* دکمهها */}
        <div className="shrink-0 flex items-center gap-1 self-start">
          <button
            type="button"
            onClick={onView}
            disabled={actionLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/15 hover:text-[var(--griffin-gold)] disabled:opacity-40 transition-all"
            title="مشاهده"
          >
            <Eye size={13} />
          </button>

          {comment.status === "pending" && (
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
                  <CheckCircle2 size={13} />
                )}
              </button>
              <button
                type="button"
                onClick={onReject}
                disabled={actionLoading}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 disabled:opacity-40 transition-all"
                title="رد"
              >
                <XCircle size={13} />
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

export default AdminComments;
