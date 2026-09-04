import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Swords, Trophy, TrendingUp, Target, Clock3 } from "lucide-react";
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
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

    const primaryLeague =
      profile.leagues.find((league) => league.status === "active") ??
      [...profile.leagues].sort((a, b) => b.rating - a.rating)[0] ??
      null;

    return { totalMatches, wins, losses, draws, winRate, primaryLeague };
  }, [profile]);

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-white/20 bg-white/40 p-6 shadow-lg backdrop-blur-xl dark:bg-white/10">
        <div className="animate-pulse space-y-5">
          <div className="h-6 w-44 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-24 rounded-2xl bg-gray-200 dark:bg-white/10" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-20 rounded-2xl bg-gray-200 dark:bg-white/10" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!profile || !arenaStats) {
    return (
      <section className="rounded-[2rem] border border-white/20 bg-white/40 p-6 shadow-lg backdrop-blur-xl dark:bg-white/10">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[var(--griffin-gold)]">GRIFFIN ARENA</p>
            <h2 className="mt-2 text-2xl font-black dark:text-white">آماده یک رقابت هستی؟</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              وارد Arena شو و اولین نبردت را شروع کن.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/arena")}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--griffin-gold)] px-5 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:opacity-90"
          >
            ورود به Arena
            <ArrowLeft size={18} />
          </button>
        </div>
      </section>
    );
  }

  const { primaryLeague, totalMatches, wins, losses, draws, winRate } = arenaStats;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/40 p-6 shadow-lg backdrop-blur-xl dark:bg-white/10 sm:p-7">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-[var(--griffin-gold)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-48 w-48 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--griffin-gold)]/15 text-[var(--griffin-gold)]">
                <Swords size={23} />
              </div>
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-[var(--griffin-gold)]">GRIFFIN ARENA</p>
                <h2 className="mt-1 text-2xl font-black dark:text-white">نبردهای رقابتی شما</h2>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300">
              عملکردت را دنبال کن، Rating را بالا ببر و برای رسیدن به رتبه‌های بالاتر بجنگ.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/arena")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/30 bg-[var(--griffin-gold)]/10 px-4 py-2.5 text-sm font-bold text-[var(--griffin-gold)] transition hover:bg-[var(--griffin-gold)]/20"
          >
            ورود به Arena
            <ArrowLeft size={17} />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
          <div className="rounded-3xl border border-white/20 bg-white/30 p-5 dark:bg-black/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Rating فعلی</p>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-4xl font-black text-[var(--griffin-gold)]">
                    {primaryLeague?.rating ?? "—"}
                  </span>
                  <TrendingUp className="mb-1 text-[var(--griffin-gold)]" size={20} />
                </div>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]">
                <Trophy size={22} />
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold dark:text-white">
              {primaryLeague?.title ?? "هنوز لیگی ثبت نشده"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat icon={<Target size={17} />} label="Win Rate" value={`${winRate}%`} />
            <MiniStat icon={<Trophy size={17} />} label="برد" value={wins} />
            <MiniStat icon={<Swords size={17} />} label="Match" value={totalMatches} />
            <MiniStat icon={<Clock3 size={17} />} label="مساوی" value={draws} />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/25 p-5 dark:bg-black/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">آخرین نبرد</p>
            {latestMatch ? (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-bold dark:text-white">
                  {latestMatch.opponent
                    ? `${latestMatch.opponent.firstName} ${latestMatch.opponent.lastName}`
                    : "حریف ناشناس"}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{latestMatch.league.title}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    latestMatch.result === "win"
                      ? "bg-green-500/10 text-green-500"
                      : latestMatch.result === "loss"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-gray-500/10 text-gray-500"
                  }`}
                >
                  {latestMatch.result === "win" ? "پیروزی" : latestMatch.result === "loss" ? "شکست" : "مساوی"}
                </span>
                <span className={`text-sm font-bold ${latestMatch.ratingChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {latestMatch.ratingChange >= 0 ? "+" : ""}{latestMatch.ratingChange} Rating
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">هنوز هیچ نبردی انجام نداده‌ای.</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/arena/history")}
            className="shrink-0 text-sm font-bold text-[var(--griffin-gold)] transition hover:opacity-75"
          >
            مشاهده تاریخچه
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{losses} شکست</span>
          <span>•</span>
          <span>{draws} مساوی</span>
          <span>•</span>
          <span>{totalMatches} نبرد ثبت‌شده</span>
        </div>
      </div>
    </section>
  );
};

const MiniStat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/20 bg-white/30 p-4 dark:bg-black/10">
    <div className="flex items-center gap-2 text-[var(--griffin-gold)]">{icon}<span className="text-xs font-semibold">{label}</span></div>
    <p className="mt-3 text-2xl font-black dark:text-white">{value}</p>
  </div>
);

export default ArenaDashboardCard;
