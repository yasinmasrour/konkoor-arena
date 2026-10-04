import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AtSign, LogIn, Shield } from "lucide-react";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import CaptchaBox from "../components/auth/CaptchaBox";
import AuthLayout from "../components/auth/AuthLayout";
import { getCaptcha, loginUser } from "../services/authService";
import { loginSchema } from "../validations/authValidation";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [captcha, setCaptcha] = useState({
    token: "",
    question: "",
  });

  const [captchaLoading, setCaptchaLoading] = useState(false);

  const [form, setForm] = useState({
    identifier: "",
    password: "",
    captchaAnswer: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const returnTo = new URLSearchParams(location.search).get("returnTo");

  // ============================================================
  // CAPTCHA
  // ============================================================

  const loadCaptcha = async () => {
    setCaptchaLoading(true);

    try {
      setCaptcha(await getCaptcha());
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setServerError("دریافت کپچا انجام نشد.");
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCaptcha();
  }, []);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const change = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((value) => ({
      ...value,
      [e.target.name]: e.target.value,
    }));

  // ============================================================
  // LOGIN
  // ============================================================

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setServerError("");

    const parsed = loginSchema.safeParse({
      ...form,
      captchaToken: captcha.token,
    });

    if (!parsed.success) {
      const next: Record<string, string> = {};

      for (const [key, value] of Object.entries(
        parsed.error.flatten().fieldErrors,
      )) {
        if (value?.[0]) {
          next[key] = value[0];
        }
      }

      setErrors(next);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await loginUser({
        identifier: form.identifier,
        password: form.password,
        captchaToken: captcha.token,
        captchaAnswer: form.captchaAnswer,
      });

      // ========================================================
      // SMS / OTP DISABLED
      // ========================================================
      //
      // ورود اکنون مستقیماً با username / phone / email
      // و password انجام می‌شود.
      //
      // دیگر نیازی به:
      // - verificationPhone
      // - code
      // - verifyLogin
      // - resendVerificationCode
      // - OtpInput
      // نیست.
      // ========================================================

      login(data.user, data.token);

      const target =
        returnTo?.startsWith("/") && !returnTo.startsWith("//")
          ? returnTo
          : "/dashboard";

      navigate(target, {
        replace: true,
      });
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message || error?.message || "ورود انجام نشد.",
      );

      // بعد از خطای ورود، کپچا را تازه می‌کنیم.
      await loadCaptcha();

      setForm((value) => ({
        ...value,
        captchaAnswer: "",
      }));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <AuthLayout
      variant="login"
      title="ورود به گریفین"
      description="با شماره همراه، ایمیل یا نام کاربری وارد شو"
    >
      {/* ======================================================
          ERROR MESSAGE
          ====================================================== */}

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

      {/* ======================================================
          LOGIN FORM
          ====================================================== */}

      <form onSubmit={submit} className="space-y-3.5">
        {/* شناسه ورود */}

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
          icon={<LogIn size={9} />}
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
          <Link
            to="/forgot-password"
            className="text-[10px] font-black text-gray-500 hover:text-[var(--griffin-gold)] transition-colors"
          >
            رمز عبور را فراموش کرده‌ای؟
          </Link>
        </div>

        {/* ورود */}

        <AuthButton
          type="submit"
          variant="primary"
          loading={loading}
          icon={LogIn}
        >
          {loading ? "در حال ورود..." : "ورود به حساب"}
        </AuthButton>
      </form>

      {/* ======================================================
          REGISTER LINK
          ====================================================== */}

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
