import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Compass,
  Crown,
  LoaderCircle,
  Lock,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getBestPlanForMe,
  getPublishedPlans,
  GRADE_LABELS,
  MAJOR_LABELS,
  type BestPlanResponse,
  type StrategyPlan,
} from "../api/strategyApi";
import StrategyTable from "../components/strategy/StrategyTable";
import RevealOnScroll from "../components/common/RevealOnScroll";
import { useAuth } from "../context/AuthContext";

const Strategy = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [result, setResult] = useState<BestPlanResponse | null>(null);
  const [publicPlans, setPublicPlans] = useState<StrategyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        if (user) {
          const data = await getBestPlanForMe();
          if (!cancelled) setResult(data);
        } else {
          const data = await getPublishedPlans({ limit: 50 });
          if (!cancelled) setPublicPlans(data.plans || []);
        }
      } catch (err) {
        console.error("Failed to load strategy plan:", err);
        if (!cancelled) setError("دریافت برنامه راهبردی انجام نشد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-3">
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
                  <LoaderCircle size={24} className="text-white animate-spin" />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                در حال دریافت برنامه راهبردی...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-6xl mx-auto">
          <button
            type="button"
            onClick={() => navigate(user ? "/dashboard" : "/")}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors mb-6"
          >
            <ArrowLeft
              size={13}
              className="transition-transform group-hover:-translate-x-1"
            />
            {user ? "بازگشت به داشبورد" : "بازگشت"}
          </button>

          <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
            <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==================== حالت‌ها ====================
  const plan = result?.plan;
  const reason = result?.reason;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ==================== Back ==================== */}
        <button
          type="button"
          onClick={() => navigate(user ? "/dashboard" : "/")}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />
          {user ? "بازگشت به داشبورد" : "بازگشت"}
        </button>

        {/* ==================== هدر ==================== */}
        <RevealOnScroll>
          <header className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30">
              <Compass size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-bold text-[var(--griffin-gold)] tracking-wider">
                GRIFFIN STRATEGY
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl font-black leading-tight text-gray-900 dark:text-white">
              برنامه{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                راهبردی
              </span>
            </h1>

            <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto rounded-full" />

            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 leading-8">
              نقشه راه آزمون‌های سال تحصیلی — بدون که قراره چی بیاد تا با خیال
              راحت برنامه‌ریزی کنی.
            </p>
          </header>
        </RevealOnScroll>

        {/* ==================== محتوا ==================== */}

        {/* 🔴 کاربر مهمان */}
        {!user && (
          <>
            {publicPlans.length === 0 ? (
              <RevealOnScroll>
                <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <Calendar
                      size={28}
                      className="text-gray-400 dark:text-gray-600"
                    />
                  </div>
                  <p className="font-heading text-base font-black text-gray-600 dark:text-gray-300">
                    هنوز برنامه راهبردی منتشر نشده
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    به زودی برنامه‌ها اضافه می‌شوند.
                  </p>
                </div>
              </RevealOnScroll>
            ) : (
              <>
                {/* CTA ورود */}
                <RevealOnScroll>
                  <div className="rounded-3xl border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/5 p-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-40" />
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                        <Lock size={24} strokeWidth={2.3} />
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-right">
                      <h3 className="font-heading text-base font-black text-gray-900 dark:text-white">
                        برنامه راهبردی مخصوص خودت رو ببین
                      </h3>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-6">
                        با ثبت‌نام، برنامه راهبردی براساس پایه و رشته تحصیلی‌ت
                        برات نمایش داده میشه.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/login?returnTo=${encodeURIComponent("/strategy")}`,
                        )
                      }
                      className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3 font-black text-white text-xs shadow-lg shadow-[var(--griffin-gold)]/40 hover:-translate-y-0.5 transition-transform"
                    >
                      <Crown size={14} />
                      ورود / ثبت‌نام
                    </button>
                  </div>
                </RevealOnScroll>

                {/* لیست پلن‌های عمومی */}
                <section className="space-y-6">
                  <RevealOnScroll>
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 mb-3">
                        <Sparkles
                          size={16}
                          className="text-[var(--griffin-gold)]"
                        />
                        <span className="text-xs font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                          All Plans
                        </span>
                      </div>
                      <h2 className="font-heading text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                        برنامه‌های راهبردی موجود
                      </h2>
                      <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto mt-3 rounded-full" />
                    </div>
                  </RevealOnScroll>

                  {publicPlans.map((p, index) => {
                    // 🆕 چک کن data.exams وجود داره یا نه
                    const examsCount = p.data?.exams?.length ?? 0;

                    return (
                      <RevealOnScroll key={p.id} delay={index * 100}>
                        <section className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 sm:p-8">
                          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-[80px] pointer-events-none" />

                          <div className="relative flex flex-col lg:flex-row lg:items-center gap-5">
                            <div className="relative shrink-0 self-center lg:self-auto">
                              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-40" />
                              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-xl rotate-3">
                                <Compass size={28} strokeWidth={2.2} />
                              </div>
                            </div>

                            <div className="flex-1 text-center lg:text-right">
                              <h3 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                                {p.title}
                              </h3>
                              {p.description && (
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-7">
                                  {p.description}
                                </p>
                              )}

                              <div className="mt-3 flex items-center gap-2 flex-wrap justify-center lg:justify-start">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-black text-gray-700 dark:text-gray-300">
                                  <Calendar size={11} />
                                  پایه {GRADE_LABELS[p.grade] ?? p.grade}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-black text-gray-700 dark:text-gray-300">
                                  رشته {MAJOR_LABELS[p.major] ?? p.major}
                                </span>
                                {examsCount > 0 && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-black text-gray-700 dark:text-gray-300">
                                    {examsCount.toLocaleString("fa-IR")} آزمون
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* CTA ورود برای مشاهده */}
                          <div className="relative mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-center gap-3">
                            <Lock
                              size={18}
                              className="text-[var(--griffin-gold)] shrink-0"
                            />
                            <p className="flex-1 text-center sm:text-right text-xs text-gray-500 dark:text-gray-400">
                              برای مشاهده کامل جدول آزمون‌ها، وارد حساب خودت شو.
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/login?returnTo=${encodeURIComponent("/strategy")}`,
                                )
                              }
                              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 font-black text-white text-xs shadow-lg shadow-[var(--griffin-gold)]/40 hover:-translate-y-0.5 transition-transform"
                            >
                              <Crown size={13} />
                              ورود / ثبت‌نام
                            </button>
                          </div>
                        </section>
                      </RevealOnScroll>
                    );
                  })}
                </section>
              </>
            )}
          </>
        )}

        {/* 🟢 کاربر لاگین‌شده */}
        {user && (
          <>
            {!plan && reason === "profile_incomplete" ? (
              <RevealOnScroll>
                <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent backdrop-blur-sm p-8 text-center">
                  <div className="relative inline-flex mb-5">
                    <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-50 animate-pulse" />
                    <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                      <AlertCircle size={36} strokeWidth={2.3} />
                    </div>
                  </div>

                  <h3 className="font-heading text-xl font-black text-gray-900 dark:text-white mb-3">
                    پروفایل شما ناقص است
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-7 mb-6">
                    برای دیدن برنامه راهبردی، لطفاً پایه و رشته تحصیلی خود را در
                    پروفایل تکمیل کنید.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/dashboard?section=profile")}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 font-black text-white text-sm shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    تکمیل پروفایل
                  </button>
                </div>
              </RevealOnScroll>
            ) : !plan ? (
              <RevealOnScroll>
                <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <Calendar
                      size={28}
                      className="text-gray-400 dark:text-gray-600"
                    />
                  </div>
                  <p className="font-heading text-base font-black text-gray-600 dark:text-gray-300">
                    هنوز برنامه راهبردی برای پایه و رشته شما منتشر نشده
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    به زودی برنامه مخصوص شما اضافه می‌شود.
                  </p>
                </div>
              </RevealOnScroll>
            ) : (
              <>
                {/* اطلاعات برنامه */}
                <RevealOnScroll>
                  <section className="relative rounded-[2rem] overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-amber-500/5 to-transparent backdrop-blur-xl p-6 sm:p-8">
                    <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="relative shrink-0 self-center lg:self-auto">
                        <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
                        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                          <Compass size={36} strokeWidth={2.2} />
                        </div>
                      </div>

                      <div className="flex-1 text-center lg:text-right">
                        <div className="inline-flex items-center gap-2 mb-2">
                          <Sparkles
                            size={12}
                            className="text-[var(--griffin-gold)] animate-pulse"
                          />
                          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                            Active Plan
                          </span>
                        </div>

                        <h2 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                          {plan.title}
                        </h2>

                        {plan.description && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-7">
                            {plan.description}
                          </p>
                        )}

                        <div className="mt-4 flex items-center gap-2 flex-wrap justify-center lg:justify-start">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-sm text-[10px] font-black text-gray-700 dark:text-gray-300">
                            <Calendar size={11} />
                            پایه {GRADE_LABELS[plan.grade] ?? plan.grade}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-sm text-[10px] font-black text-gray-700 dark:text-gray-300">
                            رشته {MAJOR_LABELS[plan.major] ?? plan.major}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-sm text-[10px] font-black text-gray-700 dark:text-gray-300">
                            {plan.data?.exams?.length ?? 0} آزمون
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>
                </RevealOnScroll>

                {/* جدول */}
                {plan.data && (
                  <RevealOnScroll>
                    <section className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                            Schedule
                          </p>
                          <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white -mt-0.5">
                            جدول آزمون‌ها
                          </h2>
                        </div>
                      </div>

                      <StrategyTable data={plan.data} />
                    </section>
                  </RevealOnScroll>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Strategy;