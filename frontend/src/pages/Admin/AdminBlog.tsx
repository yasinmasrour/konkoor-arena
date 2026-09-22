import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  adminApprovePost,
  adminDeletePost,
  adminListPosts,
  adminRejectPost,
  adminToggleFeatured,
  formatBlogDate,
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type BlogPost,
  type BlogStatus,
} from "../../api/blogApi";
import ConfirmDeleteModal from "../../components/comments/ConfirmDeleteModal";

type FilterTab = "all" | BlogStatus;

const AdminBlog = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterTab>("pending");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deletingPost, setDeletingPost] = useState<BlogPost | null>(null);
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
      const result = await adminListPosts({
        status: filter === "all" ? undefined : filter,
        search: search.trim() || undefined,
        page,
        limit: pagination.limit,
      });
      setPosts(result.posts);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError("دریافت مقالات انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ==================== Actions ====================
  const handleApprove = async (post: BlogPost) => {
    setActionLoading(post.id);
    try {
      const result = await adminApprovePost(post.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, ...result.post } : p,
        ),
      );
    } catch (err) {
      console.error("Failed to approve:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (post: BlogPost) => {
    const note = window.prompt("دلیل رد (اختیاری):");
    if (note === null) return;

    setActionLoading(post.id);
    try {
      const result = await adminRejectPost(post.id, note);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, ...result.post } : p,
        ),
      );
    } catch (err) {
      console.error("Failed to reject:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (post: BlogPost) => {
    setActionLoading(post.id);
    try {
      const result = await adminToggleFeatured(post.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, ...result.post } : p,
        ),
      );
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPost) return;
    setActionLoading(deletingPost.id);
    try {
      await adminDeletePost(deletingPost.id);
      setPosts((prev) => prev.filter((p) => p.id !== deletingPost.id));
      setDeletingPost(null);
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void load(1);
  };

  // ==================== Tabs ====================
  const tabs: { key: FilterTab; label: string; icon: typeof FileText }[] = [
    { key: "pending", label: "در انتظار", icon: Clock3 },
    { key: "published", label: "منتشرشده", icon: CheckCircle2 },
    { key: "rejected", label: "رد شده", icon: XCircle },
    { key: "draft", label: "پیش‌نویس", icon: FileText },
    { key: "all", label: "همه", icon: BookOpen },
  ];

  // ==================== JSX ====================
  return (
    <>
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl space-y-5">
          {/* Back */}
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

          {/* Hero */}
          <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/25 blur-[100px]" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0 self-center sm:self-auto">
                <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                  <BookOpen size={32} strokeWidth={2.3} />
                </div>
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
                  مدیریت وبلاگ
                </h1>

                <p className="mt-1.5 text-sm text-gray-400">
                  {pagination.total > 0
                    ? `${pagination.total.toLocaleString("fa-IR")} مقاله`
                    : "مقالات رو مدیریت کن"}
                </p>
              </div>

              <div className="shrink-0 self-center sm:self-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/admin/blog/comments")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-black text-gray-300 text-xs hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
                >
                  <MessageSquare size={13} />
                  کامنت‌ها
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/admin/blog/new")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-purple-500 to-purple-700 px-4 py-2.5 font-black text-white text-xs shadow-lg shadow-purple-500/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <Sparkles size={13} />
                  مقاله جدید
                </button>

                <button
                  type="button"
                  onClick={() => void load(pagination.page)}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 backdrop-blur-sm px-4 py-2.5 font-black text-[var(--griffin-gold)] text-xs hover:bg-[var(--griffin-gold)]/10 disabled:opacity-40 transition-all"
                >
                  <RefreshCw
                    size={13}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </div>
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
                            ? "bg-gradient-to-l from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/30"
                            : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-purple-500/40 hover:text-purple-500"
                        }
                      `}
                    >
                      <Icon size={12} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSearch} className="relative">
                <Search
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو در عنوان، خلاصه یا slug..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-2.5 pr-10 pl-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                />
              </form>
            </div>

            {/* List */}
            {loading ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center space-y-3">
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-50 animate-pulse" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
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
            ) : posts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                  <BookOpen
                    size={28}
                    className="text-gray-400 dark:text-gray-600"
                  />
                </div>
                <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
                  مقاله‌ای در این وضعیت نیست
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {posts.map((post) => (
                  <AdminPostCard
                    key={post.id}
                    post={post}
                    onView={() => navigate(`/blog/${post.slug}`)}
                    onApprove={() => void handleApprove(post)}
                    onReject={() => void handleReject(post)}
                    onToggleFeatured={() => void handleToggleFeatured(post)}
                    onDelete={() => setDeletingPost(post)}
                    actionLoading={actionLoading === post.id}
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
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-purple-500/40 hover:text-purple-500 disabled:opacity-30 transition-all text-[10px] font-black"
                  >
                    قبلی
                  </button>
                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                    onClick={() => void load(pagination.page + 1)}
                    className="px-3 py-2 rounded-lg bg-gradient-to-l from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/30 disabled:opacity-30 transition-all text-[10px] font-black"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {deletingPost && (
        <ConfirmDeleteModal
          title="حذف مقاله"
          message={`آیا از حذف "${deletingPost.title}" مطمئنی؟`}
          onClose={() => setDeletingPost(null)}
          onConfirm={() => void handleDeleteConfirm()}
          loading={actionLoading === deletingPost.id}
        />
      )}
    </>
  );
};

// ==================== AdminPostCard ====================
interface AdminPostCardProps {
  post: BlogPost;
  onView: () => void;
  onApprove: () => void;
  onReject: () => void;
  onToggleFeatured: () => void;
  onDelete: () => void;
  actionLoading: boolean;
}

const AdminPostCard = ({
  post,
  onView,
  onApprove,
  onReject,
  onToggleFeatured,
  onDelete,
  actionLoading,
}: AdminPostCardProps) => {
  const statusStyle = STATUS_COLORS[post.status];

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-4 hover:border-purple-500/30 transition-all">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Cover */}
        <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-[var(--griffin-gold)]/20 shrink-0">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen size={24} className="text-white/30" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black ${statusStyle.bg} ${statusStyle.text}`}
            >
              {STATUS_LABELS[post.status]}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black">
              {CATEGORY_LABELS[post.category]}
            </span>
            {post.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-l from-amber-500 to-amber-700 text-white text-[10px] font-black">
                <Sparkles size={9} />
                ویژه
              </span>
            )}
          </div>

          <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white line-clamp-1">
            {post.title}
          </h3>

          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            ✍️ {post.author.firstName} {post.author.lastName} ·{" "}
            {formatBlogDate(post.createdAt)}
          </p>

          {post.excerpt && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {post.excerpt}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3 flex-wrap text-[10px] text-gray-500 dark:text-gray-400">
            {post.status === "published" && (
              <>
                <span className="inline-flex items-center gap-1">
                  <Eye size={9} />
                  {post.viewsCount.toLocaleString("fa-IR")}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 size={9} />
                  {post.likesCount.toLocaleString("fa-IR")}
                </span>
              </>
            )}
            {(post.commentsCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1">
                <MessageSquare size={9} />
                {post.commentsCount?.toLocaleString("fa-IR")}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex sm:flex-col items-center gap-1 self-start">
          <button
            type="button"
            onClick={onView}
            disabled={actionLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-purple-500/15 hover:text-purple-500 disabled:opacity-40 transition-all"
            title="مشاهده"
          >
            <Eye size={13} />
          </button>

          {post.status === "published" && (
            <button
              type="button"
              onClick={onToggleFeatured}
              disabled={actionLoading}
              className={`w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-40 transition-all ${
                post.isFeatured
                  ? "bg-amber-500/15 text-amber-500"
                  : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-amber-500/15 hover:text-amber-500"
              }`}
              title={post.isFeatured ? "حذف از ویژه" : "ویژه کردن"}
            >
              <Star size={13} fill={post.isFeatured ? "currentColor" : "none"} />
            </button>
          )}

          {post.status === "pending" && (
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

export default AdminBlog;