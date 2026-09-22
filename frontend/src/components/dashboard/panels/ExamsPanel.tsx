import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  FileQuestion,
  LoaderCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getExams } from "../../../api/examApi";
import type { Exam } from "../../../types/exam";

type ExamTab = "all" | "available" | "completed" | "in-progress";

const statusLabels: Record<string, string> = {
  published: "منتشرشده",
  draft: "پیش‌نویس",
  review: "در حال بررسی",
  archived: "آرشیو",
};

const statusStyles: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  published: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  draft: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
  },
  review: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  archived: {
    bg: "bg-slate-500/10",
    text: "text-slate-500 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

const ExamsPanel = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ExamTab>("all");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getExams();
        if (!cancelled) setExams(data.exams);
      } catch (err) {
        console.error("Failed to load exams:", err);
        if (!cancelled) setError("دریافت آزمون‌ها انجام نشد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // 🔹 آمار
  const stats = useMemo(() => {
    const now = new Date();
    const available = exams.filter(
      (e) => e.status === "published" && new Date(e.examDate) > now,
    );
    const completed = exams.filter(
      (e) => e.status === "published" && new Date(e.examDate) <= now,
    );

    return {
      total: exams.length,
      available: available.length,
      completed: completed.length,
    };
  }, [exams]);

  // 🔹 فیلتر
  const filteredExams = useMemo(() => {
    let result = exams;
    const now = new Date();

    if (activeTab === "available") {
      result = result.filter(
        (e) => e.status === "published" && new Date(e.examDate) > now,
      );
    } else if (activeTab === "completed") {
      result = result.filter(
        (e) => e.status === "published" && new Date(e.examDate) <= now,
      );
    } else if (activeTab === "in-progress") {
      result = [];
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(q));
    }

    return result;
  }, [exams, activeTab, search]);

  const tabs: { key: ExamTab; label: string; count: number }[] = [
    { key: "all", label: "همه", count: stats.total },
    { key: "available", label: "در دسترس", count: stats.available },
    { key: "completed", label: "انجام‌شده", count: stats.completed },
    { key: "in-progress", label: "در حال انجام", count: 0 },
  ];

  return (
    <div className="space-y-5">
      {/* ==================== HERO (تیره) ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="relative shrink-0 self-center lg:self-auto">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
              <BookOpen size={36} strokeWidth={2.3} />
            </div>
          </div>

          <div className="flex-1 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 mb-2">
              <Sparkles
                size={12}
                className="text-[var(--griffin-gold)] animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Exams Center
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
              آزمون‌های من
            </h1>

            <p className="mt-2 text-sm text-gray-400 leading-7">
              آزمون‌های در دسترس رو ببین، شرکت کن و نتایجت رو تحلیل کن.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== ۳ کارت آمار ==================== */}
      <section className="grid grid-cols-3 gap-3">
        {[
          {
            icon: BookOpen,
            label: "کل آزمون‌ها",
            value: stats.total,
            color: "text-gray-900 dark:text-white",
            bg: "bg-gray-500/10 dark:bg-white/10",
          },
          {
            icon: Clock3,
            label: "در دسترس",
            value: stats.available,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            icon: CheckCircle2,
            label: "انجام‌شده",
            value: stats.completed,
            color: "text-[var(--griffin-gold)]",
            bg: "bg-[var(--griffin-gold)]/10",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
            >
              <div
                className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon size={16} className={stat.color} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <p
                className={`font-heading text-2xl font-black mt-1 ${stat.color}`}
              >
                {stat.value.toLocaleString("fa-IR")}
              </p>
            </div>
          );
        })}
      </section>

      {/* ==================== Tabs + Search ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="p-4 border-b border-gray-200/70 dark:border-white/5">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    group inline-flex items-center gap-2 rounded-xl px-3.5 py-2
                    text-xs font-black transition-all
                    ${
                      isActive
                        ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                        : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                    }
                  `}
                >
                  {tab.label}
                  <span
                    className={`
                      inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-md
                      text-[9px] font-black tabular-nums
                      ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                      }
                    `}
                  >
                    {tab.count.toLocaleString("fa-IR")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در عنوان آزمون..."
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-2.5 pr-10 pl-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
            />
          </div>
        </div>

        {/* ==================== لیست آزمون‌ها ==================== */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
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
                در حال دریافت آزمون‌ها...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center mb-3">
              <AlertCircle size={24} className="text-rose-500" />
            </div>
            <p className="text-sm font-bold text-rose-500 dark:text-rose-400">
              {error}
            </p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <FileQuestion
                size={28}
                className="text-gray-400 dark:text-gray-600"
              />
            </div>
            <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
              {search.trim()
                ? "آزمونی با این جستجو پیدا نشد"
                : activeTab === "available"
                  ? "هنوز آزمون در دسترسی نداری"
                  : activeTab === "completed"
                    ? "هنوز آزمونی رو انجام ندادی"
                    : "هنوز آزمونی موجود نیست"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {search.trim()
                ? "جستجو رو تغییر بده"
                : "به‌زودی آزمون‌های جدید اضافه می‌شن."}
            </p>
          </div>
        ) : (
          <div className="p-4 grid gap-3 sm:grid-cols-2">
            {filteredExams.map((exam) => {
              const examDate = new Date(exam.examDate);
              const isPast = examDate <= new Date();
              const statusStyle =
                statusStyles[exam.status] ?? statusStyles.draft;
              const totalQuestions =
                exam.booklets?.reduce(
                  (sum, b) => sum + (b.booklet?.questions?.length ?? 0),
                  0,
                ) ?? 0;
              const totalDuration =
                exam.booklets?.reduce(
                  (sum, b) => sum + (b.booklet?.duration ?? 0),
                  0,
                ) ?? 0;

              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => navigate(`/tests/${exam.id}`)}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-4 text-right transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex items-center gap-1.5 mb-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${statusStyle.dot}`}
                          />
                          {statusLabels[exam.status] ?? exam.status}
                        </span>
                        {isPast && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-500/10 text-gray-500 dark:text-gray-400 text-[9px] font-black">
                            <CheckCircle2 size={8} />
                            انجام‌شده
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white line-clamp-2 leading-5 group-hover:text-[var(--griffin-gold)] transition-colors">
                        {exam.title}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      {
                        icon: FileQuestion,
                        label: "سؤال",
                        value: totalQuestions.toLocaleString("fa-IR"),
                      },
                      {
                        icon: Clock3,
                        label: "دقیقه",
                        value: totalDuration.toLocaleString("fa-IR"),
                      },
                    ].map((info, i) => {
                      const Icon = info.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-[10px]"
                        >
                          <Icon
                            size={11}
                            className="text-[var(--griffin-gold)] shrink-0"
                          />
                          <span className="text-gray-500 dark:text-gray-400">
                            {info.label}:
                          </span>
                          <span className="font-black text-gray-900 dark:text-white">
                            {info.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-200/70 dark:border-white/5">
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                      <Calendar size={10} />
                      {examDate.toLocaleDateString("fa-IR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-[var(--griffin-gold)] group-hover:-translate-x-1 transition-transform">
                      مشاهده
                      <ArrowLeft size={10} className="rotate-180" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ExamsPanel;