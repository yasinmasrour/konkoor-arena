import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock3,
  Eye,
  FileText,
  LoaderCircle,
  Search,
  Sparkles,
  ThumbsUp,
  X,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import {
  getCategories,
  getPublishedPosts,
  getTags,
  CATEGORY_LABELS,
  formatBlogDate,
  formatReadingTime,
  type BlogCategory,
  type BlogPost,
} from "../../api/blogApi";

import RevealOnScroll from "../../components/common/RevealOnScroll";
import BlogSidebar from "../../components/blog/BlogSidebar";
import Seo from "../../components/common/Seo";

const BlogList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<
    Array<{ key: BlogCategory; label: string }>
  >([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const selectedCategory = searchParams.get("category") as BlogCategory | null;

  const selectedTag = searchParams.get("tag");

  const featured = searchParams.get("featured") === "true";

  const searchQuery = searchParams.get("search") || "";

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  // ==================== Sync search with query ====================
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch(searchQuery);
  }, [searchQuery]);

  // ==================== Load ====================
  const load = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const [postsData, categoriesData, tagsData] = await Promise.all([
        getPublishedPosts({
          category: selectedCategory || undefined,
          tag: selectedTag || undefined,
          search: searchQuery || undefined,
          featured: featured || undefined,
          page,
          limit: pagination.limit,
        }),

        getCategories(),

        getTags(),
      ]);

      setPosts(postsData.posts);
      setPagination(postsData.pagination);
      setCategories(categoriesData.categories);
      setTags(tagsData.tags);
    } catch (err) {
      console.error("Failed to load blog:", err);
      setError("دریافت مقالات انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedTag, featured, searchQuery]);

  // ==================== Filters ====================
  const handleCategory = (category: BlogCategory | null) => {
    const params = new URLSearchParams(searchParams);

    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    params.delete("page");

    setSearchParams(params);
  };

  const handleTag = (tag: string | null) => {
    const params = new URLSearchParams(searchParams);

    if (tag) {
      params.set("tag", tag);
    } else {
      params.delete("tag");
    }

    params.delete("page");

    setSearchParams(params);
  };

  const handleFeatured = () => {
    const params = new URLSearchParams(searchParams);

    if (featured) {
      params.delete("featured");
    } else {
      params.set("featured", "true");
    }

    params.delete("page");

    setSearchParams(params);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams(searchParams);

    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }

    params.delete("page");

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearch("");
  };

  const hasFilters = selectedCategory || selectedTag || featured || searchQuery;

  // ==================== JSX ====================
  return (
    <>
      <Seo
        title="وبلاگ"
        description="مقالات آموزشی، انگیزشی، تحلیلی و اخبار کنکور — همه چیز برای موفقیت تو."
        url="https://griffinedu.ir/blog"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "وبلاگ کنکور آرنا",
          description:
            "مقالات آموزشی، انگیزشی، تحلیلی و اخبار کنکور",
          url: "https://griffinedu.ir/blog",
          publisher: {
            "@type": "Organization",
            name: "آکادمی گریفین",
          },
        }}
      />

      <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            بازگشت به خانه
          </button>

          {/* Header */}
          <RevealOnScroll>
            <header className="text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30">
                <BookOpen size={14} className="text-[var(--griffin-gold)]" />

                <span className="text-xs font-bold text-[var(--griffin-gold)] tracking-wider">
                  GRIFFIN BLOG
                </span>
              </div>

              <h1 className="font-heading text-4xl md:text-6xl font-black leading-tight text-gray-900 dark:text-white">
                وبلاگ{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                  گریفین
                </span>
              </h1>

              <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto rounded-full" />

              <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 leading-8">
                مقالات آموزشی، انگیزشی، تحلیلی و اخبار کنکور — همه چیز برای
                موفقیت تو.
              </p>
            </header>
          </RevealOnScroll>

          {/* Layout: Sidebar + Main */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* ==================== Main ==================== */}
            <div className="min-w-0 space-y-5">
              {/* Filters */}
              <RevealOnScroll>
                <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 space-y-3">
                  {/* Search */}
                  <form onSubmit={handleSearchSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
                      />

                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="جستجو در مقالات..."
                        className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-2.5 pr-10 pl-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl transition-all"
                    >
                      جستجو
                    </button>
                  </form>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleCategory(null)}
                      className={`
                        inline-flex items-center gap-1.5 rounded-xl px-3 py-2
                        text-[11px] font-black transition-all
                        ${
                          !selectedCategory
                            ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                            : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                        }
                      `}
                    >
                      همه
                    </button>

                    {categories.map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => handleCategory(cat.key)}
                        className={`
                          inline-flex items-center gap-1.5 rounded-xl px-3 py-2
                          text-[11px] font-black transition-all
                          ${
                            selectedCategory === cat.key
                              ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                              : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                          }
                        `}
                      >
                        {cat.label}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={handleFeatured}
                      className={`
                        inline-flex items-center gap-1.5 rounded-xl px-3 py-2
                        text-[11px] font-black transition-all
                        ${
                          featured
                            ? "bg-gradient-to-l from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-500/30"
                            : "border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 hover:border-amber-500/50"
                        }
                      `}
                    >
                      <Sparkles size={11} />
                      ویژه
                    </button>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-200/70 dark:border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        تگ‌ها:
                      </span>

                      {tags.slice(0, 15).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            handleTag(selectedTag === tag ? null : tag)
                          }
                          className={`
                            inline-flex items-center gap-1 rounded-md px-2 py-1
                            text-[10px] font-black transition-all
                            ${
                              selectedTag === tag
                                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                                : "border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] text-gray-500 hover:border-purple-500/30 hover:text-purple-500"
                            }
                          `}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Clear */}
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1.5 text-[11px] font-black text-rose-500 hover:text-rose-600 transition-all"
                    >
                      <X size={11} />
                      پاک کردن فیلترها
                    </button>
                  )}
                </section>
              </RevealOnScroll>

              {/* Posts */}
              {loading ? (
                <div className="flex items-center justify-center min-h-[400px]">
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
                      در حال دریافت مقالات...
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
                  <AlertCircle
                    size={32}
                    className="mx-auto text-rose-500 mb-3"
                  />

                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                    {error}
                  </p>
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <FileText
                      size={28}
                      className="text-gray-400 dark:text-gray-600"
                    />
                  </div>

                  <p className="font-heading text-base font-black text-gray-500 dark:text-gray-400">
                    مقاله‌ای پیدا نشد
                  </p>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {hasFilters
                      ? "فیلترها رو تغییر بده یا پاک کن"
                      : "به زودی مقالات جدید اضافه میشن"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {posts.map((post, index) => (
                    <RevealOnScroll key={post.id} delay={index * 60}>
                      <PostCard post={post} />
                    </RevealOnScroll>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1 || loading}
                    onClick={() => void load(pagination.page - 1)}
                    className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-all text-[11px] font-black"
                  >
                    قبلی
                  </button>

                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 px-3">
                    صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
                    {pagination.totalPages.toLocaleString("fa-IR")}
                  </span>

                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                    onClick={() => void load(pagination.page + 1)}
                    className="px-4 py-2.5 rounded-lg bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30 disabled:opacity-30 transition-all text-[11px] font-black"
                  >
                    بعدی
                  </button>
                </div>
              )}
            </div>

            {/* ==================== Sidebar ==================== */}
            <div className="lg:sticky lg:top-5 lg:self-start">
              <BlogSidebar
                onSearch={(q) => {
                  const params = new URLSearchParams(searchParams);

                  if (q) {
                    params.set("search", q);
                  } else {
                    params.delete("search");
                  }

                  params.delete("page");

                  setSearchParams(params);
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

// ==================== PostCard ====================
interface PostCardProps {
  post: BlogPost;
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <Link
      to={`/blog/${encodeURIComponent(post.slug)}`}
      aria-label={`مطالعه مقاله: ${post.title}`}
      className="
        group relative h-full flex flex-col text-right
        rounded-2xl overflow-hidden
        border border-gray-200 dark:border-white/10
        bg-white/70 dark:bg-white/[0.03]
        backdrop-blur-sm
        hover:-translate-y-2 hover:border-[var(--griffin-gold)]/40
        hover:shadow-2xl hover:shadow-[var(--griffin-gold)]/10
        transition-all duration-300
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--griffin-gold)]
        focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-slate-950
      "
    >
      {/* Cover */}
      <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-[var(--griffin-gold)]/20 to-purple-600/20">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={48} className="text-white/30" strokeWidth={1.5} />
          </div>
        )}

        {/* Featured badge */}
        {post.isFeatured && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-l from-amber-500 to-amber-700 text-white text-[9px] font-black shadow-lg">
            <Sparkles size={9} />
            ویژه
          </span>
        )}

        {/* Category badge */}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[9px] font-black">
          {CATEGORY_LABELS[post.category]}
        </span>

        {/* Reading time */}
        {post.readingTime && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[9px] font-black">
            <Clock3 size={9} />
            {formatReadingTime(post.readingTime)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        <h2 className="font-heading text-base font-black text-gray-900 dark:text-white line-clamp-2 group-hover:text-[var(--griffin-gold)] transition-colors">
          {post.title}
        </h2>

        {post.excerpt && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-6 flex-1">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] font-black"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
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

        {/* Author */}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
          <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-[9px]">
            {post.author.firstName.charAt(0)}
          </span>

          <span className="font-bold">
            {post.author.firstName} {post.author.lastName}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BlogList;