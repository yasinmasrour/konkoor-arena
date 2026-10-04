import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Crown,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FEATURES, FEATURE_LABELS } from "../../constants/features";
import ConfirmDeleteModal from "../../components/comments/ConfirmDeleteModal";
import CreatePlanModal from "../../components/admin/CreatePlanModal";

interface SubscriptionPlan {
  id: string;
  title: string;
  description: string | null;
  price: number;
  durationDays: number;
  features: string[];
  isActive: boolean;
  order: number;
  badge: string | null;
  discountPercent: number | null;
  discountEndsAt: string | null;
  createdAt: string;
}

const ALL_FEATURES = Object.values(FEATURES);

const AdminSubscriptionPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ==================== Load ====================
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/subscription-plans");
      setPlans(res.data.plans);
    } catch (err) {
      console.error("Failed to load plans:", err);
      setError("دریافت پلن‌ها انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  // 🆕 auto-hide success
  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(""), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  // ==================== Save ====================
  const handleSave = async (plan: SubscriptionPlan) => {
    if (actionLoading) return; // جلوگیری از double-click
    setActionLoading(plan.id);
    setError("");
    setSuccess("");

    try {
      // 🆕 فقط درخواست PATCH
      await api.patch(`/admin/subscription-plans/${plan.id}`, {
        title: plan.title,
        description: plan.description,
        price: plan.price,
        durationDays: plan.durationDays,
        features: plan.features,
        isActive: plan.isActive,
        order: plan.order,
        badge: plan.badge,
        discountPercent: plan.discountPercent,
        discountEndsAt: plan.discountEndsAt,
      });

      // 🆕 اگه موفق بود:
      setEditingPlan(null);
      setSuccess("پلن با موفقیت ذخیره شد.");
    } catch (err) {
      console.error("Failed to save:", err);
      // 🆕 نمایش خطای واقعی
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ذخیره‌ی پلن انجام نشد. لطفاً دوباره تلاش کنید.";
      setError(message);
      return; // ← مهم: خروج قبل از load
    } finally {
      setActionLoading(null);
    }

    // 🆕 load رو جدا صدا بزن (اگه خطا بده، روی دکمه اثر نذاره)
    try {
      await load();
    } catch (err) {
      console.error("Failed to reload after save:", err);
    }
  };

  // ==================== Delete ====================
  const handleDeleteConfirm = async () => {
    if (!deletingPlan) return;
    setActionLoading(deletingPlan.id);
    setError("");
    try {
      await api.delete(`/admin/subscription-plans/${deletingPlan.id}`);
      setPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
      setDeletingPlan(null);
      setSuccess("پلن با موفقیت حذف شد.");
    } catch (err) {
      console.error("Failed to delete:", err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "حذف پلن انجام نشد.";
      setError(message);
      setDeletingPlan(null);
    } finally {
      setActionLoading(null);
    }
  };

  // ==================== JSX ====================
  return (
    <>
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-5xl space-y-5">
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
          >
            <ArrowLeft
              size={13}
              className="transition-transform group-hover:-translate-x-1"
            />
            بازگشت به داشبورد
          </button>

          {/* Hero */}
          <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[70px]" />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-50" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-xl rotate-3 border-2 border-white/10">
                  <Crown size={28} />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Admin Panel
                </p>
                <h1 className="font-heading text-2xl font-black text-white -mt-0.5">
                  مدیریت پلن‌های اشتراک
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  امکانات و تخفیف هر پلن رو مشخص کن
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 font-black text-white text-xs shadow-lg shadow-[var(--griffin-gold)]/40 hover:-translate-y-0.5 transition-transform"
                >
                  <Plus size={14} />
                  پلن جدید
                </button>

                <button
                  type="button"
                  onClick={() => void load()}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 px-4 py-2.5 font-black text-[var(--griffin-gold)] text-xs hover:bg-[var(--griffin-gold)]/10 disabled:opacity-40 transition-colors"
                >
                  <RefreshCw
                    size={13}
                    className={loading ? "animate-spin" : ""}
                  />
                  بروزرسانی
                </button>
              </div>
            </div>
          </section>

          {/* Success */}
          {success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-2">
              <CheckCircle2
                size={14}
                className="text-emerald-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex-1">
                {success}
              </p>
              <button
                onClick={() => setSuccess("")}
                className="shrink-0 text-emerald-500 hover:text-emerald-600"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2">
              <AlertCircle
                size={14}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex-1">
                {error}
              </p>
              <button
                onClick={() => setError("")}
                className="shrink-0 text-rose-500 hover:text-rose-600"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Plans */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <LoaderCircle
                size={28}
                className="text-[var(--griffin-gold)] animate-spin"
              />
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
              <Crown size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-500 mb-4">هیچ پلنی وجود نداره</p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:-translate-y-0.5 transition-transform"
              >
                <Plus size={14} />
                ساخت اولین پلن
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => {
                // 🆕 اگه این پلن در حال ویرایشه، از editingPlan استفاده کن
                const isEditing = editingPlan?.id === plan.id;
                return (
                  <PlanCard
                    key={plan.id}
                    plan={isEditing ? editingPlan! : plan}
                    isEditing={isEditing}
                    onEdit={() => {
                      setError("");
                      setSuccess("");
                      setEditingPlan(plan);
                    }}
                    onCancel={() => setEditingPlan(null)}
                    onSave={(updated) => void handleSave(updated)}
                    onDelete={() => setDeletingPlan(plan)}
                    onUpdate={(updated) => setEditingPlan(updated)}
                    actionLoading={actionLoading === plan.id}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      {deletingPlan && (
        <ConfirmDeleteModal
          title="حذف پلن"
          message={`آیا از حذف "${deletingPlan.title}" مطمئنی؟`}
          onClose={() => setDeletingPlan(null)}
          onConfirm={() => void handleDeleteConfirm()}
          loading={actionLoading === deletingPlan.id}
        />
      )}

      {showCreateModal && (
        <CreatePlanModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            setSuccess("پلن با موفقیت ساخته شد.");
            void load();
          }}
        />
      )}
    </>
  );
};

// ==================== PlanCard ====================
interface PlanCardProps {
  plan: SubscriptionPlan;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (plan: SubscriptionPlan) => void;
  onDelete: () => void;
  onUpdate: (plan: SubscriptionPlan) => void;
  actionLoading: boolean;
}

const PlanCard = ({
  plan,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onUpdate,
  actionLoading,
}: PlanCardProps) => {
  const toggleFeature = (feature: string) => {
    const newFeatures = plan.features.includes(feature)
      ? plan.features.filter((f) => f !== feature)
      : [...plan.features, feature];
    onUpdate({ ...plan, features: newFeatures });
  };

  const formatPrice = (amountInRial: number) => {
    const toman = Math.floor(amountInRial / 10);
    return new Intl.NumberFormat("fa-IR").format(toman);
  };

  const calculateFinalPrice = (
    price: number,
    discountPercent: number | null,
  ) => {
    if (!discountPercent || discountPercent <= 0) return price;
    const discountAmount = Math.floor((price * discountPercent) / 100);
    return price - discountAmount;
  };

  const isDiscountActive = () => {
    if (!plan.discountPercent || plan.discountPercent <= 0) return false;
    if (!plan.discountEndsAt) return true;
    return new Date(plan.discountEndsAt) > new Date();
  };

  const hasActiveDiscount = isDiscountActive();
  const finalPrice = calculateFinalPrice(plan.price, plan.discountPercent);

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {plan.isActive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                <CheckCircle2 size={9} />
                فعال
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-500/15 text-gray-500 text-[10px] font-black">
                غیرفعال
              </span>
            )}

            {plan.badge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600 text-white text-[10px] font-black">
                {plan.badge}
              </span>
            )}

            {hasActiveDiscount && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-l from-rose-500 to-rose-700 text-white text-[10px] font-black">
                <Tag size={9} />
                {plan.discountPercent}٪ تخفیف
              </span>
            )}
          </div>

          <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white">
            {plan.title}
          </h3>
          {plan.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {plan.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {hasActiveDiscount ? (
              <>
                <span className="text-sm font-bold text-gray-400 line-through">
                  {formatPrice(plan.price)} تومان
                </span>
                <span className="text-sm font-black text-[var(--griffin-gold)]">
                  {formatPrice(finalPrice)} تومان
                </span>
              </>
            ) : (
              <p className="text-sm font-black text-[var(--griffin-gold)]">
                {formatPrice(plan.price)} تومان
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => onSave(plan)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-4 py-2 text-xs font-black text-white shadow-lg disabled:opacity-40 transition-transform hover:-translate-y-0.5"
              >
                {actionLoading ? (
                  <LoaderCircle size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                {actionLoading ? "در حال ذخیره..." : "ذخیره"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-xs font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                <X size={12} />
                لغو
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 px-4 py-2 text-xs font-black text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 transition-colors"
              >
                ویرایش
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/5 px-3 py-2 text-xs font-black text-rose-500 hover:bg-rose-500/10 disabled:opacity-40 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      {isEditing && (
        <div className="pt-4 border-t border-gray-200/70 dark:border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
            امکانات
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {ALL_FEATURES.map((feature) => {
              const isActive = plan.features.includes(feature);
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
      )}

      {/* تخفیف */}
      {isEditing && (
        <div className="pt-4 border-t border-gray-200/70 dark:border-white/5 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={13} className="text-rose-500" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              تخفیف
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-1.5">
                درصد تخفیف (۰ تا ۱۰۰)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={plan.discountPercent ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  onUpdate({
                    ...plan,
                    discountPercent: value === "" ? null : Number(value),
                  });
                }}
                placeholder="مثلاً 30"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-1.5">
                تاریخ انقضا (اختیاری)
              </label>
              <input
                type="date"
                value={
                  plan.discountEndsAt
                    ? new Date(plan.discountEndsAt).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  const value = e.target.value;
                  onUpdate({
                    ...plan,
                    discountEndsAt: value
                      ? new Date(value + "T23:59:59").toISOString()
                      : null,
                  });
                }}
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-colors"
              />
            </div>
          </div>

          {plan.discountPercent && plan.discountPercent > 0 ? (
            <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
              <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                تخفیف {plan.discountPercent}٪ فعال میشه
                {plan.discountEndsAt
                  ? ` تا ${new Date(plan.discountEndsAt).toLocaleDateString(
                      "fa-IR",
                    )}`
                  : " (دائمی)"}
              </p>
              <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                قیمت نهایی:{" "}
                <span className="font-black text-[var(--griffin-gold)]">
                  {formatPrice(finalPrice)} تومان
                </span>{" "}
                <span className="line-through">
                  (قبلاً: {formatPrice(plan.price)} تومان)
                </span>
              </p>
            </div>
          ) : (
            <p className="mt-3 text-[10px] text-gray-500 dark:text-gray-400">
              تخفیفی تنظیم نشده — قیمت اصلی نمایش داده میشه
            </p>
          )}
        </div>
      )}

      {/* Preview */}
      {!isEditing && plan.features.length > 0 && (
        <div className="pt-4 border-t border-gray-200/70 dark:border-white/5">
          <div className="flex flex-wrap gap-1.5">
            {plan.features.map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] text-[10px] font-black"
              >
                <Check size={9} strokeWidth={3} />
                {FEATURE_LABELS[feature] || feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionPlans;