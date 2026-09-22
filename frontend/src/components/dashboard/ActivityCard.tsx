import { Activity, BookOpen, Clock3, Swords, TrendingUp } from "lucide-react";

const activities = [
  {
    title: "آزمون ریاضی پایه دوازدهم",
    description: "کسب امتیاز ۸۵ درصد",
    time: "امروز",
    icon: TrendingUp,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    title: "شرکت در کنار Arena",
    description: "دریافت ۵۰ امتیاز",
    time: "دیروز",
    icon: Swords,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    title: "مشاهده دوره فیزیک",
    description: "ادامه یادگیری دوره",
    time: "۱۰ دقیقه پیش",
    icon: BookOpen,
    color: "text-[var(--griffin-gold)]",
    bg: "bg-[var(--griffin-gold)]/10",
  },
];

const ActivityCard = () => {
  return (
    <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

      <div className="relative p-5 border-b border-gray-200/70 dark:border-white/5">
        <div className="inline-flex items-center gap-2">
          <Activity size={13} className="text-[var(--griffin-gold)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
            Recent Activity
          </span>
        </div>
        <h2 className="font-heading text-base font-black text-gray-900 dark:text-white mt-1">
          آخرین فعالیت‌ها
        </h2>
      </div>

      <div className="p-4 space-y-2">
        {activities.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="group relative rounded-xl border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-3.5 flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div
                className={`w-10 h-10 rounded-xl shrink-0 ${item.bg} ${item.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon size={18} strokeWidth={2.3} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
                  {item.title}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {item.description}
                </p>
              </div>

              <span className="inline-flex items-center gap-1 text-[10px] font-black text-[var(--griffin-gold)] shrink-0">
                <Clock3 size={10} />
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ActivityCard;
