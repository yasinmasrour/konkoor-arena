import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BrainCircuit,
  Clock3,
  LoaderCircle,
  Search,
  Shield,
  Swords,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { joinArenaQueue, leaveArenaQueue } from "../../api/arenaApi";
import { socket } from "../../socket/socket";

type MatchmakingLocationState = {
  league?: {
    title?: string;
    lesson?: string;
  };
};

const Matchmaking = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as MatchmakingLocationState | null;
  const leagueTitle = locationState?.league?.title ?? "لیگ کنکورآرنا";
  const lesson = locationState?.league?.lesson ?? "رقابت سرعتی و دانش";

  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const handleMatchFound = (data: { matchId: string; leagueId: string }) => {
      if (data.leagueId === leagueId) {
        navigate(`/arena/match/${data.matchId}`);
      }
    };

    socket.on("arena:match-found", handleMatchFound);

    return () => {
      socket.off("arena:match-found", handleMatchFound);
    };
  }, [leagueId, navigate]);

  useEffect(() => {
    if (!searching) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsedSeconds(0);
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [searching]);

  const elapsedLabel = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, "0");
    const seconds = (elapsedSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [elapsedSeconds]);

  const startMatchmaking = async () => {
    if (!leagueId) return;

    try {
      setError("");
      setSearching(true);

      const result = await joinArenaQueue(leagueId);

      if (result.matched && result.match) {
        navigate(`/arena/match/${result.match.id}`);
      }
    } catch (requestError: unknown) {
      console.error("Matchmaking error:", requestError);
      setSearching(false);
      setError(requestError instanceof Error ? requestError.message : "خطایی در پیدا کردن حریف رخ داد.");
    }
  };

  const cancelMatchmaking = async () => {
    if (!leagueId) return;

    try {
      await leaveArenaQueue(leagueId);
      setSearching(false);
    } catch (requestError) {
      console.error("Cancel matchmaking error:", requestError);
    }
  };

  return (
    <main className="arena-battle min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div className="arena-orb arena-orb-one" />
      <div className="arena-orb arena-orb-two" />

      <div className="relative mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/arena")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-4 py-2 text-sm font-medium text-slate-600 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        >
          بازگشت به لیگ‌ها
          <ArrowLeft size={16} />
        </button>

        <section className="arena-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-12">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/70 to-transparent" />

          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--griffin-gold)]/20 bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)] shadow-lg shadow-[var(--griffin-gold)]/10">
              <Swords size={30} />
            </div>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--griffin-gold)]/20 bg-[var(--griffin-gold)]/8 px-3 py-1.5 text-xs font-bold tracking-wide text-[var(--griffin-gold)]">
              <Zap size={13} />
              GRIFFIN ARENA
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {searching ? "در جستجوی حریف مناسب" : "آماده‌ای وارد نبرد شوی؟"}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
              {searching
                ? "سیستم به‌صورت خودکار بازیکنی با سطح رقابتی نزدیک به تو پیدا می‌کند. فقط آماده باش؛ نبرد به‌محض پیدا شدن حریف شروع می‌شود."
                : "حریف را انتخاب نمی‌کنی؛ سیستم به‌صورت خودکار بهترین گزینه موجود را برای یک رقابت سریع و منصفانه پیدا می‌کند."}
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <div className="rounded-3xl border border-slate-200/80 bg-white/55 p-5 text-right backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]">
                  <BrainCircuit size={22} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">لیگ انتخاب‌شده</p>
                  <h2 className="mt-1 font-bold text-slate-900 dark:text-white">{leagueTitle}</h2>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-4 dark:border-white/10">
                <span className="text-sm text-slate-500 dark:text-slate-400">موضوع</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{lesson}</span>
              </div>
            </div>

            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[var(--griffin-gold)]/30 bg-[var(--griffin-gold)]/10 text-lg font-black text-[var(--griffin-gold)] shadow-xl shadow-[var(--griffin-gold)]/10">
              <div className="absolute inset-0 animate-ping rounded-full border border-[var(--griffin-gold)]/20" />
              VS
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/55 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
                  <Users size={22} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-400">حریف</p>
                  <h2 className="mt-1 font-bold text-slate-900 dark:text-white">
                    {searching ? "در حال جستجو..." : "بازیکن تصادفی"}
                  </h2>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-4 dark:border-white/10">
                <span className="text-sm text-slate-500 dark:text-slate-400">روش انتخاب</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Matchmaking خودکار</span>
              </div>
            </div>
          </div>

          {searching ? (
            <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-[var(--griffin-gold)]/20 bg-[var(--griffin-gold)]/[0.055] p-5 sm:p-6">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-4 text-right">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--griffin-gold)] text-white shadow-lg shadow-[var(--griffin-gold)]/20">
                    <LoaderCircle className="animate-spin" size={23} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">صف نبرد فعال است</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">به‌محض پیدا شدن حریف وارد Match می‌شوی.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-2.5 font-mono text-sm font-bold text-slate-700 dark:bg-white/5 dark:text-slate-200">
                  <Clock3 size={16} />
                  {elapsedLabel}
                </div>
              </div>

              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                <div className="arena-search-progress h-full w-1/3 rounded-full bg-[var(--griffin-gold)]" />
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/70 bg-white/45 p-4 text-center dark:border-white/10 dark:bg-white/[0.025]">
                <Shield className="mx-auto text-[var(--griffin-gold)]" size={20} />
                <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">۳ Life</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/45 p-4 text-center dark:border-white/10 dark:bg-white/[0.025]">
                <Trophy className="mx-auto text-[var(--griffin-gold)]" size={20} />
                <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">۵ سؤال</p>
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/45 p-4 text-center dark:border-white/10 dark:bg-white/[0.025]">
                <Clock3 className="mx-auto text-[var(--griffin-gold)]" size={20} />
                <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">رقابت سریع</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3">
            {!searching ? (
              <button
                type="button"
                onClick={startMatchmaking}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--griffin-gold)] px-6 py-4 font-bold text-white shadow-xl shadow-[var(--griffin-gold)]/20 transition hover:-translate-y-0.5 hover:opacity-95"
              >
                <Search size={20} className="transition-transform group-hover:scale-110" />
                پیدا کردن حریف
              </button>
            ) : (
              <button
                type="button"
                onClick={cancelMatchmaking}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-6 py-4 font-bold text-slate-700 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <X size={19} />
                لغو جستجو
              </button>
            )}
          </div>
        </section>

        <p className="mt-5 text-center text-xs leading-6 text-slate-400 dark:text-slate-500">
          سیستم Matchmaking حریف را بر اساس صف فعال انتخاب می‌کند؛ انتخاب دستی حریف وجود ندارد.
        </p>
      </div>
    </main>
  );
};

export default Matchmaking;
