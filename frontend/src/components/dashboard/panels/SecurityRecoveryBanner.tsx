import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Shield,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRecoveryStatus } from "../../../services/authService";

// ============================================================
// CONSTANTS
// ============================================================

const DISMISS_KEY = "griffin-recovery-banner-dismissed-at";
const RE_SHOW_AFTER_MS = 7 * 24 * 60 * 60 * 1000; // ۷ روز

// ============================================================
// COMPONENT
// ============================================================

const SecurityRecoveryBanner = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSetup, setIsSetup] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // ============================================================
  // LOAD
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // چک dismiss
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const elapsed = Date.now() - Number(dismissedAt);
        if (elapsed < RE_SHOW_AFTER_MS) {
          if (mounted) {
            setDismissed(true);
            setLoading(false);
          }
          return;
        }
      }

      try {
        const status = await getRecoveryStatus();
        if (!mounted) return;
        setIsSetup(status.isSetup);

        // اگه تنظیم شده، dismiss رو پاک کن
        if (status.isSetup) {
          localStorage.removeItem(DISMISS_KEY);
        }
      } catch (err) {
        console.error("Failed to load recovery status:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  const handleGoToProfile = () => {
    // اگه روی داشبورد هستی، به بخش پروفایل برو
    navigate("/dashboard?section=profile");
  };

  // ============================================================
  // RENDER CONDITIONS
  // ============================================================

  if (loading) return null;
  if (isSetup) return null; // تنظیم شده، banner لازم نیست
  if (dismissed) return null;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-gradient-to-l from-amber-500/10 via-amber-500/5 to-transparent backdrop-blur-sm animate-[fadeInUp_0.4s_ease-out]">
      {/* خط طلایی بالا */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

      {/* هاله */}
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      <div className="relative p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* آیکون */}
          <div className="relative shrink-0 self-start sm:self-center">
            <div className="absolute inset-0 bg-amber-500 blur-xl opacity-40" />
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg rotate-3">
              <Shield size={20} strokeWidth={2.3} />
            </div>
          </div>

          {/* متن */}
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 mb-1.5">
              <Sparkles size={11} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                امنیت حساب
              </span>
            </div>
            <h3 className="font-heading text-sm sm:text-base font-black text-gray-900 dark:text-white">
              بازیابی رمز عبور رو تنظیم کن
            </h3>
            <p className="mt-1 text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 leading-6">
              با تنظیم سوال امنیتی و دریافت کد بازیابی، اگه رمزت رو فراموش کردی
              بدون نیاز به پشتیبانی می‌تونی رمز جدید بذاری.
            </p>
          </div>

          {/* دکمه‌ها */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={handleGoToProfile}
              className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <ShieldCheck size={13} />
                تنظیم کن
                <ArrowLeft
                  size={11}
                  className="rotate-180 transition-transform group-hover:-translate-x-0.5"
                />
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="بستن"
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityRecoveryBanner;
