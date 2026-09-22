import { ArrowLeft, Rocket, Sparkles, Star } from "lucide-react";
import RevealOnScroll from "../common/RevealOnScroll";

const FinalCTA = () => {
  return (
    <section className="px-6 py-24">
      <RevealOnScroll>
        <div
          className="
            relative
            max-w-6xl
            mx-auto
            rounded-[2.5rem]
            overflow-hidden
            bg-[#080B12]
            p-10
            md:p-16
            text-center
            text-white
            shadow-[0_30px_100px_-20px_rgba(197,139,42,0.5)]
            border
            border-white/5
          "
        >
          {/* 🔹 گرادیان‌های پس‌زمینه */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />

          {/* 🔹 شعاع نورانی چرخان */}
          <div
            className="
              absolute -top-1/2 left-1/2 -translate-x-1/2
              w-[800px] h-[800px]
              opacity-30
              animate-[spin_20s_linear_infinite]
              pointer-events-none
            "
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

          {/* 🔹 محتوای اصلی */}
          <div className="relative z-10 space-y-8">
            {/* برچسب بالا */}
            <RevealOnScroll delay={100}>
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30 backdrop-blur-sm">
                  <Sparkles
                    size={14}
                    className="text-[var(--griffin-gold)] animate-pulse"
                  />
                  <span className="text-xs font-bold text-[var(--griffin-gold)] tracking-wide">
                    همین حالا شروع کن
                  </span>
                </div>
              </div>
            </RevealOnScroll>

            {/* تیتر اصلی */}
            <RevealOnScroll delay={200}>
              <h2 className="font-heading text-3xl md:text-5xl font-black leading-[1.3]">
                آماده‌ای مسیر{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                    موفقیتت
                  </span>
                  <span className="absolute bottom-1 right-0 left-0 h-3 bg-[var(--griffin-gold)]/20 -z-0 rounded" />
                </span>{" "}
                را شروع کنی؟
              </h2>
            </RevealOnScroll>

            {/* توضیحات */}
            <RevealOnScroll delay={300}>
              <p className="text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
                با آکادمی گریفین یاد بگیر، رقابت کن و پیشرفت کن. مسیر موفقیت از
                همین‌جا شروع می‌شود.
              </p>
            </RevealOnScroll>

            {/* آمار کوچک */}
            <RevealOnScroll delay={400}>
              <div className="flex flex-wrap gap-4 justify-center pt-2">
                {[
                  { icon: Star, text: "بدون هزینه شروع" },
                  { icon: Rocket, text: "راه‌اندازی در ۱ دقیقه" },
                  { icon: Sparkles, text: "پشتیبانی همیشگی" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm text-xs text-gray-200"
                  >
                    <item.icon
                      size={14}
                      className="text-[var(--griffin-gold)]"
                    />
                    {item.text}
                  </div>
                ))}
              </div>
            </RevealOnScroll>

            {/* دکمه‌ها */}
            <RevealOnScroll delay={500}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {/* دکمه اصلی */}
                <button
                  className="
                    group
                    relative
                    rounded-2xl
                    bg-gradient-to-l
                    from-[var(--griffin-gold)]
                    to-amber-500
                    px-10
                    py-4
                    font-bold
                    text-white
                    text-lg
                    shadow-2xl
                    shadow-[var(--griffin-gold)]/50
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:shadow-[var(--griffin-gold)]/80
                    overflow-hidden
                  "
                >
                  {/* هاله زیر دکمه */}
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-300 -z-10" />

                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Rocket size={20} />
                    شروع مسیر
                    <ArrowLeft
                      size={18}
                      className="transition-transform group-hover:-translate-x-1"
                    />
                  </span>

                  {/* افکت shine */}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>

                {/* دکمه ثانویه */}
                <button
                  className="
                    rounded-2xl
                    border
                    border-white/20
                    bg-white/5
                    backdrop-blur-sm
                    px-10
                    py-4
                    font-bold
                    text-white
                    text-lg
                    hover:bg-white/10
                    hover:border-white/40
                    transition
                  "
                >
                  مشاهده امکانات
                </button>
              </div>
            </RevealOnScroll>

            {/* متن پایین */}
            <RevealOnScroll delay={600}>
              <p className="text-xs text-gray-500 pt-2">
                بدون نیاز به کارت بانکی · لغو در هر زمان
              </p>
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

export default FinalCTA;
