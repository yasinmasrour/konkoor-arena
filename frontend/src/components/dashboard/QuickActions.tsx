import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Flame,
  MessageCircle,
  Swords,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    title: "آزمون‌ها",
    description: "شرکت در آزمون‌های آزمایشی",
    icon: ClipboardList,
    path: "/dashboard?section=exams",
    color: "from-[var(--griffin-gold)] to-amber-700",
  },
  {
    title: "کنکور Arena",
    description: "رقابت سریع با دیگران",
    icon: Swords,
    path: "/arena",
    color: "from-purple-500 to-purple-700",
  },
  {
    title: "دوره‌ها",
    description: "مشاهده کلاس‌ها و دوره‌ها",
    icon: BookOpen,
    path: "/courses",
    color: "from-blue-500 to-blue-700",
  },
  {
    title: "مشاوره",
    description: "برنامه‌ریزی و راهنمایی",
    icon: MessageCircle,
    path: "/counseling",
    color: "from-emerald-500 to-emerald-700",
  },
];

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

      {/* ==================== هدر ==================== */}
      <div className="relative p-5 border-b border-gray-200/70 dark:border-white/5">
        <div className="inline-flex items-center gap-2">
          <Flame size={13} className="text-[var(--griffin-gold)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
            Quick Actions
          </span>
        </div>
        <h2 className="font-heading text-base font-black text-gray-900 dark:text-white mt-1">
          دسترسی سریع
        </h2>
      </div>

      {/* ==================== گرید ==================== */}
      <div className="relative p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              type="button"
              onClick={() => navigate(item.path)}
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
              className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-4 text-right transition-all duration-300 hover:-translate-y-1 animate-[fadeInUp_0.4s_ease-out_both]"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon size={18} strokeWidth={2.3} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-5">
                    {item.description}
                  </p>
                </div>

                <ArrowLeft
                  size={14}
                  className="text-gray-400 dark:text-gray-600 transition-transform group-hover:-translate-x-1 group-hover:text-[var(--griffin-gold)] rotate-180 shrink-0 mt-1"
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default QuickActions;
