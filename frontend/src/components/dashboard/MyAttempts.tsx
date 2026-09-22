import { useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getMyAttempts } from "../../services/attemptService";
import type { MyAttempt } from "../../types/attempt";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const MyAttempts = () => {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<MyAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const data = await getMyAttempts();
        setAttempts(data.attempts);
      } catch (err) {
        console.error("GET MY ATTEMPTS ERROR:", err);
        setError("دریافت آزمون‌های شما با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    void fetchAttempts();
  }, []);

  // ==================== Loading ====================
  if (loading) {
    return (
      <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-40" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <LoaderCircle size={16} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت آزمون‌ها...
          </p>
        </div>
      </section>
    );
  }

  // ==================== Error ====================
  if (error) {
    return (
      <section className="rounded-2xl border border-rose-500/30 bg-gradient-to-l from-rose-500/10 to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
            <AlertCircle size={16} className="text-rose-500" />
          </div>
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {/* ==================== هدر ==================== */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-40" />
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
            <BookOpen size={20} strokeWidth={2.3} />
          </div>
        </div>
        <div>
          <div className="inline-flex items-center gap-2">
            <Sparkles size={11} className="text-[var(--griffin-gold)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
              My Attempts
            </span>
          </div>
          <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white -mt-0.5">
            آزمون‌های من
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            آزمون‌هایی که تاکنون شرکت کرده‌اید
          </p>
        </div>
      </div>

      {/* ==================== خالی ==================== */}
      {attempts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] backdrop-blur-sm p-10 text-center">
          <div className="relative inline-flex mb-4">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-40" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center">
              <Target size={28} className="text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          <p className="font-heading text-base font-black text-gray-900 dark:text-white mb-2">
            هنوز در هیچ آزمونی شرکت نکرده‌ای!
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 max-w-md mx-auto leading-6">
            برای شروع، اولین آزمونت رو از بخش آزمون‌ها انتخاب کن.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard?section=exams")}
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <BookOpen size={14} />
              مشاهده آزمون‌ها
            </span>
            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>
      ) : (
        /* ==================== لیست ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {attempts.map((attempt, index) => {
            const isSubmitted = attempt.status === "submitted";

            return (
              <article
                key={attempt.id}
                style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
                className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/10 hover:border-[var(--griffin-gold)]/40 animate-[fadeInUp_0.4s_ease-out_both]"
              >
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

                {/* هدر */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white truncate group-hover:text-[var(--griffin-gold)] transition-colors">
                      {attempt.exam.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                        <Calendar size={10} />
                        {formatDate(attempt.exam.examDate)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`
                      shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                      text-[10px] font-black
                      ${
                        isSubmitted
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]"
                      }
                    `}
                  >
                    {isSubmitted ? (
                      <CheckCircle2 size={10} />
                    ) : (
                      <Clock3 size={10} />
                    )}
                    {isSubmitted ? "تکمیل شده" : "در حال انجام"}
                  </span>
                </div>

                {/* آمار (اگه submitted) */}
                {isSubmitted && (
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <div className="rounded-xl bg-[var(--griffin-gold)]/5 dark:bg-white/[0.02] border border-[var(--griffin-gold)]/20 dark:border-white/5 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Target
                          size={10}
                          className="text-[var(--griffin-gold)]"
                        />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                          درصد
                        </span>
                      </div>
                      <p className="font-heading text-xl font-black text-[var(--griffin-gold)] tabular-nums">
                        {Math.round(attempt.percentage).toLocaleString("fa-IR")}
                        ٪
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-500/5 dark:bg-white/[0.02] border border-emerald-500/20 dark:border-white/5 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Trophy
                          size={10}
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                          امتیاز
                        </span>
                      </div>
                      <p className="font-heading text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {attempt.score.toLocaleString("fa-IR")}
                      </p>
                    </div>
                  </div>
                )}

                {/* نوار نمره (اگه submitted) */}
                {isSubmitted && (
                  <div className="mb-4">
                    <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400 transition-all duration-1000"
                        style={{
                          width: `${Math.min(Math.max(attempt.percentage, 0), 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* دکمه */}
                {isSubmitted ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/attempts/${attempt.id}/result`)}
                    className="group/btn relative w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/50 hover:-translate-y-0.5 transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Eye size={14} />
                      مشاهده نتیجه
                    </span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(`/attempts/${attempt.id}`)}
                    className="group/btn relative w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/50 hover:-translate-y-0.5 transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <RotateCcw
                        size={14}
                        className="transition-transform group-hover/btn:rotate-180 duration-500"
                      />
                      ادامه آزمون
                    </span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MyAttempts;
