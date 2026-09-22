import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Landmark,
  LoaderCircle,
  User,
  Wallet,
  X,
} from "lucide-react";
import {
  createWithdrawRequest,
  toRial,
} from "../../api/walletApi";

interface WithdrawModalProps {
  currentBalance: number; // به ریال
  onClose: () => void;
  onSuccess: () => void;
}

const MIN_WITHDRAW = 50000; // تومان
const MAX_WITHDRAW = 5000000; // تومان

// 🔹 اطلاعات ذخیره‌شده در localStorage
const SAVED_CARD_KEY = "griffin_saved_card";

interface SavedCard {
  cardNumber: string;
  cardHolderName: string;
  bankName: string;
}

const WithdrawModal = ({
  currentBalance,
  onClose,
  onSuccess,
}: WithdrawModalProps) => {
  const [amount, setAmount] = useState<string>("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 🔹 بارگذاری کارت ذخیره‌شده
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVED_CARD_KEY);
      if (saved) {
        const data: SavedCard = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCardNumber(data.cardNumber);
        setCardHolderName(data.cardHolderName);
        setBankName(data.bankName);
      }
    } catch (err) {
      console.error("Failed to load saved card:", err);
    }
  }, []);

  const amountNumber = Number(amount.replace(/\D/g, "")) || 0;
  const balanceInToman = Math.floor(currentBalance / 10);

  const handleSubmit = async () => {
    setError("");

    if (amountNumber < MIN_WITHDRAW) {
      setError(
        `حداقل مبلغ برداشت ${MIN_WITHDRAW.toLocaleString("fa-IR")} تومان است`,
      );
      return;
    }
    if (amountNumber > MAX_WITHDRAW) {
      setError(
        `حداکثر مبلغ برداشت ${MAX_WITHDRAW.toLocaleString("fa-IR")} تومان است`,
      );
      return;
    }
    if (amountNumber > balanceInToman) {
      setError(
        `موجودی کافی نیست. موجودی فعلی: ${balanceInToman.toLocaleString("fa-IR")} تومان`,
      );
      return;
    }

    const cleanCard = cardNumber.replace(/\s/g, "");
    if (!/^\d{16}$/.test(cleanCard)) {
      setError("شماره کارت باید ۱۶ رقم باشد");
      return;
    }
    if (cardHolderName.trim().length < 3) {
      setError("نام صاحب کارت را وارد کن");
      return;
    }

    setLoading(true);
    try {
      await createWithdrawRequest({
        amount: toRial(amountNumber),
        cardNumber: cleanCard,
        cardHolderName: cardHolderName.trim(),
        bankName: bankName.trim() || undefined,
      });

      // 🔹 ذخیره کارت
      if (saveCard) {
        localStorage.setItem(
          SAVED_CARD_KEY,
          JSON.stringify({
            cardNumber: cleanCard,
            cardHolderName: cardHolderName.trim(),
            bankName: bankName.trim(),
          }),
        );
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "ثبت درخواست برداشت انجام نشد";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 فرمت شماره کارت
  const handleCardNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  // ==================== حالت موفقیت ====================
  if (success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-sm rounded-3xl border border-emerald-500/30 bg-[#0a0d14] p-8 text-center shadow-2xl animate-[fadeInUp_0.3s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-t-3xl" />

          <div className="relative inline-flex mb-4">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-2xl">
              <CheckCircle2 size={32} strokeWidth={2.3} />
            </div>
          </div>

          <h3 className="font-heading text-xl font-black text-white">
            درخواست ثبت شد!
          </h3>
          <p className="mt-2 text-sm text-gray-400 leading-6">
            درخواست برداشت {amountNumber.toLocaleString("fa-IR")} تومان ثبت شد.
            <br />
            بعد از تایید ادمین، مبلغ به کارتت واریز می‌شه.
          </p>
        </div>
      </div>
    );
  }

  // ==================== فرم ====================
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[92vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0d14] shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />

        {/* ==================== هدر ==================== */}
        <div className="relative flex items-start justify-between gap-3 p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                <ArrowUpRight size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Withdraw
              </p>
              <h2 className="font-heading text-lg font-black text-white">
                درخواست برداشت
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
          {/* موجودی فعلی */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-[var(--griffin-gold)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  موجودی فعلی
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-lg font-black text-white tabular-nums">
                  {balanceInToman.toLocaleString("fa-IR")}
                </span>
                <span className="text-[10px] font-bold text-gray-500">
                  تومان
                </span>
              </div>
            </div>
          </div>

          {/* مبلغ برداشت */}
          <div>
            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
              <ArrowUpRight size={10} />
              مبلغ برداشت
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setAmount(
                    digits ? Number(digits).toLocaleString("en-US") : "",
                  );
                  setError("");
                }}
                placeholder="مثلاً 50,000"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 pl-16 text-lg font-heading font-black text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all tabular-nums"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500">
                تومان
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
              <span>
                حداقل {MIN_WITHDRAW.toLocaleString("fa-IR")} / حداکثر{" "}
                {MAX_WITHDRAW.toLocaleString("fa-IR")}
              </span>
              {balanceInToman > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAmount(
                      Math.min(MAX_WITHDRAW, balanceInToman).toLocaleString(
                        "en-US",
                      ),
                    );
                    setError("");
                  }}
                  className="text-[var(--griffin-gold)] font-black hover:underline"
                >
                  برداشت همه
                </button>
              )}
            </div>
          </div>

          {/* اطلاعات کارت */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 pt-2">
              اطلاعات کارت بانکی
            </p>

            {/* شماره کارت */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                <CreditCard size={10} />
                شماره کارت
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                placeholder="0000 0000 0000 0000"
                dir="ltr"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center font-english text-base font-black text-white tracking-widest outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all tabular-nums"
              />
            </div>

            {/* نام صاحب کارت */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                <User size={10} />
                نام صاحب کارت
              </label>
              <input
                type="text"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                placeholder="نام و نام خانوادگی"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
              />
            </div>

            {/* نام بانک (اختیاری) */}
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                <Landmark size={10} />
                نام بانک (اختیاری)
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="مثلاً بانک ملی"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20 transition-all"
              />
            </div>

            {/* ذخیره کارت */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-white/20 bg-white/5 accent-[var(--griffin-gold)] cursor-pointer"
              />
              <span className="text-[10px] text-gray-400 group-hover:text-gray-300 transition-colors">
                اطلاعات کارت رو برای دفعه بعد ذخیره کن
              </span>
            </label>
          </div>

          {/* هشدار */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2.5">
            <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-300/80 leading-5">
              درخواست برداشت بعد از تایید ادمین، در ۲۴ ساعت آینده واریز می‌شه.
              مبلغ فوری از کیف پول کم می‌شه.
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
            disabled={loading || amountNumber < MIN_WITHDRAW}
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
                  در حال ثبت...
                </>
              ) : (
                <>
                  <ArrowUpRight size={16} />
                  ثبت درخواست برداشت
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

export default WithdrawModal;
