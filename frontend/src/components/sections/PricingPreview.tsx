import { useEffect, useState } from "react";
import {
  Check,
  Clock3,
  Crown,
  Sparkles,
  Tag,
  ArrowLeft,
  LoaderCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getSubscriptionPlans,
  type SubscriptionPlan,
} from "../../api/subscriptionApi";
import { FEATURE_LABELS } from "../../constants/features";
import RevealOnScroll from "../common/RevealOnScroll";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(Math.floor(price / 10));

const PricingPreview = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscriptionPlans()
      .then((data) => setPlans(data.plans))
      .catch((err) => console.error("Failed to load plans:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* هاله‌های پس‌زمینه */}
      <div className="absolute -top-40 right-1/3 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/8 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-purple-600/8 blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* ==================== هدر ==================== */}
        <RevealOnScroll>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30 mb-5">
              <Crown size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Pricing
              </span>
            </div>

            <h2 className="font-heading text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              پلن مناسب{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                  خودت
                </span>
                <span className="absolute bottom-1 right-0 left-0 h-3 bg-[var(--griffin-gold)]/20 -z-0 rounded" />
              </span>{" "}
              رو انتخاب کن
            </h2>

            <p className="mt-5 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-8">
              سه پلن متنوع برای هر بودجه و نیازی. با هر پلن، به امکانات ویژه
              گریفین دسترسی پیدا می‌کنی.
            </p>
          </div>
        </RevealOnScroll>

        {/* ==================== کارت‌های پلن ==================== */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px] gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
            <LoaderCircle className="animate-spin" size={22} />
            در حال دریافت پلن‌ها...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {plans.map((plan, index) => {
              const isRecommended = index === Math.floor(plans.length / 2);
              const hasDiscount = plan.hasDiscount;

              return (
                <RevealOnScroll key={plan.id} delay={index * 120}>
                  <article
                    className={`
                      group relative h-full flex flex-col
                      rounded-3xl overflow-hidden
                      border transition-transform duration-300
                      hover:-translate-y-1
                      ${
                        isRecommended || hasDiscount
                          ? "border-[var(--griffin-gold)]/50 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-amber-500/5 to-transparent"
                          : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-[var(--griffin-gold)]/40"
                      }
                    `}
                  >
                    {/* خط بالای کارت */}
                    {(isRecommended || hasDiscount) && (
                      <div className="h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
                    )}

                    {/* 🆕 Badge تخفیف — اولویت اول */}
                    {hasDiscount && (
                      <div className="absolute top-5 left-5 z-10">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-l from-rose-500 to-rose-700 text-white text-[10px] font-black shadow-lg shadow-rose-500/40">
                          <Tag size={11} />
                          {plan.discountPercent.toLocaleString("fa-IR")}٪ تخفیف
                        </div>
                      </div>
                    )}

                    {/* برچسب پیشنهادی — فقط اگه تخفیف نداره */}
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
                      {/* آیکون */}
                      <div
                        className={`
                          w-14 h-14 rounded-2xl flex items-center justify-center mb-5
                          ${
                            isRecommended || hasDiscount
                              ? "bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600 text-white shadow-lg"
                              : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300"
                          }
                        `}
                      >
                        <Crown size={24} strokeWidth={2.2} />
                      </div>

                      {/* عنوان */}
                      <h3 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                        {plan.title}
                      </h3>

                      {/* 🆕 قیمت با تخفیف */}
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
                              {formatPrice(plan.finalPrice ?? plan.price)}
                            </span>
                            <span className="mb-1.5 text-xs font-bold text-gray-400">
                              تومان
                            </span>
                          </div>
                        )}
                      </div>

                      {/* مدت */}
                      <div className="mt-3 inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-400">
                        {plan.durationDays.toLocaleString("fa-IR")} روز اعتبار
                      </div>

                      {/* 🆕 تایمر تخفیف */}
                      {hasDiscount && plan.remainingDays !== null && (
                        <div className="mt-3 inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] font-black">
                          <Clock3 size={11} />
                          فقط {plan.remainingDays.toLocaleString("fa-IR")} روز
                          تا پایان تخفیف!
                        </div>
                      )}

                      {/* توضیحات */}
                      {plan.description && (
                        <p className="mt-5 text-sm leading-7 text-gray-500 dark:text-gray-400">
                          {plan.description}
                        </p>
                      )}

                      {/* ویژگی‌ها */}
                      {plan.features && plan.features.length > 0 && (
                        <ul className="mt-6 pt-6 border-t border-gray-100 dark:border-white/10 space-y-3 flex-1">
                          {plan.features.slice(0, 5).map((feature) => (
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
                              <span>{FEATURE_LABELS[feature] || feature}</span>
                            </li>
                          ))}
                          {plan.features.length > 5 && (
                            <li className="text-xs text-gray-400 pr-8">
                              + {plan.features.length - 5} امکان دیگر
                            </li>
                          )}
                        </ul>
                      )}

                      {/* CTA */}
                      <button
                        type="button"
                        onClick={() => navigate("/subscriptions")}
                        className={`
                          mt-7 w-full flex items-center justify-center gap-2
                          rounded-xl py-3.5 text-sm font-black
                          transition-transform duration-300
                          ${
                            isRecommended || hasDiscount
                              ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg hover:-translate-y-0.5"
                              : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                          }
                        `}
                      >
                        <Crown size={16} />
                        {hasDiscount ? "خرید با تخفیف" : "مشاهده جزئیات"}
                      </button>
                    </div>
                  </article>
                </RevealOnScroll>
              );
            })}
          </div>
        )}

        {/* ==================== لینک به همه پلن‌ها ==================== */}
        <RevealOnScroll delay={500}>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/subscriptions")}
              className="group inline-flex items-center gap-2 text-sm font-black text-[var(--griffin-gold)] hover:underline underline-offset-4"
            >
              مشاهده همه پلن‌ها و مقایسه کامل
              <ArrowLeft
                size={14}
                className="rotate-180 transition-transform group-hover:-translate-x-1"
              />
            </button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default PricingPreview;
