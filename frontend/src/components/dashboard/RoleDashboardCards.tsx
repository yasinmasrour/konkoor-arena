import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  FileCheck2,
  FileQuestion,
  Flame,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface RoleCard {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  color: string;
}

const RoleDashboardCards = () => {
  const { user } = useAuth();
  const role = user?.role?.name;

  let cards: RoleCard[] = [];

  if (role === "ADMIN") {
    cards = [
      {
        title: "مدیریت سؤال‌ها",
        description: "بانک سؤال، طراحی، تحلیل و بررسی سؤال‌ها",
        path: "/question-bank",
        icon: FileQuestion,
        color: "from-purple-500 to-purple-700",
      },
      {
        title: "مدیریت آزمون‌ها",
        description: "ساخت و مدیریت دفترچه و آزمون",
        path: "/exam-builder",
        icon: ClipboardList,
        color: "from-[var(--griffin-gold)] to-amber-700",
      },
      {
        title: "بررسی سؤال‌ها",
        description: "مدیریت فرایند بررسی و انتشار",
        path: "/question-review",
        icon: FileCheck2,
        color: "from-blue-500 to-blue-700",
      },
      {
        title: "مدیریت سیستم",
        description: "دسترسی‌های مدیریتی و نظارت کلی",
        path: "/dashboard",
        icon: ShieldCheck,
        color: "from-emerald-500 to-emerald-700",
      },
    ];
  } else if (role === "QUESTION_DESIGNER") {
    cards = [
      {
        title: "بانک سؤال",
        description: "مشاهده و مدیریت سؤال‌های خود",
        path: "/question-bank",
        icon: FileQuestion,
        color: "from-purple-500 to-purple-700",
      },
      {
        title: "طراحی سؤال",
        description: "ساخت سؤال جدید و ویرایش سؤال‌ها",
        path: "/question-designer",
        icon: FileCheck2,
        color: "from-blue-500 to-blue-700",
      },
      {
        title: "تحلیل سؤال‌ها",
        description: "بررسی آمار و کیفیت سؤال‌ها",
        path: "/question-analytics",
        icon: ClipboardList,
        color: "from-[var(--griffin-gold)] to-amber-700",
      },
    ];
  } else if (role === "COUNSELOR") {
    cards = [
      {
        title: "دفترچه‌ها",
        description: "ساخت و مدیریت دفترچه آزمون",
        path: "/booklets",
        icon: BookOpen,
        color: "from-emerald-500 to-emerald-700",
      },
      {
        title: "آزمون‌ها",
        description: "ساخت و مدیریت آزمون‌ها",
        path: "/exam-builder",
        icon: ClipboardList,
        color: "from-[var(--griffin-gold)] to-amber-700",
      },
    ];
  }

  if (!cards.length) return null;

  return (
    <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/50 to-transparent" />

      {/* ==================== هدر ==================== */}
      <div className="relative p-5 border-b border-gray-200/70 dark:border-white/5">
        <div className="inline-flex items-center gap-2">
          <Flame size={13} className="text-[var(--griffin-gold)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
            Role Tools
          </span>
        </div>
        <h2 className="font-heading text-base font-black text-gray-900 dark:text-white mt-1">
          ابزارهای نقش شما
        </h2>
      </div>

      {/* ==================== گرید ==================== */}
      <div className="relative p-4 grid gap-3 sm:grid-cols-2">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.path}
              to={card.path}
              style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
              className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-4 transition-all duration-300 hover:-translate-y-1 animate-[fadeInUp_0.4s_ease-out_both]"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon size={18} strokeWidth={2.3} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-heading text-sm font-black text-gray-900 dark:text-white group-hover:text-[var(--griffin-gold)] transition-colors">
                    {card.title}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-5">
                    {card.description}
                  </p>
                </div>

                <ArrowLeft
                  size={14}
                  className="text-gray-400 dark:text-gray-600 transition-transform group-hover:-translate-x-1 group-hover:text-[var(--griffin-gold)] rotate-180 shrink-0 mt-1"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RoleDashboardCards;
