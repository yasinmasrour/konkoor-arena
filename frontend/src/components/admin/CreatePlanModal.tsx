import { useState } from "react";
import { AlertCircle, Check, Crown, LoaderCircle, Tag, X } from "lucide-react";
import api from "../../api/axios";
import { FEATURES, FEATURE_LABELS } from "../../constants/features";

const ALL_FEATURES = Object.values(FEATURES);

interface CreatePlanModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  isActive: boolean;
  order: number;
  badge: string;
  discountPercent: number | null;
  discountEndsAt: string | null;
}

const CreatePlanModal = ({ onClose, onSuccess }: CreatePlanModalProps) => {
  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    price: 0,
    durationDays: 365,
    features: [],
    isActive: true,
    order: 1,
    badge: "",
    discountPercent: null,
    discountEndsAt: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleFeature = (feature: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.title.trim()) {
      setError("عنوان پلن الزامی است");
      return;
    }
    if (form.title.trim().length < 2) {
      setError("عنوان پلن باید حداقل ۲ کاراکتر باشد");
      return;
    }
    if (form.price <= 0) {
      setError("قیمت باید بزرگ‌تر از صفر باشد");
      return;
    }
    if (form.durationDays <= 0) {
      setError("مدت اعتبار باید بزرگ‌تر از صفر باشد");
      return;
    }
    if (form.discountPercent !== null) {
      if (form.discountPercent < 0 || form.discountPercent > 100) {
        setError("درصد تخفیف باید بین ۰ و ۱۰۰ باشد");
        return;
      }
    }

    setLoading(true);
    try {
      await api.post("/admin/subscription-plans", {
        title: form.title.trim(),
        description: form.description.trim() || null,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        features: form.features,
        isActive: form.isActive,
        order: Number(form.order),
        badge: form.badge.trim() || null,
        discountPercent: form.discountPercent,
        discountEndsAt: form.discountEndsAt,
      });
      onSuccess();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ساخت پلن با مشکل مواجه شد";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // فرمت قیمت برای نمایش
  const formatPrice = (priceInRial: number) => {
    const toman = Math.floor(priceInRial / 10);
    return new Intl.NumberFormat("fa-IR").format(toman);
  };

  // قیمت نهایی با تخفیف
  const finalPrice =
    form.discountPercent && form.discountPercent > 0
      ? form.price - Math.floor((form.price * form.discountPercent) / 100)
      : form.price;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={() => !loading && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0F1419] shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر */}
        <div className="flex items-center justify-between gap-3 p-6 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
              <Crown size={22} />
            </div>
            <div>
              <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                پلن جدید
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                پلن جدید اشتراک بساز
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-rose-500/10 hover:text-rose-500 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* فرم */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* عنوان */}
            <div>
              <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-2">
                عنوان پلن <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="مثلاً: برنزی، نقره‌ای، طلایی"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
              />
            </div>

            {/* توضیحات */}
            <div>
              <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-2">
                توضیحات (اختیاری)
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="توضیح مختصر درباره‌ی این پلن..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors resize-none"
              />
            </div>

            {/* قیمت + مدت */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-2">
                  قیمت (تومان) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={form.price ? Math.floor(form.price / 10) : ""}
                  onChange={(e) => {
                    const toman = Number(e.target.value) || 0;
                    setForm({ ...form, price: toman * 10 });
                  }}
                  placeholder="مثلاً: 3100000"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
                />
                {form.price > 0 && (
                  <p className="mt-1 text-[10px] text-gray-500">
                    معادل: {formatPrice(form.price)} تومان
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-2">
                  مدت اعتبار (روز) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.durationDays || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      durationDays: Number(e.target.value) || 0,
                    })
                  }
                  placeholder="مثلاً: 365"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
                />
              </div>
            </div>

            {/* ترتیب + برچسب */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-2">
                  ترتیب نمایش
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) || 0 })
                  }
                  placeholder="۱ = اول"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-2">
                  برچسب (اختیاری)
                </label>
                <input
                  type="text"
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  placeholder="مثلاً: محبوب‌ترین، VIP"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-sm outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-colors"
                />
              </div>
            </div>

            {/* امکانات */}
            <div>
              <label className="block text-xs font-black text-gray-700 dark:text-gray-300 mb-3">
                امکانات پلن
              </label>
              <div className="grid sm:grid-cols-2 gap-2">
                {ALL_FEATURES.map((feature) => {
                  const isActive = form.features.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      className={`
                        flex items-center gap-2 p-3 rounded-xl border text-right transition-colors
                        ${
                          isActive
                            ? "border-emerald-500/40 bg-emerald-500/10"
                            : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:border-[var(--griffin-gold)]/40"
                        }
                      `}
                    >
                      <div
                        className={`
                          w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors
                          ${
                            isActive
                              ? "bg-emerald-500 text-white"
                              : "border-2 border-gray-300 dark:border-white/20"
                          }
                        `}
                      >
                        {isActive && <Check size={11} strokeWidth={3} />}
                      </div>
                      <span
                        className={`
                          text-xs font-bold
                          ${
                            isActive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-gray-700 dark:text-gray-300"
                          }
                        `}
                      >
                        {FEATURE_LABELS[feature] || feature}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* تخفیف */}
            <div className="pt-4 border-t border-gray-200/70 dark:border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={13} className="text-rose-500" />
                <p className="text-xs font-black text-gray-700 dark:text-gray-300">
                  تخفیف (اختیاری)
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1.5">
                    درصد تخفیف (۰ تا ۱۰۰)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.discountPercent ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm({
                        ...form,
                        discountPercent: value === "" ? null : Number(value),
                      });
                    }}
                    placeholder="مثلاً: 30"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-1.5">
                    تاریخ انقضا (اختیاری)
                  </label>
                  <input
                    type="date"
                    value={
                      form.discountEndsAt
                        ? new Date(form.discountEndsAt)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm({
                        ...form,
                        discountEndsAt: value
                          ? new Date(value + "T23:59:59").toISOString()
                          : null,
                      });
                    }}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-colors"
                  />
                </div>
              </div>

              {form.discountPercent && form.discountPercent > 0 && (
                <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    تخفیف {form.discountPercent}٪ اعمال میشه
                    {form.discountEndsAt
                      ? ` تا ${new Date(form.discountEndsAt).toLocaleDateString("fa-IR")}`
                      : " (دائمی)"}
                  </p>
                  {form.price > 0 && (
                    <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                      قیمت نهایی:{" "}
                      <span className="font-black text-[var(--griffin-gold)]">
                        {formatPrice(finalPrice)} تومان
                      </span>{" "}
                      <span className="line-through">
                        (قبلاً: {formatPrice(form.price)} تومان)
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* فعال بودن */}
            <div className="pt-4 border-t border-gray-200/70 dark:border-white/5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    className="sr-only"
                  />
                  <div
                    className={`
                      w-11 h-6 rounded-full transition-colors
                      ${form.isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/10"}
                    `}
                  >
                    <div
                      className={`
                        absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-lg transition-transform
                        ${form.isActive ? "translate-x-0.5" : "translate-x-5"}
                      `}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 dark:text-gray-300">
                    پلن فعال باشد
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {form.isActive
                      ? "کاربران می‌توانند این پلن را بخرند"
                      : "این پلن به کاربران نمایش داده نمی‌شود"}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* خطا */}
          {error && (
            <div className="mx-6 mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2">
              <AlertCircle
                size={14}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {error}
              </p>
            </div>
          )}

          {/* دکمه‌ها */}
          <div className="p-6 border-t border-gray-100 dark:border-white/5 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="
                group relative flex-1
                inline-flex items-center justify-center gap-2
                rounded-xl
                bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                py-3.5
                font-heading font-black text-white text-sm
                shadow-lg shadow-[var(--griffin-gold)]/40
                transition-transform duration-300
                hover:-translate-y-0.5
                disabled:opacity-50 disabled:cursor-not-allowed
                overflow-hidden
              "
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    در حال ساخت...
                  </>
                ) : (
                  <>
                    <Crown size={16} />
                    ساخت پلن
                  </>
                )}
              </span>
              {!loading && (
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                inline-flex items-center justify-center
                rounded-xl border border-gray-200 dark:border-white/10
                bg-white dark:bg-white/[0.03]
                px-6 py-3.5
                font-black text-gray-600 dark:text-gray-300 text-sm
                hover:bg-gray-100 dark:hover:bg-white/5
                disabled:opacity-50 transition-colors
              "
            >
              لغو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanModal;
