import { Link } from "react-router-dom";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
import { useState } from "react";
import { loginSchema } from "../validations/authValidation";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const message = location.state?.message;

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };
  const [errors, setErrors] = useState<any>({});
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors(fieldErrors);

      return;
    }

    try {
      const data = await loginUser(formData);

      login(data.user, data.token);
      const redirectPath = location.state?.from?.pathname || "/dashboard";

      navigate(redirectPath);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <AuthLayout title="ورود به گریفین" description="وارد حساب کاربری خود شوید">
      {message && (
        <div
          className="
        mb-5
        rounded-xl
        bg-green-500/10
        p-3
        text-sm
        text-green-600
      "
        >
          {message}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="
          space-y-5
        "
      >
        <div>
          <AuthInput
            label="ایمیل"
            name="email"
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email?.[0]}
          />
        </div>

        <div>
          <div
            className="
              relative
            "
          >
            <AuthInput
              label="رمز عبور"
              name="password"
              placeholder="********"
              showPasswordToggle
              value={formData.password}
              onChange={handleChange}
              error={errors.password?.[0]}
            />
          </div>
        </div>

        <button
          className="
            w-full
            rounded-xl
            bg-[var(--griffin-gold)]
            py-3
            text-white
          "
        >
          ورود
        </button>
      </form>

      <p
        className="
          mt-6
          text-center
        "
      >
        حساب ندارید؟
        <Link
          to="/register"
          className="
            mr-2
            text-[var(--griffin-gold)]
          "
        >
          ثبت‌نام کنید
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
