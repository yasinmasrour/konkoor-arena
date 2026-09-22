import { useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Ban,
  Banknote,
  CheckCircle2,
  Copy,
  CreditCard,
  Landmark,
  LoaderCircle,
  User,
  X,
} from "lucide-react";
import {
  approveWithdrawRequest,
  rejectWithdrawRequest,
  completeWithdrawRequest,
  formatPrice,
  type WithdrawRequest,
} from "../../api/walletApi";

interface WithdrawReviewModalProps {
  request: WithdrawRequest;
  onClose: () => void;
  onSuccess: () => void;
}

const WithdrawReviewModal = ({
  request,
  onClose,
  onSuccess,
}: WithdrawReviewModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleApprove = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await approveWithdrawRequest(request.id, note);
      onSuccess();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "تایید درخواست انجام نشد";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (loading) return;
    if (!window.confirm("این درخواست رد بشه و مبلغ به کیف پول برگرده؟")) return;
    setLoading(true);
    setError("");
    try {
      await rejectWithdrawRequest(request.id, note);
      onSuccess();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "رد درخواست انجام نشد";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (loading) return;
    if (!trackingCode.trim()) {
      setError("کد پیگیری واریز را وارد کن");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await completeWithdrawRequest(request.id, trackingCode.trim());
      onSuccess();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "تکمیل درخواست انجام نشد";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(request.cardNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const isPending = request.status === "PENDING";
  const isApproved = request.status === "APPROVED";
  const isCompleted = request.status === "COMPLETED";
  const isRejected = request.status === "REJECTED";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-2xl shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* خط طلایی بالا */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

        {/* هاله */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />

        {/* ==================== هدر ==================== */}
        <div className="relative flex items-start justify-between gap-3 p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <ArrowUpRight size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Withdraw Request
              </p>
              <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                بررسی درخواست برداشت
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-rose-500/15 hover:text-rose-500 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* ==================== محتوا ==================== */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* مبلغ */}
          <div className="rounded-2xl border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 to-transparent p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                مبلغ درخواستی
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-2xl font-black text-[var(--griffin-gold)] tabular-nums">
                  {formatPrice(request.amount)}
                </span>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  تومان
                </span>
              </div>
            </div>
          </div>

          {/* اطلاعات کارت */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              اطلاعات کارت مقصد
            </p>

            {/* شماره کارت */}
            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard
                    size={14}
                    className="text-[var(--griffin-gold)]"
                  />
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">
                    شماره کارت
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyCard()}
                  className="inline-flex items-center gap-1 text-[10px] font-black text-[var(--griffin-gold)] hover:underline"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={10} />
                      کپی شد
                    </>
                  ) : (
                    <>
                      <Copy size={10} />
                      کپی
                    </>
                  )}
                </button>
              </div>
              <p
                dir="ltr"
                className="mt-2 font-english text-center text-base font-black text-gray-900 dark:text-white tracking-widest tabular-nums"
              >
                {request.cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ")}
              </p>
            </div>

            {/* صاحب کارت */}
            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <User size={14} className="text-[var(--griffin-gold)]" />
                <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">
                  نام صاحب کارت
                </span>
              </div>
              <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                {request.cardHolderName}
              </p>
            </div>

            {/* نام بانک */}
            {request.bankName && (
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark size={14} className="text-[var(--griffin-gold)]" />
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">
                    نام بانک
                  </span>
                </div>
                <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                  {request.bankName}
                </p>
              </div>
            )}
          </div>

          {/* ==================== PENDING ==================== */}
          {isPending && (
            <>
              <div className="pt-2 border-t border-gray-200/70 dark:border-white/5">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  یادداشت (اختیاری)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="توضیح برای کاربر..."
                  rows={3}
                  disabled={loading}
                  className="w-full resize-none rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-xs text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5">
                  <AlertCircle
                    size={15}
                    className="text-rose-500 shrink-0 mt-0.5"
                  />
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-5">
                    {error}
                  </p>
                </div>
              )}
            </>
          )}

          {/* ==================== APPROVED ==================== */}
          {isApproved && (
            <>
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 flex items-start gap-2.5">
                <CheckCircle2
                  size={15}
                  className="text-blue-500 shrink-0 mt-0.5"
                />
                <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 leading-5">
                  این درخواست تایید شده. بعد از واریز به کارت کاربر، کد پیگیری
                  رو وارد کن.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-200/70 dark:border-white/5">
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  کد پیگیری واریز *
                </label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="مثلاً 123456789"
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-3 text-center font-english text-base font-black text-gray-900 dark:text-white tracking-widest outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all tabular-nums disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5">
                  <AlertCircle
                    size={15}
                    className="text-rose-500 shrink-0 mt-0.5"
                  />
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 leading-5">
                    {error}
                  </p>
                </div>
              )}
            </>
          )}

          {/* ==================== COMPLETED ==================== */}
          {isCompleted && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2
                  size={15}
                  className="text-emerald-600 dark:text-emerald-400"
                />
                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  واریز انجام شده
                </p>
              </div>
              {request.trackingCode && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-gray-500/5 dark:bg-white/5 p-2.5">
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">
                    کد پیگیری:
                  </span>
                  <span className="font-english text-xs font-black text-gray-900 dark:text-white tabular-nums">
                    {request.trackingCode}
                  </span>
                </div>
              )}
              {request.paidAt && (
                <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                  تاریخ واریز:{" "}
                  {new Date(request.paidAt).toLocaleString("fa-IR")}
                </p>
              )}
            </div>
          )}

          {/* ==================== REJECTED ==================== */}
          {isRejected && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Ban size={15} className="text-rose-500" />
                <p className="text-xs font-black text-rose-600 dark:text-rose-400">
                  درخواست رد شده
                </p>
              </div>
              {request.reviewNote && (
                <p className="mt-2 text-[11px] text-rose-600/80 dark:text-rose-300/80 leading-5">
                  {request.reviewNote}
                </p>
              )}
              <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                مبلغ به کیف پول کاربر برگشت داده شد.
              </p>
            </div>
          )}
        </div>

        {/* ==================== فوتر ==================== */}
        {isPending && (
          <div className="p-4 border-t border-gray-200/70 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => void handleReject()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-5 py-3 text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <Ban size={14} />
              )}
              رد درخواست
            </button>

            <button
              type="button"
              onClick={() => void handleApprove()}
              disabled={loading}
              className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-5 py-3 text-xs font-black text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 disabled:opacity-50 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                تایید درخواست
              </span>
              {!loading && (
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
            </button>
          </div>
        )}

        {isApproved && (
          <div className="p-4 border-t border-gray-200/70 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
            <button
              type="button"
              onClick={() => void handleComplete()}
              disabled={loading || !trackingCode.trim()}
              className="group relative w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Banknote size={15} />
                )}
                تایید واریز و تکمیل
              </span>
              {!loading && (
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawReviewModal;
