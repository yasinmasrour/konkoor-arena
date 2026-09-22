import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock3,
  Filter,
  LoaderCircle,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getAllWithdrawRequests,
  formatPrice,
  type WithdrawRequest,
  type WithdrawStatus,
} from "../../api/walletApi";
import WithdrawRequestCard from "../../components/admin/WithdrawRequestCard";
import WithdrawReviewModal from "../../components/admin/WithdrawReviewModal";

type FilterTab = "ALL" | WithdrawStatus;

const WithdrawRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterTab>("PENDING");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<WithdrawRequest | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // ==================== Load ====================
  const load = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const result = await getAllWithdrawRequests({
        status: filter === "ALL" ? undefined : filter,
        page,
        limit: pagination.limit,
      });
      setRequests(result.requests);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load withdraw requests:", err);
      setError("دریافت درخواست‌های برداشت انجام نشد.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ==================== آمار ====================
  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "PENDING").length;
    const completed = requests.filter((r) => r.status === "COMPLETED").length;
    const totalAmount = requests
      .filter((r) => r.status === "COMPLETED")
      .reduce((sum, r) => sum + r.amount, 0);

    return { pending, completed, totalAmount };
  }, [requests]);

  // ==================== فیلتر ====================
  const filteredRequests = useMemo(() => {
    if (!search.trim()) return requests;
    const q = search.trim().toLowerCase();
    return requests.filter(
      (r) =>
        r.cardHolderName.toLowerCase().includes(q) ||
        r.cardNumber.includes(q) ||
        (r.bankName && r.bankName.toLowerCase().includes(q)),
    );
  }, [requests, search]);

  const tabs: { key: FilterTab; label: string; icon: typeof Clock3 }[] = [
    { key: "PENDING", label: "در انتظار", icon: Clock3 },
    { key: "APPROVED", label: "تایید شده", icon: CheckCircle2 },
    { key: "COMPLETED", label: "واریز شده", icon: Banknote },
    { key: "REJECTED", label: "رد شده", icon: XCircle },
    { key: "ALL", label: "همه", icon: Filter },
  ];

  const handleSuccess = () => {
    setSelectedRequest(null);
    void load(pagination.page);
  };

  return (
    <>
      <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-6xl space-y-5">
          {/* ==================== Back ==================== */}
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

          {/* ==================== HERO ==================== */}
          <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-amber-500/20 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/20 blur-[100px] pointer-events-none" />

            <div
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative shrink-0 self-center sm:self-auto">
                <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                  <Wallet size={32} strokeWidth={2.3} />
                </div>
                {stats.pending > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-6 min-w-[24px] px-1.5 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black shadow-lg border-2 border-[#080B12] animate-pulse">
                    {stats.pending.toLocaleString("fa-IR")}
                  </span>
                )}
              </div>

              <div className="flex-1 text-center sm:text-right">
                <div className="inline-flex items-center gap-2 mb-2">
                  <Sparkles
                    size={12}
                    className="text-[var(--griffin-gold)] animate-pulse"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    Admin Panel
                  </span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
                  درخواست‌های برداشت
                </h1>

                <p className="mt-1.5 text-sm text-gray-400">
                  {stats.pending > 0
                    ? `${stats.pending.toLocaleString("fa-IR")} درخواست در انتظار بررسی`
                    : "همه درخواست‌ها بررسی شده"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void load(pagination.page)}
                disabled={loading}
                className="shrink-0 self-center sm:self-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 backdrop-blur-sm px-4 py-2.5 font-black text-[var(--griffin-gold)] text-xs hover:bg-[var(--griffin-gold)]/10 disabled:opacity-40 transition-all"
              >
                <RefreshCw
                  size={13}
                  className={loading ? "animate-spin" : ""}
                />
                بروزرسانی
              </button>
            </div>
          </section>

          {/* ==================== ۳ کارت آمار ==================== */}
          <section className="grid grid-cols-3 gap-3">
            {[
              {
                icon: Clock3,
                label: "در انتظار",
                value: stats.pending,
                color: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-500/10",
              },
              {
                icon: TrendingUp,
                label: "واریز شده",
                value: stats.completed,
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                icon: Wallet,
                label: "کل واریز",
                value: formatPrice(stats.totalAmount),
                suffix: "تومان",
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
                      className={`font-heading text-lg font-black tabular-nums ${stat.color}`}
                    >
                      {typeof stat.value === "number"
                        ? stat.value.toLocaleString("fa-IR")
                        : stat.value}
                    </p>
                    {stat.suffix && (
                      <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          {/* ==================== Filters ==================== */}
          <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
            <div className="p-4 border-b border-gray-200/70 dark:border-white/5">
              <div className="flex flex-wrap gap-2 mb-3">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = filter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setFilter(tab.key)}
                      className={`
                        inline-flex items-center gap-1.5 rounded-xl px-3 py-2
                        text-[11px] font-black transition-all
                        ${
                          isActive
                            ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                            : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
                        }
                      `}
                    >
                      <Icon size={12} />
                      {tab.label}
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
                  placeholder="جستجو در نام صاحب کارت، شماره کارت یا بانک..."
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
                      <LoaderCircle
                        size={24}
                        className="text-white animate-spin"
                      />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    در حال دریافت درخواست‌ها...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center mb-3">
                  <AlertCircle size={24} className="text-rose-500" />
                </div>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                  <Wallet
                    size={28}
                    className="text-gray-400 dark:text-gray-600"
                  />
                </div>
                <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
                  {search.trim()
                    ? "درخواستی با این جستجو پیدا نشد"
                    : filter === "PENDING"
                      ? "درخواست در انتظاری نداری"
                      : "درخواستی در این وضعیت نیست"}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {filteredRequests.map((request) => (
                  <WithdrawRequestCard
                    key={request.id}
                    request={
                      request as WithdrawRequest & {
                        user?: {
                          id: string;
                          firstName: string;
                          lastName: string;
                          phoneNumber: string | null;
                        };
                      }
                    }
                    onView={setSelectedRequest}
                  />
                ))}
              </div>
            )}

            {/* ==================== Pagination ==================== */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-200/70 dark:border-white/5">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  صفحه {pagination.page.toLocaleString("fa-IR")} از{" "}
                  {pagination.totalPages.toLocaleString("fa-IR")}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pagination.page <= 1 || loading}
                    onClick={() => void load(pagination.page - 1)}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-all text-[10px] font-black"
                  >
                    قبلی
                  </button>
                  <button
                    type="button"
                    disabled={
                      pagination.page >= pagination.totalPages || loading
                    }
                    onClick={() => void load(pagination.page + 1)}
                    className="px-3 py-2 rounded-lg bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30 disabled:opacity-30 transition-all text-[10px] font-black"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ==================== Modal ==================== */}
      {selectedRequest && (
        <WithdrawReviewModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default WithdrawRequests;