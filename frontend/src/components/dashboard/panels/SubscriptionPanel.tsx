import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Check,
  Clock3,
  Crown,
  History,
  LoaderCircle,
  Medal,
  Receipt,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getMySubscription,
  getMySubscriptionHistory,
  getSubscriptionPlans,
  type Subscription,
  type SubscriptionPlan,
} from "../../../api/subscriptionApi";

// ==================== تنظیمات ====================
const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));

const getRemainingDays = (endDate: string) => {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string; icon: typeof Check }
> = {
  active: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "فعال",
    icon: Check,
  },
  expired: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    label: "منقضی",
    icon: X,
  },
  cancelled: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    label: "لغو شده",
    icon: X,
  },
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    label: "در انتظار",
    icon: Clock3,
  },
};

// ==================== کامپوننت ====================
const SubscriptionPanel = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [subData, historyData, plansData] = await Promise.all([
          getMySubscription(),
          getMySubscriptionHistory(),
          getSubscriptionPlans(),
        ]);
        if (cancelled) return;
        setSubscription(subData.subscription);
        setHistory(historyData.subscriptions);
        setPlans(plansData.plans);
      } catch (err) {
        console.error("Failed to load subscription:", err);
        if (!cancelled) setError("دریافت اطلاعات اشتراک انجام نشد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // 🔹 محاسبه پیشرفت
  const progress = useMemo(() => {
    if (!subscription) return 0;
    const total =
      (new Date(subscription.endDate).getTime() -
        new Date(subscription.startDate).getTime()) /
      (1000 * 60 * 60 * 24);
    const remaining = getRemainingDays(subscription.endDate);
    const used = total - remaining;
    return Math.min(100, Math.max(0, (used / total) * 100));
  }, [subscription]);

  const remainingDays = subscription
    ? getRemainingDays(subscription.endDate)
    : 0;

  const isExpiringSoon = remainingDays <= 7 && remainingDays > 0;
  const isExpired = subscription && remainingDays === 0;

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
            در حال دریافت اطلاعات اشتراک...
          </p>
        </div>
      </div>
    );
  }

  // ==================== Error ====================
  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <Shield size={32} className="mx-auto text-rose-500 mb-3" />
        <p className="text-sm font-bold text-rose-500 dark:text-rose-400">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ==================== HERO اشتراک فعال ==================== */}
      {subscription ? (
        <section className="relative rounded-2xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/25 via-transparent to-purple-600/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/30 blur-[100px] pointer-events-none animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />

          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative space-y-6">
            {/* هدر */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-5">
              <div className="relative shrink-0 self-center lg:self-auto">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-3xl opacity-70 animate-pulse" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/20">
                  <Crown size={36} strokeWidth={2.3} />
                </div>
                <span className="absolute -top-1 -right-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500 text-white text-[9px] font-black shadow-lg">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                  فعال
                </span>
              </div>

              <div className="flex-1 text-center lg:text-right">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Sparkles
                    size={12}
                    className="text-[var(--griffin-gold)] animate-pulse"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Active Subscription
                  </span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                  {subscription.plan.title}
                </h1>

                <p className="mt-1.5 text-sm text-gray-400">
                  تا {formatDate(subscription.endDate)} معتبر است
                </p>
              </div>

              <div className="shrink-0 self-center lg:self-auto">
                <div
                  className={`
                    relative rounded-2xl border-2 px-6 py-4 text-center
                    ${
                      isExpired
                        ? "border-rose-500/40 bg-rose-500/10"
                        : isExpiringSoon
                          ? "border-amber-500/40 bg-amber-500/10"
                          : "border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/10"
                    }
                  `}
                >
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    باقی‌مانده
                  </p>
                  <p
                    className={`
                      font-heading text-4xl font-black leading-none tabular-nums
                      ${
                        isExpired
                          ? "text-rose-500"
                          : isExpiringSoon
                            ? "text-amber-500"
                            : "text-[var(--griffin-gold)]"
                      }
                    `}
                  >
                    {remainingDays.toLocaleString("fa-IR")}
                  </p>
                  <p className="text-[10px] font-black text-gray-400 mt-1">
                    روز
                  </p>
                </div>
              </div>
            </div>

            {/* اطلاعات */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: Calendar,
                  label: "تاریخ شروع",
                  value: formatDate(subscription.startDate),
                },
                {
                  icon: Calendar,
                  label: "تاریخ پایان",
                  value: formatDate(subscription.endDate),
                },
                {
                  icon: Clock3,
                  label: "مدت کل",
                  value: `${subscription.plan.durationDays.toLocaleString("fa-IR")} روز`,
                },
              ].map((info, i) => {
                const Icon = info.icon;
                return (
                  <div
                    key={i}
                    className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-3.5"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon size={10} className="text-[var(--griffin-gold)]" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                        {info.label}
                      </p>
                    </div>
                    <p className="font-heading text-xs font-black text-white">
                      {info.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* نوار پیشرفت */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  پیشرفت اشتراک
                </span>
                <span className="font-heading text-xs font-black text-[var(--griffin-gold)]">
                  {Math.round(progress).toLocaleString("fa-IR")}٪
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`
                    h-full rounded-full transition-all duration-1000 shadow-lg
                    ${
                      isExpired
                        ? "bg-gradient-to-l from-rose-500 to-rose-400"
                        : isExpiringSoon
                          ? "bg-gradient-to-l from-amber-500 to-amber-400"
                          : "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400"
                    }
                  `}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* هشدار انقضا */}
            {isExpiringSoon && !isExpired && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <AlertCircle size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-heading text-xs font-black text-amber-400">
                    اشتراکت داره تموم می‌شه!
                  </p>
                  <p className="text-[10px] text-amber-300/80 mt-0.5">
                    فقط {remainingDays.toLocaleString("fa-IR")} روز دیگه فرصت
                    داری. الان تمدید کن.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/subscriptions")}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-l from-amber-500 to-amber-600 px-3.5 py-2 text-[10px] font-black text-white shadow-lg shadow-amber-500/40 hover:shadow-xl transition-all"
                >
                  <Zap size={12} />
                  تمدید
                </button>
              </div>
            )}

            {isExpired && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                  <X size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-heading text-xs font-black text-rose-400">
                    اشتراکت منقضی شده
                  </p>
                  <p className="text-[10px] text-rose-300/80 mt-0.5">
                    برای استفاده مجدد، اشتراک جدید بخر.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/subscriptions")}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-l from-rose-500 to-rose-600 px-3.5 py-2 text-[10px] font-black text-white shadow-lg shadow-rose-500/40 hover:shadow-xl transition-all"
                >
                  <Zap size={12} />
                  خرید جدید
                </button>
              </div>
            )}

            {/* دکمه‌ها */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => navigate("/subscriptions")}
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <TrendingUp size={14} />
                  ارتقا یا تمدید اشتراک
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard?section=payments")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-3 text-xs font-black text-gray-300 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] transition-all"
              >
                <Receipt size={14} />
                سوابق پرداخت
              </button>
            </div>
          </div>
        </section>
      ) : (
        /* ==================== حالت بدون اشتراک ==================== */
        <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 backdrop-blur-sm p-8 text-center">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

          <div className="relative space-y-4">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3">
                <Crown size={28} />
              </div>
            </div>

            <h2 className="font-heading text-xl font-black text-gray-900 dark:text-white">
              هنوز اشتراکی نداری!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-7">
              با خرید اشتراک، به تمام امکانات آکادمی گریفین دسترسی پیدا می‌کنی.
            </p>

            <button
              type="button"
              onClick={() => navigate("/subscriptions")}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all"
            >
              <Crown size={14} />
              مشاهده پلن‌ها
            </button>
          </div>
        </section>
      )}

      {/* ==================== پلن‌های موجود ==================== */}
      {plans.length > 0 && (
        <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
            <div className="inline-flex items-center gap-2">
              <Star size={13} className="text-[var(--griffin-gold)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Available Plans
              </span>
            </div>
            <h2 className="font-heading text-base font-black text-gray-900 dark:text-white mt-1">
              پلن‌های موجود
            </h2>
          </div>

          <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-4 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                      Plan
                    </p>
                    <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white mt-0.5">
                      {plan.title}
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <Crown size={16} />
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <p className="font-heading text-2xl font-black text-[var(--griffin-gold)] tabular-nums">
                    {formatPrice(plan.price)}
                  </p>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    تومان
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-500/10 dark:bg-white/5 text-[10px] font-black text-gray-600 dark:text-gray-400 mb-3">
                  <Clock3 size={10} />
                  {plan.durationDays.toLocaleString("fa-IR")} روز اعتبار
                </div>

                {plan.description && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-5 mb-3 line-clamp-2">
                    {plan.description}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/subscriptions")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 py-2.5 text-[11px] font-black text-white shadow-md shadow-[var(--griffin-gold)]/30 hover:shadow-lg hover:shadow-[var(--griffin-gold)]/50 transition-all"
                >
                  <Zap size={12} />
                  خرید این پلن
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== تاریخچه اشتراک ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="flex items-center gap-2">
            <History size={14} className="text-[var(--griffin-gold)]" />
            <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white">
              تاریخچه اشتراک
            </h2>
          </div>
          {history.length > 0 && (
            <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">
              {history.length.toLocaleString("fa-IR")} اشتراک
            </span>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <History size={28} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
              هنوز تاریخچه‌ای نداری!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              اولین اشتراکت رو بخر تا اینجا نشون داده بشه.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {history.map((sub) => {
              const config = statusConfig[sub.status] ?? statusConfig.pending;
              const StatusIcon = config.icon;
              const isActive = sub.status === "active";

              return (
                <div
                  key={sub.id}
                  className={`
                    group relative rounded-xl overflow-hidden border
                    p-3.5 flex items-center gap-3
                    transition-all duration-300 hover:-translate-y-0.5
                    ${
                      isActive
                        ? "border-emerald-500/20 bg-gradient-to-l from-emerald-500/5 to-transparent"
                        : "border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40"
                    }
                  `}
                >
                  <div
                    className={`
                      w-10 h-10 rounded-xl shrink-0
                      flex items-center justify-center
                      ${
                        isActive
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30"
                          : `bg-gradient-to-br from-[var(--griffin-gold)]/20 to-amber-700/20 ${config.text}`
                      }
                    `}
                  >
                    {isActive ? (
                      <Crown size={18} strokeWidth={2.3} />
                    ) : (
                      <Medal size={18} strokeWidth={2.3} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-heading text-xs font-black text-gray-900 dark:text-white truncate">
                        {sub.plan.title}
                      </p>
                      <span
                        className={`
                          inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md
                          text-[9px] font-black
                          ${config.bg} ${config.text}
                        `}
                      >
                        <StatusIcon size={8} />
                        {config.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {formatDate(sub.startDate)}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">
                        →
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        {formatDate(sub.endDate)}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-left">
                    <p className="font-heading text-sm font-black text-[var(--griffin-gold)] tabular-nums">
                      {sub.plan.durationDays.toLocaleString("fa-IR")}
                    </p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400">
                      روز
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default SubscriptionPanel;
