import {
  ArrowRight,
  Home,
  LayoutDashboard,
  ShieldAlert,
  Lock,
  LogIn,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Forbidden = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const suggestions = user
    ? [
        {
          icon: LayoutDashboard,
          title: "داشبورد",
          description: "به پنل کاربری خود برگرد",
          href: "/dashboard",
        },
        {
          icon: Home,
          title: "صفحه اصلی",
          description: "به صفحه اصلی برو",
          href: "/",
        },
        {
          icon: HelpCircle,
          title: "تماس با پشتیبانی",
          description: "اگر فکر می‌کنی اشتباهی رخ داده",
          href: "/contact",
        },
      ]
    : [
        {
          icon: LogIn,
          title: "ورود به حساب",
          description: "با حساب کاربری خود وارد شو",
          href: "/login",
        },
        {
          icon: Home,
          title: "صفحه اصلی",
          description: "به صفحه اصلی برگرد",
          href: "/",
        },
        {
          icon: HelpCircle,
          title: "تماس با پشتیبانی",
          description: "اگر نیاز به کمک داری",
          href: "/contact",
        },
      ];

  return (
    <main className="relative min-h-[80vh] flex items-center justify-center px-6 py-16 overflow-hidden">
      {/* 🔹 گرادیان‌های پس‌زمینه */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-red-500/10 dark:bg-red-500/15 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/10 dark:bg-[var(--griffin-gold)]/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/5 dark:bg-purple-600/10 blur-[150px]" />
      </div>

      {/* 🔹 ذرات شناور */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[var(--griffin-gold)]/40 pointer-events-none"
          style={{
            // eslint-disable-next-line react-hooks/purity
            top: `${Math.random() * 100}%`,
            // eslint-disable-next-line react-hooks/purity
            left: `${Math.random() * 100}%`,
            // eslint-disable-next-line react-hooks/purity
            animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
            // eslint-disable-next-line react-hooks/purity
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      {/* 🔹 محتوای اصلی */}
      <div className="relative max-w-4xl w-full text-center space-y-10 animate-[fadeIn_0.5s_ease-out]">
        {/* ===== آیکون + کد خطا ===== */}
        <div className="relative flex flex-col items-center">
          {/* هاله درخشان پشت آیکون */}
          <div className="absolute top-0 w-40 h-40 rounded-full bg-red-500/20 dark:bg-red-500/30 blur-3xl animate-pulse" />

          {/* آیکون سپر با قفل */}
          <div className="relative mb-6">
            {/* حلقه چرخان */}
            <div
              className="absolute inset-0 w-32 h-32 -m-4 rounded-full border-2 border-dashed border-[var(--griffin-gold)]/30 animate-[spin_20s_linear_infinite]"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-red-500/20 to-red-700/20 dark:from-red-500/30 dark:to-red-700/30 border-2 border-red-500/30 dark:border-red-500/40 flex items-center justify-center shadow-2xl shadow-red-500/20">
              <ShieldAlert
                size={56}
                className="text-red-500 dark:text-red-400"
                strokeWidth={2}
              />

              {/* قفل کوچک گوشه */}
              <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600 flex items-center justify-center text-white shadow-lg shadow-[var(--griffin-gold)]/40">
                <Lock size={18} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* کد خطا */}
          <div className="font-heading text-8xl md:text-9xl font-black leading-none bg-gradient-to-b from-red-500 via-red-600 to-red-800 dark:from-red-400 dark:via-red-500 dark:to-red-700 bg-clip-text text-transparent drop-shadow-2xl">
            ۴۰۳
          </div>
        </div>

        {/* ===== متن ===== */}
        <div className="space-y-4">
          <h1 className="font-heading text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            دسترسی مجاز نیست
          </h1>

          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto rounded-full" />

          <p className="text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            این صفحه برای نقش کاربری شما در دسترس نیست. اگر فکر می‌کنی اشتباهی
            رخ داده، با پشتیبانی تماس بگیر.
          </p>

          {/* نشان نقش فعلی */}
          {user && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30">
              <Sparkles size={13} className="text-[var(--griffin-gold)]" />
              <span className="text-xs text-gray-700 dark:text-gray-300">
                نقش فعلی شما:{" "}
                <span className="font-bold text-[var(--griffin-gold)]">
                  {user.role.name === "ADMIN"
                    ? "مدیر"
                    : user.role.name === "QUESTION_DESIGNER"
                      ? "طراح سؤال"
                      : user.role.name === "COUNSELOR"
                        ? "مشاور"
                        : "دانش‌آموز"}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* ===== دکمه‌های اصلی ===== */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* دکمه بازگشت (اصلی) */}
          <button
            onClick={() => navigate(-1)}
            className="
              group relative inline-flex items-center justify-center gap-2
              rounded-2xl
              bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
              px-8 py-3.5 font-bold text-white
              shadow-lg shadow-[var(--griffin-gold)]/40
              hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60
              hover:-translate-y-0.5
              transition-all duration-300
              overflow-hidden
            "
          >
            <span className="relative z-10 flex items-center gap-2">
              <ArrowRight size={18} />
              بازگشت به صفحه قبل
            </span>
            <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>

          {/* دکمه خانه */}
          <Link
            to="/"
            className="
              inline-flex items-center justify-center gap-2
              rounded-2xl
              border border-gray-200 dark:border-white/10
              bg-white/70 dark:bg-white/5
              backdrop-blur-sm
              px-8 py-3.5 font-bold
              text-gray-700 dark:text-gray-200
              hover:border-[var(--griffin-gold)]/40
              hover:bg-[var(--griffin-gold)]/5
              transition-all duration-300
            "
          >
            <Home size={18} />
            صفحه اصلی
          </Link>
        </div>

        {/* ===== پیشنهادات ===== */}
        <div className="pt-6">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
            شاید به دنبال این‌ها باشی
          </p>

          <div className="grid sm:grid-cols-3 gap-3">
            {suggestions.map((item, i) => {
              const Icon = item.icon;
              return (
                <Link
                  key={i}
                  to={item.href}
                  className="
                    group
                    relative
                    rounded-2xl
                    border border-gray-200 dark:border-white/10
                    bg-white/60 dark:bg-white/[0.03]
                    backdrop-blur-sm
                    p-4
                    text-right
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-[var(--griffin-gold)]/40
                    hover:shadow-lg
                    hover:shadow-[var(--griffin-gold)]/10
                    overflow-hidden
                  "
                >
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[var(--griffin-gold)]/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)] transition-transform duration-300 group-hover:scale-110">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ===== نکته کوچک ===== */}
        <p className="text-xs text-gray-400 dark:text-gray-500 pt-4">
          کد خطا: <span className="font-mono">HTTP 403 — Forbidden</span>
        </p>
      </div>
    </main>
  );
};

export default Forbidden;
