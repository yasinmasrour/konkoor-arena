import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock3,
  Eye,
  LoaderCircle,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import {
  getPostBySlug,
  getPostToc,
  reactToPost,
  CATEGORY_LABELS,
  formatBlogDate,
  formatReadingTime,
  type BlogPost as BlogPostType,
  type BlogReactionType,
  type TocHeading,
} from "../../api/blogApi";

import { useAuth } from "../../context/AuthContext";
import BlogComments from "./components/BlogComments";
import BlogSidebar from "../../components/blog/BlogSidebar";
import BlogTOC from "../../components/blog/BlogTOC";
import RelatedPosts from "../../components/blog/RelatedPosts";
import PostNavigation from "../../components/blog/PostNavigation";
import ShareButtons from "../../components/blog/ShareButtons";
import ReadingProgressBar from "../../components/blog/ReadingProgressBar";
import Seo from "../../components/common/Seo";

const BlogPost = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [post, setPost] = useState<BlogPostType | null>(null);
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reaction, setReaction] = useState<BlogReactionType | null>(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  // ==================== Load ====================
  useEffect(() => {
    if (!slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      setError("مقاله پیدا نشد.");
      return;
    }

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [postResult, tocResult] = await Promise.all([
          getPostBySlug(slug),
          getPostToc(slug),
        ]);

        setPost(postResult.post);
        setReaction(postResult.post.myReaction ?? null);
        setLikes(postResult.post.likesCount);
        setDislikes(postResult.post.dislikesCount);
        setHeadings(tocResult.headings);
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
            type="button"
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

  // ==================== SEO Values ====================
  // 🆕 Fallback logic
  const seoTitle = post.seoTitle?.trim() || post.title;
  const seoDescription =
    post.seoDescription?.trim() || post.excerpt?.trim() || post.title;
  const coverAlt = post.coverImageAlt?.trim() || post.title;

  // ==================== JSX ====================
  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        image={post.coverImage || undefined}
        url={`https://griffinedu.ir/blog/${post.slug}`}
        type="article"
        publishedAt={post.publishedAt}
        modifiedAt={post.updatedAt}
        author={`${post.author.firstName} ${post.author.lastName}`}
        tags={post.tags}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: seoTitle,
          description: seoDescription,
          image: post.coverImage || undefined,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          author: {
            "@type": "Person",
            name: `${post.author.firstName} ${post.author.lastName}`,
          },
          publisher: {
            "@type": "Organization",
            name: "آکادمی گریفین",
            logo: {
              "@type": "ImageObject",
              url: "https://griffinedu.ir/logo-light.webp",
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://griffinedu.ir/blog/${post.slug}`,
          },
        }}
      />

      <ReadingProgressBar />

      <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/blog")}
            className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition mb-5"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            بازگشت به وبلاگ
          </button>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* ==================== Main ==================== */}
            <div className="min-w-0 space-y-6">
              <article
                className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm"
                itemScope
                itemType="https://schema.org/Article"
              >
                {/* Cover */}
                {post.coverImage && (
                  <div className="relative w-full aspect-video overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={coverAlt}
                      className="w-full h-full object-cover"
                      loading="eager"
                      fetchPriority="high"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  {/* Category */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] text-[10px] font-black">
                      {CATEGORY_LABELS[post.category]}
                    </span>

                    {post.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-l from-amber-500 to-amber-700 text-white text-[10px] font-black shadow-lg">
                        ⭐ ویژه
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1
                    className="font-heading text-2xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4"
                    itemProp="headline"
                  >
                    {post.title}
                  </h1>

                  {/* Meta */}
                  <div className="flex items-center gap-3 flex-wrap pb-6 mb-6 border-b border-gray-200/70 dark:border-white/5 text-[11px] text-gray-500 dark:text-gray-400">
                    {/* Author */}
                    <span
                      className="inline-flex items-center gap-1.5"
                      itemProp="author"
                      itemScope
                      itemType="https://schema.org/Person"
                    >
                      <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-[10px]">
                        {post.author.firstName.charAt(0)}
                      </span>

                      <span
                        className="font-bold text-gray-700 dark:text-gray-300"
                        itemProp="name"
                      >
                        {post.author.firstName} {post.author.lastName}
                      </span>
                    </span>

                    {/* Date */}
                    <time
                      className="inline-flex items-center gap-1"
                      dateTime={post.publishedAt || post.createdAt}
                      itemProp="datePublished"
                    >
                      <Calendar size={11} />

                      {formatBlogDate(post.publishedAt || post.createdAt)}
                    </time>

                    {/* Views */}
                    <span className="inline-flex items-center gap-1">
                      <Eye size={11} />
                      {post.viewsCount.toLocaleString("fa-IR")} بازدید
                    </span>

                    {/* Reading time */}
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={11} />

                      {formatReadingTime(post.readingTime)}
                    </span>
                  </div>

                  {/* TOC */}
                  {headings.length > 0 && (
                    <div className="mb-6">
                      <BlogTOC headings={headings} />
                    </div>
                  )}

                  {/* Content */}
                  <div
                    className="blog-content"
                    dir="rtl"
                    itemProp="articleBody"
                  >
                    <ReactMarkdown
                      components={{
                        h1: ({ children, ...props }) => {
                          const text = String(children);

                          const id = headings.find(
                            (h) => h.text === text && h.level === 1,
                          )?.id;

                          return (
                            <h1 id={id} {...props}>
                              {children}
                            </h1>
                          );
                        },

                        h2: ({ children, ...props }) => {
                          const text = String(children);

                          const id = headings.find(
                            (h) => h.text === text && h.level === 2,
                          )?.id;

                          return (
                            <h2 id={id} {...props}>
                              {children}
                            </h2>
                          );
                        },

                        h3: ({ children, ...props }) => {
                          const text = String(children);

                          const id = headings.find(
                            (h) => h.text === text && h.level === 3,
                          )?.id;

                          return (
                            <h3 id={id} {...props}>
                              {children}
                            </h3>
                          );
                        },

                        h4: ({ children, ...props }) => {
                          const text = String(children);

                          const id = headings.find(
                            (h) => h.text === text && h.level === 4,
                          )?.id;

                          return (
                            <h4 id={id} {...props}>
                              {children}
                            </h4>
                          );
                        },
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  </div>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200/70 dark:border-white/5 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            navigate(`/blog?tag=${encodeURIComponent(tag)}`)
                          }
                          className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black hover:bg-purple-500/20 transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reactions + Share */}
                  <div className="mt-6 pt-6 border-t border-gray-200/70 dark:border-white/5 space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Like */}
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
                          className={
                            reaction === "like" ? "fill-emerald-500" : ""
                          }
                        />

                        {likes.toLocaleString("fa-IR")}
                      </button>

                      {/* Dislike */}
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
                          className={
                            reaction === "dislike" ? "fill-rose-500" : ""
                          }
                        />

                        {dislikes.toLocaleString("fa-IR")}
                      </button>
                    </div>

                    <ShareButtons title={post.title} />
                  </div>
                </div>
              </article>

              {/* Neighbors */}
              <PostNavigation slug={post.slug} />

              {/* Comments */}
              <BlogComments postId={post.id} />

              {/* Related */}
              <RelatedPosts slug={post.slug} limit={4} />
            </div>

            {/* ==================== Sidebar ==================== */}
            <div className="lg:sticky lg:top-5 lg:self-start">
              <BlogSidebar currentPostSlug={post.slug} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default BlogPost;
