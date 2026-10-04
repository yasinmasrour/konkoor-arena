import { useEffect, useRef, useState } from "react";
import { Swords, Timer, Trophy, Zap, Crown } from "lucide-react";
import RevealOnScroll from "../common/RevealOnScroll";

// 🆕 ذرات ثابت
const PARTICLES = [
  { top: 12, left: 8, delay: 0, duration: 3 },
  { top: 28, left: 22, delay: 0.8, duration: 4 },
  { top: 45, left: 15, delay: 1.5, duration: 3.5 },
  { top: 62, left: 78, delay: 0.4, duration: 4.2 },
  { top: 18, left: 85, delay: 1.2, duration: 3.2 },
  { top: 75, left: 35, delay: 2, duration: 4.5 },
  { top: 88, left: 60, delay: 1.8, duration: 3.8 },
  { top: 38, left: 92, delay: 0.6, duration: 4.1 },
];

const ArenaPreview = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [seconds, setSeconds] = useState(30);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 🆕 throttle با requestAnimationFrame
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
      const y = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
      setTilt({ x, y });
      setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      rafRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setTilt({ x: 0, y: 0 });
  };

  const timeStr = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;

  return (
    <section className="px-6 py-24">
      <div
        className="
          relative max-w-7xl mx-auto
          rounded-[2.5rem] overflow-hidden
          bg-[#080B12] p-8 md:p-14 text-white
          shadow-[0_30px_100px_-20px_rgba(197,139,42,0.35)]
          border border-white/5
        "
      >
        {/* گرادیان پس‌زمینه */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 pointer-events-none" />

        {/* 🆕 هاله‌ها (blur سبک‌تر) */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/20 blur-[70px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-600/15 blur-[70px] pointer-events-none" />

        {/* 🆕 ذرات ثابت (۸ تا، بدون pulse) */}
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[var(--griffin-gold)]/60 pointer-events-none"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
              opacity: 0.5,
            }}
          />
        ))}

        {/* 🆕 الگوی نقطه‌ای حذف شد */}

        <div className="relative grid md:grid-cols-2 gap-12 items-center">
          {/* ===== ستون متن ===== */}
          <div className="space-y-7 text-center md:text-right">
            <RevealOnScroll direction="right">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-md opacity-50" />
                  <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600 flex items-center justify-center shadow-lg">
                    <Swords size={22} strokeWidth={2.4} />
                  </div>
                </div>
                <span className="font-heading text-lg font-bold text-[var(--griffin-gold)] tracking-wide">
                  Griffin Arena
                </span>
              </div>
            </RevealOnScroll>

            <RevealOnScroll direction="right" delay={100}>
              <h2 className="font-heading text-3xl md:text-5xl font-black leading-[1.3]">
                رقابت واقعی،
                <br />
                برای{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                    موفقیت واقعی
                  </span>
                  <span className="absolute bottom-1 right-0 left-0 h-3 bg-[var(--griffin-gold)]/20 -z-0 rounded" />
                </span>
              </h2>
            </RevealOnScroll>

            <RevealOnScroll direction="right" delay={200}>
              <p className="text-gray-300 leading-8 max-w-lg mx-auto md:mx-0">
                با دانش‌آموزان دیگر رقابت کن، سرعت و دقت خود را بسنج و جایگاه
                خود را در جدول رده‌بندی ارتقا بده.
              </p>
            </RevealOnScroll>

            {/* 🆕 بج‌ها (بدون backdrop-blur) */}
            <RevealOnScroll direction="right" delay={300}>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {[
                  { icon: Zap, text: "رقابت لحظه‌ای" },
                  { icon: Trophy, text: "جدول رده‌بندی" },
                  { icon: Timer, text: "زمان‌بندی هوشمند" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-200"
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

            <RevealOnScroll direction="right" delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
                <button
                  className="
                    group relative rounded-xl
                    bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                    px-8 py-3.5 font-bold text-white
                    shadow-lg shadow-[var(--griffin-gold)]/40
                    transition-all duration-300
                    hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60
                    hover:-translate-y-0.5
                    overflow-hidden
                  "
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Swords size={18} />
                    ورود به Arena
                  </span>
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>

                {/* 🆕 دکمه ثانویه (بدون backdrop-blur) */}
                <button className="rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 font-semibold text-white hover:bg-white/10 transition-colors">
                  تماشای دمو
                </button>
              </div>
            </RevealOnScroll>
          </div>

          {/* ===== ستون کارت Arena ===== */}
          <RevealOnScroll direction="left" delay={200}>
            <div className="relative group">
              {/* 🆕 هاله پشت کارت (blur سبک‌تر) */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/20 to-purple-600/20 blur-xl rounded-3xl" />

              {/* کارت اصلی با tilt */}
              <div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                }}
                className="
                  relative rounded-3xl
                  border border-white/10
                  bg-gradient-to-b from-white/[0.08] to-white/[0.02]
                  p-6 shadow-2xl
                  transition-transform duration-200 ease-out
                  overflow-hidden
                "
              >
                {/* 🆕 درخشش دنبال موس (ساده‌تر) */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(300px circle at ${mouse.x}px ${mouse.y}px, rgba(197,139,42,0.12), transparent 45%)`,
                  }}
                />

                {/* هدر کارت */}
                <div className="relative flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>مسابقه زنده</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30 text-[var(--griffin-gold)] text-xs font-bold">
                    <Timer size={12} />
                    <span>{timeStr}</span>
                  </div>
                </div>

                {/* دو رقیب */}
                <div className="relative grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                  {/* رقیب ۱ */}
                  <div className="text-center space-y-3">
                    <div className="relative mx-auto w-16 h-16">
                      {/* 🆕 blur سبک‌تر */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600 blur-sm opacity-50" />
                      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center font-black text-xl border-2 border-white/20">
                        ع
                      </div>
                      {/* 🆕 بدون drop-shadow */}
                      <Crown
                        size={16}
                        className="absolute -top-1 -right-1 text-yellow-400"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm">علی</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        رتبه ۱۲۵
                      </p>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 rounded-full" />
                    </div>
                    <p className="text-lg font-black text-[var(--griffin-gold)]">
                      ۸۵
                    </p>
                  </div>

                  {/* 🆕 VS (بدون pulse و blur) */}
                  <div className="relative">
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center font-black text-sm border-2 border-white/20 shadow-lg">
                      VS
                    </div>
                  </div>

                  {/* رقیب ۲ */}
                  <div className="text-center space-y-3">
                    <div className="relative mx-auto w-16 h-16">
                      {/* 🆕 blur سبک‌تر */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 blur-sm opacity-50" />
                      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center font-black text-xl border-2 border-white/20">
                        س
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-sm">سارا</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        رتبه ۹۸
                      </p>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[72%] bg-gradient-to-l from-purple-500 to-purple-400 rounded-full" />
                    </div>
                    <p className="text-lg font-black text-purple-400">۷۲</p>
                  </div>
                </div>

                <div className="my-6 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "سوال", value: "۲۵" },
                    { label: "دقت", value: "۹۴٪" },
                    { label: "امتیاز", value: "۱٬۲۴۰" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-white/5 border border-white/5 py-2.5"
                    >
                      <p className="text-[10px] text-gray-400 mb-1">
                        {stat.label}
                      </p>
                      <p className="font-bold text-sm text-white">
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -top-3 -right-3 px-3 py-1.5 rounded-xl bg-[var(--griffin-gold)] text-white text-xs font-bold shadow-lg rotate-6">
                زنده
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
};

export default ArenaPreview;