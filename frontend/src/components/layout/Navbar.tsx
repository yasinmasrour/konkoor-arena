import {
  X,
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileCheck2,
  LogOut,
  User,
  ChevronDown,
  Home,
  Trophy,
  CreditCard,
  Info,
  Mail,
  Sparkles,
  Newspaper,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ui/ThemeToggle";
import logoLight from "../../assets/logo-light.webp";
import logoDark from "../../assets/logo-dark.webp";

const Navbar = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // 🔹 تشخیص اسکرول
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 🔹 بستن منوها با Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenu(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 🔹 بستن dropdown پروفایل با کلیک بیرون
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // 🔹 بستن منوی موبایل با تغییر مسیر
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenu(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // 🔹 قفل اسکرول هنگام باز بودن منوی موبایل
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu]);

  const navLinks = [
    { title: "خانه", path: "/", icon: Home },
    { title: "آزمون‌ها", path: "/tests", icon: BookOpen },
    { title: "اشتراک", path: "/subscriptions", icon: CreditCard },
    { title: "Arena", path: "/arena", icon: Trophy },
    { title: "وبلاگ", path: "/blog", icon: Newspaper },
    { title: "درباره ما", path: "/about", icon: Info },
    { title: "تماس", path: "/contact", icon: Mail },
  ];

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  // 🔹 لینک‌های داشبورد (بر اساس نقش)
  const dashboardLinks = [
    {
      title: "داشبورد",
      path: "/dashboard",
      icon: LayoutDashboard,
      show: !!user,
    },
    {
      title: "بانک سؤال",
      path: "/question-bank",
      icon: BookOpen,
      show:
        user?.role.name === "ADMIN" || user?.role.name === "QUESTION_DESIGNER",
    },
    {
      title: "دفترچه‌ها",
      path: "/booklets",
      icon: ClipboardList,
      show: user?.role.name === "ADMIN" || user?.role.name === "COUNSELOR",
    },
    {
      title: "بررسی سؤال‌ها",
      path: "/question-review",
      icon: FileCheck2,
      show: user?.role.name === "ADMIN",
    },
  ].filter((l) => l.show);

  return (
    <>
      {/* 🔹 Navbar اصلی */}
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${scrolled ? "py-2" : "py-3 md:py-4"}
        `}
      >
        <div className="mx-auto max-w-[1400px] px-4 md:px-6">
          <div
            className={`
              relative rounded-2xl
              transition-all duration-500
              border border-white/60 dark:border-white/[0.06]
              bg-white/70 dark:bg-[#0a0d14]/60
              backdrop-blur-2xl
              shadow-lg shadow-black/[0.03] dark:shadow-black/40
              ${scrolled ? "px-3 md:px-4" : "px-4 md:px-6"}
              flex items-center justify-between
              h-14 md:h-16
            `}
          >
            {/* 🔹 گرادیان طلایی پایین navbar */}
            <div
              className={`
                absolute bottom-0 left-1/2 -translate-x-1/2
                h-[2px] rounded-full
                bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent
                transition-all duration-500
                ${scrolled ? "w-3/4 opacity-80" : "w-1/2 opacity-40"}
              `}
            />

            {/* ===== لوگو ===== */}
            <Link
              to="/"
              className="group flex items-center gap-2 md:gap-3 shrink-0"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-[var(--griffin-gold)] blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
                <div className="relative">
                  <img
                    src={theme === "dark" ? logoLight : logoDark}
                    alt="Griffin Academy"
                    className={`
                      w-auto object-contain
                      transition-all duration-300
                      ${scrolled ? "h-9 md:h-10" : "h-10 md:h-12"}
                    `}
                  />
                </div>
              </div>

              <span
                className="
                  font-heading font-bold
                  text-[var(--griffin-gold)]
                  hidden sm:block
                  transition-all duration-300
                  text-lg md:text-xl
                "
              >
                گریفین
              </span>
            </Link>

            {/* ===== منوی دسکتاپ ===== */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      relative
                      inline-flex items-center gap-1.5
                      px-3.5 py-2
                      rounded-xl
                      text-sm font-medium
                      transition-all duration-300
                      ${
                        active
                          ? "text-[var(--griffin-gold)] bg-[var(--griffin-gold)]/10"
                          : "text-gray-700 dark:text-gray-300 hover:text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/5"
                      }
                    `}
                  >
                    <Icon size={14} className="shrink-0" />
                    {link.title}

                    {active && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_8px_var(--griffin-gold)]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* ===== Actions ===== */}
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <NotificationBell />

              <ThemeToggle />

              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className={`
                      flex items-center gap-2
                      pl-1.5 pr-2.5 py-1.5
                      rounded-xl
                      border transition-all duration-300
                      ${
                        profileOpen
                          ? "border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/10"
                          : "border-gray-200 dark:border-white/10 hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5"
                      }
                    `}
                  >
                    <div className="relative">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {user.firstName?.charAt(0) || "?"}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-[#0a0d14]" />
                    </div>

                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[80px] truncate">
                      {user.firstName}
                    </span>

                    <ChevronDown
                      size={14}
                      className={`
                        text-gray-400 transition-transform duration-300
                        ${profileOpen ? "rotate-180" : ""}
                      `}
                    />
                  </button>

                  {profileOpen && (
                    <div
                      className="
                        absolute top-full left-0 mt-2
                        w-64
                        rounded-2xl
                        border border-gray-200 dark:border-white/10
                        bg-white dark:bg-[#0a0d14]
                        shadow-2xl shadow-black/10 dark:shadow-black/50
                        backdrop-blur-2xl
                        overflow-hidden
                        animate-[fadeInDown_0.2s_ease-out]
                      "
                    >
                      <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gradient-to-br from-[var(--griffin-gold)]/5 to-transparent">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--griffin-gold)]/30">
                            {user.firstName?.charAt(0) || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email || user.phoneNumber}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)] text-[10px] font-bold">
                            <Sparkles size={10} />
                            {user.role.name === "ADMIN"
                              ? "مدیر"
                              : user.role.name === "QUESTION_DESIGNER"
                                ? "طراح سؤال"
                                : user.role.name === "COUNSELOR"
                                  ? "مشاور"
                                  : "دانش‌آموز"}
                          </span>
                        </div>
                      </div>

                      <div className="p-2">
                        {dashboardLinks.map((link) => {
                          const Icon = link.icon;
                          const active = isActive(link.path);
                          return (
                            <Link
                              key={link.path}
                              to={link.path}
                              className={`
                                flex items-center gap-3
                                px-3 py-2.5
                                rounded-xl
                                text-sm
                                transition-all duration-200
                                ${
                                  active
                                    ? "bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] font-semibold"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                                }
                              `}
                            >
                              <Icon size={16} className="shrink-0" />
                              <span>{link.title}</span>
                              {active && (
                                <span className="mr-auto w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)]" />
                              )}
                            </Link>
                          );
                        })}

                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200"
                        >
                          <User size={16} className="shrink-0" />
                          <span>پروفایل من</span>
                        </Link>
                      </div>

                      <div className="p-2 border-t border-gray-100 dark:border-white/5">
                        <button
                          onClick={logout}
                          className="
                            w-full flex items-center gap-3
                            px-3 py-2.5 rounded-xl
                            text-sm text-red-500
                            hover:bg-red-50 dark:hover:bg-red-500/10
                            transition-all duration-200
                          "
                        >
                          <LogOut size={16} className="shrink-0" />
                          <span>خروج از حساب</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="
                      hidden md:inline-flex items-center gap-2
                      relative overflow-hidden
                      rounded-xl
                      bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600
                      px-5 py-2
                      text-sm font-bold text-white
                      shadow-lg shadow-[var(--griffin-gold)]/30
                      transition-all duration-300
                      hover:-translate-y-0.5
                      hover:shadow-xl hover:shadow-[var(--griffin-gold)]/50
                      group
                    "
                  >
                    <span className="relative z-10">ورود / ثبت‌نام</span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Link>

                  <Link
                    to="/login"
                    className="md:hidden inline-flex items-center justify-center rounded-xl bg-[var(--griffin-gold)] w-9 h-9 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                  >
                    <User size={16} />
                  </Link>
                </>
              )}

              {/* دکمه منوی موبایل */}
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                aria-label="منو"
                className="
                  lg:hidden
                  w-9 h-9 md:w-10 md:h-10
                  rounded-xl
                  flex items-center justify-center
                  border border-gray-200 dark:border-white/10
                  bg-white/50 dark:bg-white/5
                  text-gray-700 dark:text-gray-200
                  hover:border-[var(--griffin-gold)]/40
                  hover:bg-[var(--griffin-gold)]/5
                  transition-all duration-300
                "
              >
                <div className="relative w-5 h-5">
                  <span
                    className={`
                      absolute left-0 right-0 h-[2px] rounded-full bg-current
                      transition-all duration-300
                      ${mobileMenu ? "top-1/2 rotate-45" : "top-1"}
                    `}
                  />
                  <span
                    className={`
                      absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-current
                      transition-all duration-300
                      ${mobileMenu ? "opacity-0 scale-0" : "opacity-100"}
                    `}
                  />
                  <span
                    className={`
                      absolute left-0 right-0 h-[2px] rounded-full bg-current
                      transition-all duration-300
                      ${mobileMenu ? "bottom-1/2 -rotate-45" : "bottom-1"}
                    `}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 🔹 Spacer */}
      <div className="h-20 md:h-24" />

      {/* 🔹 Overlay منوی موبایل */}
      {mobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setMobileMenu(false)}
        />
      )}

      {/* 🔹 منوی موبایل */}
      <div
        className={`
          fixed top-0 right-0 bottom-0 z-50
          w-[85%] max-w-sm
          bg-white dark:bg-[#0a0d14]
          border-l border-gray-200 dark:border-white/10
          shadow-2xl
          transition-transform duration-300 ease-out
          lg:hidden
          flex flex-col
          ${mobileMenu ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* هدر منو */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <img
              src={theme === "dark" ? logoLight : logoDark}
              alt="Griffin"
              className="h-9 w-auto"
            />
            <span className="font-heading font-bold text-[var(--griffin-gold)]">
              گریفین
            </span>
          </div>
          <button
            onClick={() => setMobileMenu(false)}
            aria-label="بستن"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* لینک‌ها */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
            دسترسی سریع
          </p>
          <div className="space-y-1 mb-6">
            {navLinks.map((link, i) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={`
                    flex items-center gap-3
                    px-3 py-3
                    rounded-xl
                    transition-all duration-200
                    animate-[fadeInRight_0.3s_ease-out_both]
                    ${
                      active
                        ? "bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                    }
                  `}
                >
                  <div
                    className={`
                      w-9 h-9 rounded-xl flex items-center justify-center
                      ${
                        active
                          ? "bg-[var(--griffin-gold)] text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                          : "bg-gray-100 dark:bg-white/5"
                      }
                    `}
                  >
                    <Icon size={16} />
                  </div>
                  <span>{link.title}</span>
                  {active && (
                    <span className="mr-auto w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* لینک‌های داشبورد */}
          {user && dashboardLinks.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
                پنل کاربری
              </p>
              <div className="space-y-1 mb-6">
                {dashboardLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`
                        flex items-center gap-3
                        px-3 py-3
                        rounded-xl
                        transition-all duration-200
                        ${
                          active
                            ? "bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] font-semibold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                        }
                      `}
                    >
                      <div
                        className={`
                          w-9 h-9 rounded-xl flex items-center justify-center
                          ${
                            active
                              ? "bg-[var(--griffin-gold)] text-white"
                              : "bg-gray-100 dark:bg-white/5"
                          }
                        `}
                      >
                        <Icon size={16} />
                      </div>
                      <span>{link.title}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* پایین منو */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-bold">
                  {user.firstName?.charAt(0) || "?"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email || user.phoneNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 font-semibold hover:bg-red-100 dark:hover:bg-red-500/20 transition"
              >
                <LogOut size={16} />
                خروج از حساب
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600 text-white font-bold shadow-lg shadow-[var(--griffin-gold)]/30"
            >
              <User size={16} />
              ورود / ثبت‌نام
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
