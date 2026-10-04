import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import RevealOnScroll from "../common/RevealOnScroll";

interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar: string;
  rating: number;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    name: "امیر محمدی",
    role: "دوازدهم ریاضی",
    text: "با آزمون‌های گریفین، تونستم رتبه‌م رو تو آزمون‌های آزمایشی ۳۰۰۰ تا بهتر کنم. تحلیل AI واقعاً معرکه‌ست و دقیقاً می‌گه کجا ضعیفم.",
    avatar: "ا",
    rating: 5,
    gradient: "from-[var(--griffin-gold)] to-amber-700",
  },
  {
    name: "سارا احمدی",
    role: "دوازدهم تجربی",
    text: "مقایسه نمره‌م با میانگین کمک کرد بفهمم واقعاً کجا ضعیفم. اینجا جزوه‌ها و آزمون‌ها خیلی حرفه‌ای‌ان و حس می‌کنم واقعاً پیشرفت کردم.",
    avatar: "س",
    rating: 5,
    gradient: "from-purple-500 to-purple-700",
  },
  {
    name: "علی رضایی",
    role: "یازدهم انسانی",
    text: "بخش آرنا باعث شد برای یادگیری انگیزه بیشتری داشته باشم. با دوستام مسابقه می‌دیم و کیف می‌کنیم! حتی وقتی می‌بازم، انگیزه‌م بیشتر میشه.",
    avatar: "ع",
    rating: 5,
    gradient: "from-blue-500 to-blue-700",
  },
  {
    name: "مریم کریمی",
    role: "دوازدهم تجربی",
    text: "برنامه مطالعاتی شخصی که مشاور برام ساخت، کاملاً با سطح و هدفم هماهنگه. بدون گریفین، نمی‌دونستم از کجا شروع کنم.",
    avatar: "م",
    rating: 5,
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    name: "رضا نوری",
    role: "دوازدهم ریاضی",
    text: "پشتیبانی سریع و دقیق، رابط کاربری ساده و امکانات کامل. به نظرم بهترین پلتفرم کنکوری توی ایرانه.",
    avatar: "ر",
    rating: 5,
    gradient: "from-rose-500 to-rose-700",
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const current = testimonials[currentIndex];

  const goNext = () => {
    setCurrentIndex((i) => (i + 1) % testimonials.length);
  };

  const goPrev = () => {
    setCurrentIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* هاله‌های پس‌زمینه */}
      <div className="absolute -top-40 right-1/3 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/8 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-purple-600/8 blur-[80px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        {/* ==================== هدر ==================== */}
        <RevealOnScroll>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30 mb-5">
              <Sparkles size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Testimonials
              </span>
            </div>

            <h2 className="font-heading text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              دانش‌آموزان چی{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                  می‌گن
                </span>
                <span className="absolute bottom-1 right-0 left-0 h-3 bg-[var(--griffin-gold)]/20 -z-0 rounded" />
              </span>
              ؟
            </h2>

            <p className="mt-5 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-8">
              هزاران دانش‌آموز با گریفین پیشرفت کردن. تو هم می‌تونی.
            </p>
          </div>
        </RevealOnScroll>

        {/* ==================== اسلایدر ==================== */}
        <RevealOnScroll>
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* کارت اصلی */}
            <div className="relative rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-8 md:p-12 overflow-hidden">
              {/* هاله گوشه */}
              <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-[60px] pointer-events-none" />

              {/* خط طلایی بالا */}
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />

              <Quote
                size={60}
                className="absolute top-6 left-6 text-[var(--griffin-gold)]/10"
              />

              <div className="relative space-y-6">
                {/* ستاره‌ها */}
                <div className="flex gap-1 justify-center">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="text-[var(--griffin-gold)]"
                      fill="currentColor"
                    />
                  ))}
                </div>

                {/* متن */}
                <p
                  key={currentIndex}
                  className="text-base md:text-lg leading-9 text-gray-700 dark:text-gray-200 text-center max-w-3xl mx-auto animate-[fadeInUp_0.5s_ease-out]"
                >
                  «{current.text}»
                </p>

                {/* اطلاعات نویسنده */}
                <div className="flex items-center justify-center gap-4 pt-4">
                  <div
                    className={`
                      w-14 h-14 rounded-2xl
                      bg-gradient-to-br ${current.gradient}
                      flex items-center justify-center
                      text-white font-heading font-black text-xl
                      shadow-lg
                    `}
                  >
                    {current.avatar}
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-black text-gray-900 dark:text-white">
                      {current.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {current.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* دکمه‌های ناوبری */}
            <button
              onClick={goPrev}
              aria-label="قبلی"
              className="
                absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6
                w-11 h-11 rounded-2xl
                border border-gray-200 dark:border-white/10
                bg-white dark:bg-[#0a0d14]
                flex items-center justify-center
                text-gray-600 dark:text-gray-300
                transition-colors duration-300
                hover:border-[var(--griffin-gold)]/40
                hover:text-[var(--griffin-gold)]
                shadow-lg
              "
            >
              <ChevronRight size={18} />
            </button>

            <button
              onClick={goNext}
              aria-label="بعدی"
              className="
                absolute top-1/2 -translate-y-1/2 -left-4 md:-left-6
                w-11 h-11 rounded-2xl
                border border-gray-200 dark:border-white/10
                bg-white dark:bg-[#0a0d14]
                flex items-center justify-center
                text-gray-600 dark:text-gray-300
                transition-colors duration-300
                hover:border-[var(--griffin-gold)]/40
                hover:text-[var(--griffin-gold)]
                shadow-lg
              "
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </RevealOnScroll>

        {/* ==================== نقطه‌های ناوبری ==================== */}
        <RevealOnScroll delay={300}>
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`نظر ${i + 1}`}
                className={`
                  h-2 rounded-full transition-all duration-300
                  ${
                    i === currentIndex
                      ? "w-8 bg-[var(--griffin-gold)]"
                      : "w-2 bg-gray-300 dark:bg-white/20 hover:bg-gray-400 dark:hover:bg-white/40"
                  }
                `}
              />
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default TestimonialsSection;
