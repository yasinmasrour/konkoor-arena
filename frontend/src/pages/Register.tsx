import { Link } from "react-router-dom";
import AuthInput from "../components/auth/AuthInput";
import AuthLayout from "../components/auth/AuthLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors] = useState<Record<string, string[]>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,

      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await registerUser(formData);

      console.log(data);

      navigate("/login", {
        state: {
          message: "ثبت‌نام با موفقیت انجام شد. لطفاً وارد شوید.",
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AuthLayout
      title="ساخت حساب گریفین"
      description="به خانواده آکادمی گریفین بپیوندید"
    >
      <form
        onSubmit={handleSubmit}
        className="
           grid
           grid-cols-1
           md:grid-cols-2
           gap-5
         "
      >
        {/* First Name */}

        <AuthInput
          label="نام"
          name="firstName"
          placeholder="محمد"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName?.[0]}
        />

        {/* Last Name */}

        <AuthInput
          label="نام خانوادگی"
          name="lastName"
          placeholder="محمدی"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName?.[0]}
        />

        {/* Email */}

        <div className="md:col-span-2">
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

        {/* Password */}

        <AuthInput
          label="رمز عبور"
          name="password"
          placeholder="********"
          showPasswordToggle
          value={formData.password}
          onChange={handleChange}
          error={errors.password?.[0]}
        />

        {/* Confirm Password */}

        <AuthInput
          label="تکرار رمز عبور"
          name="confirmPassword"
          placeholder="********"
          showPasswordToggle
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword?.[0]}
        />

        <button
          className="
            md:col-span-2
            w-full
            rounded-xl
            bg-[var(--griffin-gold)]
            py-3
            text-white
            hover:opacity-90
            transition
          "
        >
          ثبت‌نام
        </button>
      </form>

      <p
        className="
          mt-6
          text-center
          dark:text-gray-200
        "
      >
        قبلاً ثبت‌نام کرده‌اید؟
        <Link
          to="/login"
          className="
            mr-2
            text-[var(--griffin-gold)]
          "
        >
          ورود
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
