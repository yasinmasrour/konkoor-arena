import { useEffect, useMemo, useState, useRef } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpDown,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileQuestion,
  LoaderCircle,
  PlayCircle,
  Search,
  Sparkles,
  Timer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getExams } from "../../../api/examApi";
import { getMyAttempts } from "../../../services/attemptService";
import { useAuth } from "../../../context/AuthContext";
import type { Exam } from "../../../types/exam";

type ExamTab = "all" | "available" | "completed" | "in-progress";

type SortOption =
  | "status"        // وضعیت (پیش‌فرض)
  | "newest"        // جدیدترین اول
  | "oldest"        // قدیمی‌ترین اول
  | "most-questions" // بیشترین سوال
  | "least-time"    // کمترین زمان
  | "score";        // نمره (فقط انجام‌شده‌ها)

const sortLabels: Record<SortOption, string> = {
  status: "وضعیت",
  newest: "جدیدترین اول",
  oldest: "قدیمی‌ترین اول",
  "most-questions": "بیشترین سوال",
  "least-time": "کمترین زمان",
  score: "نمره",
};

// ==================== Helper: پنجره‌ی دسترسی ====================
function getExamAccessWindow(exam: Exam) {
  const examDate = new Date(exam.examDate);
  if (isNaN(examDate.getTime())) return null;

  const year = examDate.getFullYear();
  const month = examDate.getMonth();
  const day = examDate.getDate();

  const [startH, startM] = (exam.startTime || "00:00")
    .split(":")
    .map(Number);
  const startDateTime = new Date(year, month, day, startH, startM, 0, 0);

  let endDateTime: Date | null = null;
  if (exam.endTime) {
    const [endH, endM] = exam.endTime.split(":").map(Number);
    endDateTime = new Date(year, month, day, endH, endM, 0, 0);
  }

  return { startDateTime, endDateTime };
}

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

// ==================== Attempt Info ====================
interface AttemptInfo {
  id: string;
  status: string;
  score: number;
  percentage: number;
  submittedAt: string | null;
}

// ==================== Sort Dropdown ====================
interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SortDropdown = ({ value, onChange }: SortDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const options: SortOption[] = [
    "status",
    "newest",
    "oldest",
    "most-questions",
    "least-time",
    "score",
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-[11px] font-black text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] transition-all"
      >
        <ArrowUpDown size={12} />
        <span className="hidden sm:inline">مرتب‌سازی:</span>
        <span className="text-[var(--griffin-gold)]">
          {sortLabels[value]}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 w-44 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0d14] shadow-2xl shadow-black/20 dark:shadow-black/50 p-1">
          {options.map((opt) => {
            const isActive = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2
                  text-[11px] font-bold text-right transition-colors
                  ${
                    isActive
                      ? "bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                  }
                `}
              >
                {sortLabels[opt]}
                {isActive && <Check size={12} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==================== ExamsPanel ====================
const ExamsPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Map<string, AttemptInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ExamTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("status");
  const [now, setNow] = useState(new Date());

  const isStudent = user?.role?.name === "STUDENT";

  // ==================== به‌روزرسانی هر دقیقه ====================
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  // ==================== Load ====================
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getExams();
        if (cancelled) return;
        setExams(data.exams);

        if (isStudent) {
          try {
            const attemptsData = await getMyAttempts();
            const map = new Map<string, AttemptInfo>();
            for (const a of attemptsData.attempts) {
              map.set(a.exam.id, {
                id: a.id,
                status: a.status,
                score: a.score,
                percentage: a.percentage,
                submittedAt: a.submittedAt,
              });
            }
            if (!cancelled) setAttempts(map);
          } catch (err) {
            console.error("Failed to load my attempts:", err);
          }
        }
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
  }, [isStudent]);

  // ==================== helper: وضعیت آزمون ====================
  type ExamStatus =
    | "completed"
    | "in-progress"
    | "available"
    | "expired"
    | "upcoming";

  const getExamStatus = (exam: Exam): ExamStatus => {
    const attempt = attempts.get(exam.id);

    if (attempt) {
      if (attempt.status === "submitted") return "completed";
      if (attempt.status === "started") return "in-progress";
    }

    const window = getExamAccessWindow(exam);
    if (!window) return "expired";

    if (now < window.startDateTime) return "upcoming";
    if (window.endDateTime && now > window.endDateTime) return "expired";
    return "available";
  };

  // ==================== آمار ====================
  const stats = useMemo(() => {
    let available = 0;
    let completed = 0;
    let inProgress = 0;

    for (const exam of exams) {
      const status = getExamStatus(exam);
      if (status === "available") available++;
      else if (status === "completed") completed++;
      else if (status === "in-progress") inProgress++;
    }

    return { total: exams.length, available, completed, inProgress };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exams, attempts, now]);

  // ==================== فیلتر + مرتب‌سازی ====================
  const filteredExams = useMemo(() => {
    let result = exams;

    if (activeTab === "available") {
      result = result.filter((e) => getExamStatus(e) === "available");
    } else if (activeTab === "completed") {
      result = result.filter((e) => getExamStatus(e) === "completed");
    } else if (activeTab === "in-progress") {
      result = result.filter((e) => getExamStatus(e) === "in-progress");
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(q));
    }

    // 🆕 مرتب‌سازی بر اساس انتخاب کاربر
    const sorted = [...result];

    const getTotalQuestions = (e: Exam) =>
      e.booklets?.reduce(
        (sum, b) => sum + (b.booklet?.questions?.length ?? 0),
        0,
      ) ?? 0;

    const getTotalDuration = (e: Exam) =>
      e.booklets?.reduce((sum, b) => sum + (b.booklet?.duration ?? 0), 0) ?? 0;

    switch (sortBy) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.examDate).getTime() - new Date(a.examDate).getTime(),
        );
        break;

      case "oldest":
        sorted.sort(
          (a, b) =>
            new Date(a.examDate).getTime() - new Date(b.examDate).getTime(),
        );
        break;

      case "most-questions":
        sorted.sort((a, b) => getTotalQuestions(b) - getTotalQuestions(a));
        break;

      case "least-time":
        sorted.sort((a, b) => getTotalDuration(a) - getTotalDuration(b));
        break;

      case "score": {
        // فقط انجام‌شده‌ها بالای لیست، بر اساس درصد
        const order: Record<ExamStatus, number> = {
          "in-progress": 0,
          available: 1,
          upcoming: 2,
          completed: 3,
          expired: 4,
        };
        sorted.sort((a, b) => {
          const sa = getExamStatus(a);
          const sb = getExamStatus(b);
          // انجام‌شده‌ها همیشه بالا
          if (sa === "completed" && sb !== "completed") return -1;
          if (sa !== "completed" && sb === "completed") return 1;
          if (sa === "completed" && sb === "completed") {
            const pa = attempts.get(a.id)?.percentage ?? 0;
            const pb = attempts.get(b.id)?.percentage ?? 0;
            return pb - pa;
          }
          return order[sa] - order[sb];
        });
        break;
      }

      case "status":
      default: {
        const order: Record<ExamStatus, number> = {
          "in-progress": 0,
          available: 1,
          upcoming: 2,
          completed: 3,
          expired: 4,
        };
        sorted.sort((a, b) => {
          const sa = order[getExamStatus(a)];
          const sb = order[getExamStatus(b)];
          if (sa !== sb) return sa - sb;
          return (
            new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
          );
        });
        break;
      }
    }

    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exams, attempts, activeTab, search, sortBy, now]);

  const tabs: { key: ExamTab; label: string; count: number }[] = [
    { key: "all", label: "همه", count: stats.total },
    { key: "available", label: "در دسترس", count: stats.available },
    { key: "completed", label: "انجام‌شده", count: stats.completed },
    { key: "in-progress", label: "در حال انجام", count: stats.inProgress },
  ];

  return (
    <div className="space-y-5">
      {/* HERO (بدون تغییر) */}
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

      {/* ۳ کارت آمار (بدون تغییر) */}
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

      {/* Tabs + Search + Sort */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="p-4 border-b border-gray-200/70 dark:border-white/5">
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

          {/* Search + Sort */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
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

            {/* 🆕 دکمه‌ی مرتب‌سازی */}
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* لیست آزمون‌ها (بدون تغییر) */}
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
                    : activeTab === "in-progress"
                      ? "آزمون نیمه‌کاره نداری"
                      : "هنوز آزمونی موجود نیست"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {search.trim()
                ? "جستجو رو تغییر بده"
                : "به‌زودی آزمون‌های جدید اضافه می‌شن."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200/70 dark:divide-white/5">
            {filteredExams.map((exam) => {
              const examStatus = getExamStatus(exam);
              const attempt = attempts.get(exam.id);
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

              const examDate = new Date(exam.examDate);

              const config: {
                label: string;
                badgeBg: string;
                badgeText: string;
                badgeIcon: typeof Clock3;
                actionLabel: string;
                actionColor: string;
              } = (() => {
                switch (examStatus) {
                  case "completed":
                    return {
                      label: "انجام‌شده",
                      badgeBg: "bg-emerald-500/10",
                      badgeText: "text-emerald-600 dark:text-emerald-400",
                      badgeIcon: CheckCircle2,
                      actionLabel: "مشاهده نتیجه",
                      actionColor: "text-emerald-500",
                    };
                  case "in-progress":
                    return {
                      label: "در حال انجام",
                      badgeBg: "bg-amber-500/10",
                      badgeText: "text-amber-600 dark:text-amber-400",
                      badgeIcon: Timer,
                      actionLabel: "ادامه آزمون",
                      actionColor: "text-amber-500",
                    };
                  case "available":
                    return {
                      label: "در دسترس",
                      badgeBg: "bg-[var(--griffin-gold)]/10",
                      badgeText: "text-[var(--griffin-gold)]",
                      badgeIcon: PlayCircle,
                      actionLabel: "شروع آزمون",
                      actionColor: "text-[var(--griffin-gold)]",
                    };
                  case "upcoming":
                    return {
                      label: "به‌زودی",
                      badgeBg: "bg-blue-500/10",
                      badgeText: "text-blue-600 dark:text-blue-400",
                      badgeIcon: Clock3,
                      actionLabel: "شروع نشده",
                      actionColor: "text-blue-500",
                    };
                  case "expired":
                  default:
                    return {
                      label: "زمان تموم شده",
                      badgeBg: "bg-gray-500/10",
                      badgeText: "text-gray-500 dark:text-gray-400",
                      badgeIcon: Clock3,
                      actionLabel: "مشاهده",
                      actionColor: "text-gray-400",
                    };
                }
              })();

              const BadgeIcon = config.badgeIcon;

              return (
                <button
                  key={exam.id}
                  type="button"
                  onClick={() => navigate(`/tests/${exam.id}`)}
                  className="group relative w-full text-right transition-colors hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3 p-3 sm:p-4">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-md opacity-0 group-hover:opacity-30 transition-opacity" />
                      <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-md">
                        <FileQuestion size={18} strokeWidth={2.3} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black ${config.badgeBg} ${config.badgeText}`}
                        >
                          <BadgeIcon size={8} />
                          {config.label}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          <span
                            className={`w-1 h-1 rounded-full ${statusStyle.dot}`}
                          />
                          {statusLabels[exam.status] ?? exam.status}
                        </span>
                      </div>

                      <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white truncate group-hover:text-[var(--griffin-gold)] transition-colors">
                        {exam.title}
                      </h3>

                      <div className="mt-1 flex items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <FileQuestion size={9} />
                          {totalQuestions.toLocaleString("fa-IR")} سوال
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={9} />
                          {totalDuration.toLocaleString("fa-IR")} دقیقه
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={9} />
                          {examDate.toLocaleDateString("fa-IR", {
                            month: "short",
                            day: "numeric",
                          })}
                          {exam.startTime && ` · ${exam.startTime}`}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {examStatus === "completed" && attempt && (
                        <div className="hidden sm:block text-center px-2">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                            درصد
                          </p>
                          <p className="font-heading text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                            {Math.round(attempt.percentage).toLocaleString(
                              "fa-IR",
                            )}
                            ٪
                          </p>
                        </div>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-black ${config.actionColor} group-hover:-translate-x-1 transition-transform`}
                      >
                        {config.actionLabel}
                        <ArrowLeft size={10} className="rotate-180" />
                      </span>
                    </div>
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