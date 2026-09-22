import { Swords, Target, TrendingUp, type LucideIcon } from "lucide-react";

interface StatItem {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const stats: StatItem[] = [
  {
    title: "آزمون‌های شرکت کرده",
    value: "۱۲",
    icon: Target,
    color: "text-[var(--griffin-gold)]",
    bg: "bg-[var(--griffin-gold)]/10",
  },
  {
    title: "امتیاز Arena",
    value: "۸۵۰",
    icon: Swords,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    title: "درصد پیشرفت",
    value: "۷۵٪",
    icon: TrendingUp,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
];

const StatsCard = () => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
            className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/10 animate-[fadeInUp_0.4s_ease-out_both]"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

            <div className="relative">
              <div
                className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon size={18} className={item.color} strokeWidth={2.3} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {item.title}
              </p>

              <p
                className={`font-heading text-2xl sm:text-3xl font-black mt-1 tabular-nums ${item.color}`}
              >
                {item.value}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default StatsCard;
