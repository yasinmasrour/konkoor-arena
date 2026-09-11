import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
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
  const [form, setForm] = useState({
    identifier: "",
    password: "",
    captchaAnswer: "",
  });
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = new URLSearchParams(location.search).get("returnTo");
  useEffect(() => {
    void getCaptcha().then(setCaptcha);
  }, []);
  const change = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((v) => ({ ...v, [e.target.name]: e.target.value }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
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
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message || error?.message || "ورود انجام نشد.",
      );
      setCaptcha(await getCaptcha());
      setForm((v) => ({ ...v, captchaAnswer: "" }));
    } finally {
      setLoading(false);
    }
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");
    try {
      const data = await verifyLogin(verificationPhone, code);

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
      title="ورود به گریفین"
      description="با شماره همراه خود وارد شوید"
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
        <form onSubmit={submit} className="space-y-5">
          <AuthInput
            label="شماره همراه، ایمیل یا نام کاربری"
            name="identifier"
            placeholder="09123456789 یا example@gmail.com یا yasin_m"
            value={form.identifier}
            onChange={change}
            error={errors.identifier}
          />
          <AuthInput
            label="رمز عبور"
            name="password"
            placeholder="********"
            showPasswordToggle
            value={form.password}
            onChange={change}
            error={errors.password}
          />
          <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 p-4">
            <div className="flex justify-between mb-3">
              <span className="text-sm font-semibold">کپچا</span>
              <button
                type="button"
                onClick={() => void getCaptcha().then(setCaptcha)}
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
            className="w-full rounded-xl bg-[var(--griffin-gold)] py-3 text-white disabled:opacity-50"
          >
            {loading ? "در حال ارسال..." : "ورود و ارسال کد"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-5">
          <div className="rounded-2xl bg-[var(--griffin-gold)]/10 p-4 text-sm">
            کد تایید به شماره <strong>{verificationPhone}</strong> ارسال شد.
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
            {loading ? "در حال ورود..." : "تایید کد و ورود"}
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
      <p className="mt-6 text-center">
        حساب ندارید؟{" "}
        <Link to="/register" className="mr-2 text-[var(--griffin-gold)]">
          ثبت‌نام کنید
        </Link>
      </p>
    </AuthLayout>
  );
};
export default Login;
