import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AtSign, Key, Phone, Shield, User, UserPlus } from "lucide-react";
import AuthInput from "../components/auth/AuthInput";
import AuthButton from "../components/auth/AuthButton";
import AuthLayout from "../components/auth/AuthLayout";
import { registerUser } from "../services/authService";
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const change = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((value) => ({
      ...value,
      [e.target.name]: e.target.value,
    }));

  // ============================================================
  // REGISTER
  // ============================================================

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setServerError("");

    // ----------------------------------------------------------
    // Client-side validation
    // ----------------------------------------------------------

    const parsed = registerSchema.safeParse(form);

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

    // ----------------------------------------------------------
    // Confirm password
    // ----------------------------------------------------------

    if (form.password !== form.confirmPassword) {
      setErrors({
        confirmPassword: "تکرار رمز عبور با رمز عبور یکسان نیست.",
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await registerUser({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });

      // ========================================================
      // SMS / OTP DISABLED
      // ========================================================
      //
      // ثبت‌نام اکنون مستقیماً token و user دریافت می‌کند.
      //
      // دیگر نیازی به:
      // - OtpInput
      // - verifyRegistration
      // - resendVerificationCode
      // - کد تأیید پیامکی
      // نیست.
      // ========================================================

      login(data.user, data.token);

      navigate("/dashboard", {
        replace: true,
      });
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

  // ============================================================
  // UI
  // ============================================================

  return (
    <AuthLayout
      variant="register"
      title="ساخت حساب گریفین"
      description="به خانواده آکادمی گریفین بپیوند"
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
          REGISTER FORM
          ====================================================== */}

      <form onSubmit={submit} className="space-y-3.5">
        {/* نام و نام خانوادگی */}

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

        {/* شماره همراه */}

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

        {/* رمز و تکرار رمز */}

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
            <a href="#" className="text-[var(--griffin-gold)] hover:underline">
              قوانین و مقررات
            </a>{" "}
            و{" "}
            <a href="#" className="text-[var(--griffin-gold)] hover:underline">
              حریم خصوصی
            </a>{" "}
            را می‌پذیرم.
          </span>
        </label>

        {/* ثبت‌نام */}

        <AuthButton
          type="submit"
          variant="primary"
          loading={loading}
          icon={UserPlus}
        >
          {loading ? "در حال ساخت حساب..." : "ساخت حساب"}
        </AuthButton>
      </form>

      {/* ======================================================
          LOGIN LINK
          ====================================================== */}

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
