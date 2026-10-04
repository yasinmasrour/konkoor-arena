import { BookOpen, Swords, Trophy, Users } from "lucide-react";
import CountUpNumber from "../ui/CountUpNumber";
import RevealOnScroll from "../common/RevealOnScroll";
import { usePublicStats } from "../../hooks/usePublicStats";

const StatsSection = () => {
  const { stats } = usePublicStats();

  const statItems = [
    {
      icon: Users,
      value: stats.totalStudents,
      suffix: "+",
      label: "دانش‌آموز فعال",
    },
    {
      icon: BookOpen,
      value: stats.totalQuestions,
      suffix: "+",
      label: "سؤال حل‌شده",
    },
    {
      icon: Swords,
      value: stats.totalArenaMatches,
      suffix: "+",
      label: "مسابقه Arena",
    },
    {
      icon: Trophy,
      value: stats.totalExams,
      suffix: "+",
      label: "آزمون برگزارشده",
    },
  ];

  return (
    <section className="relative px-6 py-20 overflow-hidden">
      {/* هاله‌های پس‌زمینه */}
      <div className="absolute -top-40 right-1/3 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/8 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-purple-600/8 blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* ==================== هدر ==================== */}
        <RevealOnScroll>
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
              گریفین در یک نگاه
            </h2>
            <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto mt-4 rounded-full" />
          </div>
        </RevealOnScroll>

        {/* ==================== گرید آمار ==================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <RevealOnScroll key={i} delay={i * 120}>
                <div
                  className="
                    group relative text-center
                    rounded-3xl border border-gray-200 dark:border-gray-800
                    bg-white dark:bg-white/5
                    p-6
                    transition-transform duration-300
                    hover:-translate-y-1
                    hover:border-[var(--griffin-gold)]/40
                    overflow-hidden
                  "
                >
                  <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-[var(--griffin-gold)]/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div
                    className="
                      relative mx-auto w-12 h-12 rounded-2xl
                      flex items-center justify-center
                      bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600
                      text-white mb-5
                      shadow-lg shadow-[var(--griffin-gold)]/30
                      transition-transform duration-300
                      group-hover:scale-110
                    "
                  >
                    <Icon size={22} strokeWidth={2.2} />
                  </div>

                  <div className="relative font-heading text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                    <CountUpNumber end={stat.value} suffix={stat.suffix} />
                  </div>

                  <p className="relative mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
