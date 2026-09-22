import { RefreshCw, ShieldCheck } from "lucide-react";

interface CaptchaBoxProps {
  question: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  error?: string;
  loading?: boolean;
}

const CaptchaBox = ({
  question,
  value,
  onChange,
  onRefresh,
  error,
  loading = false,
}: CaptchaBoxProps) => (
  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-sm p-3">
    {/* هاله تزئینی */}
    <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />

    {/* هدر */}
    <div className="relative flex items-center justify-between gap-3 mb-2">
      <div className="inline-flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-md bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
          <ShieldCheck size={11} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
          کپچا
        </span>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="group inline-flex items-center gap-1 text-[9px] font-black text-[var(--griffin-gold)] hover:underline disabled:opacity-50"
      >
        <RefreshCw
          size={10}
          className={`transition-transform ${
            loading ? "animate-spin" : "group-hover:rotate-180 duration-500"
          }`}
        />
        کپچای جدید
      </button>
    </div>

    {/* سؤال + پاسخ — کنار هم */}
    <div className="relative grid grid-cols-[1fr_130px] gap-2 items-stretch">
      {/* سؤال کپچا */}
      <div
        dir="ltr"
        className="
          relative
          rounded-lg
          bg-gradient-to-br from-[var(--griffin-gold)]/10 to-purple-600/5
          border border-[var(--griffin-gold)]/20
          px-3 py-2.5
          flex items-center justify-center
          font-heading font-black text-base tracking-[0.2em] text-white
          select-none
          overflow-hidden
        "
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)",
        }}
      >
        {question || "..."}
      </div>

      {/* ورودی پاسخ */}
      <div className="relative">
        <input
          type="text"
          name="captchaAnswer"
          inputMode="numeric"
          placeholder="پاسخ"
          value={value}
          onChange={onChange}
          className={`
            w-full h-full
            rounded-lg border
            px-3 py-2.5
            bg-white/[0.03]
            backdrop-blur-sm
            text-center text-sm font-black text-white
            placeholder:text-gray-600 placeholder:text-xs placeholder:font-bold
            outline-none
            transition-all duration-300
            ${
              error
                ? "border-rose-500/50 focus:border-rose-500"
                : "border-white/10 focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20"
            }
          `}
        />
      </div>
    </div>

    {/* خطا */}
    {error && (
      <p className="relative mt-2 text-[10px] font-bold text-rose-500 text-center">
        {error}
      </p>
    )}
  </div>
);

export default CaptchaBox;
