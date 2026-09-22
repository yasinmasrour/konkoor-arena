import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, LoaderCircle, Crown } from "lucide-react";
import { verifySubscriptionPayment } from "../api/subscriptionApi";
import { verifyWalletCharge } from "../api/walletApi";
import { useAuth } from "../context/AuthContext";

const PaymentVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshFeatures } = useAuth();

  const paymentId = searchParams.get("paymentId");
  const type = searchParams.get("type") || "subscription";

  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!paymentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("failed");
      setError("شناسه پرداخت یافت نشد");
      return;
    }

    const verify = async () => {
      try {
        if (type === "subscription") {
          await verifySubscriptionPayment(paymentId, true);
        } else if (type === "wallet") {
          await verifyWalletCharge(paymentId, true);
        }

        await refreshFeatures();
        setStatus("success");

        setTimeout(() => {
          navigate(
            type === "subscription"
              ? "/subscriptions"
              : "/dashboard?section=wallet",
          );
        }, 2500);
      } catch (err) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "تأیید پرداخت با مشکل مواجه شد";
        setError(message);
        setStatus("failed");
      }
    };

    void verify();
  }, [paymentId, type, navigate, refreshFeatures]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="relative rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-xl p-8 text-center">
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-3xl pointer-events-none" />

          <div className="relative space-y-5">
            {status === "loading" && (
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
                  در حال تأیید پرداخت...
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  لطفاً چند لحظه صبر کنید
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-50 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white">
                    <CheckCircle2 size={36} />
                  </div>
                </div>
                <h1 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                  پرداخت موفق!
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {type === "subscription"
                    ? "اشتراک شما فعال شد"
                    : "کیف پول شما شارژ شد"}
                </p>
                <p className="text-xs text-gray-400">در حال انتقال...</p>
              </>
            )}

            {status === "failed" && (
              <>
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-50" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white">
                    <XCircle size={36} />
                  </div>
                </div>
                <h1 className="font-heading text-xl font-black text-gray-900 dark:text-white">
                  پرداخت ناموفق
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {error}
                </p>

                <button
                  onClick={() => navigate("/subscriptions")}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg"
                >
                  <Crown size={16} />
                  بازگشت به اشتراک‌ها
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