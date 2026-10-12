import { useEffect, useState } from "react";
import { BookOpen, Clock3, Eye, LoaderCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getRelatedPosts,
  formatBlogDate,
  formatReadingTime,
  CATEGORY_LABELS,
  type BlogPost,
} from "../../api/blogApi";

interface RelatedPostsProps {
  slug: string;
  limit?: number;
}

const RelatedPosts = ({ slug, limit = 4 }: RelatedPostsProps) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await getRelatedPosts(slug, limit);
        setPosts(result.relatedPosts);
      } catch (err) {
        console.error("Failed to load related posts:", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [slug, limit]);

  if (!loading && posts.length === 0) return null;

  return (
    <section className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

      {/* Header */}
      <div className="relative p-5 border-b border-gray-200/70 dark:border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[var(--griffin-gold)]" />
          <h2 className="font-heading text-base font-black text-gray-900 dark:text-white">
            مقالات مرتبط
          </h2>
        </div>
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
          پیشنهاد بر اساس دسته‌بندی و تگ‌های مشترک
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoaderCircle
            size={22}
            className="text-[var(--griffin-gold)] animate-spin"
          />
        </div>
      ) : (
        <div className="p-4 grid gap-3 sm:grid-cols-2">
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="group flex gap-3 text-right rounded-xl border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 hover:border-[var(--griffin-gold)]/40 p-3 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Cover */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--griffin-gold)]/20 to-purple-600/20 shrink-0">
                {post.coverImage ? (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={22} className="text-white/40" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-black mb-1.5">
                  {CATEGORY_LABELS[post.category]}
                </span>

                <h3 className="font-heading text-xs font-black text-gray-900 dark:text-white line-clamp-2 group-hover:text-[var(--griffin-gold)] transition-colors leading-5">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-4 flex-1">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[9px] text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-0.5">
                    <Eye size={8} />
                    {post.viewsCount.toLocaleString("fa-IR")}
                  </span>
                  {post.readingTime && (
                    <span className="inline-flex items-center gap-0.5">
                      <Clock3 size={8} />
                      {formatReadingTime(post.readingTime)}
                    </span>
                  )}
                  {post.publishedAt && (
                    <span>{formatBlogDate(post.publishedAt)}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default RelatedPosts;
