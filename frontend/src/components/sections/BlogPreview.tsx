import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Eye,
  LoaderCircle,
  Sparkles,
  ThumbsUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getPublishedPosts,
  CATEGORY_LABELS,
  formatBlogDate,
  type BlogPost,
} from "../../api/blogApi";
import RevealOnScroll from "../common/RevealOnScroll";

const BlogPreview = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublishedPosts({ page: 1, limit: 3 })
      .then((data) => setPosts(data.posts))
      .catch((err) => console.error("Failed to load blog:", err))
      .finally(() => setLoading(false));
  }, []);

  // اگه مقاله‌ای نیست، کل بخش رو مخفی کن
  if (!loading && posts.length === 0) return null;

  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* هاله‌های پس‌زمینه */}
      <div className="absolute -top-40 right-1/3 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/8 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-purple-600/8 blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* ==================== هدر ==================== */}
        <RevealOnScroll>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30 mb-5">
              <BookOpen size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Blog
              </span>
            </div>

            <h2 className="font-heading text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              آخرین{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                  مقالات
                </span>
                <span className="absolute bottom-1 right-0 left-0 h-3 bg-[var(--griffin-gold)]/20 -z-0 rounded" />
              </span>
            </h2>

            <p className="mt-5 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-8">
              نکات مطالعه، تحلیل کنکور و مقالات انگیزشی — همه برای موفقیت تو.
            </p>
          </div>
        </RevealOnScroll>

        {/* ==================== مقالات ==================== */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px] gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
            <LoaderCircle className="animate-spin" size={22} />
            در حال دریافت مقالات...
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((post, index) => (
              <RevealOnScroll key={post.id} delay={index * 120}>
                <BlogCard
                  post={post}
                  onView={() => navigate(`/blog/${post.slug}`)}
                />
              </RevealOnScroll>
            ))}
          </div>
        )}

        {/* ==================== CTA ==================== */}
        <RevealOnScroll delay={500}>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/blog")}
              className="group inline-flex items-center gap-2 text-sm font-black text-[var(--griffin-gold)] hover:underline underline-offset-4"
            >
              مشاهده همه مقالات
              <ArrowLeft
                size={14}
                className="rotate-180 transition-transform group-hover:-translate-x-1"
              />
            </button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

// ==================== کارت مقاله ====================
interface BlogCardProps {
  post: BlogPost;
  onView: () => void;
}

const BlogCard = ({ post, onView }: BlogCardProps) => {
  return (
    <button
      type="button"
      onClick={onView}
      className="
        group relative h-full flex flex-col text-right
        rounded-2xl overflow-hidden
        border border-gray-200 dark:border-white/10
        bg-white dark:bg-white/[0.03]
        transition-transform duration-300
        hover:-translate-y-1
        hover:border-[var(--griffin-gold)]/40
      "
    >
      {/* تصویر */}
      <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-[var(--griffin-gold)]/20 to-purple-600/20">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={48} className="text-white/30" strokeWidth={1.5} />
          </div>
        )}

        {/* برچسب ویژه */}
        {post.isFeatured && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-l from-amber-500 to-amber-700 text-white text-[9px] font-black shadow-lg">
            <Sparkles size={9} />
            ویژه
          </span>
        )}

        {/* برچسب دسته */}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 text-white text-[9px] font-black">
          {CATEGORY_LABELS[post.category]}
        </span>
      </div>

      {/* محتوا */}
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="font-heading text-base font-black text-gray-900 dark:text-white line-clamp-2 group-hover:text-[var(--griffin-gold)] transition-colors">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-6 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* متا */}
        <div className="mt-4 pt-3 border-t border-gray-200/70 dark:border-white/5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Calendar size={10} />
              {formatBlogDate(post.publishedAt || post.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1">
              <Eye size={10} />
              {post.viewsCount.toLocaleString("fa-IR")}
            </span>
            <span className="inline-flex items-center gap-1">
              <ThumbsUp size={10} />
              {post.likesCount.toLocaleString("fa-IR")}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default BlogPreview;
