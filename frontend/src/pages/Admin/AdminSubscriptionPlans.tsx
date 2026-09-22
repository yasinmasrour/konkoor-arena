import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Crown,
  LoaderCircle,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { FEATURES, FEATURE_LABELS } from "../../constants/features";
import ConfirmDeleteModal from "../../components/comments/ConfirmDeleteModal";

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
  createdAt: string;
}

const ALL_FEATURES = Object.values(FEATURES);

const AdminSubscriptionPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<SubscriptionPlan | null>(
    null,
  );
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

  // ==================== Actions ====================
  const handleSave = async (plan: SubscriptionPlan) => {
    setActionLoading(plan.id);
    try {
      await api.patch(`/admin/subscription-plans/${plan.id}`, {
        title: plan.title,
        description: plan.description,
        price: plan.price,
        durationDays: plan.durationDays,
        features: plan.features,
        isActive: plan.isActive,
        order: plan.order,
        badge: plan.badge,
      });
      setEditingPlan(null);
      await load();
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPlan) return;
    setActionLoading(deletingPlan.id);
    try {
      await api.delete(`/admin/subscription-plans/${deletingPlan.id}`);
      setPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
      setDeletingPlan(null);
    } catch (err) {
      console.error("Failed to delete:", err);
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
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px]" />

            <div className="relative flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
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
                  امکانات هر پلن رو مشخص کن
                </p>
              </div>

              <button
                type="button"
                onClick={() => void load()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 px-4 py-2.5 font-black text-[var(--griffin-gold)] text-xs hover:bg-[var(--griffin-gold)]/10 disabled:opacity-40 transition-all"
              >
                <RefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
                بروزرسانی
              </button>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2">
              <AlertCircle
                size={14}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                {error}
              </p>
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
              <p className="text-sm text-gray-500">هیچ پلنی وجود نداره</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isEditing={editingPlan?.id === plan.id}
                  onEdit={() => setEditingPlan(plan)}
                  onCancel={() => setEditingPlan(null)}
                  onSave={(updated) => void handleSave(updated)}
                  onDelete={() => setDeletingPlan(plan)}
                  onUpdate={(updated) => setEditingPlan(updated)}
                  actionLoading={actionLoading === plan.id}
                />
              ))}
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

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5">
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
          </div>

          <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white">
            {plan.title}
          </h3>
          {plan.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {plan.description}
            </p>
          )}
          <p className="text-sm font-black text-[var(--griffin-gold)] mt-2">
            {formatPrice(plan.price)} تومان
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => onSave(plan)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-4 py-2 text-xs font-black text-white shadow-lg disabled:opacity-40 transition-all"
              >
                {actionLoading ? (
                  <LoaderCircle size={12} className="animate-spin" />
                ) : (
                  <Save size={12} />
                )}
                ذخیره
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-xs font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-40 transition-all"
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 px-4 py-2 text-xs font-black text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 transition-all"
              >
                ویرایش
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/5 px-3 py-2 text-xs font-black text-rose-500 hover:bg-rose-500/10 disabled:opacity-40 transition-all"
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
                    flex items-center gap-2 p-3 rounded-xl border text-right transition-all
                    ${
                      isActive
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:border-[var(--griffin-gold)]/40"
                    }
                  `}
                >
                  <div
                    className={`
                      w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all
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
