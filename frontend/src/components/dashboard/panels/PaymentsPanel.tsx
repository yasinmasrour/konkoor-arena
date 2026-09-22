import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Hash,
  LoaderCircle,
  Receipt,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Wallet,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getMyPayments,
  mapPaymentStatus,
  getGatewayLabel,
  formatPrice,
  type Payment,
} from "../../../api/paymentApi";

type PaymentTab = "all" | "success" | "pending" | "failed";

// ==================== تنظیمات ====================
const statusConfig: Record<
  string,
  { bg: string; text: string; label: string; icon: typeof CheckCircle2 }
> = {
  success: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "موفق",
    icon: CheckCircle2,
  },
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    label: "در انتظار",
    icon: Clock3,
  },
  failed: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    label: "ناموفق",
    icon: XCircle,
  },
  refunded: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    label: "بازگشت",
    icon: TrendingUp,
  },
};

const typeLabels: Record<string, string> = {
  subscription: "خرید اشتراک",
  wallet_charge: "شارژ کیف پول",
  exam: "خرید آزمون",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

// ==================== کامپوننت ====================
const PaymentsPanel = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<PaymentTab>("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ==================== Load ====================
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getMyPayments();
      setPayments(response.payments);
    } catch (err) {
      console.error("Failed to load payments:", err);
      setError("دریافت سوابق پرداخت انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, []);

  // ==================== آمار ====================
  const stats = useMemo(() => {
    const success = payments.filter((p) => p.status === "paid");
    const failed = payments.filter(
      (p) => p.status === "failed" || p.status === "cancelled",
    );
    const pending = payments.filter((p) => p.status === "pending");
    const totalAmount = success.reduce((sum, p) => sum + p.amount, 0);

    return {
      total: payments.length,
      successCount: success.length,
      failedCount: failed.length,
      pendingCount: pending.length,
      totalAmount,
    };
  }, [payments]);

  // ==================== فیلتر ====================
  const filteredPayments = useMemo(() => {
    let result = payments;

    if (activeTab === "success") {
      result = result.filter((p) => p.status === "paid");
    } else if (activeTab === "pending") {
      result = result.filter((p) => p.status === "pending");
    } else if (activeTab === "failed") {
      result = result.filter(
        (p) => p.status === "failed" || p.status === "cancelled",
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.merchantOrderId?.toLowerCase().includes(q) ||
          p.transactionId?.toLowerCase().includes(q) ||
          p.plan?.title?.toLowerCase().includes(q) ||
          p.type?.toLowerCase().includes(q),
      );
    }

    return result;
  }, [payments, activeTab, search]);

  const tabs: { key: PaymentTab; label: string; count: number }[] = [
    { key: "all", label: "همه", count: stats.total },
    { key: "success", label: "موفق", count: stats.successCount },
    { key: "pending", label: "در انتظار", count: stats.pendingCount },
    { key: "failed", label: "ناموفق", count: stats.failedCount },
  ];

  const handleCopyTracking = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-5">
      {/* ==================== HERO (تیره) ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[100px] pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="relative shrink-0 self-center lg:self-auto">
            <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
              <Receipt size={36} strokeWidth={2.3} />
            </div>
            <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white border-2 border-[#080B12] shadow-lg">
              <CreditCard size={14} />
            </span>
          </div>

          <div className="flex-1 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 mb-2">
              <Sparkles
                size={12}
                className="text-[var(--griffin-gold)] animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Payment History
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
              سوابق پرداخت
            </h1>

            <p className="mt-2 text-sm text-gray-400 leading-7">
              تمام پرداخت‌های موفق و ناموفق رو اینجا ببین.
            </p>
          </div>

          <div className="shrink-0 self-center lg:self-auto">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 backdrop-blur-sm px-5 py-3.5 font-black text-[var(--griffin-gold)] text-xs hover:bg-[var(--griffin-gold)]/10 disabled:opacity-40 transition-all"
            >
              <RefreshCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : "transition-transform group-hover:rotate-180 duration-500"
                }
              />
              بروزرسانی
            </button>
          </div>
        </div>
      </section>

      {/* ==================== ۳ کارت آمار ==================== */}
      <section className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Wallet,
            label: "کل پرداخت",
            value: formatPrice(stats.totalAmount),
            suffix: "تومان",
            color: "text-[var(--griffin-gold)]",
            bg: "bg-[var(--griffin-gold)]/10",
          },
          {
            icon: CheckCircle2,
            label: "موفق",
            value: stats.successCount.toLocaleString("fa-IR"),
            suffix: "پرداخت",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            icon: XCircle,
            label: "ناموفق",
            value: stats.failedCount.toLocaleString("fa-IR"),
            suffix: "پرداخت",
            color: "text-rose-500",
            bg: "bg-rose-500/10",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
            >
              <div
                className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon size={16} className={stat.color} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1 mt-1">
                <p
                  className={`font-heading text-lg font-black tabular-nums ${stat.color}`}
                >
                  {stat.value}
                </p>
                <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                  {stat.suffix}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {/* ==================== Tabs + Search ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="p-4 border-b border-gray-200/70 dark:border-white/5">
          <div className="flex flex-wrap gap-2 mb-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    inline-flex items-center gap-2 rounded-xl px-3.5 py-2
                    text-xs font-black transition-all
                    ${
                      isActive
                        ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                        : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                    }
                  `}
                >
                  {tab.label}
                  <span
                    className={`
                      inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-md
                      text-[9px] font-black tabular-nums
                      ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                      }
                    `}
                  >
                    {tab.count.toLocaleString("fa-IR")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--griffin-gold)]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در کد پیگیری یا نام پلن..."
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] py-2.5 pr-10 pl-3 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
            />
          </div>
        </div>

        {/* ==================== لیست ==================== */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-3">
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
                  <LoaderCircle size={24} className="text-white animate-spin" />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                در حال دریافت پرداخت‌ها...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center mb-3">
              <AlertCircle size={24} className="text-rose-500" />
            </div>
            <p className="text-sm font-bold text-rose-500 dark:text-rose-400">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl transition-all"
            >
              <RefreshCw size={14} />
              تلاش مجدد
            </button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <Receipt size={28} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
              {search.trim()
                ? "پرداختی با این جستجو پیدا نشد"
                : activeTab === "failed"
                  ? "هیچ پرداخت ناموفقی نداری"
                  : activeTab === "success"
                    ? "هنوز پرداخت موفقی نداری"
                    : activeTab === "pending"
                      ? "پرداخت در انتظاری نداری"
                      : "هنوز پرداختی ثبت نشده!"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {search.trim() ? "جستجو رو تغییر بده" : "با خرید اشتراک شروع کن."}
            </p>
            {!search.trim() && (
              <button
                type="button"
                onClick={() => navigate("/subscriptions")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl transition-all"
              >
                <CreditCard size={14} />
                مشاهده پلن‌ها
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredPayments.map((payment) => {
              const status = mapPaymentStatus(payment.status);
              const config = statusConfig[status] ?? statusConfig.pending;
              const StatusIcon = config.icon;
              const isSuccess = status === "success";

              return (
                <div
                  key={payment.id}
                  className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-4 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div
                      className={`
                        w-11 h-11 rounded-xl shrink-0 self-start sm:self-auto
                        flex items-center justify-center
                        ${config.bg} ${config.text}
                      `}
                    >
                      <StatusIcon size={20} strokeWidth={2.4} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black ${config.bg} ${config.text}`}
                        >
                          <StatusIcon size={8} />
                          {config.label}
                        </span>

                        {payment.plan?.title && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] text-[9px] font-black">
                            <Shield size={8} />
                            {payment.plan.title}
                          </span>
                        )}

                        {payment.gateway && payment.gateway !== "pending" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-500/10 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-[9px] font-black">
                            <CreditCard size={8} />
                            {getGatewayLabel(payment.gateway)}
                          </span>
                        )}
                      </div>

                      <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                        {typeLabels[payment.type] ?? "پرداخت"}
                        {payment.plan?.title && ` - ${payment.plan.title}`}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                          <Calendar size={9} />
                          {formatDate(payment.paidAt ?? payment.createdAt)}
                        </span>

                        {payment.merchantOrderId && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleCopyTracking(
                                payment.id,
                                payment.merchantOrderId,
                              )
                            }
                            className="inline-flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
                          >
                            {copiedId === payment.id ? (
                              <>
                                <CheckCircle2 size={9} />
                                کپی شد
                              </>
                            ) : (
                              <>
                                <Hash size={9} />
                                {payment.merchantOrderId}
                                <Copy size={9} />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0">
                      <div className="text-left sm:text-right">
                        <p
                          className={`
                            font-heading text-base font-black tabular-nums
                            ${
                              isSuccess
                                ? "text-emerald-500"
                                : "text-gray-500 dark:text-gray-400"
                            }
                          `}
                        >
                          {formatPrice(payment.amount)}
                        </p>
                        <p className="text-[9px] text-gray-500 dark:text-gray-600">
                          تومان
                        </p>
                      </div>
                    </div>
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

export default PaymentsPanel;
