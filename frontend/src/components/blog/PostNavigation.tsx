import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getPostNeighbors,
  type PostNeighborsResponse,
} from "../../api/blogApi";

interface PostNavigationProps {
  slug: string;
}

const PostNavigation = ({ slug }: PostNavigationProps) => {
  const navigate = useNavigate();
  const [data, setData] = useState<PostNeighborsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await getPostNeighbors(slug);
        setData(result);
      } catch (err) {
        console.error("Failed to load neighbors:", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [slug]);

  if (loading || !data) return null;
  if (!data.prevPost && !data.nextPost) return null;

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      {/* Previous */}
      {data.prevPost ? (
        <button
          type="button"
          onClick={() => navigate(`/blog/${data.prevPost!.slug}`)}
          className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 text-right transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
        >
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight
              size={12}
              className="text-[var(--griffin-gold)] transition-transform group-hover:translate-x-1"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              مقاله قبلی
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--griffin-gold)]/20 to-purple-600/20 shrink-0">
              {data.prevPost.coverImage ? (
                <img
                  src={data.prevPost.coverImage}
                  alt={data.prevPost.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen size={16} className="text-white/40" />
                </div>
              )}
            </div>
            <p className="flex-1 font-heading text-xs font-black text-gray-900 dark:text-white line-clamp-2 leading-5 group-hover:text-[var(--griffin-gold)] transition-colors">
              {data.prevPost.title}
            </p>
          </div>
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Next */}
      {data.nextPost && (
        <button
          type="button"
          onClick={() => navigate(`/blog/${data.nextPost!.slug}`)}
          className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
        >
          <div className="flex items-center justify-end gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              مقاله بعدی
            </span>
            <ArrowLeft
              size={12}
              className="text-[var(--griffin-gold)] transition-transform group-hover:-translate-x-1"
            />
          </div>
          <div className="flex flex-row-reverse items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--griffin-gold)]/20 to-purple-600/20 shrink-0">
              {data.nextPost.coverImage ? (
                <img
                  src={data.nextPost.coverImage}
                  alt={data.nextPost.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen size={16} className="text-white/40" />
                </div>
              )}
            </div>
            <p className="flex-1 font-heading text-xs font-black text-gray-900 dark:text-white line-clamp-2 leading-5 group-hover:text-[var(--griffin-gold)] transition-colors text-right">
              {data.nextPost.title}
            </p>
          </div>
        </button>
      )}
    </section>
  );
};

export default PostNavigation;