import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock3,
  Coins,
  Filter,
  History,
  LoaderCircle,
  Plus,
  Receipt,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import {
  getWalletBalance,
  getWalletTransactions,
  getMyWithdrawRequests,
  formatPrice,
  type WalletBalance,
  type WalletTransaction,
  type WithdrawRequest,
  type TransactionType,
} from "../../../api/walletApi";
import ChargeWalletModal from "../../wallet/ChargeWalletModal";
import WithdrawModal from "../../wallet/WithdrawModal";

// ==================== تنظیمات ====================
const typeLabels: Record<TransactionType, string> = {
  CHARGE: "شارژ کیف پول",
  PURCHASE: "خرید",
  REFUND: "بازگشت وجه",
  WITHDRAW: "برداشت",
  REWARD: "جایزه",
  ADMIN_ADJUST: "تنظیم ادمین",
};

const typeStyles: Record<
  string,
  { bg: string; text: string; icon: typeof Plus }
> = {
  CHARGE: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: ArrowDownRight,
  },
  REWARD: {
    bg: "bg-[var(--griffin-gold)]/10",
    text: "text-[var(--griffin-gold)]",
    icon: TrendingUp,
  },
  REFUND: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    icon: RefreshCw,
  },
  PURCHASE: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    icon: ArrowUpRight,
  },
  WITHDRAW: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    icon: ArrowUpRight,
  },
  ADMIN_ADJUST: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    icon: Banknote,
  },
};

const statusStyles: Record<
  string,
  { bg: string; text: string; label: string; icon: typeof CheckCircle2 }
> = {
  SUCCESS: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "موفق",
    icon: CheckCircle2,
  },
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    label: "در انتظار",
    icon: Clock3,
  },
  FAILED: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    label: "ناموفق",
    icon: XCircle,
  },
  CANCELLED: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    label: "لغو شده",
    icon: X,
  },
};

const withdrawStatusStyles: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    label: "در انتظار بررسی",
  },
  APPROVED: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    label: "تایید شده",
  },
  COMPLETED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "واریز شده",
  },
  REJECTED: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    label: "رد شده",
  },
  CANCELLED: {
    bg: "bg-gray-500/10",
    text: "text-gray-600 dark:text-gray-400",
    label: "لغو شده",
  },
};

type TabType = "transactions" | "withdrawals";

const formatDate = (value: string) =>
  new Date(value).toLocaleString("fa-IR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ==================== کامپوننت ====================
const WalletPanel = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("transactions");
  const [filter, setFilter] = useState<"all" | TransactionType>("all");
  const [chargeOpen, setChargeOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // 🔹 آمار
  const stats = useMemo(() => {
    const totalCharge = transactions
      .filter((t) => t.type === "CHARGE" && t.status === "SUCCESS")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = transactions
      .filter((t) => t.type === "PURCHASE" && t.status === "SUCCESS")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRewards = transactions
      .filter((t) => t.type === "REWARD" && t.status === "SUCCESS")
      .reduce((sum, t) => sum + t.amount, 0);

    return { totalCharge, totalSpent, totalRewards };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  // ==================== Loaders ====================
  const loadBalance = async () => {
    try {
      const data = await getWalletBalance();
      setBalance(data);
    } catch (err) {
      console.error("Failed to load balance:", err);
      setError("دریافت موجودی انجام نشد");
    }
  };

  const loadTransactions = async (page = 1) => {
    setTxLoading(true);
    try {
      const result = await getWalletTransactions({
        page,
        limit: pagination.limit,
      });
      setTransactions(result.transactions);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setTxLoading(false);
    }
  };

  const loadWithdrawRequests = async () => {
    try {
      const result = await getMyWithdrawRequests();
      setWithdrawRequests(result.requests);
    } catch (err) {
      console.error("Failed to load withdraw requests:", err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");
    await Promise.all([
      loadBalance(),
      loadTransactions(1),
      loadWithdrawRequests(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== Handlers ====================
  const handleChargeSuccess = () => {
    setChargeOpen(false);
    void loadAll();
  };

  const handleWithdrawSuccess = () => {
    setWithdrawOpen(false);
    void loadAll();
  };

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
            در حال دریافت اطلاعات کیف پول...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* ==================== HERO (تیره) ==================== */}
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

          <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
            <div className="relative shrink-0 self-center lg:self-auto">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-3xl opacity-70 animate-pulse" />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/20">
                <Wallet size={44} strokeWidth={2.3} />
              </div>
              <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white border-2 border-[#080B12] shadow-lg">
                <Coins size={14} />
              </span>
            </div>

            <div className="flex-1 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 mb-2">
                <Sparkles
                  size={12}
                  className="text-[var(--griffin-gold)] animate-pulse"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Wallet Balance
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-2">موجودی فعلی</p>

              <div className="flex items-baseline gap-2 justify-center lg:justify-start">
                <h1 className="font-heading text-4xl sm:text-5xl font-black text-white tabular-nums">
                  {formatPrice(balance?.balance || 0)}
                </h1>
                <span className="text-sm font-black text-[var(--griffin-gold)]">
                  تومان
                </span>
              </div>

              <p className="mt-2 text-[11px] text-gray-500">
                موجودی قابل استفاده در تمام بخش‌های آکادمی
              </p>
            </div>

            <div className="shrink-0 self-center lg:self-auto flex flex-col sm:flex-row lg:flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setChargeOpen(true)}
                className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 font-heading font-black text-white text-sm shadow-2xl shadow-[var(--griffin-gold)]/50 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/80 hover:-translate-y-1 transition-all overflow-hidden whitespace-nowrap"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Plus size={16} strokeWidth={2.5} />
                  شارژ کیف پول
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>

              <button
                type="button"
                onClick={() => setWithdrawOpen(true)}
                disabled={(balance?.balance || 0) < 500000}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-3.5 font-black text-gray-200 text-sm hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
              >
                <ArrowUpRight size={16} />
                درخواست برداشت
              </button>
            </div>
          </div>
        </section>

        {/* ==================== ۳ کارت آمار ==================== */}
        <section className="grid grid-cols-3 gap-3">
          {[
            {
              icon: TrendingUp,
              label: "کل شارژ",
              value: stats.totalCharge,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
            {
              icon: TrendingDown,
              label: "کل خرج",
              value: stats.totalSpent,
              color: "text-rose-500",
              bg: "bg-rose-500/10",
            },
            {
              icon: Sparkles,
              label: "کل جوایز",
              value: stats.totalRewards,
              color: "text-[var(--griffin-gold)]",
              bg: "bg-[var(--griffin-gold)]/10",
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
                    className={`font-heading text-base font-black tabular-nums ${stat.color}`}
                  >
                    {formatPrice(stat.value)}
                  </p>
                  <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                    تومان
                  </span>
                </div>
              </div>
            );
          })}
        </section>

        {/* ==================== Tabs ==================== */}
        <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-200/70 dark:border-white/5">
            <div className="flex items-center gap-2">
              {[
                {
                  key: "transactions" as TabType,
                  label: "تراکنش‌ها",
                  icon: History,
                  count: pagination.total,
                },
                {
                  key: "withdrawals" as TabType,
                  label: "درخواست‌های برداشت",
                  icon: ArrowUpRight,
                  count: withdrawRequests.length,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      inline-flex items-center gap-2 rounded-xl px-3.5 py-2
                      text-[11px] font-black transition-all
                      ${
                        isActive
                          ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                          : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                      }
                    `}
                  >
                    <Icon size={13} />
                    {tab.label}
                    <span
                      className={`
                        inline-flex items-center justify-center min-w-[18px] h-[16px] px-1.5 rounded-md
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
          </div>

          {/* ==================== محتوای تب ==================== */}
          {activeTab === "transactions" ? (
            <>
              {/* فیلتر */}
              <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200/70 dark:border-white/5">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">
                  <Filter size={11} />
                  فیلتر:
                </div>

                {[
                  { key: "all" as const, label: "همه" },
                  { key: "CHARGE" as const, label: "شارژ" },
                  { key: "REWARD" as const, label: "جایزه" },
                  { key: "PURCHASE" as const, label: "خرید" },
                  { key: "WITHDRAW" as const, label: "برداشت" },
                ].map((f) => {
                  const isActive = filter === f.key;
                  const count =
                    f.key === "all"
                      ? transactions.length
                      : transactions.filter((t) => t.type === f.key).length;

                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilter(f.key)}
                      className={`
                        inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5
                        text-[10px] font-black transition-all
                        ${
                          isActive
                            ? "bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)] border border-[var(--griffin-gold)]/30"
                            : "border border-gray-200 dark:border-white/5 bg-white/60 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/30 hover:text-[var(--griffin-gold)]"
                        }
                      `}
                    >
                      {f.label}
                      {count > 0 && (
                        <span className="text-[9px] opacity-70 tabular-nums">
                          ({count.toLocaleString("fa-IR")})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* لیست تراکنش‌ها */}
              <div className="p-4 space-y-2">
                {txLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoaderCircle
                      size={24}
                      className="text-[var(--griffin-gold)] animate-spin"
                    />
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                      <Receipt
                        size={28}
                        className="text-gray-400 dark:text-gray-600"
                      />
                    </div>
                    <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
                      تراکنشی پیدا نشد
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {filter === "all"
                        ? "اولین تراکنشت رو با شارژ کیف پول شروع کن"
                        : "فیلتر رو تغییر بده"}
                    </p>
                  </div>
                ) : (
                  filteredTransactions.map((tx) => {
                    const typeStyle =
                      typeStyles[tx.type] ?? typeStyles.PURCHASE;
                    const statusStyle =
                      statusStyles[tx.status] ?? statusStyles.PENDING;
                    const TypeIcon = typeStyle.icon;
                    const StatusIcon = statusStyle.icon;
                    const isIncoming = tx.direction === "IN";

                    return (
                      <div
                        key={tx.id}
                        className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-3.5 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <div
                          className={`
                            w-10 h-10 rounded-xl shrink-0
                            flex items-center justify-center
                            ${typeStyle.bg} ${typeStyle.text}
                          `}
                        >
                          <TypeIcon size={18} strokeWidth={2.4} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-heading text-xs font-black text-gray-900 dark:text-white truncate">
                              {typeLabels[tx.type] ?? tx.type}
                            </p>
                            <span
                              className={`
                                inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md
                                text-[9px] font-black
                                ${statusStyle.bg} ${statusStyle.text}
                              `}
                            >
                              <StatusIcon size={8} />
                              {statusStyle.label}
                            </span>
                          </div>
                          {tx.description && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {tx.description}
                            </p>
                          )}
                          <p className="text-[9px] text-gray-500 dark:text-gray-600 mt-0.5">
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>

                        <div className="shrink-0 text-left">
                          <p
                            className={`
                              font-heading text-sm font-black tabular-nums
                              ${
                                isIncoming
                                  ? "text-emerald-500"
                                  : "text-rose-500"
                              }
                            `}
                          >
                            {isIncoming ? "+" : "-"}
                            {formatPrice(tx.amount)}
                          </p>
                          <p className="text-[9px] text-gray-500 dark:text-gray-600">
                            تومان
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* صفحه‌بندی */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200/70 dark:border-white/5">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
                    {pagination.totalPages.toLocaleString("fa-IR")}
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={pagination.page <= 1 || txLoading}
                      onClick={() =>
                        void loadTransactions(pagination.page - 1)
                      }
                      className="px-3 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-all text-[10px] font-black"
                    >
                      قبلی
                    </button>
                    <button
                      type="button"
                      disabled={
                        pagination.page >= pagination.totalPages || txLoading
                      }
                      onClick={() =>
                        void loadTransactions(pagination.page + 1)
                      }
                      className="px-3 h-8 rounded-lg flex items-center justify-center bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30 disabled:opacity-30 transition-all text-[10px] font-black"
                    >
                      بعدی
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ==================== تب درخواست‌های برداشت ==================== */
            <div className="p-4 space-y-2">
              {withdrawRequests.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                    <ArrowUpRight
                      size={28}
                      className="text-gray-400 dark:text-gray-600"
                    />
                  </div>
                  <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
                    هنوز درخواست برداشتی نداری
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    برای برداشت، حداقل ۵۰,۰۰۰ تومان موجودی لازمه
                  </p>
                  {(balance?.balance || 0) >= 500000 && (
                    <button
                      type="button"
                      onClick={() => setWithdrawOpen(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl transition-all"
                    >
                      <ArrowUpRight size={14} />
                      درخواست برداشت جدید
                    </button>
                  )}
                </div>
              ) : (
                withdrawRequests.map((request) => {
                  const statusStyle =
                    withdrawStatusStyles[request.status] ??
                    withdrawStatusStyles.PENDING;

                  return (
                    <div
                      key={request.id}
                      className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-4 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div
                          className={`
                            w-10 h-10 rounded-xl shrink-0 self-start
                            flex items-center justify-center
                            ${statusStyle.bg} ${statusStyle.text}
                          `}
                        >
                          <ArrowUpRight size={18} strokeWidth={2.4} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black ${statusStyle.bg} ${statusStyle.text}`}
                            >
                              {statusStyle.label}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-500/10 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-[9px] font-black font-english">
                              {request.cardNumber.slice(0, 4)}****
                              {request.cardNumber.slice(-4)}
                            </span>
                          </div>

                          <p className="font-heading text-xs font-black text-gray-900 dark:text-white">
                            {request.cardHolderName}
                          </p>

                          {request.bankName && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {request.bankName}
                            </p>
                          )}

                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                            درخواست: {formatDate(request.createdAt)}
                          </p>

                          {request.reviewedAt && (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              بررسی: {formatDate(request.reviewedAt)}
                            </p>
                          )}

                          {request.trackingCode && (
                            <p className="text-[10px] text-emerald-500 font-black mt-1">
                              کد پیگیری: {request.trackingCode}
                            </p>
                          )}

                          {request.reviewNote && (
                            <div className="mt-2 rounded-lg bg-gray-500/5 dark:bg-white/5 p-2 border border-gray-200 dark:border-white/10">
                              <p className="text-[10px] text-gray-600 dark:text-gray-400">
                                یادداشت ادمین: {request.reviewNote}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 text-left">
                          <p className="font-heading text-base font-black text-[var(--griffin-gold)] tabular-nums">
                            {formatPrice(request.amount)}
                          </p>
                          <p className="text-[9px] text-gray-500 dark:text-gray-600">
                            تومان
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      </div>

      {/* ==================== Modals ==================== */}
      {chargeOpen && (
        <ChargeWalletModal
          onClose={() => setChargeOpen(false)}
          onSuccess={handleChargeSuccess}
        />
      )}

      {withdrawOpen && (
        <WithdrawModal
          currentBalance={balance?.balance || 0}
          onClose={() => setWithdrawOpen(false)}
          onSuccess={handleWithdrawSuccess}
        />
      )}
    </>
  );
};

export default WalletPanel;