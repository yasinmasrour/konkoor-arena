import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import AuthHero from "./AuthHero";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  variant?: "login" | "register";
}

const AuthLayout = ({
  children,
  title,
  description,
  variant = "login",
}: AuthLayoutProps) => {
  return (
    <main className="relative h-screen overflow-hidden bg-[#080B12] text-white">
      {/* ==================== پس‌زمینه سراسری ==================== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* گرادیان‌ها */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10" />

        {/* هاله‌های درخشان */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[var(--griffin-gold)]/20 blur-[140px] animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[140px]" />

        {/* الگوی نقطه‌ای */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* ذرات شناور */}
        {[
          { top: "15%", left: "10%", delay: "0s", size: 3 },
          { top: "25%", right: "12%", delay: "0.5s", size: 2 },
          { top: "45%", left: "8%", delay: "1s", size: 3 },
          { top: "65%", right: "15%", delay: "0.3s", size: 2 },
          { top: "80%", left: "20%", delay: "0.8s", size: 3 },
          { top: "35%", right: "25%", delay: "0.4s", size: 2 },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[var(--griffin-gold)]/40"
            style={{
              top: p.top,
              left: p.left,
              right: p.right,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* ==================== دکمه بازگشت ==================== */}
      <Link
        to="/"
        className="
          absolute top-4 right-4 sm:top-5 sm:right-5 z-50
          group inline-flex items-center gap-1.5
          rounded-xl border border-white/10 bg-white/5
          backdrop-blur-sm
          px-3 py-1.5
          text-[11px] font-black text-gray-300
          hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]
          transition-all
        "
      >
        <ArrowRight
          size={12}
          className="transition-transform group-hover:-translate-x-0.5 rotate-180"
        />
        بازگشت
      </Link>

      {/* ==================== کادر اصلی (وسط صفحه) ==================== */}
      <div className="relative h-full flex items-center justify-center p-4 sm:p-6 overflow-y-auto auth-scroll">
        <div
          className="
            relative w-full max-w-5xl
            rounded-3xl overflow-hidden
            border border-white/10
            bg-white/[0.02]
            backdrop-blur-2xl
            shadow-2xl shadow-black/40
          "
        >
          {/* خط طلایی بالا */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/60 to-transparent" />

          {/* گرید داخلی: فرم + کاراکتر */}
          <div className="grid lg:grid-cols-[1fr_1.1fr]">
            {/* ==================== سمت کاراکتر (چپ در RTL) ==================== */}
            <div className="hidden lg:block relative border-l border-white/5 bg-gradient-to-br from-[var(--griffin-gold)]/5 via-transparent to-purple-600/5">
              <AuthHero variant={variant} />
            </div>

            {/* ==================== سمت فرم (راست در RTL) ==================== */}
            <div className="relative p-6 sm:p-8">
              {/* هدر فرم */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_8px_var(--griffin-gold)] animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                    {variant === "login" ? "Welcome Back" : "Join Us"}
                  </span>
                </div>

                <h1 className="font-heading text-xl sm:text-2xl font-black text-white">
                  {title}
                </h1>

                <p className="mt-1.5 text-[11px] text-gray-400">
                  {description}
                </p>

                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent mx-auto mt-3 rounded-full" />
              </div>

              {/* محتوای فرم */}
              <div className="relative">{children}</div>
            </div>
          </div>

          {/* ==================== کاراکتر کوچیک توی موبایل ==================== */}
          <div className="lg:hidden relative h-32 bg-gradient-to-b from-[var(--griffin-gold)]/10 to-transparent border-b border-white/5 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full bg-[var(--griffin-gold)]/30 blur-3xl animate-pulse" />
            </div>
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_8px_var(--griffin-gold)] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Griffin Academy
                </span>
              </div>
              <p className="font-heading text-sm font-black text-white">
                {variant === "login" ? "خوش برگشتی!" : "به گریفین بپیوند!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== فوتر ==================== */}
      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
        <p className="text-[10px] text-gray-600">
          © {new Date().getFullYear()} آکادمی گریفین · تمام حقوق محفوظ است
        </p>
      </div>
    </main>
  );
};

export default AuthLayout;