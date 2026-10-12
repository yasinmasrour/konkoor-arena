import {
  UserPlus,
  CreditCard,
  Rocket,
  TrendingUp,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RevealOnScroll from "../common/RevealOnScroll";

const steps = [
  {
    number: "۰۱",
    title: "ثبت‌نام کن",
    description:
      "در کمتر از ۱ دقیقه حساب کاربری بساز. نیازی به کارت بانکی برای شروع نیست.",
    icon: UserPlus,
    gradient: "from-emerald-500 to-emerald-700",
    glowColor: "bg-emerald-500/20",
  },
  {
    number: "۰۲",
    title: "اشتراکت رو انتخاب کن",
    description:
      "از بین پلن‌های برنزی، نقره‌ای و طلایی، پلنی که با نیازت هماهنگه رو انتخاب کن.",
    icon: CreditCard,
    gradient: "from-[var(--griffin-gold)] to-amber-700",
    glowColor: "bg-[var(--griffin-gold)]/20",
  },
  {
    number: "۰۳",
    title: "شروع کن",
    description:
      "توی آزمون‌ها شرکت کن، با دیگران رقابت کن، و مهارت‌هات رو محک بزن.",
    icon: Rocket,
    gradient: "from-blue-500 to-blue-700",
    glowColor: "bg-blue-500/20",
  },
  {
    number: "۰۴",
    title: "پیشرفتت رو ببین",
    description:
      "با تحلیل AI، نقاط قوت و ضعفت رو بشناس و هر روز بهتر از دیروز باش.",
    icon: TrendingUp,
    gradient: "from-purple-500 to-purple-700",
    glowColor: "bg-purple-500/20",
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* هاله‌های پس‌زمینه */}
      <div className="absolute -top-40 right-1/3 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/8 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-blue-600/8 blur-[80px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* ==================== هدر ==================== */}
        <RevealOnScroll>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30 mb-5">
              <Sparkles size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                How It Works
              </span>
            </div>

            <h2 className="font-heading text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              چطور{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                  شروع کنم
                </span>
                <span className="absolute bottom-1 right-0 left-0 h-3 bg-[var(--griffin-gold)]/20 -z-0 rounded" />
              </span>
              ؟
            </h2>

            <p className="mt-5 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-8">
              فقط ۴ قدم ساده تا شروع مسیر موفقیت. همین الان شروع کن.
            </p>
          </div>
        </RevealOnScroll>

        {/* ==================== Steps ==================== */}
        <div className="relative">
          {/* خط افقی اتصال (فقط دسکتاپ) */}
          <div className="hidden lg:block absolute top-[60px] left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/30 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <RevealOnScroll key={i} delay={i * 120}>
                  <div className="group relative">
                    {/* کارت */}
                    <div
                      className="
                        relative rounded-3xl overflow-hidden
                        border border-gray-200 dark:border-white/10
                        bg-white dark:bg-white/[0.03]
                        p-6
                        transition-transform duration-300
                        hover:-translate-y-1
                        hover:border-[var(--griffin-gold)]/40
                      "
                    >
                      {/* هاله گوشه */}
                      <div
                        className={`
                          absolute -top-16 -right-16 w-32 h-32 rounded-full
                          ${step.glowColor} blur-2xl
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-300
                          pointer-events-none
                        `}
                      />

                      {/* خط طلایی بالا */}
                      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="relative text-center">
                        {/* آیکون + شماره */}
                        <div className="relative inline-flex mb-5">
                          <div
                            className={`
                              relative w-16 h-16 rounded-2xl
                              bg-gradient-to-br ${step.gradient}
                              flex items-center justify-center
                              text-white shadow-lg
                              transition-transform duration-300
                              group-hover:scale-110
                            `}
                          >
                            <Icon size={28} strokeWidth={2.2} />
                          </div>

                          {/* شماره */}
                          <span
                            className="
                              absolute -top-2 -right-2
                              inline-flex items-center justify-center
                              min-w-[30px] h-[30px] px-2
                              rounded-xl
                              bg-white dark:bg-[#080B12]
                              border-2 border-[var(--griffin-gold)]/40
                              text-[11px] font-black
                              text-[var(--griffin-gold)]
                              shadow-lg
                            "
                          >
                            {step.number}
                          </span>
                        </div>

                        {/* عنوان */}
                        <h3 className="font-heading text-lg font-black text-gray-900 dark:text-white">
                          {step.title}
                        </h3>

                        {/* توضیحات */}
                        <p className="mt-3 text-xs leading-6 text-gray-600 dark:text-gray-400">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {/* فلش بین کارت‌ها (فقط دسکتاپ) */}
                    {i < steps.length - 1 && (
                      <div className="hidden lg:flex absolute top-1/2 -left-3 -translate-y-1/2 z-10">
                        <div className="w-6 h-6 rounded-full bg-white dark:bg-[#080B12] border border-[var(--griffin-gold)]/30 flex items-center justify-center text-[var(--griffin-gold)]">
                          <ArrowLeft size={11} />
                        </div>
                      </div>
                    )}
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>

        {/* ==================== CTA ==================== */}
        <RevealOnScroll delay={500}>
          <div className="mt-14 text-center">
            <button
              onClick={() => navigate("/register")}
              className="
                group relative inline-flex items-center justify-center gap-2
                rounded-2xl
                bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                px-8 py-4
                font-heading font-black text-white text-base
                shadow-2xl shadow-[var(--griffin-gold)]/50
                transition-transform duration-300
                hover:-translate-y-1
                overflow-hidden
              "
            >
              <span className="relative z-10 flex items-center gap-2">
                <Rocket size={20} />
                همین حالا شروع کن
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              بدون نیاز به کارت بانکی · لغو در هر زمان
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default HowItWorks;
