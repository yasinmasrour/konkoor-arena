/* eslint-disable react-hooks/static-components */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  LoaderCircle,
  Crown,
  Wallet,
  FileQuestion,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

type VerifyStatus = "loading" | "success" | "failed" | "cancelled";

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshFeatures } = useAuth();

  const paymentId = searchParams.get("paymentId");
  const status = searchParams.get("status") as VerifyStatus | null;
  const gateway = searchParams.get("gateway");
  const message = searchParams.get("message");
  const type = searchParams.get("type") || "subscription";

  const [uiStatus, setUiStatus] = useState<VerifyStatus>("loading");

  useEffect(() => {
    if (!status) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUiStatus("failed");
      return;
    }

    setUiStatus(status);

    if (status === "success") {
      void refreshFeatures();
    }

    if (status === "success" || status === "failed" || status === "cancelled") {
      const timer = window.setTimeout(() => {
        navigate(
          type === "wallet"
            ? "/dashboard?section=wallet"
            : type === "exam"
              ? "/tests"
              : "/subscriptions",
        );
      }, 3500);

      return () => window.clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type]);

  const getTargetPath = () => {
    if (type === "wallet") return "/dashboard?section=wallet";
    if (type === "exam") return "/tests";
    return "/subscriptions";
  };

  const getTargetIcon = () => {
    if (type === "wallet") return Wallet;
    if (type === "exam") return FileQuestion;
    return Crown;
  };

  const TargetIcon = getTargetIcon();

  const getTitle = () => {
    if (uiStatus === "success") return "پرداخت موفق!";
    if (uiStatus === "cancelled") return "پرداخت لغو شد";
    if (uiStatus === "failed") return "پرداخت ناموفق";
    return "در حال تأیید پرداخت...";
  };

  const getMessage = () => {
    if (uiStatus === "success") {
      if (type === "subscription") return "اشتراک شما فعال شد";
      if (type === "wallet") return "کیف پول شما شارژ شد";
      if (type === "exam") return "آزمون با موفقیت خریداری شد";
      return "پرداخت با موفقیت انجام شد";
    }

    if (message) return message;

    if (uiStatus === "cancelled") return "پرداخت توسط شما لغو شد";
    if (uiStatus === "failed") return "متأسفانه پرداخت انجام نشد";
    return "لطفاً چند لحظه صبر کنید";
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-8 text-center">
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-3xl pointer-events-none" />

          <div className="relative space-y-5">
            {/* ===== LOADING ===== */}
            {uiStatus === "loading" && (
              <>
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
                    <LoaderCircle
                      size={32}
                      className="text-white animate-spin"
                    />
                  </div>
                </div>
                <h1 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                  {getTitle()}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getMessage()}
                </p>
              </>
            )}

            {/* ===== SUCCESS ===== */}
            {uiStatus === "success" && (
              <>
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-50 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white">
                    <CheckCircle2 size={36} />
                  </div>
                </div>
                <h1 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                  {getTitle()}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getMessage()}
                </p>

                {paymentId && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                      شماره پیگیری
                    </p>
                    <p
                      className="font-english text-xs font-black text-emerald-600 dark:text-emerald-400"
                      dir="ltr"
                    >
                      {paymentId.slice(0, 12).toUpperCase()}
                    </p>
                  </div>
                )}

                {gateway === "zarinpal" && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-600 dark:text-blue-400">
                    <CheckCircle2 size={11} />
                    پرداخت از درگاه زرین‌پال
                  </div>
                )}

                <p className="text-xs text-gray-400">
                  در حال انتقال به صفحه‌ی مربوطه...
                </p>
              </>
            )}

            {/* ===== CANCELLED ===== */}
            {uiStatus === "cancelled" && (
              <>
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-50" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white">
                    <AlertCircle size={36} />
                  </div>
                </div>
                <h1 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                  {getTitle()}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getMessage()}
                </p>

                <button
                  onClick={() => navigate(getTargetPath())}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg"
                >
                  <TargetIcon size={16} />
                  بازگشت
                </button>
              </>
            )}

            {/* ===== FAILED ===== */}
            {uiStatus === "failed" && (
              <>
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-50" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white">
                    <XCircle size={36} />
                  </div>
                </div>
                <h1 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                  {getTitle()}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getMessage()}
                </p>

                <button
                  onClick={() => navigate(getTargetPath())}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg"
                >
                  <TargetIcon size={16} />
                  تلاش مجدد
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentVerify;
