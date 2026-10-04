import { useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  setupSecurity,
  getRecoveryStatus,
  type RecoveryStatus,
} from "../../../services/authService";
import { SECURITY_QUESTIONS_LIST } from "../../../constants/securityQuestions";

// ============================================================
// COMPONENT
// ============================================================

const SecurityRecoverySection = () => {
  const [status, setStatus] = useState<RecoveryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  // فرم تنظیم
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // کد بازیابی (فقط یک‌بار نمایش داده می‌شود)
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(true);

  // ============================================================
  // LOAD STATUS
  // ============================================================

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await getRecoveryStatus();
      setStatus(data);
    } catch (err) {
      console.error("Failed to load recovery status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStatus();
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleOpenSetup = () => {
    setQuestion("");
    setAnswer("");
    setError("");
    setShowSetup(true);
  };

  const handleSave = async () => {
    if (!question) {
      setError("لطفاً یک سوال امنیتی انتخاب کن.");
      return;
    }
    if (answer.trim().length < 2) {
      setError("جواب سوال باید حداقل ۲ کاراکتر باشد.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const result = await setupSecurity({
        question,
        answer: answer.trim(),
      });

      setRecoveryCode(result.recoveryCode);
      setShowSetup(false);
      setCopied(false);
      setShowCode(true);
      await loadStatus();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "تنظیم امنیت انجام نشد.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!recoveryCode) return;
    try {
      await navigator.clipboard.writeText(recoveryCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCloseCodeModal = () => {
    setRecoveryCode(null);
    setCopied(false);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5">
        <div className="flex items-center justify-center gap-2 py-6 text-xs font-bold text-gray-500 dark:text-gray-400">
          <LoaderCircle className="animate-spin" size={16} />
          در حال دریافت وضعیت امنیت...
        </div>
      </section>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />

        <div className="relative p-5">
          {/* هدر */}
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Shield size={15} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Recovery
                </p>
                <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5">
                  بازیابی رمز عبور
                </h2>
              </div>
            </div>

            {status?.isSetup && !showSetup && (
              <button
                type="button"
                onClick={handleOpenSetup}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2 text-xs font-black text-gray-600 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] transition-all"
              >
                <RefreshCw size={13} />
                تنظیم مجدد
              </button>
            )}
          </div>

          {/* وضعیت */}
          {status?.isSetup && !showSetup && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-3">
              <CheckCircle2
                size={16}
                className="text-emerald-500 shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  بازیابی رمز عبور تنظیم شده است
                </p>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                  سوال امنیتی:{" "}
                  <span className="font-black">
                    {status.questionText || "—"}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* توضیحات + دکمه تنظیم (وقتی تنظیم نشده) */}
          {!status?.isSetup && !showSetup && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-6">
                برای اینکه بتونی در صورت فراموشی رمز عبور، بدون نیاز به پشتیبانی
                رمزت رو بازیابی کنی، یک <strong>سوال امنیتی</strong> تنظیم کن.
                بهت یک <strong>کد بازیابی ۱۲ کاراکتری</strong> هم داده می‌شه که
                باید یه جای امن ذخیره‌ش کنی.
              </p>

              <button
                type="button"
                onClick={handleOpenSetup}
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <ShieldCheck size={14} />
                  تنظیم بازیابی رمز
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          )}

          {/* فرم تنظیم */}
          {showSetup && (
            <div className="space-y-4 pt-4 border-t border-gray-200/70 dark:border-white/5">
              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  سوال امنیتی
                </label>
                <select
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-[#0a0d14] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                >
                  <option value="">یک سوال انتخاب کن...</option>
                  {SECURITY_QUESTIONS_LIST.map((q) => (
                    <option key={q.key} value={q.key}>
                      {q.text}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  جواب سوال
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="جوابت رو بنویس..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-[var(--griffin-gold)] transition-all"
                />
                <p className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
                  جواب رو دقیقاً همون‌طور که یادت می‌مونه وارد کن. حروف
                  بزرگ/کوچک مهم نیست.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 flex items-center gap-2">
                  <AlertCircle size={14} className="text-rose-500 shrink-0" />
                  <p className="text-[11px] font-bold text-rose-500 dark:text-rose-400">
                    {error}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSetup(false);
                    setError("");
                  }}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] px-4 py-2.5 text-xs font-black text-gray-600 dark:text-gray-300 hover:border-rose-500/40 hover:text-rose-500 transition-all disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  {saving ? "در حال ذخیره..." : "ذخیره و دریافت کد"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================== */}
      {/* RECOVERY CODE MODAL — فقط یک‌بار نمایش داده می‌شود */}
      {/* ====================================================== */}
      {recoveryCode && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
          onClick={handleCloseCodeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl border border-[var(--griffin-gold)]/40 bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-2xl shadow-2xl p-6 animate-[fadeInUp_0.3s_ease-out]"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

            {/* هدر */}
            <div className="text-center mb-5">
              <div className="relative inline-flex mb-3">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
                  <KeyRound size={24} />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 mb-3">
                <AlertCircle size={11} className="text-amber-500" />
                <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">
                  فقط یک‌بار نمایش داده می‌شود
                </span>
              </div>

              <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white mb-2">
                کد بازیابی شما
              </h3>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-6">
                این کد رو در یه جای امن (مثل مدیر رمز عبور یا کاغذ) ذخیره کن.
                اگه رمزت رو فراموش کردی، با این کد می‌تونی رمز جدید بذاری.
              </p>
            </div>

            {/* کد */}
            <div className="relative mb-4">
              <div className="rounded-2xl border-2 border-dashed border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/5 p-5">
                <div className="flex items-center justify-between gap-3">
                  <code
                    className={`
                      font-mono text-lg font-black text-[var(--griffin-gold)] tracking-wider
                      transition-all duration-300
                      ${showCode ? "" : "blur-md select-none"}
                    `}
                    dir="ltr"
                  >
                    {recoveryCode}
                  </code>
                  <button
                    type="button"
                    onClick={() => setShowCode(!showCode)}
                    className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/10 transition-colors"
                    aria-label={showCode ? "پنهان کردن" : "نمایش"}
                  >
                    {showCode ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* کپی */}
              <button
                type="button"
                onClick={() => void handleCopy()}
                className={`
                  mt-3 w-full inline-flex items-center justify-center gap-2
                  rounded-xl px-5 py-3 text-xs font-black
                  transition-all duration-300
                  ${
                    copied
                      ? "bg-emerald-500 text-white"
                      : "bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/40 text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/20"
                  }
                `}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    کپی شد!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    کپی کردن کد
                  </>
                )}
              </button>
            </div>

            {/* هشدار */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 mb-4">
              <div className="flex items-start gap-2">
                <Sparkles
                  size={13}
                  className="text-amber-500 shrink-0 mt-0.5"
                />
                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 leading-5">
                  اگه این کد رو گم کنی، فقط از طریق سوال امنیتی می‌تونی رمزت رو
                  بازیابی کنی. پس حتماً ذخیره‌ش کن.
                </p>
              </div>
            </div>

            {/* دکمه بستن */}
            <button
              type="button"
              onClick={handleCloseCodeModal}
              className="w-full py-3 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white font-heading font-black text-sm shadow-lg shadow-[var(--griffin-gold)]/40 hover:-translate-y-0.5 transition-transform"
            >
              ذخیره کردم، ببند
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SecurityRecoverySection;
