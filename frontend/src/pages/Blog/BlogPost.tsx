import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Eye,
  LoaderCircle,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  getPostBySlug,
  reactToPost,
  CATEGORY_LABELS,
  formatBlogDate,
  type BlogPost as BlogPostType,
  type BlogReactionType,
} from "../../api/blogApi";
import { useAuth } from "../../context/AuthContext";
import BlogComments from "./components/BlogComments";

const BlogPost = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reaction, setReaction] = useState<BlogReactionType | null>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [copied, setCopied] = useState(false);

  // ==================== Load ====================
  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getPostBySlug(slug);
        setPost(result.post);
        setReaction(result.post.myReaction ?? null);
        setLikes(result.post.likesCount);
        setDislikes(result.post.dislikesCount);
      } catch (err) {
        console.error("Failed to load post:", err);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "دریافت مقاله انجام نشد.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [slug]);

  // ==================== React ====================
  const handleReact = async (type: BlogReactionType) => {
    if (!user || !post) return;

    try {
      const result = await reactToPost(post.id, type);
      setLikes(result.likesCount);
      setDislikes(result.dislikesCount);
      setReaction(result.myReaction);
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  const handleShare = async () => {
    if (!post) return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-3">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <LoaderCircle size={24} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت مقاله...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error || !post) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-4">
            {error || "مقاله پیدا نشد"}
          </p>
          <button
            onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg"
          >
            <ArrowLeft size={13} />
            بازگشت به وبلاگ
          </button>
        </div>
      </main>
    );
  }

  // ==================== JSX ====================
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/blog")}
          className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت به وبلاگ
        </button>

        {/* Article */}
        <article className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          {/* Cover */}
          {post.coverImage && (
            <div className="relative w-full aspect-video overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* Category + Featured */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] text-[10px] font-black">
                {CATEGORY_LABELS[post.category]}
              </span>
              {post.isFeatured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-l from-amber-500 to-amber-700 text-white text-[10px] font-black shadow-lg">
                  <Sparkles size={10} />
                  ویژه
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-2xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-3 flex-wrap pb-6 mb-6 border-b border-gray-200/70 dark:border-white/5 text-[11px] text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-[10px]">
                  {post.author.firstName.charAt(0)}
                </span>
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {post.author.firstName} {post.author.lastName}
                </span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar size={11} />
                {formatBlogDate(post.publishedAt || post.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye size={11} />
                {post.viewsCount.toLocaleString("fa-IR")} بازدید
              </span>
            </div>

            {/* Content */}
            <div
              className="prose prose-base sm:prose-lg max-w-none dark:prose-invert
                  prose-headings:font-heading prose-headings:font-black prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4 prose-h1:pb-3 prose-h1:border-b prose-h1:border-gray-200 dark:prose-h1:border-white/10
                  prose-h2:text-2xl prose-h2:mt-7 prose-h2:mb-3
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2
                  prose-p:leading-8 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:my-4
                  prose-a:text-[var(--griffin-gold)] prose-a:no-underline hover:prose-a:underline prose-a:font-bold
                  prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-black
                  prose-ul:my-4 prose-ul:pr-6 prose-li:my-1.5 prose-li:text-gray-700 dark:prose-li:text-gray-300
                  prose-ol:my-4 prose-ol:pr-6
                  prose-blockquote:border-r-4 prose-blockquote:border-[var(--griffin-gold)] prose-blockquote:bg-[var(--griffin-gold)]/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-lg prose-blockquote:not-italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
                  prose-code:bg-gray-100 dark:prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[var(--griffin-gold)] prose-code:font-english prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-gray-900 dark:prose-pre:bg-black prose-pre:rounded-2xl prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:border prose-pre:border-gray-700
                  prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-6 prose-img:mx-auto
                  prose-table:border-collapse prose-table:w-full
                  prose-th:bg-gray-100 dark:prose-th:bg-white/5 prose-th:border prose-th:border-gray-200 dark:prose-th:border-white/10 prose-th:px-4 prose-th:py-2
                  prose-td:border prose-td:border-gray-200 dark:prose-td:border-white/10 prose-td:px-4 prose-td:py-2
                  prose-hr:my-8 prose-hr:border-gray-200 dark:prose-hr:border-white/10
                "
            >
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200/70 dark:border-white/5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Reactions */}
            <div className="mt-6 pt-6 border-t border-gray-200/70 dark:border-white/5 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleReact("like")}
                  disabled={!user}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                    text-xs font-black transition-all
                    ${
                      reaction === "like"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    }
                  `}
                >
                  <ThumbsUp
                    size={14}
                    className={reaction === "like" ? "fill-emerald-500" : ""}
                  />
                  {likes.toLocaleString("fa-IR")}
                </button>

                <button
                  type="button"
                  onClick={() => void handleReact("dislike")}
                  disabled={!user}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                    text-xs font-black transition-all
                    ${
                      reaction === "dislike"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                        : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    }
                  `}
                >
                  <ThumbsDown
                    size={14}
                    className={reaction === "dislike" ? "fill-rose-500" : ""}
                  />
                  {dislikes.toLocaleString("fa-IR")}
                </button>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/10 hover:text-[var(--griffin-gold)] transition-all text-xs font-black"
              >
                <Share2 size={14} />
                {copied ? "کپی شد!" : "اشتراک‌گذاری"}
              </button>
            </div>
          </div>
        </article>

        {/* Comments */}
        <BlogComments postId={post.id} />
      </div>
    </main>
  );
};

export default BlogPost;
