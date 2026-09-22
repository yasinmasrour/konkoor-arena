import { BookOpen, Sparkles, Swords, Trophy } from "lucide-react";
import griffinCharacter from "../../assets/griffin-login.webp";

interface AuthHeroProps {
  variant?: "login" | "register";
}

const AuthHero = ({ variant = "login" }: AuthHeroProps) => {
  const title = variant === "login" ? "خوش برگشتی!" : "به گریفین بپیوند!";
  const subtitle =
    variant === "login"
      ? "با ورود به گریفین، مسیر موفقیتت رو ادامه بده."
      : "با ثبت‌نام، اولین قدم به سوی موفقیت رو بردار.";

  return (
    <div className="relative h-full w-full flex items-center justify-center p-6 lg:p-8 overflow-hidden">
      {/* پس‌زمینه گرادیان */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />

      {/* هاله‌های درخشان */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/25 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      {/* الگوی نقطه‌ای */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* محتوای اصلی — وسط‌چین و متعادل */}
      <div className="relative flex flex-col items-center text-center space-y-5 z-10 max-w-md">
        {/* برچسب */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30 backdrop-blur-sm">
          <Sparkles
            size={12}
            className="text-[var(--griffin-gold)] animate-pulse"
          />
          <span className="text-[10px] font-black text-[var(--griffin-gold)] tracking-widest uppercase">
            Griffin Academy
          </span>
        </div>

        {/* کاراکتر گریفین — فشرده‌تر */}
        <div className="relative w-full max-w-[220px] lg:max-w-[260px]">
          {/* حلقه‌های چرخان */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-[95%] h-[95%] rounded-full border border-dashed border-[var(--griffin-gold)]/20 animate-spin"
              style={{ animationDuration: "30s" }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="w-[75%] h-[75%] rounded-full border border-[var(--griffin-gold)]/10 animate-spin"
              style={{
                animationDuration: "20s",
                animationDirection: "reverse",
              }}
            />
          </div>

          {/* هاله درخشان */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[65%] h-[65%] rounded-full bg-[var(--griffin-gold)]/30 blur-[70px] animate-pulse" />
          </div>

          {/* تصویر */}
          <img
            src={griffinCharacter}
            alt="کاراکتر گریفین"
            className="relative w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(197,139,42,0.5)] animate-[float_4s_ease-in-out_infinite]"
            draggable={false}
          />

          {/* ذرات نورانی */}
          {[
            { top: "12%", left: "18%", delay: "0s" },
            { top: "25%", right: "12%", delay: "0.5s" },
            { bottom: "30%", left: "10%", delay: "1s" },
            { bottom: "18%", right: "15%", delay: "1.5s" },
          ].map((p, i) => (
            <span
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_10px_var(--griffin-gold)] pointer-events-none"
              style={{
                top: p.top,
                left: p.left,
                right: p.right,
                bottom: p.bottom,
                animation: `float 3s ease-in-out infinite`,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>

        {/* تیتر */}
        <h1 className="font-heading text-xl lg:text-2xl font-black text-white leading-tight">
          {title}
        </h1>

        {/* توضیحات */}
        <p className="text-xs text-gray-400 leading-6 max-w-xs">{subtitle}</p>

        {/* ویژگی‌ها */}
        <div className="flex flex-wrap justify-center gap-1.5 pt-1">
          {[
            { icon: BookOpen, label: "آزمون هوشمند" },
            { icon: Swords, label: "رقابت زنده" },
            { icon: Trophy, label: "تحلیل عملکرد" },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <Icon size={10} className="text-[var(--griffin-gold)]" />
                <span className="text-[10px] font-bold text-gray-300">
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AuthHero;
