import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  HelpCircle,
  KeyRound,
  LoaderCircle,
  Lock,
  ShieldCheck,
} from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";
import {
  forgotPasswordLookup,
  resetPasswordWithQuestion,
  resetPasswordWithRecoveryCode,
} from "../services/authService";

// ============================================================
// TYPES
// ============================================================

type Step = "lookup" | "recovery";

// ============================================================
// COMPONENT
// ============================================================

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("lookup");
  const [identifier, setIdentifier] = useState("");
  const [question, setQuestion] = useState("");
  const [questionText, setQuestionText] = useState("");

  const [mode, setMode] = useState<"question" | "code">("question");

  const [answer, setAnswer] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ============================================================
  // STEP 1 — LOOKUP
  // ============================================================

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("لطفاً شماره موبایل، ایمیل یا نام کاربری‌ت رو وارد کن.");
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPasswordLookup(identifier.trim());
      setQuestion(result.question);
      setQuestionText(result.questionText);
      setStep("recovery");
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "اطلاعات بازیابی پیدا نشد.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STEP 2 — RESET
  // ============================================================

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("رمز عبور جدید باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("تکرار رمز عبور مطابقت ندارد.");
      return;
    }

    if (mode === "question" && !answer.trim()) {
      setError("لطفاً جواب سوال امنیتی رو وارد کن.");
      return;
    }

    if (mode === "code" && !code.trim()) {
      setError("لطفاً کد بازیابی رو وارد کن.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "question") {
        await resetPasswordWithQuestion({
          identifier: identifier.trim(),
          answer: answer.trim(),
          newPassword,
        });
      } else {
        await resetPasswordWithRecoveryCode({
          identifier: identifier.trim(),
          code: code.trim(),
          newPassword,
        });
      }

      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "تغییر رمز عبور انجام نشد.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SUCCESS
  // ============================================================

  if (success) {
    return (
      <AuthLayout
        variant="login"
        title="رمز تغییر کرد"
        description="حالا می‌تونی با رمز جدید وارد بشی"
      >
        <div className="text-center py-8">
          <div className="relative inline-flex mb-5">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-50" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-2xl">
              <CheckCircle2 size={36} />
            </div>
          </div>

          <h2 className="font-heading text-xl font-black text-white mb-2">
            رمز عبور با موفقیت تغییر کرد
          </h2>
          <p className="text-sm text-gray-400 leading-7 mb-6">
            در حال انتقال به صفحه ورود...
          </p>

          <LoaderCircle
            size={20}
            className="animate-spin text-[var(--griffin-gold)] mx-auto"
          />
        </div>
      </AuthLayout>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <AuthLayout
      variant="login"
      title="بازیابی رمز عبور"
      description="از طریق سوال امنیتی یا کد بازیابی، رمزت رو عوض کن"
    >
      {/* ERROR */}
      {error && (
        <div
          className="mb-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5 animate-[fadeInUp_0.3s_ease-out]"
          role="alert"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
            <AlertCircle size={13} className="text-rose-500" />
          </div>
          <p className="text-xs font-bold text-rose-400 leading-6">{error}</p>
        </div>
      )}

      {/* ====================================================== */}
      {/* STEP 1: LOOKUP */}
      {/* ====================================================== */}
      {step === "lookup" && (
        <form onSubmit={handleLookup} className="space-y-3.5">
          <div className="rounded-xl border border-[var(--griffin-gold)]/20 bg-[var(--griffin-gold)]/5 p-3 flex items-start gap-2.5">
            <ShieldCheck
              size={14}
              className="text-[var(--griffin-gold)] shrink-0 mt-0.5"
            />
            <p className="text-[11px] text-[var(--griffin-gold)] leading-5 font-bold">
              برای بازیابی رمز، اول شناسه‌ی حساب‌ت رو وارد کن. بعد سوال امنیتی
              یا کد بازیابی ازت پرسیده می‌شه.
            </p>
          </div>

          <AuthInput
            label="شماره موبایل، ایمیل یا نام کاربری"
            name="identifier"
            placeholder="09123456789 یا example@gmail.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            icon={<HelpCircle size={9} />}
          />

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3.5 font-heading font-black text-white text-sm shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  در حال بررسی...
                </>
              ) : (
                <>
                  <ArrowLeft size={16} className="rotate-180" />
                  ادامه
                </>
              )}
            </span>
            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </form>
      )}

      {/* ====================================================== */}
      {/* STEP 2: RECOVERY */}
      {/* ====================================================== */}
      {step === "recovery" && (
        <form onSubmit={handleReset} className="space-y-3.5">
          {/* Tabs: سوال / کد */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode("question");
                setError("");
              }}
              className={`
                inline-flex items-center justify-center gap-2
                rounded-lg px-3 py-2 text-xs font-black
                transition-all
                ${
                  mode === "question"
                    ? "bg-[var(--griffin-gold)] text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              <HelpCircle size={12} />
              سوال امنیتی
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("code");
                setError("");
              }}
              className={`
                inline-flex items-center justify-center gap-2
                rounded-lg px-3 py-2 text-xs font-black
                transition-all
                ${
                  mode === "code"
                    ? "bg-[var(--griffin-gold)] text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              <KeyRound size={12} />
              کد بازیابی
            </button>
          </div>

          {/* سوال امنیتی */}
          {mode === "question" && (
            <div className="rounded-xl border border-[var(--griffin-gold)]/20 bg-[var(--griffin-gold)]/5 p-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                سوال امنیتی تو
              </p>
              <p className="text-sm font-bold text-white leading-6">
                {questionText}
              </p>
            </div>
          )}

          {/* ورودی جواب یا کد */}
          {mode === "question" ? (
            <AuthInput
              label="جواب سوال"
              name="answer"
              placeholder="جوابت رو بنویس..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              icon={<Lock size={9} />}
            />
          ) : (
            <AuthInput
              label="کد بازیابی ۱۲ کاراکتری"
              name="code"
              placeholder="XXXX-XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              icon={<KeyRound size={9} />}
              dir="ltr"
            />
          )}

          {/* رمز جدید */}
          <div className="relative">
            <AuthInput
              label="رمز عبور جدید"
              name="newPassword"
              placeholder="••••••••"
              showPasswordToggle
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<Lock size={9} />}
            />
          </div>

          {/* تکرار رمز */}
          <AuthInput
            label="تکرار رمز عبور جدید"
            name="confirmPassword"
            placeholder="••••••••"
            showPasswordToggle
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock size={9} />}
          />

          {/* دکمه‌ها */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-emerald-500 to-emerald-700 px-5 py-3.5 font-heading font-black text-white text-sm shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  در حال تغییر...
                </>
              ) : (
                <>
                  <Check size={16} />
                  تغییر رمز عبور
                </>
              )}
            </span>
            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          {/* برگشت به مرحله قبل */}
          <button
            type="button"
            onClick={() => {
              setStep("lookup");
              setError("");
              setAnswer("");
              setCode("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            className="w-full text-center text-[10px] font-black text-gray-500 hover:text-[var(--griffin-gold)] transition-colors"
          >
            ← برگشت به مرحله قبل
          </button>
        </form>
      )}

      {/* FOOTER */}
      <div className="mt-4 pt-3.5 border-t border-white/5">
        <p className="text-center text-[11px] text-gray-500">
          یادت اومد؟{" "}
          <Link
            to="/login"
            className="mr-1 font-black text-[var(--griffin-gold)] hover:underline"
          >
            بازگشت به ورود
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
