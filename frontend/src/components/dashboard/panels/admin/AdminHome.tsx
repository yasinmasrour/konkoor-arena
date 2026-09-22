import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  BookOpen,
  ClipboardList,
  Compass,
  Crown,
  DollarSign,
  FileCheck2,
  FileQuestion,
  Flame,
  LoaderCircle,
  MessageSquare,
  Receipt,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axios";

interface GlobalStats {
  users: {
    total: number;
    verified: number;
    newLast7Days: number;
    newLast30Days: number;
    byRole: Record<string, number>;
  };
  questions: { total: number; published: number };
  exams: { total: number; attempts: number };
  subscriptions: { active: number };
  revenue: { total: number; last30Days: number };
  wallet: { totalBalance: number };
  arena: { totalMatches: number };
}

const formatPrice = (amountInRial: number) => {
  const toman = Math.floor(amountInRial / 10);
  return new Intl.NumberFormat("fa-IR").format(toman);
};

const AdminHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await api.get("/admin/stats");
        if (!cancelled) setStats(response.data);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
        if (!cancelled) setError("دریافت آمار سیستم انجام نشد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <LoaderCircle size={24} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت آمار سیستم...
          </p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
        <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
        <p className="text-sm font-bold text-rose-500 dark:text-rose-400">
          {error || "آمار پیدا نشد"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ==================== HERO ==================== */}
      <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-transparent to-[var(--griffin-gold)]/15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-purple-600/25 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="relative shrink-0 self-center lg:self-auto">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-3xl opacity-70 animate-pulse" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/20">
              <Shield size={36} strokeWidth={2.3} />
            </div>
            <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white border-2 border-[#080B12] shadow-lg">
              <Sparkles size={14} />
            </span>
          </div>

          <div className="flex-1 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 mb-2">
              <Zap
                size={12}
                className="text-[var(--griffin-gold)] animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Admin Dashboard
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
              خوش آمدی، مدیر!
            </h1>

            <p className="mt-2 text-sm text-gray-400 leading-7">
              نمای کلی سیستم و مدیریت آکادمی گریفین
            </p>
          </div>
        </div>
      </section>

      {/* ==================== ۴ کارت اصلی ==================== */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            icon: Users,
            label: "کل کاربران",
            value: stats.users.total,
            sub: `${stats.users.newLast7Days} جدید این هفته`,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            icon: DollarSign,
            label: "کل درآمد",
            value: `${formatPrice(stats.revenue.total)} ت`,
            sub: `${formatPrice(stats.revenue.last30Days)} ت این ماه`,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            icon: FileQuestion,
            label: "بانک سؤال",
            value: stats.questions.total,
            sub: `${stats.questions.published} منتشرشده`,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
          {
            icon: Wallet,
            label: "موجودی کاربران",
            value: `${formatPrice(stats.wallet.totalBalance)} ت`,
            sub: "کل کیف پول‌ها",
            color: "text-[var(--griffin-gold)]",
            bg: "bg-[var(--griffin-gold)]/10",
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
              >
                <Icon size={18} className={stat.color} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              <p
                className={`font-heading text-xl font-black mt-1 tabular-nums ${stat.color}`}
              >
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString("fa-IR")
                  : stat.value}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                {stat.sub}
              </p>
            </div>
          );
        })}
      </section>

      {/* ==================== دسترسی سریع ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
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

        <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            {
              icon: Banknote,
              label: "درخواست‌های برداشت",
              desc: "بررسی و تایید",
              href: "/admin/withdraw-requests",
              color: "from-amber-500 to-amber-700",
            },
            {
              icon: FileCheck2,
              label: "بررسی سؤال‌ها",
              desc: "صف بررسی",
              href: "/question-review",
              color: "from-purple-500 to-purple-700",
            },
            {
              icon: BookOpen,
              label: "مدیریت دفترچه‌ها",
              desc: "ساخت و ویرایش",
              href: "/booklets",
              color: "from-blue-500 to-blue-700",
            },
            {
              icon: ClipboardList,
              label: "مدیریت آزمون‌ها",
              desc: "ساخت و مدیریت",
              href: "/exam-builder",
              color: "from-[var(--griffin-gold)] to-amber-700",
            },
            {
              icon: MessageSquare,
              label: "مدیریت نظرات",
              desc: "بررسی و تایید",
              href: "/admin/comments",
              color: "from-emerald-500 to-emerald-700",
            },
            {
              icon: Compass,
              label: "برنامه‌های راهبردی",
              desc: "ساخت و انتشار",
              href: "/admin/strategy-plans",
              color: "from-emerald-500 to-emerald-700",
            },
            {
              icon: BookOpen,
              label: "مدیریت وبلاگ",
              desc: "مقالات و کامنتها",
              href: "/admin/blog",
              color: "from-purple-500 to-purple-700",
            },
            {
              icon: Target,
              label: "برنامه‌های مطالعاتی",
              desc: "دانش‌آموزان و برنامه‌ها",
              href: "/dashboard/counselor/students",
              color: "from-rose-500 to-rose-700",
            },
            {
              icon: Crown,
              label: "پلن‌های اشتراک",
              desc: "مدیریت امکانات",
              href: "/admin/subscription-plans",
              color: "from-[var(--griffin-gold)] to-amber-700",
            },
          ].map((action, i) => {
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

      {/* ==================== توزیع کاربران ==================== */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm">
        <div className="p-5 border-b border-gray-200/70 dark:border-white/5">
          <div className="inline-flex items-center gap-2">
            <Users size={13} className="text-[var(--griffin-gold)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
              Users Distribution
            </span>
          </div>
          <h2 className="font-heading text-base font-black text-gray-900 dark:text-white mt-1">
            توزیع کاربران
          </h2>
        </div>

        <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Shield,
              label: "مدیران",
              value: stats.users.byRole.ADMIN || 0,
              color: "text-red-500",
              bg: "bg-red-500/10",
            },
            {
              icon: FileQuestion,
              label: "طراحان سؤال",
              value: stats.users.byRole.QUESTION_DESIGNER || 0,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
            {
              icon: UserCheck,
              label: "مشاوران",
              value: stats.users.byRole.COUNSELOR || 0,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              icon: Users,
              label: "دانش‌آموزان",
              value: stats.users.byRole.STUDENT || 0,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
            },
          ].map((role, i) => {
            const Icon = role.icon;
            return (
              <div
                key={i}
                className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg ${role.bg} flex items-center justify-center text-white`}
                  >
                    <Icon size={16} className={role.color} />
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {stats.users.total > 0
                      ? `${Math.round((role.value / stats.users.total) * 100)}٪`
                      : "0٪"}
                  </span>
                </div>
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  {role.label}
                </p>
                <p
                  className={`font-heading text-2xl font-black mt-1 tabular-nums ${role.color}`}
                >
                  {role.value.toLocaleString("fa-IR")}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== آمار تفصیلی ==================== */}
      <section className="grid gap-3 md:grid-cols-2">
        {[
          {
            icon: Receipt,
            label: "آزمون‌ها",
            items: [
              { label: "کل آزمون‌ها", value: stats.exams.total },
              { label: "تلاش‌ها", value: stats.exams.attempts },
            ],
          },
          {
            icon: Crown,
            label: "اشتراک‌ها",
            items: [
              { label: "فعال", value: stats.subscriptions.active },
              { label: "کاربران تاییدشده", value: stats.users.verified },
            ],
          },
          {
            icon: Trophy,
            label: "آرنا",
            items: [{ label: "کل نبردها", value: stats.arena.totalMatches }],
          },
          {
            icon: TrendingUp,
            label: "آمار ۳۰ روز",
            items: [
              { label: "کاربران جدید", value: stats.users.newLast30Days },
              {
                label: "درآمد ماه",
                value: `${formatPrice(stats.revenue.last30Days)} ت`,
              },
            ],
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden"
            >
              <div className="flex items-center gap-3 p-4 border-b border-gray-200/70 dark:border-white/5">
                <div className="w-9 h-9 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)]">
                  <Icon size={15} />
                </div>
                <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white">
                  {card.label}
                </h3>
              </div>
              <div className="p-4 space-y-2">
                {card.items.map((item, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.label}
                    </span>
                    <span className="font-heading text-sm font-black text-gray-900 dark:text-white tabular-nums">
                      {typeof item.value === "number"
                        ? item.value.toLocaleString("fa-IR")
                        : item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default AdminHome;
