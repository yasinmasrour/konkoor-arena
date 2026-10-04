import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { createWalletCharge, toRial } from "../../api/walletApi";

interface ChargeWalletModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_AMOUNTS = [
  { amount: 50000, label: "۵۰ هزار" },
  { amount: 100000, label: "۱۰۰ هزار", popular: true },
  { amount: 200000, label: "۲۰۰ هزار" },
  { amount: 500000, label: "۵۰۰ هزار" },
];

const MIN_AMOUNT = 10000;
const MAX_AMOUNT = 5000000;

const ChargeWalletModal = ({ onClose, onSuccess }: ChargeWalletModalProps) => {
  const [amount, setAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const finalAmount = useCustom ? Number(customAmount) || 0 : amount;

  const handleSubmit = async () => {
    setError("");

    if (finalAmount < MIN_AMOUNT) {
      setError(
        `حداقل مبلغ شارژ ${MIN_AMOUNT.toLocaleString("fa-IR")} تومان است`,
      );
      return;
    }
    if (finalAmount > MAX_AMOUNT) {
      setError(
        `حداکثر مبلغ شارژ ${MAX_AMOUNT.toLocaleString("fa-IR")} تومان است`,
      );
      return;
    }

    setLoading(true);
    try {
      // 🆕 درخواست به بک‌اند، دریافت paymentUrl
      const result = await createWalletCharge(toRial(finalAmount));

      if (result.paymentUrl) {
        // 🆕 ریدایرکت به زرین‌پال
        window.location.href = result.paymentUrl;
        return;
      }

      // اگه paymentUrl نبود (نباید اتفاق بیفته)، موفق درنظر بگیر
      onSuccess();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "شارژ کیف پول انجام نشد";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[92vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0d14] shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* خط طلایی بالا */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

        {/* هاله */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />

        {/* ==================== هدر ==================== */}
        <div className="relative flex items-start justify-between gap-3 p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <Wallet size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Charge Wallet
              </p>
              <h2 className="font-heading text-lg font-black text-white">
                شارژ کیف پول
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 text-gray-400 hover:bg-white/10 hover:text-rose-400 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* ==================== محتوا ==================== */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* مبالغ پیشنهادی */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
              <Sparkles size={10} />
              مبلغ را انتخاب کن
            </label>

            <div className="grid grid-cols-2 gap-2">
              {PRESET_AMOUNTS.map((preset) => {
                const isSelected = !useCustom && amount === preset.amount;
                return (
                  <button
                    key={preset.amount}
                    type="button"
                    onClick={() => {
                      setAmount(preset.amount);
                      setUseCustom(false);
                      setError("");
                    }}
                    className={`
                      relative rounded-2xl border-2 p-3.5 text-center transition-all
                      ${
                        isSelected
                          ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)]/10 shadow-lg shadow-[var(--griffin-gold)]/20"
                          : "border-white/10 bg-white/[0.02] hover:border-[var(--griffin-gold)]/40"
                      }
                    `}
                  >
                    {preset.popular && (
                      <span className="absolute -top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600 text-white text-[8px] font-black shadow-lg">
                        <Zap size={7} fill="white" />
                        پیشنهادی
                      </span>
                    )}

                    <p
                      className={`
                        font-heading text-lg font-black
                        ${isSelected ? "text-[var(--griffin-gold)]" : "text-white"}
                      `}
                    >
                      {preset.label}
                    </p>
                    <p className="text-[9px] text-gray-500 mt-0.5">تومان</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* مبلغ دلخواه */}
          <div>
            <button
              type="button"
              onClick={() => setUseCustom(true)}
              className={`
                w-full rounded-xl border-2 p-3 text-[11px] font-black transition-all mb-2
                ${
                  useCustom
                    ? "border-[var(--griffin-gold)] bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]"
                    : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-[var(--griffin-gold)]/40"
                }
              `}
            >
              مبلغ دلخواه
            </button>

            {useCustom && (
              <div className="relative">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setError("");
                  }}
                  placeholder="مثلاً 150000"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 pl-16 text-sm text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all tabular-nums"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500">
                  تومان
                </span>
              </div>
            )}

            <p className="mt-2 text-[10px] text-gray-500">
              حداقل {MIN_AMOUNT.toLocaleString("fa-IR")} و حداکثر{" "}
              {MAX_AMOUNT.toLocaleString("fa-IR")} تومان
            </p>
          </div>

          {/* نمایش مبلغ نهایی */}
          <div className="rounded-2xl border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 to-transparent p-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                مبلغ نهایی
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-2xl font-black text-[var(--griffin-gold)] tabular-nums">
                  {finalAmount.toLocaleString("fa-IR")}
                </span>
                <span className="text-[10px] font-bold text-gray-500">
                  تومان
                </span>
              </div>
            </div>
          </div>

          {/* اطلاعات زرین‌پال */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 flex items-start gap-2.5">
            <ShieldCheck size={14} className="text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-5">
              پرداخت از طریق درگاه امن <strong>زرین‌پال</strong> انجام می‌شود.
            </p>
          </div>

          {/* خطا */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5">
              <AlertCircle
                size={15}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <p className="text-[11px] font-bold text-rose-400 leading-5">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* ==================== فوتر ==================== */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={loading || finalAmount < MIN_AMOUNT}
            className="
              group relative w-full
              inline-flex items-center justify-center gap-2
              rounded-xl
              bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
              px-6 py-3.5
              font-heading font-black text-white
              shadow-lg shadow-[var(--griffin-gold)]/40
              hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60
              hover:-translate-y-0.5
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-300
              overflow-hidden
            "
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  در حال انتقال به درگاه...
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  پرداخت و شارژ کیف پول
                </>
              )}
            </span>
            {!loading && (
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChargeWalletModal;