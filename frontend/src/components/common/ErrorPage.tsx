import {
  ArrowRight,
  Compass,
  Flame,
  Home,
  RefreshCcw,
  Search,
  ServerCrash,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import GriffinMascot from "./GriffinMascot";

const ErrorPage = () => {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;

  // 🔹 تنظیمات بر اساس نوع خطا
  const config = {
    404: {
      title: "صفحه پیدا نشد",
      message:
        "صفحه‌ای که دنبالش هستی وجود نداره یا جابه‌جا شده. می‌تونی از دکمه‌های زیر استفاده کنی.",
      shortLabel: "Not Found",
      color: "amber",
      Icon: Compass,
    },
    401: {
      title: "نیاز به ورود",
      message:
        "برای دیدن این صفحه باید وارد حساب کاربری‌ات بشی. اگه وارد شدی، ممکنه نشستت منقضی شده باشه.",
      shortLabel: "Unauthorized",
      color: "rose",
      Icon: Flame,
    },
    403: {
      title: "دسترسی مجاز نیست",
      message:
        "این صفحه برای نقش کاربری تو در دسترس نیست. اگه فکر می‌کنی اشتباهی رخ داده، با پشتیبانی تماس بگیر.",
      shortLabel: "Forbidden",
      color: "rose",
      Icon: Flame,
    },
    500: {
      title: "خطای سرور",
      message:
        "در پردازش این صفحه مشکلی پیش اومد. لطفاً چند لحظه بعد دوباره تلاش کن.",
      shortLabel: "Server Error",
      color: "rose",
      Icon: ServerCrash,
    },
  }[status] ?? {
    title: "خطایی رخ داد",
    message:
      "یه مشکل غیرمنتظره پیش اومد. لطفاً دوباره تلاش کن یا به صفحه اصلی برگرد.",
    shortLabel: "Error",
    color: "rose",
    Icon: ServerCrash,
  };

  const { title, message, shortLabel, color, Icon } = config;

  // 🔹 پالت رنگ
  const palette = {
    amber: {
      border: "border-amber-500/40",
      bg: "bg-gradient-to-br from-amber-500/15 via-amber-500/10 to-transparent",
      text: "text-amber-500",
      textDark: "text-amber-600 dark:text-amber-400",
      glow: "bg-amber-500",
      badge: "bg-amber-500 text-white shadow-amber-500/40",
      shadow: "shadow-amber-500/20",
      ring: "ring-amber-500/20",
    },
    rose: {
      border: "border-rose-500/40",
      bg: "bg-gradient-to-br from-rose-500/15 via-rose-500/10 to-transparent",
      text: "text-rose-500",
      textDark: "text-rose-600 dark:text-rose-400",
      glow: "bg-rose-500",
      badge: "bg-rose-500 text-white shadow-rose-500/40",
      shadow: "shadow-rose-500/20",
      ring: "ring-rose-500/20",
    },
  }[color] ?? {
    border: "border-gray-500/40",
    bg: "bg-gradient-to-br from-gray-500/15 via-gray-500/10 to-transparent",
    text: "text-gray-500",
    textDark: "text-gray-600 dark:text-gray-400",
    glow: "bg-gray-500",
    badge: "bg-gray-500 text-white shadow-gray-500/40",
    shadow: "shadow-gray-500/20",
    ring: "ring-gray-500/20",
  };

  return (
    <main className="relative min-h-[80vh] flex items-center justify-center px-6 py-16 overflow-hidden">
      {/* ==================== پس‌زمینه تزئینی ==================== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* هاله‌های رنگی */}
        <div
          className={`absolute top-1/4 right-1/4 w-96 h-96 rounded-full ${palette.glow} blur-[120px] opacity-20`}
        />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-[var(--griffin-gold)] blur-[120px] opacity-15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px]" />

        {/* الگوی نقطه‌ای */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* ذرات شناور */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[var(--griffin-gold)]/40"
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
      </div>

      {/* ==================== کارت اصلی ==================== */}
      <section
        className={`
          relative w-full max-w-2xl
          rounded-[2rem] overflow-hidden
          border ${palette.border}
          bg-white/80 dark:bg-[#0a0d14]/80
          backdrop-blur-2xl
          shadow-2xl ${palette.shadow}
          animate-[fadeInUp_0.5s_ease-out]
        `}
      >
        {/* خط طلایی بالا */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

        {/* هاله درخشان گوشه */}
        <div
          className={`absolute -top-32 -right-32 w-80 h-80 rounded-full ${palette.glow} blur-3xl opacity-20`}
        />

        <div className="relative p-8 md:p-10 text-center">
          {/* ==================== mascot یا آیکون ==================== */}
          {status === 404 ? (
            <div className="relative flex justify-center mb-4">
              <GriffinMascot
                variant="notFound"
                size="md"
                animation="wiggle"
                glowColor="gold"
                particles
              />
            </div>
          ) : (
            <div className="relative inline-flex mb-6">
              <div
                className={`
                  absolute inset-0 ${palette.glow} blur-2xl opacity-60 animate-pulse
                `}
              />
              <div
                className={`
                  relative w-20 h-20 rounded-3xl
                  bg-gradient-to-br
                  flex items-center justify-center
                  shadow-2xl rotate-3
                  ${palette.badge}
                `}
              >
                <Icon size={36} strokeWidth={2.3} className="text-white" />
              </div>

              {/* ستاره تزئینی */}
              <Sparkles
                size={20}
                className={`absolute -top-2 -right-2 ${palette.text} animate-pulse`}
              />
            </div>
          )}

          {/* ==================== شماره خطا (بزرگ) ==================== */}
          <div className="relative mb-4">
            {/* عدد پشت (سایه) */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={`
                  font-heading text-9xl font-black
                  ${palette.text} opacity-10 select-none
                `}
              >
                {status}
              </span>
            </div>

            {/* برچسب */}
            <div
              className={`
                relative inline-flex items-center gap-2
                px-3.5 py-1.5 rounded-full
                ${palette.bg} border ${palette.border}
                backdrop-blur-sm
              `}
            >
              <Flame size={11} className={`${palette.text} animate-pulse`} />
              <span
                className={`
                  text-[10px] font-black uppercase tracking-widest
                  ${palette.textDark}
                `}
              >
                {shortLabel} · {status}
              </span>
            </div>
          </div>

          {/* ==================== تیتر ==================== */}
          <h1 className="font-heading text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3">
            {title}
          </h1>

          {/* خط جداکننده */}
          <div className="flex items-center gap-3 justify-center mb-5">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[var(--griffin-gold)]/40 rounded-full" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)]" />
            <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[var(--griffin-gold)]/40 rounded-full" />
          </div>

          {/* ==================== پیام ==================== */}
          <p className="text-sm md:text-base leading-7 text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
            {message}
          </p>

          {/* ==================== دکمه‌ها ==================== */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* دکمه صفحه اصلی */}
            <Link
              to="/"
              className="
                group relative
                inline-flex items-center justify-center gap-2
                rounded-xl
                bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                px-7 py-3
                font-black text-white
                text-sm
                shadow-lg shadow-[var(--griffin-gold)]/40
                hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60
                hover:-translate-y-0.5
                transition-all duration-300
                overflow-hidden
              "
            >
              <span className="relative z-10 flex items-center gap-2">
                <Home size={16} />
                صفحه اصلی
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1 rotate-180"
                />
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>

            {/* دکمه تلاش مجدد */}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="
                group inline-flex items-center justify-center gap-2
                rounded-xl
                border border-gray-200 dark:border-white/10
                bg-white/70 dark:bg-white/[0.04]
                backdrop-blur-sm
                px-7 py-3
                font-black text-gray-700 dark:text-gray-200
                text-sm
                hover:border-[var(--griffin-gold)]/40
                hover:bg-[var(--griffin-gold)]/5
                transition-all duration-300
              "
            >
              <RefreshCcw
                size={16}
                className="transition-transform group-hover:rotate-180 duration-500"
              />
              تلاش مجدد
            </button>
          </div>

          {/* ==================== پیشنهادات (فقط برای 404) ==================== */}
          {status === 404 && (
            <div className="mt-8 pt-6 border-t border-gray-200/70 dark:border-white/5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                شاید به دنبال این‌ها باشی
              </p>

              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { icon: Search, label: "آزمون‌ها", href: "/tests" },
                  { icon: Flame, label: "Arena", href: "/arena" },
                  { icon: Sparkles, label: "داشبورد", href: "/dashboard" },
                  { icon: Wifi, label: "تماس با ما", href: "/contact" },
                ].map((item, i) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={i}
                      to={item.href}
                      className="
                        group/link
                        inline-flex items-center gap-1.5
                        px-3 py-1.5
                        rounded-lg
                        bg-gray-100/70 dark:bg-white/5
                        border border-transparent
                        text-[11px] font-black text-gray-600 dark:text-gray-400
                        transition-all duration-200
                        hover:border-[var(--griffin-gold)]/40
                        hover:text-[var(--griffin-gold)]
                        hover:bg-[var(--griffin-gold)]/5
                        hover:-translate-y-0.5
                      "
                    >
                      <ItemIcon size={12} />
                      {item.label}
                      <ArrowRight
                        size={10}
                        className="opacity-0 -mr-2 group-hover/link:opacity-100 group-hover/link:mr-0 transition-all rotate-180"
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== پیشنهاد تلاش مجدد برای 500 ==================== */}
          {status >= 500 && (
            <div className="mt-8 pt-6 border-t border-gray-200/70 dark:border-white/5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <WifiOff size={12} />
                <span className="text-[10px] font-black">
                  اگه مشکل ادامه داشت، اتصال اینترنتت رو چک کن
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ErrorPage;
