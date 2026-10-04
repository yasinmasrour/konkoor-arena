import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Save,
  Send,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPost,
  getPostBySlug,
  submitForReview,
  updatePost,
  type BlogCategory,
} from "../../api/blogApi";
import { useAuth } from "../../context/AuthContext";

const CATEGORY_OPTIONS: Array<{ value: BlogCategory; label: string }> = [
  { value: "general", label: "عمومی" },
  { value: "educational", label: "آموزشی" },
  { value: "motivation", label: "انگیزشی" },
  { value: "news", label: "اخبار" },
  { value: "analysis", label: "تحلیل" },
  { value: "interview", label: "مصاحبه" },
];

const BlogEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const isEdit = !!id;

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState<BlogCategory>("general");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = user?.role?.name === "ADMIN";

  // ==================== Load (اگه ویرایش) ====================
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        // id هم میتونه slug باشه، هم postId — فرض می‌کنیم slug هست
        const result = await getPostBySlug(id);
        const post = result.post;
        setTitle(post.title);
        setExcerpt(post.excerpt);
        setContent(post.content);
        setCoverImage(post.coverImage);
        setCategory(post.category);
        setTags(post.tags);
      } catch (err) {
        console.error("Failed to load post:", err);
        setError("دریافت مقاله انجام نشد.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  // ==================== Tags ====================
  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || tags.includes(tag) || tags.length >= 10) return;
    setTags([...tags, tag]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // ==================== Save ====================
  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!title.trim() || title.trim().length < 3) {
      setError("عنوان حداقل ۳ کاراکتر باشد");
      return;
    }
    if (!content.trim()) {
      setError("متن مقاله الزامی است");
      return;
    }

    setSaving(true);
    try {
      if (isEdit && id) {
        // در ویرایش، id می‌تونه slug باشه — بهتره از یه API جدا استفاده کنیم
        // ولی فعلاً با updatePost کار می‌کنیم
        const result = await updatePost(id, {
          title: title.trim(),
          excerpt: excerpt.trim(),
          content,
          coverImage: coverImage.trim(),
          category,
          tags,
        });
        setSuccess("مقاله ذخیره شد");
        // اگه slug عوض شد، برو به slug جدید
        if (result.post.slug !== id) {
          setTimeout(() => navigate(`/blog/${result.post.slug}`), 1200);
        }
      } else {
        const result = await createPost({
          title: title.trim(),
          excerpt: excerpt.trim(),
          content,
          coverImage: coverImage.trim(),
          category,
          tags,
        });
        setSuccess(isAdmin ? "مقاله ساخته و منتشر شد" : "مقاله ساخته شد");
        setTimeout(() => {
          navigate(
            isAdmin
              ? `/blog/${result.post.slug}`
              : "/dashboard?section=my-blog-posts",
          );
        }, 1200);
      }
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ذخیره انجام نشد";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // ==================== Submit ====================
  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await submitForReview(id);
      setSuccess("برای تایید ارسال شد");
      setTimeout(() => navigate("/dashboard?section=my-blog-posts"), 1200);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ارسال انجام نشد";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <LoaderCircle
          size={32}
          className="text-[var(--griffin-gold)] animate-spin"
        />
      </main>
    );
  }

  // ==================== JSX ====================
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Back */}
        <button
          type="button"
          onClick={() =>
            navigate(
              isAdmin ? "/admin/blog" : "/dashboard?section=my-blog-posts",
            )
          }
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت
        </button>

        {/* Hero */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px]" />

          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                <BookOpen size={24} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                {isEdit ? "Edit Post" : "New Post"}
              </p>
              <h1 className="font-heading text-xl sm:text-2xl font-black text-white -mt-0.5">
                {isEdit ? "ویرایش مقاله" : "مقاله جدید"}
              </h1>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 font-black text-white text-xs shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl disabled:opacity-40 transition-all"
              >
                {saving ? (
                  <LoaderCircle size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                ذخیره
              </button>
            </div>
          </div>
        </section>

        {/* Messages */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {error}
            </p>
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-2">
            <Check
              size={14}
              className="text-emerald-500 shrink-0 mt-0.5"
              strokeWidth={3}
            />
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {success}
            </p>
          </div>
        )}

        {/* Form */}
        <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              <FileText size={10} />
              عنوان مقاله
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: روش مطالعه ریاضی در ۳۰ روز"
              maxLength={200}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
            />
          </div>

          {/* Category + Cover */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                <Sparkles size={10} />
                دسته‌بندی
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BlogCategory)}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                <ImageIcon size={10} />
                تصویر کاور (URL)
              </label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                dir="ltr"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all font-english"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">
              خلاصه (اختیاری — اگه ندید، از متن ساخته میشه)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="یه خلاصه کوتاه از مقاله..."
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all resize-none leading-7"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 block">
              متن مقاله (Markdown)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              placeholder="# عنوان&#10;&#10;متن مقاله با Markdown..."
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all resize-y leading-7 font-english"
            />
            <div className="mt-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-3">
              <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                راهنمای Markdown
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px]">
                {[
                  { syntax: "# هدر", desc: "هدر بزرگ" },
                  { syntax: "## هدر", desc: "هدر کوچک" },
                  { syntax: "**بولد**", desc: "متن بولد" },
                  { syntax: "*ایتالیک*", desc: "متن ایتالیک" },
                  { syntax: "[لینک](url)", desc: "لینک" },
                  { syntax: "![توضیح](url)", desc: "تصویر" },
                  { syntax: "- آیتم", desc: "لیست" },
                  { syntax: "> نقل قول", desc: "نقل قول" },
                  { syntax: "```کد```", desc: "بلوک کد" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <code className="px-1.5 py-0.5 rounded-md bg-white dark:bg-white/10 text-[9px] font-english text-[var(--griffin-gold)]">
                      {item.syntax}
                    </code>
                    <span className="text-gray-500 dark:text-gray-400">
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              <Tag size={10} />
              تگ‌ها ({tags.length.toLocaleString("fa-IR")}/۱۰)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="مثلاً: ریاضی"
                maxLength={30}
                className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!tagInput.trim() || tags.length >= 10}
                className="px-4 rounded-xl bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] text-xs font-black hover:bg-[var(--griffin-gold)]/20 disabled:opacity-40 transition-all"
              >
                افزودن
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-rose-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Submit for review */}
        {isEdit && !isAdmin && (
          <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                آماده انتشار؟
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                بعد از ذخیره، می‌تونی برای تایید ادمین ارسال کنی.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-5 py-3 font-black text-white text-xs shadow-lg shadow-emerald-500/40 hover:shadow-xl disabled:opacity-40 transition-all"
            >
              {submitting ? (
                <LoaderCircle size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
              ارسال برای تایید
            </button>
          </section>
        )}
      </div>
    </main>
  );
};

export default BlogEditor;
