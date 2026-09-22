import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  Swords,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getArenaMatchHistory, getArenaProfile } from "../../api/arenaApi";
import type { ArenaHistoryItem, ArenaProfile } from "../../api/arenaApi";

const ArenaDashboardCard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ArenaProfile | null>(null);
  const [latestMatch, setLatestMatch] = useState<ArenaHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadArenaData = async () => {
      try {
        const [profileData, historyData] = await Promise.all([
          getArenaProfile(),
          getArenaMatchHistory(),
        ]);

        if (!mounted) return;

        setProfile(profileData);
        setLatestMatch(historyData.matches[0] ?? null);
      } catch (error) {
        console.error("GET DASHBOARD ARENA DATA ERROR:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadArenaData();

    return () => {
      mounted = false;
    };
  }, []);

  const arenaStats = useMemo(() => {
    if (!profile) return null;

    const { totalMatches, wins, losses, draws } = profile.statistics;
    const winRate =
      totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    const primaryLeague =
      profile.leagues.find((league) => league.status === "active") ??
      [...profile.leagues].sort((a, b) => b.rating - a.rating)[0] ??
      null;

    return { totalMatches, wins, losses, draws, winRate, primaryLeague };
  }, [profile]);

  // ==================== Loading ====================
  if (loading) {
    return (
      <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-6 shadow-lg backdrop-blur-sm">
        <div className="animate-pulse space-y-5">
          <div className="h-6 w-44 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-24 rounded-2xl bg-gray-200 dark:bg-white/10" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-20 rounded-2xl bg-gray-200 dark:bg-white/10"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ==================== بدون پروفایل ====================
  if (!profile || !arenaStats) {
    return (
      <section className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-6 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
              Griffin Arena
            </p>
            <h2 className="mt-2 font-heading text-xl font-black text-gray-900 dark:text-white">
              آماده یک رقابت هستی؟
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              وارد Arena شو و اولین نبردت را شروع کن.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/arena")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/30 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Swords size={16} />
            ورود به Arena
            <ArrowLeft size={14} className="rotate-180" />
          </button>
        </div>
      </section>
    );
  }

  const { primaryLeague, totalMatches, wins, losses, draws, winRate } =
    arenaStats;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-6 shadow-lg backdrop-blur-sm sm:p-7">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[var(--griffin-gold)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-6">
        {/* ==================== هدر ==================== */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)]">
                <Swords size={23} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Griffin Arena
                </p>
                <h2 className="mt-1 font-heading text-xl font-black text-gray-900 dark:text-white">
                  نبردهای رقابتی شما
                </h2>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
              عملکردت را دنبال کن، Rating را بالا ببر و برای رسیدن به رتبه‌های
              بالاتر بجنگ.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/arena")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/30 bg-[var(--griffin-gold)]/10 px-4 py-2.5 text-sm font-black text-[var(--griffin-gold)] transition hover:bg-[var(--griffin-gold)]/20"
          >
            ورود به Arena
            <ArrowLeft size={15} className="rotate-180" />
          </button>
        </div>

        {/* ==================== Rating + آمار ==================== */}
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
          {/* Rating */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Rating فعلی
                </p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="font-heading text-4xl font-black text-[var(--griffin-gold)] tabular-nums">
                    {(primaryLeague?.rating ?? 0).toLocaleString("fa-IR")}
                  </span>
                  <TrendingUp
                    className="mb-1 text-[var(--griffin-gold)]"
                    size={20}
                  />
                </div>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]">
                <Trophy size={22} />
              </div>
            </div>
            <p className="mt-4 font-heading text-sm font-black text-gray-900 dark:text-white">
              {primaryLeague?.title ?? "هنوز لیگی ثبت نشده"}
            </p>
          </div>

          {/* آمار */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat
              icon={<Target size={15} />}
              label="Win Rate"
              value={`${winRate.toLocaleString("fa-IR")}٪`}
            />
            <MiniStat
              icon={<Trophy size={15} />}
              label="برد"
              value={wins.toLocaleString("fa-IR")}
            />
            <MiniStat
              icon={<Swords size={15} />}
              label="نبرد"
              value={totalMatches.toLocaleString("fa-IR")}
            />
            <MiniStat
              icon={<Clock3 size={15} />}
              label="مساوی"
              value={draws.toLocaleString("fa-IR")}
            />
          </div>
        </div>

        {/* ==================== آخرین نبرد ==================== */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              آخرین نبرد
            </p>
            {latestMatch ? (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="font-heading font-black text-gray-900 dark:text-white">
                  {latestMatch.opponent
                    ? `${latestMatch.opponent.firstName} ${latestMatch.opponent.lastName}`
                    : "حریف ناشناس"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {latestMatch.league.title}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                    latestMatch.result === "win"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : latestMatch.result === "loss"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {latestMatch.result === "win"
                    ? "پیروزی"
                    : latestMatch.result === "loss"
                      ? "شکست"
                      : "مساوی"}
                </span>
                <span
                  className={`text-xs font-black tabular-nums ${
                    latestMatch.ratingChange >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {latestMatch.ratingChange >= 0 ? "+" : ""}
                  {latestMatch.ratingChange.toLocaleString("fa-IR")} Rating
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                هنوز هیچ نبردی انجام نداده‌ای.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/arena/history")}
            className="shrink-0 inline-flex items-center gap-1.5 text-xs font-black text-[var(--griffin-gold)] transition hover:underline underline-offset-4"
          >
            مشاهده تاریخچه
            <ArrowLeft size={12} className="rotate-180" />
          </button>
        </div>

        {/* ==================== خلاصه ==================== */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-500 dark:text-gray-400">
          <span>{losses.toLocaleString("fa-IR")} شکست</span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span>{draws.toLocaleString("fa-IR")} مساوی</span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span>{totalMatches.toLocaleString("fa-IR")} نبرد ثبت‌شده</span>
        </div>
      </div>
    </section>
  );
};

// ==================== MiniStat ====================
const MiniStat = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] p-4">
    <div className="flex items-center gap-2 text-[var(--griffin-gold)]">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label}
      </span>
    </div>
    <p className="mt-3 font-heading text-2xl font-black text-gray-900 dark:text-white tabular-nums">
      {value}
    </p>
  </div>
);

export default ArenaDashboardCard;
