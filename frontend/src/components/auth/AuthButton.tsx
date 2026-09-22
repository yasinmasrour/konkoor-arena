import { LoaderCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface AuthButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
}

const AuthButton = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
}: AuthButtonProps) => {
  const variants = {
    primary: `
      bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
      text-white
      shadow-lg shadow-[var(--griffin-gold)]/40
      hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60
      hover:-translate-y-0.5
    `,
    secondary: `
      border border-white/10 bg-white/5 backdrop-blur-sm
      text-gray-200
      hover:border-[var(--griffin-gold)]/40
      hover:bg-[var(--griffin-gold)]/5
      hover:text-[var(--griffin-gold)]
    `,
    ghost: `
      text-gray-400
      hover:text-[var(--griffin-gold)]
      hover:bg-white/5
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        group relative w-full
        inline-flex items-center justify-center gap-2
        rounded-xl
        px-5 py-3.5
        font-heading font-black text-sm
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden
        ${variants[variant]}
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <LoaderCircle size={16} className="animate-spin" />
            در حال پردازش...
          </>
        ) : (
          <>
            {Icon && <Icon size={16} />}
            {children}
          </>
        )}
      </span>

      {/* shine effect */}
      {variant === "primary" && !loading && !disabled && (
        <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      )}
    </button>
  );
};

export default AuthButton;
