import { BookOpen, Swords, Users, Trophy } from "lucide-react";
import CountUpNumber from "../ui/CountUpNumber";
import RevealOnScroll from "../common/RevealOnScroll";

const stats = [
  { icon: Users, value: 12000, suffix: "+", label: "دانش‌آموز فعال" },
  { icon: BookOpen, value: 45000, suffix: "+", label: "سوال حل‌شده" },
  { icon: Swords, value: 8500, suffix: "+", label: "مسابقه Arena" },
  { icon: Trophy, value: 98, suffix: "٪", label: "رضایت کاربران" },
];

const StatsSection = () => {
  return (
    <section className="px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <RevealOnScroll>
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              گریفین در یک نگاه
            </h2>
            <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto mt-4 rounded-full" />
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <RevealOnScroll key={i} delay={i * 120}>
                <div
                  className="
                    group relative text-center
                    rounded-3xl border border-gray-200 dark:border-gray-800
                    bg-white dark:bg-white/5
                    p-6 transition-all duration-300
                    hover:-translate-y-2
                    hover:shadow-2xl hover:shadow-[var(--griffin-gold)]/10
                    hover:border-[var(--griffin-gold)]/40
                    overflow-hidden
                  "
                >
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div
                    className="
                      relative mx-auto w-12 h-12 rounded-2xl
                      flex items-center justify-center
                      bg-gradient-to-br from-[var(--griffin-gold)] to-amber-600
                      text-white mb-5
                      shadow-lg shadow-[var(--griffin-gold)]/30
                      transition-transform duration-300
                      group-hover:scale-110 group-hover:rotate-3
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
