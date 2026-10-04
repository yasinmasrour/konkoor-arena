import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Crown,
  FileQuestion,
  Gift,
  Layers,
  LoaderCircle,
  Lock,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { getExamById } from "../services/examService";
import { getMyAttempts, startAttempt } from "../services/attemptService";
import { purchaseExam } from "../api/examPurchaseApi";
import type { ExamDetail as ExamDetailType } from "../types/examDetail";
import { useAuth } from "../context/AuthContext";
import CommentsSection from "../components/comments/CommentsSection";

// ==================== ابزار ====================
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fa-IR", {
    dateStyle: "long",
  });

const gradeLabels: Record<string, string> = {
  "10": "دهم",
  "11": "یازدهم",
  "12": "دوازدهم",
};

const majorLabels: Record<string, string> = {
  math: "ریاضی",
  experimental: "تجربی",
  humanities: "انسانی",
  Math: "ریاضی",
};

const lessonLabels: Record<string, string> = {
  ریاضی: "ریاضی",
  فیزیک: "فیزیک",
  شیمی: "شیمی",
  زیست: "زیست",
  ادبیات: "ادبیات",
  عربی: "عربی",
  دینی: "دینی",
  زبان: "زبان",
  chemistry: "شیمی",
  biology: "زیست",
  math: "ریاضی",
  physics: "فیزیک",
};

const statusLabels: Record<string, string> = {
  draft: "پیش‌نویس",
  published: "منتشرشده",
  archived: "بایگانی",
};

// ==================== کامپوننت ====================
const ExamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, refreshFeatures } = useAuth();

  const [exam, setExam] = useState<ExamDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  // 🆕 attempt قبلی کاربر
  const [myAttempt, setMyAttempt] = useState<{
    id: string;
    status: string;
    score: number;
    percentage: number;
    submittedAt: string | null;
  } | null>(null);

  const isStudent = user?.role?.name === "STUDENT";

  // 🆕 آزمون رایگان
  const isFree = exam?.accessType === "FREE";

  // ==================== Fetch ====================
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getExamById(id);
        setExam(data.exam);

        // 🆕 اگه دانش‌آموزه، attempt قبلی رو چک کن
        if (isStudent) {
          try {
            const attemptsData = await getMyAttempts();
            const found = attemptsData.attempts.find((a) => a.exam.id === id);
            if (found) {
              setMyAttempt({
                id: found.id,
                status: found.status,
                score: found.score,
                percentage: found.percentage,
                submittedAt: found.submittedAt,
              });
            }
          } catch (err) {
            console.error("Failed to load my attempts:", err);
          }
        }
      } catch (err) {
        console.error("Failed to load exam:", err);
        setError("دریافت اطلاعات آزمون با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, isStudent]);

  // ==================== آمار ====================
  const stats = useMemo(() => {
    if (!exam) {
      return {
        questionCount: 0,
        duration: 0,
        bookletCount: 0,
      };
    }

    const questionCount = exam.booklets.reduce(
      (total, item) => total + item.booklet.questions.length,
      0,
    );

    const duration = exam.booklets.reduce(
      (total, item) => total + item.booklet.duration,
      0,
    );

    return {
      questionCount,
      duration,
      bookletCount: exam.booklets.length,
    };
  }, [exam]);

  // ==================== Start/Continue ====================
  const handleStartAttempt = async () => {
    if (!exam || starting) return;

    // 🆕 چک دسترسی: اگه رایگان باشه، نیازی به isPurchased نیست
    const canAccess = isFree || exam.isPurchased;
    if (!canAccess) return;

    if (myAttempt) {
      if (myAttempt.status === "submitted") {
        navigate(`/attempts/${myAttempt.id}/result`);
      } else {
        navigate(`/attempts/${myAttempt.id}`);
      }
      return;
    }

    setStarting(true);
    try {
      const data = await startAttempt(exam.id);
      const attemptId = data.result?.id;

      if (!attemptId) {
        console.error("No attempt ID in response:", data);
        setError("خطا: شناسایی آزمون انجام نشد");
        setStarting(false);
        return;
      }

      navigate(`/attempts/${attemptId}`);
    } catch (error) {
      console.error("START ATTEMPT ERROR:", error);
      setError("شروع آزمون با مشکل مواجه شد");
      setStarting(false);
    }
  };

  // ==================== 🆕 Purchase ====================
  const handlePurchaseExam = async (gateway: "wallet" | "zarinpal") => {
    if (!exam || purchasing) return;

    setPurchasing(true);
    setError("");

    try {
      const result = await purchaseExam(exam.id, gateway);

      // 🆕 اگه پرداخت مستقیم (کیف پول) موفق بود
      if (result.purchase?.status === "paid") {
        await refreshFeatures();
        const data = await getExamById(exam.id);
        setExam(data.exam);
        return;
      }

      // 🆕 اگه paymentUrl داشتیم (زرین‌پال) → ریدایرکت
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      setError("پرداخت ایجاد شد ولی لینک پرداخت موجود نیست.");
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "خرید آزمون با مشکل مواجه شد";
      setError(message);
    } finally {
      setPurchasing(false);
    }
  };

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <LoaderCircle size={28} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت آزمون...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error || !exam) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-4">
            {error || "آزمون پیدا نشد"}
          </p>
          <button
            onClick={() => navigate("/dashboard?section=exams")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg"
          >
            <ArrowLeft size={13} />
            بازگشت به آزمون‌ها
          </button>
        </div>
      </main>
    );
  }

  // ==================== JSX ====================
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* ==================== BACK ==================== */}
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت
        </button>

        {/* ==================== HERO ==================== */}
        <section className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/10 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                  <FileQuestion size={28} strokeWidth={2.3} />
                </div>
              </div>

              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Exam Detail
                  </span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  {exam.title}
                </h1>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span
                    className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black
                      ${
                        exam.status === "published"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                      }
                    `}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        exam.status === "published"
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-gray-400"
                      }`}
                    />
                    {statusLabels[exam.status] ?? exam.status}
                  </span>

                  {/* 🆕 Badge رایگان */}
                  {isFree && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-gradient-to-l from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/40">
                      <Gift size={11} />
                      آزمون رایگان
                    </span>
                  )}

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(exam.examDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* دکمه اصلی */}
            {isStudent && (
              <div className="shrink-0 space-y-2 lg:max-w-xs">
                {/* 🆕 آزمون رایگان یا دسترسی داره */}
                {isFree && !myAttempt ? (
                  <button
                    onClick={handleStartAttempt}
                    disabled={starting || exam.status !== "published"}
                    className="group relative w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/60 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {starting ? (
                        <>
                          <LoaderCircle size={17} className="animate-spin" />
                          در حال شروع...
                        </>
                      ) : (
                        <>
                          <PlayCircle size={17} />
                          شروع آزمون رایگان
                        </>
                      )}
                    </span>
                    {!starting && (
                      <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    )}
                  </button>
                ) : !exam.isPurchased && !myAttempt ? (
                  <div className="space-y-2">
                    {/* دکمه خرید آزمون */}
                    <button
                      type="button"
                      onClick={() => void handlePurchaseExam("zarinpal")}
                      disabled={purchasing || exam.status !== "published"}
                      className="group relative w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/60 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {purchasing ? (
                          <>
                            <LoaderCircle size={17} className="animate-spin" />
                            در حال انتقال به درگاه...
                          </>
                        ) : (
                          <>
                            <Crown size={17} />
                            خرید آزمون —{" "}
                            {new Intl.NumberFormat("fa-IR").format(
                              Math.floor((exam.price || 3000000) / 10),
                            )}{" "}
                            تومان
                          </>
                        )}
                      </span>
                      {!purchasing && (
                        <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      )}
                    </button>

                    {/* توضیحات زیر دکمه */}
                    <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 leading-5">
                      <ShieldCheck size={10} className="inline ml-1" />
                      پرداخت امن از طریق زرین‌پال
                    </p>

                    <p className="text-[10px] text-center text-gray-500 dark:text-gray-400 leading-5">
                      <Lock size={10} className="inline ml-1" />
                      یا با خرید{" "}
                      <button
                        type="button"
                        onClick={() => navigate("/subscriptions")}
                        className="font-black text-[var(--griffin-gold)] hover:underline"
                      >
                        اشتراک
                      </button>
                      ، به همه آزمون‌ها دسترسی داشته باش
                    </p>
                  </div>
                ) : myAttempt?.status === "submitted" ? (
                  <button
                    onClick={handleStartAttempt}
                    className="group relative inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 px-6 py-3.5 text-sm font-black text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:-translate-y-0.5 transition-all"
                  >
                    <CheckCircle2 size={17} />
                    مشاهده نتیجه
                  </button>
                ) : myAttempt?.status === "started" ? (
                  <button
                    onClick={handleStartAttempt}
                    className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <PlayCircle size={17} />
                      ادامه آزمون
                    </span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                ) : (
                  <button
                    onClick={handleStartAttempt}
                    disabled={starting || exam.status !== "published"}
                    className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {starting ? (
                        <>
                          <LoaderCircle size={17} className="animate-spin" />
                          در حال شروع...
                        </>
                      ) : (
                        <>
                          <PlayCircle size={17} />
                          شروع آزمون
                        </>
                      )}
                    </span>
                    {!starting && (
                      <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ==================== آمار سریع ==================== */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: FileQuestion,
              label: "تعداد سوال",
              value: `${stats.questionCount.toLocaleString("fa-IR")} سوال`,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              icon: Clock,
              label: "مدت آزمون",
              value: `${stats.duration.toLocaleString("fa-IR")} دقیقه`,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
            {
              icon: Layers,
              label: "تعداد دفترچه",
              value: `${stats.bookletCount.toLocaleString("fa-IR")} دفترچه`,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
            {
              icon: CalendarDays,
              label: "تاریخ آزمون",
              value: formatDate(exam.examDate),
              color: "text-[var(--griffin-gold)]",
              bg: "bg-[var(--griffin-gold)]/10",
              small: true,
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon size={18} className={stat.color} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p
                  className={`font-heading font-black mt-1 ${
                    stat.small ? "text-sm" : "text-xl"
                  } ${stat.color}`}
                >
                  {stat.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* ==================== نتیجه قبلی (اگه هست) ==================== */}
        {myAttempt?.status === "submitted" && (
          <section className="relative rounded-3xl overflow-hidden border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-transparent to-[var(--griffin-gold)]/10 backdrop-blur-sm p-5">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-40" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-lg">
                  <Trophy size={22} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
                  نتیجه قبلی تو
                </p>
                <p className="font-heading text-lg font-black text-gray-900 dark:text-white">
                  توی این آزمون شرکت کردی
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {myAttempt.submittedAt &&
                    `تاریخ: ${formatDate(myAttempt.submittedAt)}`}
                </p>
              </div>

              <div className="shrink-0 grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    نمره
                  </p>
                  <p className="font-heading text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {myAttempt.score.toLocaleString("fa-IR")}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    درصد
                  </p>
                  <p className="font-heading text-2xl font-black text-[var(--griffin-gold)] tabular-nums">
                    {Math.round(myAttempt.percentage).toLocaleString("fa-IR")}٪
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================== لیست دفترچه‌ها ==================== */}
        <section className="relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

          <div className="relative p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Booklets
                </p>
                <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white -mt-0.5">
                  دفترچه‌های آزمون
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {exam.booklets
                .sort((a, b) => a.order - b.order)
                .map((item) => {
                  const lesson = item.booklet.lesson;
                  const lessonLabel = lessonLabels[lesson] ?? lesson;
                  const qCount = item.booklet.questions.length;

                  return (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-4 hover:border-[var(--griffin-gold)]/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-30" />
                          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-lg shadow-lg">
                            {item.order.toLocaleString("fa-IR")}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-heading text-base font-black text-gray-900 dark:text-white">
                              {lessonLabel}
                            </p>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              ·
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {gradeLabels[item.booklet.grade] ??
                                item.booklet.grade}{" "}
                              |{" "}
                              {majorLabels[item.booklet.major] ??
                                item.booklet.major}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-4">
                          <div className="text-center hidden sm:block">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
                              سوال
                            </p>
                            <p className="font-heading text-sm font-black text-blue-600 dark:text-blue-400 tabular-nums">
                              {qCount.toLocaleString("fa-IR")}
                            </p>
                          </div>

                          <div className="text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-0.5">
                              زمان
                            </p>
                            <p className="font-heading text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                              {item.booklet.duration.toLocaleString("fa-IR")} د
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>

        {/* ==================== نظرات ==================== */}
        <CommentsSection examId={exam.id} />

        {/* ==================== اطلاعات اضافی ==================== */}
        <section className="relative rounded-3xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 backdrop-blur-sm p-5">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
                <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                  <Target size={18} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Rules
                </p>
                <h2 className="font-heading text-base font-black text-gray-900 dark:text-white -mt-0.5">
                  قوانین آزمون
                </h2>
              </div>
            </div>

            <ul className="space-y-2.5">
              {[
                "هر دفترچه زمان مستقل داره و بعد از تموم شدن زمان، به‌صورت خودکار به دفترچه بعدی می‌ری.",
                "نمی‌تونی به دفترچه‌های قبلی برگردی.",
                "بین دفترچه‌ها ۱۰ ثانیه استراحت هست.",
                "پاسخ‌های اشتباه نمره منفی دارن (هر ۳ غلط = ۱ نمره منفی).",
                "زمان توی خارج از آزمون هم متوقف نمی‌شه، پس بهتره تا آخر بمونی.",
              ].map((rule, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-xs leading-6 text-gray-700 dark:text-gray-300"
                >
                  <div className="w-5 h-5 rounded-full bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap
                      size={10}
                      className="text-[var(--griffin-gold)]"
                      strokeWidth={2.5}
                    />
                  </div>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ExamDetail;