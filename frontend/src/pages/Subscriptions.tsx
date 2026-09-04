import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock3,
  Crown,
  History,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  getMySubscription,
  getMySubscriptionHistory,
  getSubscriptionPlans,
  type Subscription,
  type SubscriptionPlan,
} from "../api/subscriptionApi";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));

const getRemainingDays = (endDate: string) => {
  const difference = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(difference / (1000 * 60 * 60 * 24)));
};

const Subscriptions = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [plansData, currentData, historyData] = await Promise.all([
          getSubscriptionPlans(),
          getMySubscription(),
          getMySubscriptionHistory(),
        ]);

        if (cancelled) return;

        setPlans(plansData.plans);
        setSubscription(currentData.subscription);
        setHistory(historyData.subscriptions);
      } catch {
        if (!cancelled) {
          setError("دریافت اطلاعات اشتراک با مشکل مواجه شد. لطفاً دوباره تلاش کنید.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const remainingDays = useMemo(
    () => (subscription ? getRemainingDays(subscription.endDate) : 0),
    [subscription],
  );

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-4 py-8 dark:bg-[#080b12] sm:px-6 sm:py-12">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/55 p-5 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.035] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.22em] text-[var(--griffin-gold)]">
                GRIFFIN MEMBERSHIP
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
                اشتراک گریفین
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
                پلن مناسب خودت را انتخاب کن و امکانات آموزشی گریفین را بدون محدودیت‌های معمول دنبال کن.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--griffin-gold)]/20 bg-[var(--griffin-gold)]/10 px-4 py-2 text-xs font-bold text-[var(--griffin-gold)] sm:self-auto">
              <ShieldCheck size={15} /> پرداخت امن در مرحله بعد
            </div>
          </header>

          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
              <LoaderCircle className="animate-spin" size={20} />
              در حال دریافت اطلاعات اشتراک...
            </div>
          ) : error ? (
            <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm font-bold text-red-600 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-400">
              {error}
            </div>
          ) : (
            <>
              {subscription && (
                <section className="mt-8 overflow-hidden rounded-3xl border border-[var(--griffin-gold)]/20 bg-gradient-to-br from-[var(--griffin-gold)]/10 to-white/50 p-5 dark:to-white/[0.02] sm:p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--griffin-gold)] text-white shadow-lg shadow-[var(--griffin-gold)]/20">
                        <Crown size={23} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--griffin-gold)]">اشتراک فعال</p>
                        <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                          {subscription.plan.title}
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          تا {formatDate(subscription.endDate)} معتبر است.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 dark:bg-black/10">
                      <Clock3 size={19} className="text-[var(--griffin-gold)]" />
                      <div>
                        <p className="text-xs text-slate-400">زمان باقی‌مانده</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">
                          {remainingDays.toLocaleString("fa-IR")} روز
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <section className="mt-10">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-400">PLANS</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                      پلن‌های اشتراک
                    </h2>
                  </div>
                  <Sparkles className="text-[var(--griffin-gold)]" size={24} />
                </div>

                {plans.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                    در حال حاضر پلن اشتراکی برای خرید وجود ندارد.
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan, index) => (
                      <article
                        key={plan.id}
                        className={`relative overflow-hidden rounded-3xl border p-6 transition hover:-translate-y-1 ${
                          index === 1
                            ? "border-[var(--griffin-gold)]/35 bg-[var(--griffin-gold)]/[0.07] shadow-xl shadow-[var(--griffin-gold)]/5"
                            : "border-slate-200/70 bg-white/55 dark:border-white/10 dark:bg-white/[0.025]"
                        }`}
                      >
                        {index === 1 && (
                          <span className="absolute left-5 top-5 rounded-full bg-[var(--griffin-gold)] px-3 py-1 text-[10px] font-black text-white">
                            پیشنهادی
                          </span>
                        )}
                        <p className="text-sm font-bold text-[var(--griffin-gold)]">{plan.title}</p>
                        <div className="mt-5 flex items-end gap-2">
                          <span className="text-3xl font-black text-slate-900 dark:text-white">
                            {formatPrice(plan.price)}
                          </span>
                          <span className="mb-1 text-xs text-slate-400">تومان</span>
                        </div>
                        <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                          {plan.durationDays.toLocaleString("fa-IR")} روز اعتبار
                        </p>
                        {plan.description && (
                          <p className="mt-5 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {plan.description}
                          </p>
                        )}
                        <ul className="mt-5 space-y-3 border-t border-slate-200/70 pt-5 text-xs font-bold text-slate-600 dark:border-white/10 dark:text-slate-300">
                          <li className="flex items-center gap-2"><Check size={15} className="text-[var(--griffin-gold)]" /> دسترسی به امکانات آموزشی</li>
                          <li className="flex items-center gap-2"><Check size={15} className="text-[var(--griffin-gold)]" /> فعال‌سازی پس از پرداخت موفق</li>
                        </ul>
                        <button
                          type="button"
                          disabled
                          title="پرداخت در مرحله بعد پیاده‌سازی می‌شود"
                          className="mt-6 w-full cursor-not-allowed rounded-xl bg-slate-200 py-3 text-sm font-black text-slate-400 dark:bg-white/10 dark:text-slate-500"
                        >
                          خرید اشتراک — به‌زودی
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="mt-12 rounded-3xl border border-slate-200/70 bg-white/45 p-5 dark:border-white/10 dark:bg-white/[0.02] sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                    <History size={19} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">تاریخچه اشتراک</h2>
                    <p className="text-xs text-slate-400">سوابق اشتراک‌های فعال و گذشته</p>
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    هنوز سابقه‌ای برای اشتراک شما ثبت نشده است.
                  </div>
                ) : (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[620px] text-right text-sm">
                      <thead className="border-b border-slate-200/70 text-xs text-slate-400 dark:border-white/10">
                        <tr>
                          <th className="px-3 py-3 font-bold">پلن</th>
                          <th className="px-3 py-3 font-bold">شروع</th>
                          <th className="px-3 py-3 font-bold">پایان</th>
                          <th className="px-3 py-3 font-bold">وضعیت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((item) => (
                          <tr key={item.id} className="border-b border-slate-200/50 last:border-0 dark:border-white/5">
                            <td className="px-3 py-4 font-bold text-slate-800 dark:text-slate-200">{item.plan.title}</td>
                            <td className="px-3 py-4 text-slate-500 dark:text-slate-400">{formatDate(item.startDate)}</td>
                            <td className="px-3 py-4 text-slate-500 dark:text-slate-400">{formatDate(item.endDate)}</td>
                            <td className="px-3 py-4">
                              <span className={`rounded-full px-3 py-1 text-[11px] font-black ${item.status === "active" ? "bg-emerald-500/10 text-emerald-500" : item.status === "expired" ? "bg-slate-500/10 text-slate-500" : "bg-rose-500/10 text-rose-500"}`}>
                                {item.status === "active" ? "فعال" : item.status === "expired" ? "منقضی" : "لغوشده"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Subscriptions;
