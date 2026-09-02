import { type ReactNode } from "react";
import { useTheme } from "../../context/ThemeContext";

import logoLight from "../../assets/logo-light.webp";
import logoDark from "../../assets/logo-dark.webp";

import authLight from "../../assets/auth-light.webp";
import authDark from "../../assets/auth-dark.webp";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

const AuthLayout = ({ children, title, description }: AuthLayoutProps) => {
  const { theme } = useTheme();

  return (
    <section
      className="
        min-h-screen
        flex
        items-center
        justify-center
        px-6
        py-20
        bg-cover
        bg-center
        relative
      "
      style={{
        backgroundImage: `
          url(
            ${theme === "dark" ? authDark : authLight}
          )
        `,
      }}
    >
      {/* Overlay */}

      <div
        className="
          absolute
          inset-0
          bg-white/40
          dark:bg-black/50
        "
      />

      {/* Card */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-xl
          rounded-3xl
          border
          border-white/30
          bg-white/15
          dark:bg-white/5
          backdrop-blur-xl
          p-8
          shadow-2xl
        "
      >
        {/* Logo */}

        <div
          className="
            flex
            justify-center
            mb-8
          "
        >
          <img
            src={theme === "dark" ? logoLight : logoDark}
            alt="Griffin Academy"
            className="
              h-20
              object-contain
            "
          />
        </div>

        <h1
          className="
            text-3xl
            font-bold
            text-center
            dark:text-white
          "
        >
          {title}
        </h1>

        <p
          className="
            mt-3
            text-center
            text-gray-600
            dark:text-gray-300
          "
        >
          {description}
        </p>

        {/* Form Content */}

        <div
          className="
            mt-8
          "
        >
          {children}
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;
