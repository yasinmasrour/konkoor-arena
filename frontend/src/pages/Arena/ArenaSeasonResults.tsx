import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Crown, Medal, Trophy, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getArenaLeagueStandings, type ArenaLeagueStandingsResponse } from "../../api/arenaApi";

const ArenaSeasonResults = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ArenaLeagueStandingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!leagueId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getArenaLeagueStandings(leagueId);
        if (!cancelled) setData(result);
      } catch (requestError: unknown) {
        if (cancelled) return;
        const message = requestError instanceof Error ? requestError.message : "";
        console.error("GET ARENA SEASON RESULTS ERROR:", requestError);
        setError(message || "دریافت نتایج فصل با مشکل مواجه شد.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [leagueId]);

  const podium = useMemo(() => data?.standings.slice(0, 3) ?? [], [data]);

  return (
    <main className="arena-battle min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div className="arena-orb arena-orb-one" />
      <div className="arena-orb arena-orb-two" />
      <div className="relative mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/arena")}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-4 py-2 text-sm font-bold text-slate-600 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        >
          <ArrowLeft size={16} />
          بازگشت به Arena
        </button>

        <section className="arena-panel rounded-[2rem] p-5 sm:p-10">
          {loading ? (
            <div className="py-20 text-center text-sm font-bold text-slate-500">در حال دریافت نتایج فصل...</div>
          ) : error ? (
            <div className="py-20 text-center text-sm font-bold text-red-500">{error}</div>
          ) : data ? (
            <>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]">
                  <Trophy size={30} />
                </div>
                <p className="mt-5 text-xs font-black tracking-[.22em] text-[var(--griffin-gold)]">SEASON RESULTS</p>
                <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{data.league.title}</h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{data.league.lesson} · جدول نهایی فصل</p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <Summary icon={<Trophy size={19} />} label="شرکت‌کنندگان" value={data.standings.length} />
                <Summary icon={<Crown size={19} />} label="قهرمان فصل" value={data.standings[0] ? `${data.standings[0].firstName} ${data.standings[0].lastName}` : "—"} />
                <Summary icon={<Users size={19} />} label="وضعیت" value="پایان‌یافته" />
              </div>

              {podium.length > 0 && (
                <div className="mt-8 grid gap-3 md:grid-cols-3">
                  {podium.map((player) => (
                    <div
                      key={player.userId}
                      className={`relative overflow-hidden rounded-3xl border p-5 ${
                        player.rank === 1
                          ? "border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/8"
                          : "border-slate-200/70 bg-white/45 dark:border-white/10 dark:bg-white/[.03]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400">RANK #{player.rank}</span>
                        {player.rank === 1 ? <Crown className="text-[var(--griffin-gold)]" /> : <Medal className="text-slate-400" />}
                      </div>
                      <p className="mt-5 text-lg font-black text-slate-900 dark:text-white">{player.firstName} {player.lastName}</p>
                      <div className="mt-3 flex items-end justify-between">
                        <span className="text-xs text-slate-400">{player.wins} برد · {player.losses} باخت</span>
                        <strong className="text-2xl text-[var(--griffin-gold)]">{player.finalRating}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/10">
                <div className="grid grid-cols-[58px_1fr_92px_72px] gap-3 bg-slate-50/80 px-4 py-3 text-xs font-black text-slate-400 dark:bg-white/[.035] sm:grid-cols-[72px_1fr_110px_90px_90px]">
                  <span>رتبه</span><span>بازیکن</span><span>Rating نهایی</span><span className="hidden sm:block">برد</span><span className="hidden sm:block">نبرد</span>
                </div>
                {data.standings.map((player) => (
                  <div key={player.userId} className="grid grid-cols-[58px_1fr_92px_72px] items-center gap-3 border-t border-slate-200/60 px-4 py-4 dark:border-white/10 sm:grid-cols-[72px_1fr_110px_90px_90px]">
                    <div className="flex items-center justify-center">
                      {player.rank === 1 ? <Crown className="text-[var(--griffin-gold)]" size={20} /> : player.rank === 2 || player.rank === 3 ? <Medal className="text-slate-400" size={20} /> : <span className="text-sm font-black text-slate-400">#{player.rank}</span>}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">{player.firstName} {player.lastName}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{player.wins} برد · {player.losses} باخت · {player.draws} مساوی</p>
                    </div>
                    <p className="font-black text-[var(--griffin-gold)]">{player.finalRating}</p>
                    <p className="font-black">{player.wins}</p>
                    <p className="hidden font-bold text-slate-500 dark:text-slate-400 sm:block">{player.wins + player.losses + player.draws}</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
};

const Summary = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 dark:border-white/10 dark:bg-white/[.035]">
    <div className="text-[var(--griffin-gold)]">{icon}</div>
    <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 truncate text-2xl font-black text-slate-900 dark:text-white">{value}</p>
  </div>
);

export default ArenaSeasonResults;
