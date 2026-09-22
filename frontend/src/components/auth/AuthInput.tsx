import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState, type ReactNode } from "react";

interface AuthInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPasswordToggle?: boolean;
  icon?: ReactNode;
}

const AuthInput = ({
  label,
  name,
  type = "text",
  placeholder,
  error,
  value,
  onChange,
  showPasswordToggle = false,
  icon,
  inputMode,
  maxLength,
  ...rest
}: AuthInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div>
      {/* برچسب */}
      <label className="flex items-center gap-1 text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
        {icon}
        {label}
      </label>

      <div className="relative group">
        {/* هاله فوکوس */}
        <div
          className={`
            absolute inset-0 rounded-xl blur-md transition-opacity duration-300 pointer-events-none
            ${focused ? "bg-[var(--griffin-gold)]/20 opacity-100" : "opacity-0"}
          `}
        />

        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          {...rest}
          className={`
            relative w-full
            rounded-xl border
            px-3.5 py-2.5
            bg-white/[0.03]
            backdrop-blur-sm
            text-xs text-white
            placeholder:text-gray-600
            outline-none
            transition-all duration-300
            ${
              error
                ? "border-rose-500/50 focus:border-rose-500"
                : "border-white/10 focus:border-[var(--griffin-gold)] focus:ring-2 focus:ring-[var(--griffin-gold)]/20"
            }
            ${showPasswordToggle ? "pl-10" : ""}
          `}
        />

        {/* دکمه نمایش رمز */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute left-2.5 top-1/2 -translate-y-1/2
              w-6 h-6 rounded-md
              flex items-center justify-center
              text-gray-500 hover:text-[var(--griffin-gold)]
              hover:bg-[var(--griffin-gold)]/10
              transition-all
            "
          >
            {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
      </div>

      {/* خطا */}
      {error && (
        <div className="mt-1.5 flex items-center gap-1">
          <AlertCircle size={10} className="text-rose-500 shrink-0" />
          <p className="text-[10px] font-bold text-rose-500">{error}</p>
        </div>
      )}
    </div>
  );
};

export default AuthInput;
