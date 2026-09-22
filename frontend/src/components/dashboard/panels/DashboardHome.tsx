import {
  ArrowLeft,
  BookOpen,
  CreditCard,
  Crown,
  Flame,
  Gift,
  Swords,
  Target,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import RoleDashboardCards from "../RoleDashboardCards";

const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 🔹 کارت‌های آماری (placeholder - بعداً از API می‌گیریم)
  const stats = [
    {
      icon: Trophy,
      label: "Rating Arena",
      value: "۱٬۲۴۰",
      color: "text-[var(--griffin-gold)]",
      bg: "bg-[var(--griffin-gold)]/10",
    },
    {
      icon: Swords,
      label: "نبردها",
      value: "۲۴",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: BookOpen,
      label: "آزمون‌ها",
      value: "۱۲",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: Target,
      label: "پیشرفت",
      value: "۸۵٪",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  // 🔹 دسترسی سریع
  const quickActions = [
    {
      icon: Swords,
      label: "ورود به Arena",
      desc: "شروع نبرد جدید",
      href: "/arena",
      color: "from-purple-500 to-purple-700",
    },
    {
      icon: BookOpen,
      label: "آزمون‌ها",
      desc: "مشاهده آزمون‌ها",
      href: "/dashboard?section=exams",
      color: "from-[var(--griffin-gold)] to-amber-700",
    },
    {
      icon: Wallet,
      label: "کیف پول",
      desc: "مشاهده موجودی",
      href: "/dashboard?section=wallet",
      color: "from-emerald-500 to-emerald-700",
    },
    {
    icon: Gift,
    label: "دعوت دوستان",
    desc: "۳۰۰ هزار تومان جایزه بگیر",
    href: "/referral",
    color: "from-rose-500 to-rose-700",
  },
  ];

  return (
    <div className="space-y-5">
      {/* ==================== HERO ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/10 backdrop-blur-xl p-6 sm:p-8">
        {/* هاله‌های تزئینی */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
          {/* آواتار */}
          <div className="relative shrink-0 self-center sm:self-auto">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-3xl shadow-2xl rotate-3">
              {user?.firstName?.charAt(0) || "?"}
            </div>
          </div>

          {/* متن خوش‌آمدگویی */}
          <div className="flex-1 text-center sm:text-right">
            <div className="inline-flex items-center gap-2 mb-2">
              <Zap
                size={12}
                className="text-[var(--griffin-gold)] animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                خوش آمدی
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h1>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-7">
              امروز یک روز عالی برای پیشرفت است! بزن بریم که موفقیت نزدیکه.
            </p>
          </div>

          {/* نشان اشتراک (اگه هست) */}
          <div className="shrink-0 self-center sm:self-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600 text-white shadow-lg shadow-[var(--griffin-gold)]/30">
              <Crown size={14} />
              <span className="text-xs font-black">اشتراک فعال</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== آمار سریع ==================== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
            >
              <div
                className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon size={16} className={stat.color} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <p
                className={`font-heading text-xl font-black mt-1 ${stat.color}`}
              >
                {stat.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* ==================== کارت‌های نقش‌محور ==================== */}
      <RoleDashboardCards />

      {/* ==================== دسترسی سریع ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="inline-flex items-center gap-2">
            <Flame size={14} className="text-[var(--griffin-gold)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
              Quick Actions
            </span>
          </div>
          <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white mt-1">
            دسترسی سریع
          </h2>
        </div>

        <div className="p-4 grid gap-3 sm:grid-cols-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => navigate(action.href)}
                className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-4 text-right transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-sm font-black text-gray-900 dark:text-white">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {action.desc}
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

      {/* ==================== وضعیت اشتراک ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="flex items-center gap-2">
            <CreditCard size={14} className="text-[var(--griffin-gold)]" />
            <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white">
              وضعیت اشتراک
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/subscriptions")}
            className="inline-flex items-center gap-1.5 text-[10px] font-black text-[var(--griffin-gold)] hover:underline"
          >
            مشاهده
            <ArrowLeft size={11} className="rotate-180" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
              <Crown size={22} />
            </div>
            <div className="flex-1">
              <p className="font-heading text-base font-black text-gray-900 dark:text-white">
                پلن طلایی
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                اعتبار تا ۱۵ آذر ۱۴۰۳ · ۴۵ روز باقی‌مانده
              </p>
            </div>
            <div className="text-left">
              <p className="font-heading text-2xl font-black text-[var(--griffin-gold)]">
                ۴۵
              </p>
              <p className="text-[9px] text-gray-500 dark:text-gray-400">روز</p>
            </div>
          </div>

          {/* نوار پیشرفت */}
          <div className="mt-4 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400"
              style={{ width: "75%" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;