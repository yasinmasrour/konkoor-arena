import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  AtSign,
  CheckCircle2,
  Key,
  LogIn,
  MessageSquare,
  Shield,
  Sparkles,
} from "lucide-react";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import CaptchaBox from "../components/auth/CaptchaBox";
import AuthLayout from "../components/auth/AuthLayout";
import OtpInput from "../components/auth/OtpInput";
import {
  getCaptcha,
  loginUser,
  verifyLogin,
  resendVerificationCode,
} from "../services/authService";
import { loginSchema } from "../validations/authValidation";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [verificationPhone, setVerificationPhone] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [captcha, setCaptcha] = useState({ token: "", question: "" });
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    captchaAnswer: "",
  });
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [serverSuccess, setServerSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = new URLSearchParams(location.search).get("returnTo");

  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      setCaptcha(await getCaptcha());
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    void loadCaptcha();
  }, []);

  const change = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((v) => ({ ...v, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setServerSuccess("");

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.error.flatten().fieldErrors))
        if (v?.[0]) next[k] = v[0];
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const data = await loginUser({
        ...form,
        captchaToken: captcha.token,
      });
      setVerificationPhone(data.phoneNumber);
      setStep("verify");
      setCode("");
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message || error?.message || "ورود انجام نشد.",
      );
      await loadCaptcha();
      setForm((v) => ({ ...v, captchaAnswer: "" }));
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

    setLoading(true);
    setServerError("");
    setServerSuccess("");

    try {
      const data = await verifyLogin(verificationPhone, finalCode);
      login(data.user, data.token);

      const target =
        returnTo?.startsWith("/") && !returnTo.startsWith("//")
          ? returnTo
          : "/dashboard";

      navigate(target, { replace: true });
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
      await resendVerificationCode(verificationPhone, "PHONE_LOGIN");
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
      variant="login"
      title="ورود به گریفین"
      description="با شماره همراه، ایمیل یا نام کاربری وارد شو"
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

      {/* ==================== مرحله ۱: فرم ورود ==================== */}
      {step === "form" ? (
        <form onSubmit={submit} className="space-y-3.5">
          {/* شناسه */}
          <AuthInput
            label="شماره همراه، ایمیل یا نام کاربری"
            name="identifier"
            placeholder="09123456789 یا example@gmail.com"
            value={form.identifier}
            onChange={change}
            error={errors.identifier}
            icon={<AtSign size={9} />}
          />

          {/* رمز عبور */}
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

          {/* کپچا */}
          <CaptchaBox
            question={captcha.question}
            value={form.captchaAnswer}
            onChange={change}
            onRefresh={() => void loadCaptcha()}
            error={errors.captchaAnswer}
            loading={captchaLoading}
          />

          {/* فراموشی رمز */}
          <div className="flex items-center justify-end -mt-1">
            <button
              type="button"
              className="text-[10px] font-black text-gray-500 hover:text-[var(--griffin-gold)] transition-colors"
            >
              رمز عبور را فراموش کرده‌ای؟
            </button>
          </div>

          {/* دکمه ورود */}
          <AuthButton
            type="submit"
            variant="primary"
            loading={loading}
            icon={LogIn}
          >
            {loading ? "در حال ارسال کد..." : "ورود و ارسال کد تایید"}
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
                    {verificationPhone}
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
            {loading ? "در حال بررسی..." : "تایید کد و ورود"}
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

      {/* لینک ثبت‌نام */}
      <div className="mt-4 pt-3.5 border-t border-white/5">
        <p className="text-center text-[11px] text-gray-500">
          حساب نداری؟{" "}
          <Link
            to="/register"
            className="mr-1 font-black text-[var(--griffin-gold)] hover:underline"
          >
            همین حالا ثبت‌نام کن
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
