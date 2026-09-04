import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, Crown, CreditCard, Clock3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMySubscription } from "../../api/subscriptionApi";
import type { Subscription } from "../../api/subscriptionApi";

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

    loadSubscription();

    return () => {
      mounted = false;
    };
  }, []);

  const subscriptionInfo = useMemo(() => {
    if (!subscription) return null;

    const endDate = new Date(subscription.endDate);
    const startDate = new Date(subscription.startDate);
    const now = new Date();
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / millisecondsPerDay));

    return {
      endDate,
      startDate,
      remainingDays,
      isActive: subscription.status === "active" && endDate.getTime() > now.getTime(),
    };
  }, [subscription]);

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-white/20 bg-white/40 p-6 shadow-lg backdrop-blur-xl dark:bg-white/10">
        <div className="animate-pulse space-y-5">
          <div className="h-6 w-40 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-28 rounded-3xl bg-gray-200 dark:bg-white/10" />
        </div>
      </section>
    );
  }

  if (!subscription || !subscriptionInfo?.isActive) {
    return (
      <section className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 p-6 shadow-lg backdrop-blur-xl dark:bg-white/10 sm:p-7">
        <div className="pointer-events-none absolute -left-20 -top-24 h-48 w-48 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)]">
              <Crown size={23} />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[var(--griffin-gold)]">GRIFFIN SUBSCRIPTION</p>
              <h2 className="mt-1 text-2xl font-black dark:text-white">اشتراک فعالی نداری</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                با انتخاب یک پلن، امکانات ویژه آکادمی گریفین را فعال کن.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/subscriptions")}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90"
          >
            مشاهده پلن‌ها
            <ArrowLeft size={17} />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 p-6 shadow-lg backdrop-blur-xl dark:bg-white/10 sm:p-7">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[var(--griffin-gold)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative space-y-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)]">
              <Crown size={23} />
            </div>
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[var(--griffin-gold)]">GRIFFIN SUBSCRIPTION</p>
              <h2 className="mt-1 text-2xl font-black dark:text-white">اشتراک فعال شما</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">وضعیت اشتراک و زمان باقی‌مانده را اینجا ببین.</p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-500">
            <CheckCircle2 size={15} />
            فعال
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_1.85fr]">
          <div className="rounded-3xl border border-white/20 bg-white/30 p-5 dark:bg-black/10">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">پلن فعلی</p>
                <p className="mt-1 text-lg font-black dark:text-white">{subscription.plan.title}</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {subscription.plan.description || "اشتراک فعال آکادمی گریفین"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SubscriptionMiniStat
              icon={<Clock3 size={17} />}
              label="روزهای باقی‌مانده"
              value={`${subscriptionInfo.remainingDays} روز`}
            />
            <SubscriptionMiniStat
              icon={<CalendarDays size={17} />}
              label="شروع اشتراک"
              value={formatDate(subscriptionInfo.startDate)}
            />
            <SubscriptionMiniStat
              icon={<CalendarDays size={17} />}
              label="تاریخ انقضا"
              value={formatDate(subscriptionInfo.endDate)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4 dark:border-white/10">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            برای مشاهده پلن‌ها و جزئیات بیشتر وارد صفحه اشتراک شو.
          </p>
          <button
            type="button"
            onClick={() => navigate("/subscriptions")}
            className="inline-flex items-center gap-2 text-sm font-bold text-[var(--griffin-gold)] transition hover:opacity-75"
          >
            مدیریت اشتراک
            <ArrowLeft size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

const SubscriptionMiniStat = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) => (
  <div className="rounded-2xl border border-white/20 bg-white/30 p-4 dark:bg-black/10">
    <div className="flex items-center gap-2 text-[var(--griffin-gold)]">
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </div>
    <p className="mt-3 text-base font-black dark:text-white">{value}</p>
  </div>
);

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);

export default SubscriptionDashboardCard;
