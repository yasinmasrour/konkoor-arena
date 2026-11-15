import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CreditCard,
  Crown,
  Flame,
  Gift,
  LoaderCircle,
  Lock,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  getStudentHome,
  type StudentHomeData,
} from "../../../api/dashboardApi";
import { getMyAchievements } from "../../../api/achievementApi";
import RoleDashboardCards from "../RoleDashboardCards";
import SecurityRecoveryBanner from "./SecurityRecoveryBanner";
import AchievementBadge, {
  tierStyles,
} from "../../achievements/AchievementBadge";

// 🆕 فرمت اعداد فارسی
const toFa = (n: number) => n.toLocaleString("fa-IR");

// 🆕 فرمت تاریخ
const formatDate = (date: string) =>
  new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));

// ==================== Last Achievements Card ====================
interface AchievementSummary {
  id: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  title: string;
  icon: string;
  category: string;
  familyTitle: string;
}

const LastAchievementsCard = () => {
  const navigate = useNavigate();
  const [recent, setRecent] = useState<AchievementSummary[]>([]);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [totalTiers, setTotalTiers] = useState(0);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getMyAchievements();
        if (cancelled) return;

        const unlocked: AchievementSummary[] = [];
        let totalTiersCount = 0;
        let pointsCount = 0;

        for (const family of data.families) {
          totalTiersCount += family.tiers.length;
          for (const tier of family.tiers) {
            if (tier.unlocked) {
              pointsCount += tier.points;
              unlocked.push({
                id: tier.id,
                tier: tier.tier,
                title: tier.title,
                icon: family.icon,
                category: family.category,
                familyTitle: family.title,
                // @ts-expect-error - unlockedAt اضافه میشه
                unlockedAt: tier.unlockedAt,
              });
            }
          }
        }

        // مرتب‌سازی بر اساس تاریخ unlock (جدیدترین اول)
        unlocked.sort((a: any, b: any) => {
          const ta = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
          const tb = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
          return tb - ta;
        });

        setRecent(unlocked.slice(0, 4));
        setTotalUnlocked(unlocked.length);
        setTotalTiers(totalTiersCount);
        setPoints(pointsCount);
      } catch (err) {
        console.error("Failed to load achievements summary:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const progressPercent =
    totalTiers > 0 ? (totalUnlocked / totalTiers) * 100 : 0;

  return (
    <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03]">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200/70 dark:border-white/5">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-[var(--griffin-gold)]" />
          <h2 className="font-heading text-sm font-black text-gray-900 dark:text-white">
            دستاوردهای من
          </h2>
        </div>
        <button
          type="button"
          onClick={() => navigate("/achievements")}
          className="inline-flex items-center gap-1.5 text-[10px] font-black text-[var(--griffin-gold)] hover:underline"
        >
          مشاهده همه
          <ArrowLeft size={11} className="rotate-180" />
        </button>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <LoaderCircle
              size={20}
              className="text-[var(--griffin-gold)] animate-spin"
            />
          </div>
        ) : totalUnlocked === 0 ? (
          /* 🆕 بدون دستاورد */
          <div className="text-center py-6">
            <div className="relative inline-flex mb-3">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-40" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center">
                <Lock size={24} className="text-gray-400 dark:text-gray-600" />
              </div>
            </div>
            <p className="font-heading text-sm font-black text-gray-700 dark:text-gray-300 mb-1">
              هنوز دستاوردی نداری
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              با شرکت توی آزمون‌ها، اولین دستاوردت رو باز کن!
            </p>
            <button
              onClick={() => navigate("/dashboard?section=exams")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:-translate-y-0.5 transition-transform"
            >
              <Trophy size={14} />
              شروع آزمون
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center rounded-xl bg-[var(--griffin-gold)]/5 border border-[var(--griffin-gold)]/20 p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  امتیاز
                </p>
                <p className="font-heading text-lg font-black text-[var(--griffin-gold)] tabular-nums mt-0.5">
                  {toFa(points)}
                </p>
              </div>
              <div className="text-center rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  باز شده
                </p>
                <p className="font-heading text-lg font-black text-emerald-500 tabular-nums mt-0.5">
                  {toFa(totalUnlocked)}
                </p>
              </div>
              <div className="text-center rounded-xl bg-purple-500/5 border border-purple-500/20 p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  کل
                </p>
                <p className="font-heading text-lg font-black text-purple-500 tabular-nums mt-0.5">
                  {toFa(totalTiers)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400 transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Recent achievements */}
            {recent.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                  آخرین دستاوردها
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {recent.map((a) => (
                    <div
                      key={a.id}
                      className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                      title={`${a.familyTitle} - ${a.title}`}
                    >
                      <AchievementBadge
                        tier={a.tier}
                        icon={a.icon}
                        unlocked
                        size="sm"
                        showLock={false}
                      />
                      <p className="text-[9px] font-black text-gray-700 dark:text-gray-300 text-center line-clamp-2 leading-tight">
                        {a.title}
                      </p>
                      <p
                        className={`text-[8px] font-black ${
                          tierStyles[a.tier]?.labelColor ?? ""
                        }`}
                      >
                        {tierStyles[a.tier]?.label ?? ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

// ==================== Main DashboardHome ====================
const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState<StudentHomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const result = await getStudentHome();
        if (!cancelled) setData(result);
      } catch (err) {
        console.error("Failed to load dashboard home:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  // 🆕 کارت‌های آماری
  const stats = [
    {
      icon: Trophy,
      label: "Rating Arena",
      value: data ? toFa(data.stats.arenaRating) : "—",
      color: "text-[var(--griffin-gold)]",
      bg: "bg-[var(--griffin-gold)]/10",
    },
    {
      icon: Swords,
      label: "نبردها",
      value: data ? toFa(data.stats.arenaMatches) : "—",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: BookOpen,
      label: "آزمون‌ها",
      value: data ? toFa(data.stats.examsTaken) : "—",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      icon: Target,
      label: "پیشرفت",
      value: data ? `${toFa(data.stats.progress)}٪` : "—",
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
      icon: Trophy,
      label: "دستاوردها",
      desc: "جام‌های خودت رو ببین",
      href: "/achievements",
      color: "from-cyan-500 to-purple-600",
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
      <SecurityRecoveryBanner />

      {/* HERO */}
      <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/10 p-6 sm:p-8">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/10 blur-[60px] pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
          <div className="relative shrink-0 self-center sm:self-auto">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-50" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-3xl shadow-xl rotate-3">
              {user?.firstName?.charAt(0) || "?"}
            </div>
          </div>

          <div className="flex-1 text-center sm:text-right">
            <div className="inline-flex items-center gap-2 mb-2">
              <Zap size={12} className="text-[var(--griffin-gold)]" />
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

          {!loading && data?.subscription.hasActive && (
            <div className="shrink-0 self-center sm:self-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-600 text-white shadow-lg shadow-[var(--griffin-gold)]/30">
                <Crown size={14} />
                <span className="text-xs font-black">
                  {data.subscription.planTitle}
                </span>
              </div>
            </div>
          )}

          {!loading && data && !data.subscription.hasActive && (
            <div className="shrink-0 self-center sm:self-auto">
              <button
                onClick={() => navigate("/subscriptions")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] hover:bg-[var(--griffin-gold)]/20 transition-colors"
              >
                <Crown size={14} />
                <span className="text-xs font-black">خرید اشتراک</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* آمار */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 transition-transform duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40"
            >
              <div
                className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon size={16} className={stat.color} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
              {loading ? (
                <div className="mt-2 h-6 w-16 rounded-md bg-gray-200 dark:bg-white/10 animate-pulse" />
              ) : (
                <p
                  className={`font-heading text-xl font-black mt-1 tabular-nums ${stat.color}`}
                >
                  {stat.value}
                </p>
              )}
            </div>
          );
        })}
      </section>

      {/* کارت‌های نقش‌محور */}
      <RoleDashboardCards />

      {/* 🆕 دستاوردها */}
      <LastAchievementsCard />

      {/* دسترسی سریع */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03]">
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

        <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={() => navigate(action.href)}
                className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-[var(--griffin-gold)]/5 dark:hover:bg-white/[0.05] hover:border-[var(--griffin-gold)]/40 p-4 text-right transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110`}
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

      {/* وضعیت اشتراک */}
      <section className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03]">
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
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <LoaderCircle
                size={20}
                className="text-[var(--griffin-gold)] animate-spin"
              />
            </div>
          ) : !data?.subscription.hasActive ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
                <Crown size={24} className="text-gray-400" />
              </div>
              <p className="font-heading text-sm font-black text-gray-700 dark:text-gray-300 mb-1">
                هنوز اشتراکی نداری
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                برای دسترسی کامل به امکانات، یه پلن تهیه کن
              </p>
              <button
                onClick={() => navigate("/subscriptions")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 hover:-translate-y-0.5 transition-transform"
              >
                <Crown size={14} />
                مشاهده پلن‌ها
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                  <Crown size={22} />
                </div>
                <div className="flex-1">
                  <p className="font-heading text-base font-black text-gray-900 dark:text-white">
                    پلن {data.subscription.planTitle}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    اعتبار تا {formatDate(data.subscription.endDate!)} ·{" "}
                    {toFa(data.subscription.remainingDays)} روز باقی‌مانده
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-heading text-2xl font-black text-[var(--griffin-gold)] tabular-nums">
                    {toFa(data.subscription.remainingDays)}
                  </p>
                  <p className="text-[9px] text-gray-500 dark:text-gray-400">
                    روز
                  </p>
                </div>
              </div>

              <div className="mt-4 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-400 transition-all duration-1000"
                  style={{ width: `${data.subscription.progress}%` }}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;
