import { Moon, Sun, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import logoLight from "../../assets/logo-light.webp";
import logoDark from "../../assets/logo-dark.webp";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  const navLinks = [
    {
      title: "خانه",
      path: "/",
    },
    {
      title: "آزمون‌ها",
      path: "/tests",
    },
    {
      title: "Arena",
      path: "/arena",
    },
    {
      title: "درباره ما",
      path: "/about",
    },
    {
      title: "تماس",
      path: "/contact",
    },
  ];

  return (
    <nav
      className="
        sticky
        top-0
        z-50
        relative
        w-full
        border-b
        bg-white/60
        dark:bg-[#080B12]/50
        backdrop-blur-xl
        border-gray-200
        dark:border-gray-700
        px-6
        py-4
        flex
        items-center
        justify-between
      "
    >
      {/* Logo */}

      <Link to="/" className="flex items-center gap-3">
        <img
          src={theme === "dark" ? logoLight : logoDark}
          alt="Griffin Academy"
          className="
            h-12
            w-auto
            object-contain
          "
        />

        <span
          className="
            text-xl
            font-bold
            text-[var(--griffin-gold)]
            hidden
            sm:block
          "
        >
          آکادمی گریفین
        </span>
      </Link>

      {/* Desktop Menu */}

      <div
        className="
          hidden
          md:flex
          gap-8
          text-sm
          text-gray-700
          dark:text-gray-200
        "
      >
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="
                hover:text-[var(--griffin-gold)]
                transition
              "
          >
            {link.title}
          </Link>
        ))}
      </div>

      {/* Actions */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <button
          onClick={toggleTheme}
          className="
            p-2
            rounded-full
            text-gray-700
            dark:text-yellow-400
            hover:bg-gray-100
            dark:hover:bg-gray-800
            transition-colors
          "
        >
          {theme === "dark" ? (
            <Sun size={20} strokeWidth={2.2} />
          ) : (
            <Moon size={20} strokeWidth={2.2} />
          )}
        </button>

        {user ? (
          <div
            className="
        hidden
        md:flex
        items-center
        gap-4
      "
          >
            <Link
              to="/dashboard"
              className="
          text-sm
          dark:text-white
        "
            >
              داشبورد
            </Link>

            <button
              onClick={logout}
              className="
          rounded-xl
          border
          px-4
          py-2
          text-sm
          dark:text-white
        "
            >
              خروج
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="
        hidden
        md:block
        rounded-xl
        bg-[var(--griffin-gold)]
        px-5
        py-2
        text-white
      "
          >
            ورود
          </Link>
        )}

        <button
          className="md:hidden"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}

      {mobileMenu && (
        <div
          className="
              absolute
              top-full
              right-0
              left-0
              bg-white
              dark:bg-[#080B12]
              border-b
              border-gray-200
              dark:border-gray-800
              p-6
              md:hidden
              z-50
            "
        >
          <div
            className="
                flex
                flex-col
                gap-5
                text-gray-700
                dark:text-gray-200
              "
          >
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={closeMobileMenu}>
                {link.title}
              </Link>
            ))}

            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="
                  text-[var(--griffin-gold)]
                "
            >
              ورود
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
