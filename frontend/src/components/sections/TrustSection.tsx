import {
  ShieldCheck,
  Users,
  Star,
  Lock,
  Award,
  Zap,
  Headphones,
  TrendingUp,
} from "lucide-react";
import RevealOnScroll from "../common/RevealOnScroll";
import { usePublicStats } from "../../hooks/usePublicStats";

const TrustSection = () => {
  const { stats } = usePublicStats();

  const trustItems = [
    {
      icon: Lock,
      title: "پرداخت امن",
      description: "تمام تراکنش‌ها از درگاه‌های امن انجام می‌شه.",
      gradient: "from-emerald-500 to-emerald-700",
      glowColor: "bg-emerald-500/20",
    },
    {
      icon: Users,
      title: `${stats.totalStudents.toLocaleString("fa-IR")}+ دانش‌آموز`,
      description: "هزاران داوطلب کنکور با گریفین پیشرفت کردن.",
      gradient: "from-[var(--griffin-gold)] to-amber-700",
      glowColor: "bg-[var(--griffin-gold)]/20",
    },
    {
      icon: Star,
      title: "پشتیبانی تخصصی",
      description: "تیم ما همیشه کنارته تا بهترین نتیجه رو بگیری.",
      gradient: "from-purple-500 to-purple-700",
      glowColor: "bg-purple-500/20",
    },
    {
      icon: Headphones,
      title: "پشتیبانی ۲۴/۷",
      description: "تیم پشتیبانی همیشه آماده پاسخ‌گویی به سوالاته.",
      gradient: "from-blue-500 to-blue-700",
      glowColor: "bg-blue-500/20",
    },
  ];

  return (
    <section className="relative px-6 py-20 overflow-hidden">
      {/* هاله‌های پس‌زمینه */}
      <div className="absolute -top-40 right-1/4 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/8 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/4 w-96 h-96 rounded-full bg-emerald-600/8 blur-[80px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* ==================== هدر ==================== */}
        <RevealOnScroll>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30 mb-5">
              <ShieldCheck size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Trust & Security
              </span>
            </div>

            <h2 className="font-heading text-3xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
              امنیت و{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                  اعتماد
                </span>
                <span className="absolute bottom-1 right-0 left-0 h-3 bg-[var(--griffin-gold)]/20 -z-0 rounded" />
              </span>
            </h2>

            <p className="mt-5 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-8">
              با اطمینان خاطر، مسیر موفقیتت رو با گریفین شروع کن.
            </p>
          </div>
        </RevealOnScroll>

        {/* ==================== کارت‌های اعتماد ==================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trustItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <RevealOnScroll key={i} delay={i * 120}>
                <div
                  className="
                    group relative rounded-3xl overflow-hidden
                    border border-gray-200 dark:border-white/10
                    bg-white dark:bg-white/[0.03]
                    p-6
                    text-center
                    transition-transform duration-300
                    hover:-translate-y-1
                    hover:border-[var(--griffin-gold)]/40
                  "
                >
                  {/* هاله گوشه */}
                  <div
                    className={`
                      absolute -top-16 -right-16 w-32 h-32 rounded-full
                      ${item.glowColor} blur-2xl
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-300
                      pointer-events-none
                    `}
                  />

                  {/* خط طلایی بالا */}
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    {/* آیکون */}
                    <div
                      className={`
                        relative inline-flex mb-4
                        w-14 h-14 rounded-2xl
                        bg-gradient-to-br ${item.gradient}
                        items-center justify-center
                        text-white shadow-lg
                        transition-transform duration-300
                        group-hover:scale-110
                      `}
                    >
                      <Icon size={24} strokeWidth={2.2} />
                    </div>

                    {/* عنوان */}
                    <h3 className="font-heading text-base font-black text-gray-900 dark:text-white">
                      {item.title}
                    </h3>

                    {/* توضیحات */}
                    <p className="mt-2 text-xs leading-6 text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* ==================== نمادهای اعتماد (Badges) ==================== */}
        <RevealOnScroll delay={500}>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {[
              { icon: ShieldCheck, text: "SSL امن" },
              { icon: Award, text: "محتوای تخصصی" },
              { icon: Zap, text: "پاسخ سریع" },
              { icon: TrendingUp, text: "پیشرفت تضمینی" },
            ].map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div
                  key={i}
                  className="
                    inline-flex items-center gap-2
                    rounded-xl
                    border border-gray-200 dark:border-white/10
                    bg-white/60 dark:bg-white/[0.03]
                    px-4 py-2.5
                    transition-colors duration-300
                    hover:border-[var(--griffin-gold)]/40
                  "
                >
                  <Icon
                    size={14}
                    className="text-[var(--griffin-gold)]"
                    strokeWidth={2.3}
                  />
                  <span className="text-xs font-black text-gray-700 dark:text-gray-300">
                    {badge.text}
                  </span>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};

export default TrustSection;
