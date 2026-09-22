import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  AtSign,
  CheckCircle2,
  Key,
  MessageSquare,
  Phone,
  Shield,
  User,
  UserPlus,
} from "lucide-react";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import AuthLayout from "../components/auth/AuthLayout";
import OtpInput from "../components/auth/OtpInput";
import {
  registerUser,
  verifyRegistration,
  resendVerificationCode,
} from "../services/authService";
import { registerSchema } from "../validations/authValidation";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((v) => ({ ...v, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const [key, value] of Object.entries(
        parsed.error.flatten().fieldErrors,
      ))
        if (value?.[0]) next[key] = value[0];
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await registerUser(form);
      setStep("verify");
      setCode("");
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message ||
          error?.message ||
          "ثبت‌نام انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e?: React.FormEvent, codeOverride?: string) => {
    e?.preventDefault();
    const finalCode = codeOverride ?? code;

    if (!finalCode || finalCode.length !== 6) {
      setServerError("کد ۶ رقمی را وارد کن.");
      return;
    }

    setServerError("");
    setServerSuccess("");
    setLoading(true);

    try {
      const data = await verifyRegistration(form.phoneNumber, finalCode);
      login(data.user, data.token);
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message ||
          error?.message ||
          "کد تایید صحیح نیست.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await resendVerificationCode(form.phoneNumber, "PHONE_REGISTRATION");
      setServerSuccess("کد جدید ارسال شد.");
      setServerError("");
      setCode("");
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message ||
          error?.message ||
          "ارسال مجدد کد انجام نشد.",
      );
    }
  };

  return (
    <AuthLayout
      variant="register"
      title="ساخت حساب گریفین"
      description="به خانواده آکادمی گریفین بپیوند"
    >
      {/* پیام خطا */}
      {serverError && (
        <div
          className="mb-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5 animate-[fadeInUp_0.3s_ease-out]"
          role="alert"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
            <Shield size={13} className="text-rose-500" />
          </div>
          <p className="text-xs font-bold text-rose-400 leading-6">
            {serverError}
          </p>
        </div>
      )}

      {/* پیام موفقیت */}
      {serverSuccess && (
        <div className="mb-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-start gap-2.5 animate-[fadeInUp_0.3s_ease-out]">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={13} className="text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-emerald-400 leading-6">
            {serverSuccess}
          </p>
        </div>
      )}

      {/* ==================== مرحله ۱: فرم ثبت‌نام ==================== */}
      {step === "form" ? (
        <form onSubmit={submit} className="space-y-3.5">
          {/* نام و فامیل — ۲ ستونه */}
          <div className="grid grid-cols-2 gap-2.5">
            <AuthInput
              label="نام"
              name="firstName"
              placeholder="محمد"
              value={form.firstName}
              onChange={change}
              error={errors.firstName}
              icon={<User size={9} />}
            />
            <AuthInput
              label="نام خانوادگی"
              name="lastName"
              placeholder="محمدی"
              value={form.lastName}
              onChange={change}
              error={errors.lastName}
              icon={<User size={9} />}
            />
          </div>

          {/* نام کاربری */}
          <AuthInput
            label="نام کاربری"
            name="username"
            placeholder="yasin_m"
            value={form.username}
            onChange={change}
            error={errors.username}
            icon={<AtSign size={9} />}
          />

          {/* موبایل */}
          <AuthInput
            label="شماره همراه"
            name="phoneNumber"
            type="tel"
            inputMode="numeric"
            placeholder="09123456789"
            value={form.phoneNumber}
            onChange={change}
            error={errors.phoneNumber}
            icon={<Phone size={9} />}
          />

          {/* رمز و تکرار — ۲ ستونه */}
          <div className="grid grid-cols-2 gap-2.5">
            <AuthInput
              label="رمز عبور"
              name="password"
              placeholder="••••••••"
              showPasswordToggle
              value={form.password}
              onChange={change}
              error={errors.password}
              icon={<Key size={9} />}
            />
            <AuthInput
              label="تکرار رمز"
              name="confirmPassword"
              placeholder="••••••••"
              showPasswordToggle
              value={form.confirmPassword}
              onChange={change}
              error={errors.confirmPassword}
              icon={<Key size={9} />}
            />
          </div>

          {/* قوانین */}
          <label className="flex items-start gap-2 cursor-pointer group pt-1">
            <input
              type="checkbox"
              required
              className="
                mt-0.5 w-3.5 h-3.5 rounded
                border-2 border-white/20
                bg-white/5
                accent-[var(--griffin-gold)]
                cursor-pointer
              "
            />
            <span className="text-[10px] text-gray-400 leading-5 group-hover:text-gray-300 transition-colors">
              با ثبت‌نام،{" "}
              <a
                href="#"
                className="text-[var(--griffin-gold)] hover:underline"
              >
                قوانین و مقررات
              </a>{" "}
              و{" "}
              <a
                href="#"
                className="text-[var(--griffin-gold)] hover:underline"
              >
                حریم خصوصی
              </a>{" "}
              را می‌پذیرم.
            </span>
          </label>

          {/* دکمه ثبت‌نام */}
          <AuthButton
            type="submit"
            variant="primary"
            loading={loading}
            icon={UserPlus}
          >
            {loading ? "در حال ارسال کد..." : "ثبت‌نام و ارسال کد"}
          </AuthButton>
        </form>
      ) : (
        /* ==================== مرحله ۲: تایید کد ==================== */
        <form onSubmit={(e) => void verify(e)} className="space-y-3.5">
          {/* اطلاعات شماره */}
          <div className="relative rounded-2xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 to-transparent p-3.5">
            <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-[var(--griffin-gold)]/15 blur-2xl pointer-events-none" />

            <div className="relative flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30 flex items-center justify-center text-[var(--griffin-gold)] shrink-0">
                <MessageSquare size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  کد تایید ارسال شد
                </p>
                <p className="mt-1 text-[11px] font-bold text-white leading-5">
                  کد ۶ رقمی به شماره{" "}
                  <span
                    dir="ltr"
                    className="font-english text-[var(--griffin-gold)]"
                  >
                    {form.phoneNumber}
                  </span>{" "}
                  فرستاده شد.
                </p>
              </div>
            </div>
          </div>

          {/* ==================== OTP Input ==================== */}
          <div>
            <label className="block text-center text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3">
              کد تایید را وارد کن
            </label>
            <OtpInput
              length={6}
              value={code}
              onChange={setCode}
              onComplete={(fullCode) => {
                setCode(fullCode);
                void verify(undefined, fullCode);
              }}
              disabled={loading}
            />
          </div>

          {/* دکمه تایید (پشتیبان) */}
          <AuthButton
            type="submit"
            variant="primary"
            loading={loading}
            icon={CheckCircle2}
          >
            {loading ? "در حال بررسی..." : "تایید شماره و ورود"}
          </AuthButton>

          {/* دکمه ارسال مجدد */}
          <AuthButton
            type="button"
            variant="secondary"
            onClick={() => void resend()}
            icon={MessageSquare}
          >
            ارسال مجدد کد
          </AuthButton>

          {/* بازگشت */}
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setCode("");
              setServerError("");
              setServerSuccess("");
            }}
            className="w-full text-center text-[10px] font-black text-gray-500 hover:text-[var(--griffin-gold)] transition-colors"
          >
            بازگشت به مرحله قبل
          </button>
        </form>
      )}

      {/* لینک ورود */}
      <div className="mt-4 pt-3.5 border-t border-white/5">
        <p className="text-center text-[11px] text-gray-500">
          قبلاً ثبت‌نام کرده‌ای؟{" "}
          <Link
            to="/login"
            className="mr-1 font-black text-[var(--griffin-gold)] hover:underline"
          >
            ورود به حساب
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
