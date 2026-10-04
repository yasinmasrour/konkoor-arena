import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Clock3,
  Crown,
  History,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Zap,
  X,
  Calendar,
  BadgeCheck,
  TrendingUp,
  Wallet,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Tag,
  Gift,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getMySubscription,
  getMySubscriptionHistory,
  getSubscriptionPlans,
  purchaseSubscription,
  type Subscription,
  type SubscriptionPlan,
} from "../api/subscriptionApi";
import {
  validateReferralCode,
  formatReferralAmount,
  type ValidateCodeResponse,
} from "../api/referralApi";
import { FEATURE_LABELS } from "../constants/features";
import RevealOnScroll from "../components/common/RevealOnScroll";
import { useAuth } from "../context/AuthContext";

// ==================== ابزار ====================
const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(Math.floor(price / 10));

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

// ==================== کامپوننت ====================
const Subscriptions = () => {
  const navigate = useNavigate();
  const { refreshFeatures } = useAuth();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [history, setHistory] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseSuccess, setPurchaseSuccess] = useState<{
    planTitle: string;
    refundAmount: number;
  } | null>(null);

  // 🆕 Referral
  const [referralCode, setReferralCode] = useState("");
  const [appliedReferral, setAppliedReferral] =
    useState<ValidateCodeResponse | null>(null);
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [referralError, setReferralError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [plansData, currentData, historyData] = await Promise.all([
        getSubscriptionPlans(),
        getMySubscription(),
        getMySubscriptionHistory(),
      ]);

      setPlans(plansData.plans);
      setSubscription(currentData.subscription);
      setHistory(historyData.subscriptions);
    } catch {
      setError(
        "دریافت اطلاعات اشتراک با مشکل مواجه شد. لطفاً دوباره تلاش کنید.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  const remainingDays = useMemo(
    () => (subscription ? getRemainingDays(subscription.endDate) : 0),
    [subscription],
  );

  const progress = useMemo(() => {
    if (!subscription) return 0;
    const total =
      (new Date(subscription.endDate).getTime() -
        new Date(subscription.startDate).getTime()) /
      (1000 * 60 * 60 * 24);
    const used = total - remainingDays;
    return Math.min(100, Math.max(0, (used / total) * 100));
  }, [subscription, remainingDays]);

  const recommendedIndex = useMemo(() => {
    if (plans.length < 2) return -1;
    return Math.floor(plans.length / 2);
  }, [plans]);

  // 🆕 محاسبه‌ی قیمت نهایی با تخفیف Referral
  const calculateFinalPrice = (plan: SubscriptionPlan) => {
    const planPrice = plan.finalPrice; // قیمت با تخفیف پلن
    const referralDiscount = appliedReferral?.discount || 0;
    return Math.max(0, planPrice - referralDiscount);
  };

  const handlePurchaseClick = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowGatewayModal(true);
    setPurchaseError("");
    // ریست کردن کد دعوت برای پلن جدید
    setReferralCode("");
    setAppliedReferral(null);
    setReferralError("");
  };

  // 🆕 اعتبارسنجی کد دعوت
  const handleApplyReferral = async () => {
    if (!referralCode.trim()) {
      setReferralError("کد دعوت رو وارد کن");
      return;
    }

    setValidatingReferral(true);
    setReferralError("");

    try {
      const result = await validateReferralCode(referralCode.trim());
      setAppliedReferral(result);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "کد دعوت نامعتبر است";
      setReferralError(message);
      setAppliedReferral(null);
    } finally {
      setValidatingReferral(false);
    }
  };

  // 🆕 حذف کد دعوت
  const handleRemoveReferral = () => {
    setReferralCode("");
    setAppliedReferral(null);
    setReferralError("");
  };

  const handlePurchase = async (gateway: "wallet" | "zarinpal") => {
    if (!selectedPlan) return;

    setPurchasing(true);
    setPurchaseError("");

    try {
      const result = await purchaseSubscription(
        selectedPlan.id,
        gateway,
        appliedReferral ? referralCode.trim() : undefined,
      );

      // 🆕 اگه پرداخت مستقیم (کیف پول) موفق بود
      if (result.payment.status === "paid") {
        await refreshFeatures();
        await load();

        setPurchaseSuccess({
          planTitle: selectedPlan.title,
          refundAmount: result.refundInfo?.refundAmount || 0,
        });

        setShowGatewayModal(false);
        setSelectedPlan(null);
        setReferralCode("");
        setAppliedReferral(null);
        return;
      }

      // 🆕 اگه paymentUrl داشتیم (زرین‌پال) → ریدایرکت
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
        return;
      }

      // اگه هیچکدوم نبود (نباید اتفاق بیفته)
      setPurchaseError("پرداخت ایجاد شد ولی لینک پرداخت موجود نیست.");
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "خرید اشتراک با مشکل مواجه شد";
      setPurchaseError(message);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* ===== هدر ===== */}
        <RevealOnScroll>
          <header className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30">
              <Crown size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-bold text-[var(--griffin-gold)] tracking-wider">
                GRIFFIN MEMBERSHIP
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl font-black leading-tight text-gray-900 dark:text-white">
              اشتراک{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                گریفین
              </span>
            </h1>

            <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto rounded-full" />

            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 leading-8">
              پلن مناسب خودت را انتخاب کن و امکانات آموزشی گریفین را بدون
              محدودیت‌های معمول دنبال کن.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <ShieldCheck size={14} />
              پرداخت امن
            </div>
          </header>
        </RevealOnScroll>

        {/* ===== محتوای اصلی ===== */}
        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
            <LoaderCircle className="animate-spin" size={22} />
            در حال دریافت اطلاعات اشتراک...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-sm font-bold text-red-600 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-400">
            {error}
          </div>
        ) : (
          <>
            {/* ===== اشتراک فعال ===== */}
            {subscription && (
              <RevealOnScroll>
                <section className="relative rounded-[2rem] overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-amber-500/5 to-transparent p-6 sm:p-8">
                  <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-[60px] pointer-events-none" />
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/10 blur-[60px] pointer-events-none" />

                  <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-50" />
                        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-xl">
                          <Crown size={28} strokeWidth={2.2} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            فعال
                          </span>
                        </div>
                        <h2 className="font-heading mt-1.5 text-2xl font-black text-gray-900 dark:text-white">
                          {subscription.plan.title}
                        </h2>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          تا {formatDate(subscription.endDate)} معتبر است
                        </p>
                      </div>
                    </div>

                    <div className="lg:mr-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 px-4 py-3">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                          <Clock3
                            size={12}
                            className="text-[var(--griffin-gold)]"
                          />
                          <span>باقی‌مانده</span>
                        </div>
                        <p className="font-heading text-2xl font-black text-gray-900 dark:text-white">
                          {remainingDays.toLocaleString("fa-IR")}
                          <span className="text-xs font-bold text-gray-400 mr-1">
                            روز
                          </span>
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 px-4 py-3">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                          <Calendar
                            size={12}
                            className="text-[var(--griffin-gold)]"
                          />
                          <span>شروع</span>
                        </div>
                        <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                          {formatDate(subscription.startDate)}
                        </p>
                      </div>

                      <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/40 dark:border-white/10 px-4 py-3">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                          <TrendingUp
                            size={12}
                            className="text-[var(--griffin-gold)]"
                          />
                          <span>پیشرفت</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400 transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                          {Math.round(progress).toLocaleString("fa-IR")}٪
                          مصرف‌شده
                        </p>
                      </div>
                    </div>
                  </div>

                  {subscription.plan.features &&
                    subscription.plan.features.length > 0 && (
                      <div className="relative mt-6 pt-6 border-t border-white/20 dark:border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
                          امکانات فعال شما
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {subscription.plan.features.map((feature) => (
                            <span
                              key={feature}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black"
                            >
                              <Check size={10} strokeWidth={3} />
                              {FEATURE_LABELS[feature] || feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </section>
              </RevealOnScroll>
            )}

            {/* ===== پلن‌ها ===== */}
            <section>
              <RevealOnScroll>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 mb-3">
                    <Sparkles
                      size={18}
                      className="text-[var(--griffin-gold)]"
                    />
                    <span className="text-xs font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase">
                      Plans
                    </span>
                  </div>
                  <h2 className="font-heading text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                    پلن‌های اشتراک
                  </h2>
                  <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto mt-4 rounded-full" />
                  <p className="mt-5 text-gray-600 dark:text-gray-300">
                    پلنی که با نیازت هماهنگه رو انتخاب کن
                  </p>
                </div>
              </RevealOnScroll>

              {plans.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  در حال حاضر پلن اشتراکی برای خرید وجود ندارد.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                  {plans.map((plan, index) => {
                    const isRecommended = index === recommendedIndex;
                    const hasDiscount = plan.hasDiscount;

                    return (
                      <RevealOnScroll key={plan.id} delay={index * 120}>
                        <article
                          className={`
                            group relative h-full flex flex-col
                            rounded-[2rem] overflow-hidden
                            border transition-transform duration-300
                            hover:-translate-y-1
                            ${
                              isRecommended
                                ? "border-[var(--griffin-gold)]/50 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-amber-500/5 to-transparent"
                                : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-[var(--griffin-gold)]/30"
                            }
                          `}
                        >
                          <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-[var(--griffin-gold)]/8 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                          <div
                            className={`h-1.5 ${
                              isRecommended
                                ? "bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent"
                                : "bg-gradient-to-r from-transparent via-gray-300/50 dark:via-white/10 to-transparent"
                            }`}
                          />

                          {/* 🆕 Badge تخفیف */}
                          {hasDiscount && (
                            <div className="absolute top-5 left-5 z-10">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-l from-rose-500 to-rose-700 text-white text-[10px] font-black shadow-lg shadow-rose-500/40">
                                <Tag size={11} />
                                {plan.discountPercent.toLocaleString("fa-IR")}٪
                                تخفیف
                              </div>
                            </div>
                          )}

                          {/* برچسب پیشنهادی */}
                          {isRecommended && !hasDiscount && (
                            <div className="absolute top-5 left-5 z-10">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600 text-white text-[10px] font-black shadow-lg">
                                <Crown size={11} />
                                پیشنهادی
                              </div>
                            </div>
                          )}

                          {plan.badge && !isRecommended && !hasDiscount && (
                            <div className="absolute top-5 left-5 z-10">
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500 text-white text-[10px] font-black shadow-lg">
                                <Sparkles size={11} />
                                {plan.badge}
                              </div>
                            </div>
                          )}

                          <div className="relative p-7 flex-1 flex flex-col">
                            <div
                              className={`
                                w-14 h-14 rounded-2xl flex items-center justify-center mb-5
                                transition-transform duration-300 group-hover:scale-110
                                ${
                                  isRecommended
                                    ? "bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600 text-white shadow-lg"
                                    : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300"
                                }
                              `}
                            >
                              <Zap size={24} strokeWidth={2.2} />
                            </div>

                            <h3 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                              {plan.title}
                            </h3>

                            {/* قیمت */}
                            <div className="mt-5">
                              {hasDiscount ? (
                                <>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base font-bold text-gray-400 dark:text-gray-500 line-through">
                                      {formatPrice(plan.originalPrice)}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 line-through">
                                      تومان
                                    </span>
                                  </div>
                                  <div className="flex items-end gap-2">
                                    <span className="font-heading text-4xl font-black text-[var(--griffin-gold)]">
                                      {formatPrice(plan.finalPrice)}
                                    </span>
                                    <span className="mb-1.5 text-xs font-bold text-gray-400">
                                      تومان
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-end gap-2">
                                  <span
                                    className={`
                                      font-heading text-4xl font-black
                                      ${
                                        isRecommended
                                          ? "text-[var(--griffin-gold)]"
                                          : "text-gray-900 dark:text-white"
                                      }
                                    `}
                                  >
                                    {formatPrice(plan.finalPrice)}
                                  </span>
                                  <span className="mb-1.5 text-xs font-bold text-gray-400">
                                    تومان
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* تایمر تخفیف */}
                            {hasDiscount && plan.remainingDays !== null && (
                              <div className="mt-3 inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] font-black">
                                <Clock3 size={11} />
                                فقط {plan.remainingDays.toLocaleString(
                                  "fa-IR",
                                )}{" "}
                                روز تا پایان تخفیف باقی‌مونده!
                              </div>
                            )}

                            <div className="mt-3 inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-400">
                              <Clock3 size={12} />
                              {plan.durationDays.toLocaleString("fa-IR")} روز
                              اعتبار
                            </div>

                            {plan.description && (
                              <p className="mt-5 text-sm leading-7 text-gray-500 dark:text-gray-400">
                                {plan.description}
                              </p>
                            )}

                            {plan.features && plan.features.length > 0 && (
                              <ul className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10 space-y-3 flex-1">
                                {plan.features.map((feature) => (
                                  <li
                                    key={feature}
                                    className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                      <Check
                                        size={12}
                                        className="text-emerald-500"
                                        strokeWidth={3}
                                      />
                                    </div>
                                    <span>
                                      {FEATURE_LABELS[feature] || feature}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            <button
                              type="button"
                              onClick={() => handlePurchaseClick(plan)}
                              disabled={purchasing}
                              className={`
                                mt-7 w-full flex items-center justify-center gap-2
                                rounded-xl py-3.5 text-sm font-black
                                transition-transform duration-300
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${
                                  isRecommended || hasDiscount
                                    ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:-translate-y-0.5"
                                    : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:-translate-y-0.5"
                                }
                              `}
                            >
                              <Crown size={16} />
                              {subscription
                                ? "تغییر به این پلن"
                                : hasDiscount
                                  ? "خرید با تخفیف"
                                  : "خرید این پلن"}
                            </button>
                          </div>
                        </article>
                      </RevealOnScroll>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ===== تاریخچه ===== */}
            <RevealOnScroll>
              <section className="rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-white dark:to-gray-200 flex items-center justify-center text-white dark:text-slate-900 shadow-lg">
                    <History size={22} />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                      تاریخچه اشتراک
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      سوابق اشتراک‌های فعال و گذشته شما
                    </p>
                  </div>
                </div>

                {history.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                      <History
                        size={24}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      هنوز سابقه‌ای برای اشتراک شما ثبت نشده است.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full min-w-[620px] text-right text-sm">
                      <thead>
                        <tr className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                          <th className="px-3 pb-4">پلن</th>
                          <th className="px-3 pb-4">شروع</th>
                          <th className="px-3 pb-4">پایان</th>
                          <th className="px-3 pb-4">وضعیت</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((item) => (
                          <tr
                            key={item.id}
                            className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-3 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[var(--griffin-gold)]/10 flex items-center justify-center text-[var(--griffin-gold)]">
                                  <Crown size={14} />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {item.plan.title}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-4 text-gray-500 dark:text-gray-400 text-xs">
                              {formatDate(item.startDate)}
                            </td>
                            <td className="px-3 py-4 text-gray-500 dark:text-gray-400 text-xs">
                              {formatDate(item.endDate)}
                            </td>
                            <td className="px-3 py-4">
                              <span
                                className={`
                                  inline-flex items-center gap-1.5
                                  px-3 py-1.5 rounded-full
                                  text-[10px] font-black
                                  ${
                                    item.status === "active"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                      : item.status === "expired"
                                        ? "bg-gray-500/10 text-gray-500 dark:text-gray-400"
                                        : "bg-rose-500/10 text-rose-500 dark:text-rose-400"
                                  }
                                `}
                              >
                                {item.status === "active" ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    فعال
                                  </>
                                ) : item.status === "expired" ? (
                                  <>
                                    <X size={10} />
                                    منقضی
                                  </>
                                ) : (
                                  <>
                                    <X size={10} />
                                    لغوشده
                                  </>
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </RevealOnScroll>

            {/* ===== CTA ===== */}
            <RevealOnScroll>
              <div className="relative rounded-[2rem] overflow-hidden border border-[var(--griffin-gold)]/20 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 p-8 md:p-10 text-center">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-[60px]" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/12 blur-[60px]" />

                <div className="relative space-y-4">
                  <BadgeCheck
                    size={40}
                    className="mx-auto text-[var(--griffin-gold)]"
                  />
                  <h2 className="font-heading text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                    سوالی داری؟
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto text-sm leading-7">
                    اگر در انتخاب پلن مناسب شک داری، تیم پشتیبانی گریفین آماده
                    کمکت هست.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-7 py-3 font-bold text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    تماس با پشتیبانی
                  </a>
                </div>
              </div>
            </RevealOnScroll>
          </>
        )}
      </div>

      {/* ===== مودال انتخاب درگاه ===== */}
      {showGatewayModal && selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => !purchasing && setShowGatewayModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F1419] shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-6 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                  <Crown size={22} />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                    خرید {selectedPlan.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    روش پرداخت رو انتخاب کن
                  </p>
                </div>
              </div>
            </div>

            {/* 🆕 کد دعوت */}
            <div className="p-5 bg-gradient-to-br from-purple-500/5 to-transparent border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Gift size={14} className="text-purple-500" />
                <p className="text-xs font-black text-gray-900 dark:text-white">
                  کد دعوت داری؟
                </p>
              </div>

              {!appliedReferral ? (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => {
                        setReferralCode(
                          e.target.value.toUpperCase().slice(0, 10),
                        );
                        setReferralError("");
                      }}
                      placeholder="مثلاً: GRIFFIN"
                      dir="ltr"
                      className="
                        flex-1 rounded-xl
                        border border-gray-200 dark:border-white/10
                        bg-white/60 dark:bg-white/[0.03]
                        px-3 py-2.5
                        text-sm text-gray-900 dark:text-white
                        font-mono tracking-widest text-center
                        outline-none
                        focus:border-purple-500
                        focus:ring-2 focus:ring-purple-500/20
                        transition-colors
                      "
                    />
                    <button
                      type="button"
                      onClick={() => void handleApplyReferral()}
                      disabled={validatingReferral || !referralCode.trim()}
                      className="
                        inline-flex items-center justify-center gap-1.5
                        rounded-xl
                        bg-purple-500 hover:bg-purple-600
                        px-4 py-2.5
                        text-xs font-black text-white
                        disabled:opacity-40 disabled:cursor-not-allowed
                        transition-colors shrink-0
                      "
                    >
                      {validatingReferral ? (
                        <LoaderCircle size={13} className="animate-spin" />
                      ) : (
                        <Check size={13} />
                      )}
                      اعمال
                    </button>
                  </div>

                  {referralError && (
                    <div className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 flex items-start gap-1.5">
                      <AlertCircle
                        size={11}
                        className="text-rose-500 shrink-0 mt-0.5"
                      />
                      <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        {referralError}
                      </p>
                    </div>
                  )}

                  <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-400 leading-5">
                    با کد دعوت دوستت،{" "}
                    <span className="font-black text-purple-600 dark:text-purple-400">
                      {formatReferralAmount(1000000)} تومان
                    </span>{" "}
                    تخفیف بگیر.
                  </p>
                </>
              ) : (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        کد «{referralCode}» اعمال شد
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80 mt-1">
                        دعوت‌کننده: {appliedReferral.referrerName}
                      </p>
                      <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-1.5">
                        تخفیف: {formatReferralAmount(appliedReferral.discount)}{" "}
                        تومان
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveReferral}
                      disabled={purchasing}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                      aria-label="حذف کد دعوت"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* مبلغ قابل پرداخت */}
            <div className="p-6 bg-[var(--griffin-gold)]/5 border-b border-[var(--griffin-gold)]/20">
              <div className="space-y-2">
                {selectedPlan.hasDiscount && (
                  <div className="flex items-baseline justify-between text-[11px]">
                    <span className="text-gray-500 dark:text-gray-400">
                      قیمت اصلی
                    </span>
                    <span className="font-bold text-gray-400 line-through">
                      {formatPrice(selectedPlan.originalPrice)} تومان
                    </span>
                  </div>
                )}

                {selectedPlan.hasDiscount && (
                  <div className="flex items-baseline justify-between text-[11px]">
                    <span className="text-rose-500">
                      تخفیف پلن ({selectedPlan.discountPercent}٪)
                    </span>
                    <span className="font-bold text-rose-500">
                      - {formatPrice(selectedPlan.discountAmount)} تومان
                    </span>
                  </div>
                )}

                {appliedReferral && (
                  <div className="flex items-baseline justify-between text-[11px]">
                    <span className="text-purple-500">تخفیف کد دعوت</span>
                    <span className="font-bold text-purple-500">
                      - {formatReferralAmount(appliedReferral.discount)} تومان
                    </span>
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-2 border-t border-[var(--griffin-gold)]/20">
                  <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                    مبلغ نهایی
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-2xl font-black text-[var(--griffin-gold)]">
                      {formatPrice(calculateFinalPrice(selectedPlan))}
                    </span>
                    <span className="text-xs font-bold text-gray-500">
                      تومان
                    </span>
                  </div>
                </div>
              </div>

              {subscription && (
                <p className="mt-3 text-[11px] text-amber-600 dark:text-amber-400 leading-5">
                  <AlertCircle size={11} className="inline ml-1" />
                  اشتراک فعلی شما لغو شده و باقی‌مانده آن به کیف پول برمی‌گردد.
                </p>
              )}
            </div>

            <div className="p-6 space-y-3">
              <button
                type="button"
                onClick={() => handlePurchase("wallet")}
                disabled={purchasing}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 transition-colors disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Wallet size={22} />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                    پرداخت از کیف پول
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    کسر از موجودی کیف پول
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePurchase("zarinpal")}
                disabled={purchasing}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 transition-colors disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <CreditCard size={22} />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                    پرداخت آنلاین
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    درگاه پرداخت امن زرین‌پال
                  </p>
                </div>
              </button>

              {purchaseError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2">
                  <AlertCircle
                    size={14}
                    className="text-rose-500 shrink-0 mt-0.5"
                  />
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    {purchaseError}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowGatewayModal(false)}
                disabled={purchasing}
                className="w-full py-3 text-xs font-black text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
              >
                انصراف
              </button>

              {purchasing && (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--griffin-gold)]">
                  <LoaderCircle size={14} className="animate-spin" />
                  در حال پردازش...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال موفقیت ===== */}
      {purchaseSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setPurchaseSuccess(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-white dark:bg-[#0F1419] shadow-2xl p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative inline-flex mb-5">
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-50" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-2xl">
                <CheckCircle2 size={36} />
              </div>
            </div>

            <h3 className="font-heading text-xl font-black text-gray-900 dark:text-white mb-2">
              اشتراک فعال شد!
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-7 mb-4">
              اشتراک{" "}
              <span className="font-black text-[var(--griffin-gold)]">
                {purchaseSuccess.planTitle}
              </span>{" "}
              با موفقیت فعال شد.
            </p>

            {purchaseSuccess.refundAmount > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 mb-4">
                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  {formatPrice(purchaseSuccess.refundAmount)} تومان از اشتراک
                  قبلی به کیف پولت برگشت.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPurchaseSuccess(null)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white font-black text-sm shadow-lg shadow-[var(--griffin-gold)]/40 hover:-translate-y-0.5 transition-transform"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Subscriptions;
