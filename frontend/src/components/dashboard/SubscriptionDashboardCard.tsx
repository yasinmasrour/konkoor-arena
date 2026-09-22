import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Crown,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMySubscription } from "../../api/subscriptionApi";
import type { Subscription } from "../../api/subscriptionApi";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);

const SubscriptionDashboardCard = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSubscription = async () => {
      try {
        const data = await getMySubscription();
        if (mounted) setSubscription(data.subscription);
      } catch (error) {
        console.error("GET DASHBOARD SUBSCRIPTION ERROR:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadSubscription();

    return () => {
      mounted = false;
    };
  }, []);

  const subscriptionInfo = useMemo(() => {
    if (!subscription) return null;

    const endDate = new Date(subscription.endDate);
    const startDate = new Date(subscription.startDate);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const remainingDays = Math.max(
      0,
      Math.ceil((endDate.getTime() - now.getTime()) / msPerDay),
    );

    const totalDays = Math.max(
      1,
      Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay),
    );
    const usedDays = totalDays - remainingDays;
    const progress = Math.min(100, Math.max(0, (usedDays / totalDays) * 100));

    return {
      endDate,
      startDate,
      remainingDays,
      totalDays,
      progress,
      isActive:
        subscription.status === "active" && endDate.getTime() > now.getTime(),
      isExpiringSoon: remainingDays <= 7 && remainingDays > 0,
    };
  }, [subscription]);

  // ==================== Loading ====================
  if (loading) {
    return (
      <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-6 shadow-lg">
        <div className="animate-pulse space-y-5">
          <div className="h-6 w-40 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-28 rounded-2xl bg-gray-200 dark:bg-white/10" />
        </div>
      </section>
    );
  }

  // ==================== بدون اشتراک ====================
  if (!subscription || !subscriptionInfo?.isActive) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-6 shadow-lg sm:p-7">
        <div className="pointer-events-none absolute -left-20 -top-24 h-48 w-48 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-50" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <Crown size={22} strokeWidth={2.3} />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2">
                <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Griffin Subscription
                </span>
              </div>
              <h2 className="mt-1 font-heading text-xl font-black text-gray-900 dark:text-white">
                اشتراک فعالی نداری
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                با انتخاب یک پلن، امکانات ویژه آکادمی گریفین را فعال کن.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/subscriptions")}
            className="group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Crown size={15} />
              مشاهده پلن‌ها
            </span>
            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>
      </section>
    );
  }

  // ==================== با اشتراک ====================
  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-6 shadow-lg sm:p-7">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[var(--griffin-gold)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative space-y-5">
        {/* ==================== هدر ==================== */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-50" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <Crown size={22} strokeWidth={2.3} />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2">
                <Sparkles size={11} className="text-[var(--griffin-gold)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Griffin Subscription
                </span>
              </div>
              <h2 className="mt-1 font-heading text-xl font-black text-gray-900 dark:text-white">
                اشتراک فعال شما
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                وضعیت اشتراک و زمان باقی‌مانده را اینجا ببین.
              </p>
            </div>
          </div>

          <div
            className={`
              inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black
              ${
                subscriptionInfo.isExpiringSoon
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }
            `}
          >
            <CheckCircle2 size={12} />
            {subscriptionInfo.isExpiringSoon ? "داره تموم می‌شه" : "فعال"}
          </div>
        </div>

        {/* ==================== پلن + آمار ==================== */}
        <div className="grid gap-4 lg:grid-cols-[1.15fr_1.85fr]">
          {/* پلن فعلی */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]">
                <CreditCard size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  پلن فعلی
                </p>
                <p className="mt-1 font-heading text-base font-black text-gray-900 dark:text-white">
                  {subscription.plan.title}
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-6 text-gray-600 dark:text-gray-400">
              {subscription.plan.description || "اشتراک فعال آکادمی گریفین"}
            </p>
          </div>

          {/* آمار */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SubscriptionMiniStat
              icon={<Clock3 size={15} />}
              label="باقی‌مانده"
              value={`${subscriptionInfo.remainingDays.toLocaleString("fa-IR")} روز`}
              highlight={subscriptionInfo.isExpiringSoon}
            />
            <SubscriptionMiniStat
              icon={<CalendarDays size={15} />}
              label="شروع"
              value={formatDate(subscriptionInfo.startDate)}
            />
            <SubscriptionMiniStat
              icon={<CalendarDays size={15} />}
              label="انقضا"
              value={formatDate(subscriptionInfo.endDate)}
            />
          </div>
        </div>

        {/* ==================== نوار پیشرفت ==================== */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              پیشرفت اشتراک
            </span>
            <span className="font-heading text-xs font-black text-[var(--griffin-gold)] tabular-nums">
              {Math.round(subscriptionInfo.progress).toLocaleString("fa-IR")}٪
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
            <div
              className={`
                h-full rounded-full transition-all duration-1000 shadow-lg
                ${
                  subscriptionInfo.isExpiringSoon
                    ? "bg-gradient-to-l from-amber-500 to-amber-400"
                    : "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400"
                }
              `}
              style={{ width: `${subscriptionInfo.progress}%` }}
            />
          </div>
        </div>

        {/* ==================== هشدار ==================== */}
        {subscriptionInfo.isExpiringSoon && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <AlertCircle size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                اشتراکت داره تموم می‌شه!
              </p>
              <p className="text-[10px] text-amber-600/80 dark:text-amber-300/80 mt-0.5">
                فقط {subscriptionInfo.remainingDays.toLocaleString("fa-IR")} روز
                دیگه فرصت داری.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/subscriptions")}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-l from-amber-500 to-amber-600 px-3.5 py-2 text-[10px] font-black text-white shadow-lg shadow-amber-500/40 hover:shadow-xl transition-all"
            >
              تمدید
            </button>
          </div>
        )}

        {/* ==================== فوتر ==================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/70 dark:border-white/5 pt-4">
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            برای مشاهده پلن‌ها و جزئیات بیشتر وارد صفحه اشتراک شو.
          </p>
          <button
            type="button"
            onClick={() => navigate("/subscriptions")}
            className="inline-flex items-center gap-1.5 text-xs font-black text-[var(--griffin-gold)] hover:underline underline-offset-4 transition"
          >
            مدیریت اشتراک
            <ArrowLeft size={13} className="rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
};

// ==================== SubscriptionMiniStat ====================
const SubscriptionMiniStat = ({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  highlight?: boolean;
}) => (
  <div
    className={`
      rounded-2xl border p-4
      ${
        highlight
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]"
      }
    `}
  >
    <div
      className={`flex items-center gap-2 ${
        highlight
          ? "text-amber-600 dark:text-amber-400"
          : "text-[var(--griffin-gold)]"
      }`}
    >
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label}
      </span>
    </div>
    <p className="mt-3 font-heading text-sm font-black text-gray-900 dark:text-white tabular-nums">
      {value}
    </p>
  </div>
);

export default SubscriptionDashboardCard;
