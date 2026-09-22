import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Compass,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getBestPlanForMe,
  GRADE_LABELS,
  MAJOR_LABELS,
  type BestPlanResponse,
} from "../../../api/strategyApi";
import StrategyTable from "../../strategy/StrategyTable";

const StrategyPanel = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<BestPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getBestPlanForMe();
        if (!cancelled) setResult(data);
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
  }, []);

  // ==================== Loading ====================
  if (loading) {
    return (
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
    );
  }

  // ==================== Error ====================
  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
        <p className="text-sm font-bold text-rose-500 dark:text-rose-400">
          {error}
        </p>
      </div>
    );
  }

  const plan = result?.plan;
  const reason = result?.reason;

  // ==================== حالت پروفایل ناقص ====================
  if (!plan && reason === "profile_incomplete") {
    return (
      <div className="space-y-5">
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="relative shrink-0 self-center lg:self-auto">
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                <Compass size={36} strokeWidth={2.3} />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 mb-2">
                <Sparkles
                  size={12}
                  className="text-[var(--griffin-gold)] animate-pulse"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Strategy Plan
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                برنامه راهبردی
              </h1>

              <p className="mt-2 text-sm text-gray-400 leading-7">
                نقشه راه آزمون‌های سال تحصیلی
              </p>
            </div>
          </div>
        </section>

        <section className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent backdrop-blur-sm p-8 text-center">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

          <div className="relative space-y-4">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-50 animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                <AlertCircle size={28} />
              </div>
            </div>

            <h2 className="font-heading text-xl font-black text-gray-900 dark:text-white">
              پروفایل شما ناقص است
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-7">
              برای دیدن برنامه راهبردی، لطفاً پایه و رشته تحصیلی خود را در
              پروفایل تکمیل کنید.
            </p>

            <button
              type="button"
              onClick={() => navigate("/dashboard?section=profile")}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              تکمیل پروفایل
              <ArrowLeft size={14} className="rotate-180" />
            </button>
          </div>
        </section>
      </div>
    );
  }

  // ==================== حالت بدون برنامه ====================
  if (!plan) {
    return (
      <div className="space-y-5">
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="relative shrink-0 self-center lg:self-auto">
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                <Compass size={36} strokeWidth={2.3} />
              </div>
            </div>

            <div className="flex-1 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 mb-2">
                <Sparkles
                  size={12}
                  className="text-[var(--griffin-gold)] animate-pulse"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Strategy Plan
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                برنامه راهبردی
              </h1>

              <p className="mt-2 text-sm text-gray-400 leading-7">
                نقشه راه آزمون‌های سال تحصیلی
              </p>
            </div>
          </div>
        </section>

        <section className="relative rounded-2xl overflow-hidden border border-dashed border-gray-300 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-8 text-center">
          <div className="relative space-y-4">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-gray-400 blur-2xl opacity-30 animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                <Calendar size={28} />
              </div>
            </div>

            <h2 className="font-heading text-xl font-black text-gray-900 dark:text-white">
              هنوز برنامه راهبردی برای پایه و رشته شما منتشر نشده
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-7">
              به زودی برنامه مخصوص شما اضافه میشود.
            </p>
          </div>
        </section>
      </div>
    );
  }

  // ==================== حالت با برنامه ====================
  return (
    <div className="space-y-5">
      {/* ==================== HERO ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#080B12] p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/25 blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[100px] pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="relative shrink-0 self-center lg:self-auto">
            <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-70 animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/20">
              <Compass size={36} strokeWidth={2.3} />
            </div>
          </div>

          <div className="flex-1 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 mb-2">
              <Sparkles
                size={12}
                className="text-[var(--griffin-gold)] animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Active Strategy
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
              {plan.title}
            </h1>

            {plan.description && (
              <p className="mt-2 text-sm text-gray-400 leading-7">
                {plan.description}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2 flex-wrap justify-center lg:justify-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm text-[10px] font-black text-gray-300">
                <Calendar size={11} />
                پایه {GRADE_LABELS[plan.grade] ?? plan.grade}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm text-[10px] font-black text-gray-300">
                رشته {MAJOR_LABELS[plan.major] ?? plan.major}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm text-[10px] font-black text-gray-300">
                {plan.data.exams.length.toLocaleString("fa-IR")} آزمون
              </span>
            </div>
          </div>

          <div className="shrink-0 self-center lg:self-auto">
            <button
              type="button"
              onClick={() => navigate("/strategy")}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 backdrop-blur-sm px-4 py-2.5 font-black text-[var(--griffin-gold)] text-xs hover:bg-[var(--griffin-gold)]/10 transition-all"
            >
              مشاهده کامل
              <ArrowLeft size={13} className="rotate-180" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================== جدول ==================== */}
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
    </div>
  );
};

export default StrategyPanel;
