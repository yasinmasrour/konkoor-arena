import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Hash,
  Link as LinkIcon,
  LoaderCircle,
  RotateCcw,
  Save,
  Search,
  Send,
  Sparkles,
  Tag as TagIcon,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPost,
  getPostBySlug,
  submitForReview,
  updatePost,
  CATEGORY_LABELS,
  type BlogCategory,
} from "../../api/blogApi";
import { useAuth } from "../../context/AuthContext";
import {
  slugifyEnglish,
  countWords,
  calculateReadingTime,
} from "../../utils/slugify";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import { useAutoSave, loadDraft, clearDraft } from "../../hooks/useAutoSave";
import MarkdownToolbar from "../../components/blog/MarkdownToolbar";
import MarkdownPreview from "../../components/blog/MarkdownPreview";
import ImageUploader from "../../components/blog/ImageUploader";
import ContentImageUploader from "../../components/blog/ContentImageUploader";

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
  const isAdmin = user?.role?.name === "ADMIN";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ==================== State ====================
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [category, setCategory] = useState<BlogCategory>("general");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [showImageUploader, setShowImageUploader] = useState(false);

  // ==================== Draft Key ====================
  const draftKey = isEdit ? `blog-draft-${id}` : "blog-draft-new";

  // ==================== Load (ویرایش) ====================
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const result = await getPostBySlug(id);
        const post = result.post;
        setTitle(post.title);
        setSlug(post.slug);
        setSlugTouched(true);
        setExcerpt(post.excerpt);
        setContent(post.content);
        setCoverImage(post.coverImage);
        setSeoTitle(post.seoTitle || "");
        setSeoDescription(post.seoDescription || "");
        setCoverImageAlt(post.coverImageAlt || "");
        setCategory(post.category);
        setTags(post.tags);

        setInitialSnapshot(
          JSON.stringify({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            seoTitle: post.seoTitle || "",
            seoDescription: post.seoDescription || "",
            coverImageAlt: post.coverImageAlt || "",
            category: post.category,
            tags: post.tags,
          }),
        );
      } catch (err) {
        console.error("Failed to load post:", err);
        setError("دریافت مقاله انجام نشد.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  // ==================== Auto-slug ====================
  useEffect(() => {
    if (isEdit || slugTouched || !title.trim()) return;
    const auto = slugifyEnglish(title);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlug(auto);
  }, [title, slugTouched, isEdit]);

  // ==================== Draft Load (جدید) ====================
  useEffect(() => {
    if (isEdit) return;
    const draft = loadDraft(draftKey);
    if (
      draft &&
      window.confirm("پیش‌نویس ذخیره‌شده پیدا شد. می‌خوای بازیابی کنی؟")
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(draft.title);
      setSlug(draft.slug);
      setExcerpt(draft.excerpt);
      setContent(draft.content);
      setCoverImage(draft.coverImage);
      setSeoTitle(draft.seoTitle || "");
      setSeoDescription(draft.seoDescription || "");
      setCoverImageAlt(draft.coverImageAlt || "");
      setCategory(draft.category as BlogCategory);
      setTags(draft.tags);
      setSlugTouched(true);
    } else if (draft) {
      clearDraft(draftKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== Autosave ====================
  useAutoSave(
    draftKey,
    {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      seoTitle,
      seoDescription,
      coverImageAlt,
      category,
      tags,
      savedAt: new Date().toISOString(),
    },
    !isEdit && (title.trim().length > 0 || content.trim().length > 0),
  );

  // ==================== Unsaved changes ====================
  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        coverImage,
        seoTitle,
        seoDescription,
        coverImageAlt,
        category,
        tags,
      }),
    [
      title,
      slug,
      excerpt,
      content,
      coverImage,
      seoTitle,
      seoDescription,
      coverImageAlt,
      category,
      tags,
    ],
  );

  const hasChanges = isEdit
    ? currentSnapshot !== initialSnapshot
    : title.trim().length > 0 || content.trim().length > 0;

  useUnsavedChanges(hasChanges && !saving && !submitting);

  // ==================== Stats ====================
  const wordCount = useMemo(() => countWords(content), [content]);
  const readingTime = useMemo(() => calculateReadingTime(content), [content]);

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

  // ==================== Insert Image ====================
  const handleInsertImage = (url: string, alt: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const md = `![${alt}](${url})`;
    const prefix = start > 0 && content[start - 1] !== "\n" ? "\n\n" : "";
    const suffix =
      start < content.length && content[start] !== "\n" ? "\n\n" : "";

    const newContent =
      content.slice(0, start) + prefix + md + suffix + content.slice(start);

    setContent(newContent);

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursor = start + prefix.length + md.length + suffix.length;
      textarea.setSelectionRange(newCursor, newCursor);
    });
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
    if (slug.trim() && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) {
      setError("slug باید فقط حروف کوچک انگلیسی، اعداد و - باشد");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        content,
        coverImage: coverImage.trim() || undefined,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        coverImageAlt: coverImageAlt.trim() || undefined,
        category,
        tags,
      };

      if (isEdit && id) {
        const result = await updatePost(id, payload);
        setSuccess("مقاله ذخیره شد");
        setInitialSnapshot(currentSnapshot);
        if (result.post.slug !== id) {
          setTimeout(() => navigate(`/blog/${result.post.slug}`), 1200);
        }
      } else {
        const result = await createPost(payload);
        setSuccess(isAdmin ? "مقاله ساخته و منتشر شد" : "مقاله ساخته شد");
        clearDraft(draftKey);
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

  // ==================== Reset Draft ====================
  const handleResetDraft = () => {
    if (!window.confirm("پیش‌نویس پاک بشه؟")) return;
    clearDraft(draftKey);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverImage("");
    setSeoTitle("");
    setSeoDescription("");
    setCoverImageAlt("");
    setCategory("general");
    setTags([]);
    setSlugTouched(false);
  };

  // ==================== Keyboard shortcuts ====================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    slug,
    excerpt,
    content,
    coverImage,
    seoTitle,
    seoDescription,
    coverImageAlt,
    category,
    tags,
  ]);

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
    <>
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-5">
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
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative shrink-0">
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
                <p className="mt-1 text-xs text-gray-400">
                  {wordCount.toLocaleString("fa-IR")} کلمه ·{" "}
                  {readingTime.toLocaleString("fa-IR")} دقیقه مطالعه
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-black text-gray-300 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] transition-all"
                >
                  {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                  {showPreview ? "بستن پیش‌نمایش" : "پیش‌نمایش"}
                </button>

                {!isEdit && (
                  <button
                    type="button"
                    onClick={handleResetDraft}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/5 px-3 py-2.5 text-xs font-black text-rose-400 hover:bg-rose-500/10 transition-all"
                  >
                    <RotateCcw size={13} />
                    پاک کردن
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl disabled:opacity-40 transition-all"
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
              <AlertCircle
                size={14}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex-1">
                {error}
              </p>
              <button
                onClick={() => setError("")}
                className="shrink-0 text-rose-500"
              >
                <X size={13} />
              </button>
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-2">
              <Check
                size={14}
                className="text-emerald-500 shrink-0 mt-0.5"
                strokeWidth={3}
              />
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex-1">
                {success}
              </p>
            </div>
          )}

          {/* Grid: Editor + Preview */}
          <div
            className={`grid gap-4 ${
              showPreview ? "lg:grid-cols-2" : "lg:grid-cols-1"
            }`}
          >
            {/* ==================== Editor ==================== */}
            <div className="space-y-4 min-w-0">
              {/* Title + Slug + Category + Cover */}
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

                {/* Slug */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      <LinkIcon size={10} />
                      Slug (آدرس انگلیسی)
                    </label>
                    {!isEdit && slugTouched && (
                      <button
                        type="button"
                        onClick={() => {
                          setSlugTouched(false);
                          setSlug(slugifyEnglish(title));
                        }}
                        className="text-[10px] font-black text-[var(--griffin-gold)] hover:underline"
                      >
                        بازسازی خودکار
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      dir="ltr"
                      className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] px-3 py-2.5 text-xs font-english text-gray-500 dark:text-gray-400"
                    >
                      /blog/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value.toLowerCase());
                        setSlugTouched(true);
                      }}
                      placeholder="auto-generated-slug"
                      dir="ltr"
                      maxLength={200}
                      className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all font-english"
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                    فقط حروف کوچک انگلیسی، اعداد و خط تیره
                  </p>
                </div>

                {/* Category + Cover + Alt */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      <Sparkles size={10} />
                      دسته‌بندی
                    </label>
                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value as BlogCategory)
                      }
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
                    <ImageUploader
                      value={coverImage}
                      onChange={setCoverImage}
                      folder="cover"
                      label="تصویر کاور"
                      aspect="video"
                    />
                  </div>

                  {/* 🆕 Alt Text */}
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      <Search size={10} />
                      متن جایگزین تصویر (Alt Text)
                    </label>
                    <input
                      type="text"
                      value={coverImageAlt}
                      onChange={(e) => setCoverImageAlt(e.target.value)}
                      placeholder={
                        title || "توضیح کوتاه تصویر برای موتورهای جستجو"
                      }
                      maxLength={200}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                    />
                    <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                      {coverImageAlt.length.toLocaleString("fa-IR")} / ۲۰۰ — اگه
                      خالی باشه، از عنوان مقاله استفاده میشه
                    </p>
                  </div>
                </div>
              </section>

              {/* Excerpt */}
              <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5">
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
                <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500">
                  {excerpt.length.toLocaleString("fa-IR")} / ۵۰۰
                </p>
              </section>

              {/* 🆕 SEO */}
              <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={13} className="text-[var(--griffin-gold)]" />
                  <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white">
                    تنظیمات SEO
                  </h3>
                  <span className="text-[10px] text-gray-400 font-bold">
                    (اختیاری — برای موتورهای جستجو)
                  </span>
                </div>

                {/* SEO Title */}
                <div>
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                    عنوان SEO
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={
                      title || "اگه خالی باشه، از عنوان مقاله استفاده میشه"
                    }
                    maxLength={70}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                  />
                  <p
                    className={`mt-1 text-[10px] ${
                      seoTitle.length > 70
                        ? "text-rose-500"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {seoTitle.length.toLocaleString("fa-IR")} / ۷۰
                  </p>
                </div>

                {/* SEO Description */}
                <div>
                  <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                    توضیحات SEO (Meta Description)
                  </label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={2}
                    maxLength={160}
                    placeholder={
                      excerpt || "اگه خالی باشه، از خلاصه استفاده میشه"
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all resize-none leading-7"
                  />
                  <p
                    className={`mt-1 text-[10px] ${
                      seoDescription.length > 160
                        ? "text-rose-500"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {seoDescription.length.toLocaleString("fa-IR")} / ۱۶۰
                  </p>
                </div>
              </section>

              {/* Content with toolbar */}
              <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                <MarkdownToolbar
                  textareaRef={textareaRef}
                  value={content}
                  onChange={setContent}
                  onImageClick={() => setShowImageUploader(true)}
                />
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  placeholder="# عنوان&#10;&#10;متن مقاله با Markdown..."
                  className="w-full border-0 bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none resize-y leading-7 font-english"
                />
                <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-gray-200/70 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <FileText size={10} />
                      {wordCount.toLocaleString("fa-IR")} کلمه
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={10} />
                      {readingTime.toLocaleString("fa-IR")} دقیقه
                    </span>
                  </div>
                  <span>{content.length.toLocaleString("fa-IR")} کاراکتر</span>
                </div>
              </section>

              {/* Tags */}
              <section className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5">
                <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  <TagIcon size={10} />
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
                        <Hash size={9} />
                        {tag}
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
              </section>
            </div>

            {/* ==================== Preview ==================== */}
            {showPreview && (
              <div className="space-y-4 min-w-0">
                <section className="lg:sticky lg:top-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200/70 dark:border-white/5 bg-[var(--griffin-gold)]/5">
                    <Eye size={13} className="text-[var(--griffin-gold)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                      Live Preview
                    </span>
                  </div>

                  <div className="p-5 max-h-[70vh] overflow-y-auto dashboard-scroll">
                    {/* Cover */}
                    {coverImage.trim() && (
                      <div className="relative w-full aspect-video overflow-hidden rounded-xl mb-5 bg-gray-100 dark:bg-white/5">
                        <img
                          src={coverImage}
                          alt={coverImageAlt || title || "Cover"}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Category */}
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] text-[10px] font-black mb-3">
                      {CATEGORY_LABELS[category]}
                    </span>

                    {/* Title */}
                    <h1 className="font-heading text-2xl font-black text-gray-900 dark:text-white leading-tight mb-3">
                      {title || "عنوان مقاله..."}
                    </h1>

                    {/* Excerpt */}
                    {excerpt.trim() && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-7 mb-5 pb-5 border-b border-gray-200/70 dark:border-white/5">
                        {excerpt}
                      </p>
                    )}

                    {/* Content */}
                    <MarkdownPreview content={content} />

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div className="mt-6 pt-5 border-t border-gray-200/70 dark:border-white/5 flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 🆕 SEO Preview */}
                    {(seoTitle.trim() || seoDescription.trim()) && (
                      <div className="mt-6 pt-5 border-t border-gray-200/70 dark:border-white/5">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                          پیش‌نمایش Google
                        </p>
                        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-3">
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-500 font-english">
                            griffinedu.ir › blog › {slug || "..."}
                          </p>
                          <p className="mt-1 text-blue-700 dark:text-blue-400 font-bold text-sm line-clamp-1">
                            {seoTitle.trim() || title || "عنوان SEO..."}
                          </p>
                          <p className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2">
                            {seoDescription.trim() ||
                              excerpt ||
                              "توضیحات SEO..."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>

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

      {/* Image Uploader Modal */}
      <ContentImageUploader
        open={showImageUploader}
        onClose={() => setShowImageUploader(false)}
        onInsert={handleInsertImage}
      />
    </>
  );
};

export default BlogEditor;
