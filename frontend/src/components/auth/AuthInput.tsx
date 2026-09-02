import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface AuthInputProps {
  name: string;

  label: string;

  type?: string;

  placeholder?: string;

  error?: string;

  value?: string;

  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  showPasswordToggle?: boolean;
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
}: AuthInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div>
      <label
        className="
          text-sm
          dark:text-gray-200
        "
      >
        {label}
      </label>

      <div
        className="
          relative
        "
      >
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            mt-2
            w-full
            rounded-xl
            border
            px-4
            py-3
            bg-transparent
            outline-none
            transition

            ${showPasswordToggle ? "pl-12" : ""}

            ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"}

            focus:border-[var(--griffin-gold)]
          `}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
                absolute
                left-4
                top-1/2
                -translate-y-1/3
                text-[var(--griffin-gold)]
                dark:text-[var(--griffin-gold)]
              "
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {error && (
        <p
          className="
              mt-2
              text-sm
              text-red-500
            "
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default AuthInput;
