import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
import {
  getCaptcha,
  registerUser,
  verifyRegistration,
  resendVerificationCode,
} from "../services/authService";
import { registerSchema } from "../validations/authValidation";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [captcha, setCaptcha] = useState({ token: "", question: "" });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    captchaAnswer: "",
  });
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadCaptcha = async () => setCaptcha(await getCaptcha());
  useEffect(() => {
    void loadCaptcha();
  }, []);

  const change = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((v) => ({ ...v, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
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
      await registerUser({ ...form, captchaToken: captcha.token });
      setStep("verify");
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message ||
          error?.message ||
          "ثبت‌نام انجام نشد.",
      );
      await loadCaptcha();
      setForm((v) => ({ ...v, captchaAnswer: "" }));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setLoading(true);
    try {
      const data = await verifyRegistration(form.phoneNumber, code);
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
      setServerError("کد جدید ارسال شد.");
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
      title="ساخت حساب گریفین"
      description="به خانواده آکادمی گریفین بپیوندید"
    >
      {serverError && (
        <div
          className="mb-5 rounded-xl bg-red-500/10 p-3 text-sm text-red-600"
          role="alert"
        >
          {serverError}
        </div>
      )}
      {step === "form" ? (
        <form
          onSubmit={submit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <AuthInput
            label="نام"
            name="firstName"
            placeholder="محمد"
            value={form.firstName}
            onChange={change}
            error={errors.firstName}
          />
          <AuthInput
            label="نام خانوادگی"
            name="lastName"
            placeholder="محمدی"
            value={form.lastName}
            onChange={change}
            error={errors.lastName}
          />
          <AuthInput
            label="نام کاربری"
            name="username"
            placeholder="yasin_m"
            value={form.username}
            onChange={change}
            error={errors.username}
          />

          <AuthInput
            label="ایمیل (اختیاری)"
            name="email"
            type="email"
            placeholder="example@gmail.com"
            value={form.email}
            onChange={change}
            error={errors.email}
          />
          <div className="md:col-span-2">
            <AuthInput
              label="شماره همراه"
              name="phoneNumber"
              type="tel"
              placeholder="09123456789"
              value={form.phoneNumber}
              onChange={change}
              error={errors.phoneNumber}
            />
          </div>
          <AuthInput
            label="رمز عبور"
            name="password"
            placeholder="********"
            showPasswordToggle
            value={form.password}
            onChange={change}
            error={errors.password}
          />
          <AuthInput
            label="تکرار رمز عبور"
            name="confirmPassword"
            placeholder="********"
            showPasswordToggle
            value={form.confirmPassword}
            onChange={change}
            error={errors.confirmPassword}
          />
          <div className="md:col-span-2 rounded-2xl border border-slate-200/70 dark:border-white/10 p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-sm font-semibold">کپچا</span>
              <button
                type="button"
                onClick={() => void loadCaptcha()}
                className="text-xs text-[var(--griffin-gold)]"
              >
                کپچای جدید
              </button>
            </div>
            <div
              dir="ltr"
              className="mb-3 rounded-xl bg-slate-100 dark:bg-white/5 px-4 py-3 text-center font-bold tracking-widest"
            >
              {captcha.question || "..."}
            </div>
            <AuthInput
              label="پاسخ کپچا"
              name="captchaAnswer"
              inputMode="numeric"
              placeholder="پاسخ"
              value={form.captchaAnswer}
              onChange={change}
              error={errors.captchaAnswer}
            />
          </div>
          <button
            disabled={loading}
            className="md:col-span-2 w-full rounded-xl bg-[var(--griffin-gold)] py-3 text-white disabled:opacity-50"
          >
            {loading ? "در حال ارسال..." : "ثبت‌نام و ارسال کد"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-5">
          <div className="rounded-2xl bg-[var(--griffin-gold)]/10 p-4 text-sm">
            کد ۶ رقمی به شماره <strong>{form.phoneNumber}</strong> ارسال شد.
          </div>
          <AuthInput
            label="کد تایید"
            name="code"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button
            disabled={loading}
            className="w-full rounded-xl bg-[var(--griffin-gold)] py-3 text-white disabled:opacity-50"
          >
            {loading ? "در حال بررسی..." : "تایید شماره و ورود"}
          </button>
          <button
            type="button"
            onClick={() => void resend()}
            className="w-full rounded-xl border py-3"
          >
            ارسال مجدد کد
          </button>
        </form>
      )}
      <p className="mt-6 text-center dark:text-gray-200">
        قبلاً ثبت‌نام کرده‌اید؟{" "}
        <Link to="/login" className="mr-2 text-[var(--griffin-gold)]">
          ورود
        </Link>
      </p>
    </AuthLayout>
  );
};
export default Register;
