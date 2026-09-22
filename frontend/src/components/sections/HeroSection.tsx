import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Rocket,
  Sparkles,
  Swords,
  Trophy,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import GriffinMascot from "../../components/common/GriffinMascot";
import RevealOnScroll from "../common/RevealOnScroll";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative px-4 py-8 sm:px-6 sm:py-12">
      <RevealOnScroll>
        <div className="relative max-w-7xl mx-auto rounded-[2.5rem] overflow-hidden bg-[#080B12] text-white p-8 md:p-14 border border-white/5 shadow-[0_30px_100px_-20px_rgba(197,139,42,0.5)]">
          {/* 🔹 گرادیان‌های پس‌زمینه */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />

          {/* 🔹 شعاع نورانی چرخان */}
          <div
            className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-30 animate-[spin_20s_linear_infinite] pointer-events-none"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(197,139,42,0.5) 90deg, transparent 180deg, rgba(139,92,246,0.3) 270deg, transparent 360deg)",
              filter: "blur(80px)",
            }}
          />

          {/* 🔹 ذرات نورانی ثابت */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/25 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

          {/* 🔹 ذرات شناور طلایی */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[var(--griffin-gold)] pointer-events-none"
              style={{
                // eslint-disable-next-line react-hooks/purity
                top: `${Math.random() * 100}%`,
                // eslint-disable-next-line react-hooks/purity
                left: `${Math.random() * 100}%`,
                // eslint-disable-next-line react-hooks/purity
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                // eslint-disable-next-line react-hooks/purity
                animationDelay: `${Math.random() * 3}s`,
                // eslint-disable-next-line react-hooks/purity
                opacity: 0.3 + Math.random() * 0.5,
              }}
            />
          ))}

          {/* 🔹 الگوی نقطه‌ای */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* ==================== محتوای اصلی ==================== */}
          <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* ===== سمت راست: متن ===== */}
            <div className="space-y-7 text-center lg:text-right order-2 lg:order-1">
              {/* برچسب */}
              <RevealOnScroll delay={100}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30 backdrop-blur-sm">
                  <Sparkles
                    size={14}
                    className="text-[var(--griffin-gold)] animate-pulse"
                  />
                  <span className="text-xs font-black text-[var(--griffin-gold)] tracking-wider">
                    آکادمی گریفین · شروع یک ماجراجویی
                  </span>
                </div>
              </RevealOnScroll>

              {/* تیتر */}
              <RevealOnScroll delay={200}>
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black leading-[1.3]">
                  مسیر موفقیت
                  <br />
                  با آکادمی{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                      گریفین
                    </span>
                    <span className="absolute bottom-1 right-0 left-0 h-3 bg-[var(--griffin-gold)]/20 -z-0 rounded" />
                  </span>
                </h1>
              </RevealOnScroll>

              {/* توضیحات */}
              <RevealOnScroll delay={300}>
                <p className="text-gray-300 leading-8 max-w-xl mx-auto lg:mx-0 text-sm md:text-base">
                  یادگیری، آزمون و رقابت را در یک مسیر هوشمند تجربه کن. برای
                  کنکور آماده شو، مهارت‌هات رو به چالش بکش و با گریفین به قله
                  برس!
                </p>
              </RevealOnScroll>

              {/* ویژگی‌های کوچک */}
              <RevealOnScroll delay={400}>
                <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
                  {[
                    { icon: BookOpen, text: "آزمون‌های هوشمند" },
                    { icon: Swords, text: "رقابت زنده" },
                    { icon: Trophy, text: "تحلیل عملکرد" },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-bold text-gray-200 hover:border-[var(--griffin-gold)]/40 hover:bg-[var(--griffin-gold)]/5 transition-all"
                      >
                        <Icon
                          size={14}
                          className="text-[var(--griffin-gold)]"
                        />
                        {item.text}
                      </div>
                    );
                  })}
                </div>
              </RevealOnScroll>

              {/* دکمه‌ها */}
              <RevealOnScroll delay={500}>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                  {/* دکمه اصلی */}
                  <button
                    onClick={() => navigate("/login")}
                    className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-8 py-4 font-heading font-black text-white text-base shadow-2xl shadow-[var(--griffin-gold)]/50 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/80 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Rocket size={20} />
                      شروع مسیر
                      <ArrowLeft
                        size={18}
                        className="transition-transform group-hover:-translate-x-1 rotate-180"
                      />
                    </span>
                    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </button>

                  {/* دکمه ثانویه */}
                  <button
                    onClick={() => navigate("/arena")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 font-heading font-black text-white text-base hover:bg-white/10 hover:border-white/40 transition-all"
                  >
                    <Swords size={18} />
                    ورود به Arena
                  </button>
                </div>
              </RevealOnScroll>

              {/* آمار کوچک */}
              <RevealOnScroll delay={600}>
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-3 border-t border-white/10">
                  {[
                    { value: "۱۲K+", label: "دانش‌آموز" },
                    { value: "۴۵K+", label: "سؤال" },
                    { value: "۱۲۰+", label: "آزمون" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center lg:text-right">
                      <p className="font-heading text-2xl font-black text-[var(--griffin-gold)]">
                        {stat.value}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </RevealOnScroll>
            </div>

            {/* ===== سمت چپ: کاراکتر گریفین ===== */}
            <RevealOnScroll delay={300}>
              <div className="relative order-1 lg:order-2 flex items-center justify-center">
                {/* 🆕 mascot گریفین */}
                <div className="relative w-full max-w-[400px] md:max-w-[480px]">
                  <GriffinMascot
                    variant="hero"
                    size="2xl"
                    animation="float"
                    glowColor="gold"
                    halo
                    particles
                    className="w-full h-auto"
                  />
                </div>

                {/* برچسب شناور بالای کاراکتر */}
                <div className="absolute top-2 right-2 lg:top-6 lg:right-6 animate-[float_3s_ease-in-out_infinite]">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-xl border border-[var(--griffin-gold)]/30 shadow-2xl">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                      <GraduationCap size={15} />
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Griffin
                      </p>
                      <p className="text-[11px] font-black text-gray-900 dark:text-white">
                        راهنمای تو
                      </p>
                    </div>
                  </div>
                </div>

                {/* برچسب شناور پایین کاراکتر */}
                <div
                  className="absolute bottom-6 left-2 lg:bottom-10 lg:left-6 animate-[float_3.5s_ease-in-out_infinite]"
                  style={{ animationDelay: "0.5s" }}
                >
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-[#0a0d14]/95 backdrop-blur-xl border border-purple-500/30 shadow-2xl">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg">
                      <Zap size={14} fill="white" />
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Arena
                      </p>
                      <p className="text-[11px] font-black text-gray-900 dark:text-white">
                        آماده نبرد
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* 🔹 گوشه‌های تزئینی */}
          <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-[var(--griffin-gold)]/30 rounded-tl-2xl pointer-events-none" />
          <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-[var(--griffin-gold)]/30 rounded-tr-2xl pointer-events-none" />
          <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-[var(--griffin-gold)]/30 rounded-bl-2xl pointer-events-none" />
          <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-[var(--griffin-gold)]/30 rounded-br-2xl pointer-events-none" />
        </div>
      </RevealOnScroll>
    </section>
  );
};

export default HeroSection;