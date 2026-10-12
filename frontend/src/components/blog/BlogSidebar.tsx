import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Eye,
  Flame,
  Hash,
  Layers,
  LoaderCircle,
  Megaphone,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getBlogSidebar,
  formatBlogDate,
  type BlogSidebarData,
  type BlogCategory,
} from "../../api/blogApi";

interface BlogSidebarProps {
  currentPostSlug?: string;
  onSearch?: (query: string) => void;
}

const BlogSidebar = ({ currentPostSlug, onSearch }: BlogSidebarProps) => {
  const navigate = useNavigate();
  const [data, setData] = useState<BlogSidebarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getBlogSidebar();
        setData(result);
      } catch (err) {
        console.error("Failed to load sidebar:", err);
        setError("دریافت اطلاعات انجام نشد.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    if (onSearch) {
      onSearch(searchValue.trim());
    } else {
      navigate(`/blog?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleCategoryClick = (category: BlogCategory) => {
    navigate(`/blog?category=${category}`);
  };

  const handleTagClick = (tag: string) => {
    navigate(`/blog?tag=${encodeURIComponent(tag)}`);
  };

  if (loading) {
    return (
      <aside className="space-y-4">
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-8 flex items-center justify-center">
          <LoaderCircle
            size={22}
            className="text-[var(--griffin-gold)] animate-spin"
          />
        </div>
      </aside>
    );
  }

  if (error || !data) {
    return (
      <aside className="space-y-4">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center">
          <AlertCircle size={20} className="mx-auto text-rose-500 mb-2" />
          <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
            {error || "خطا"}
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="space-y-4">
      {/* ==================== Search ==================== */}
      <Widget title="جستجو" icon={Search}>
        <form onSubmit={handleSearch} className="relative">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="جستجو در مقالات..."
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] pr-9 pl-3 py-2.5 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
          />
        </form>
      </Widget>

      {/* ==================== Categories ==================== */}
      {data.categories.length > 0 && (
        <Widget title="دسته‌بندی‌ها" icon={Layers}>
          <ul className="space-y-1">
            {data.categories.map((cat) => (
              <li key={cat.key}>
                <button
                  type="button"
                  onClick={() => handleCategoryClick(cat.key)}
                  className="group w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-right text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-[var(--griffin-gold)]/10 hover:text-[var(--griffin-gold)] transition-all"
                >
                  <span className="truncate">{cat.label}</span>
                  <span className="shrink-0 min-w-[22px] h-[22px] px-1.5 rounded-md bg-gray-100 dark:bg-white/5 text-[10px] font-black text-gray-500 flex items-center justify-center tabular-nums group-hover:bg-[var(--griffin-gold)]/20 group-hover:text-[var(--griffin-gold)] transition-colors">
                    {cat.count.toLocaleString("fa-IR")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Widget>
      )}

      {/* ==================== Popular Posts ==================== */}
      {data.popularPosts.length > 0 && (
        <Widget title="محبوب‌ترین‌ها" icon={Flame}>
          <ul className="space-y-2">
            {data.popularPosts.map((post, i) => (
              <li key={post.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className={`group w-full flex gap-2.5 text-right p-1.5 rounded-lg transition-all ${
                    currentPostSlug === post.slug
                      ? "bg-[var(--griffin-gold)]/10"
                      : "hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--griffin-gold)]/20 to-purple-600/20 shrink-0">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={16} className="text-white/40" />
                      </div>
                    )}
                    <span className="absolute top-0.5 right-0.5 w-5 h-5 rounded-md bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-[9px] font-black tabular-nums">
                      {(i + 1).toLocaleString("fa-IR")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-gray-900 dark:text-white line-clamp-2 group-hover:text-[var(--griffin-gold)] transition-colors leading-5">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[9px] text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-0.5">
                        <Eye size={8} />
                        {post.viewsCount.toLocaleString("fa-IR")}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Widget>
      )}

      {/* ==================== Ad Slot 1 ==================== */}
      <AdSlot variant="horizontal" />

      {/* ==================== Recent Posts ==================== */}
      {data.recentPosts.length > 0 && (
        <Widget title="جدیدترین‌ها" icon={Sparkles}>
          <ul className="space-y-2">
            {data.recentPosts.map((post) => (
              <li key={post.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className={`group w-full flex gap-2.5 text-right p-1.5 rounded-lg transition-all ${
                    currentPostSlug === post.slug
                      ? "bg-[var(--griffin-gold)]/10"
                      : "hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--griffin-gold)]/20 to-purple-600/20 shrink-0">
                    {post.coverImage ? (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={14} className="text-white/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-gray-900 dark:text-white line-clamp-2 group-hover:text-[var(--griffin-gold)] transition-colors leading-5">
                      {post.title}
                    </p>
                    {post.publishedAt && (
                      <p className="mt-0.5 text-[9px] text-gray-500 dark:text-gray-400 inline-flex items-center gap-0.5">
                        <Calendar size={8} />
                        {formatBlogDate(post.publishedAt)}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Widget>
      )}

      {/* ==================== Tags ==================== */}
      {data.popularTags.length > 0 && (
        <Widget title="تگ‌های پرطرفدار" icon={Hash}>
          <div className="flex flex-wrap gap-1.5">
            {data.popularTags.map(({ tag, count }) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="group inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-white/5 text-[10px] font-black text-gray-600 dark:text-gray-400 hover:bg-purple-500/15 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
              >
                <span>#{tag}</span>
                <span className="text-[9px] text-gray-400 group-hover:text-purple-500">
                  ({count.toLocaleString("fa-IR")})
                </span>
              </button>
            ))}
          </div>
        </Widget>
      )}

      {/* ==================== Ad Slot 2 ==================== */}
      <AdSlot variant="square" />

      {/* ==================== Stats ==================== */}
      <Widget title="آمار وبلاگ" icon={TrendingUp}>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-[var(--griffin-gold)]/5 border border-[var(--griffin-gold)]/20 p-2.5 text-center">
            <p className="font-heading text-lg font-black text-[var(--griffin-gold)] tabular-nums">
              {data.totalPosts.toLocaleString("fa-IR")}
            </p>
            <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 mt-0.5">
              مقاله
            </p>
          </div>
          <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-2.5 text-center">
            <p className="font-heading text-lg font-black text-purple-600 dark:text-purple-400 tabular-nums">
              {data.popularTags.length.toLocaleString("fa-IR")}
            </p>
            <p className="text-[9px] font-black text-gray-500 dark:text-gray-400 mt-0.5">
              تگ
            </p>
          </div>
        </div>
      </Widget>
    </aside>
  );
};

// ==================== Widget Wrapper ====================
interface WidgetProps {
  title: string;
  icon: typeof Search;
  children: React.ReactNode;
}

const Widget = ({ title, icon: Icon, children }: WidgetProps) => {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200/70 dark:border-white/5">
        <Icon size={13} className="text-[var(--griffin-gold)]" />
        <h3 className="font-heading text-xs font-black text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

// ==================== Ad Slot ====================
interface AdSlotProps {
  variant?: "square" | "horizontal";
}

const AdSlot = ({ variant = "square" }: AdSlotProps) => {
  const aspect = variant === "square" ? "aspect-square" : "aspect-[4/3]";

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] ${aspect} flex flex-col items-center justify-center gap-2 p-4`}
    >
      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10 flex items-center justify-center">
        <Megaphone size={18} className="text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        Ad Space
      </p>
      <p className="text-[9px] text-gray-400 dark:text-gray-600 text-center leading-4">
        جای تبلیغات
      </p>
    </div>
  );
};

export default BlogSidebar;
