import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Crown, Medal, Trophy, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getArenaLeagueRanking, getArenaPlayerRanking, type ArenaRankingResponse, type ArenaPlayerRankingResponse } from "../../api/arenaApi";

const ArenaRanking = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ArenaRankingResponse | null>(null);
  const [me, setMe] = useState<ArenaPlayerRankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!leagueId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([getArenaLeagueRanking(leagueId), getArenaPlayerRanking(leagueId)])
      .then(([ranking, player]) => { setData(ranking); setMe(player); })
      .catch(() => setError("دریافت جدول رتبه‌بندی با مشکل مواجه شد."))
      .finally(() => setLoading(false));
  }, [leagueId]);

  const topThree = useMemo(() => data?.rankings.slice(0, 3) ?? [], [data]);

  return (
    <main className="arena-battle min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div className="arena-orb arena-orb-one" /><div className="arena-orb arena-orb-two" />
      <div className="relative mx-auto max-w-6xl">
        <button onClick={() => navigate("/arena/profile")} className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-4 py-2 text-sm font-bold text-slate-600 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300"><ArrowLeft size={16}/> پروفایل Arena</button>
        <section className="arena-panel rounded-[2rem] p-5 sm:p-10">
          {loading ? <div className="py-20 text-center text-sm font-bold text-slate-500">در حال دریافت جدول...</div> : error ? <div className="py-20 text-center text-red-500">{error}</div> : data && <>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--griffin-gold)]/10 text-[var(--griffin-gold)]"><Trophy size={30}/></div>
              <p className="mt-5 text-xs font-black tracking-[.22em] text-[var(--griffin-gold)]">LEADERBOARD</p>
              <h1 className="mt-2 text-3xl font-black">{data.league.title}</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{data.league.lesson} · جدول رقابت بازیکنان</p>
            </div>

            {me && <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Summary icon={<Crown size={19}/>} label="رتبه فعلی" value={`#${me.ranking.rank}`} />
              <Summary icon={<Trophy size={19}/>} label="Rating" value={me.ranking.rating} />
              <Summary icon={<Users size={19}/>} label="بازیکنان جدول" value={data.rankings.length} />
            </div>}

            {topThree.length > 0 && <div className="mt-8 grid gap-3 md:grid-cols-3">
              {topThree.map((player) => <div key={player.userId} className={`relative overflow-hidden rounded-3xl border p-5 ${player.rank === 1 ? "border-[var(--griffin-gold)]/40 bg-[var(--griffin-gold)]/8" : "border-slate-200/70 bg-white/45 dark:border-white/10 dark:bg-white/[.03]"}`}>
                <div className="flex items-center justify-between"><span className="text-xs font-black text-slate-400">RANK #{player.rank}</span>{player.rank === 1 ? <Crown className="text-[var(--griffin-gold)]"/> : <Medal className="text-slate-400"/>}</div>
                <p className="mt-5 text-lg font-black">{player.firstName} {player.lastName}</p>
                <div className="mt-3 flex items-end justify-between"><span className="text-xs text-slate-400">{player.wins} برد · {player.matchesPlayed} نبرد</span><strong className="text-2xl text-[var(--griffin-gold)]">{player.rating}</strong></div>
              </div>)}
            </div>}

            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200/70 dark:border-white/10">
              <div className="grid grid-cols-[52px_1fr_82px_72px] gap-3 bg-slate-50/80 px-4 py-3 text-xs font-black text-slate-400 dark:bg-white/[.035] sm:grid-cols-[70px_1fr_110px_100px_100px]"><span>رتبه</span><span>بازیکن</span><span>Rating</span><span className="hidden sm:block">برد</span><span className="hidden sm:block">نبرد</span></div>
              {data.rankings.map((player) => <div key={player.userId} className={`grid grid-cols-[52px_1fr_82px_72px] items-center gap-3 border-t border-slate-200/60 px-4 py-4 dark:border-white/10 sm:grid-cols-[70px_1fr_110px_100px_100px] ${me?.ranking.userId === player.userId ? "bg-[var(--griffin-gold)]/8" : ""}`}>
                <div className="flex items-center justify-center">{player.rank === 1 ? <Crown className="text-[var(--griffin-gold)]" size={20}/> : player.rank === 2 ? <Medal className="text-slate-400" size={20}/> : player.rank === 3 ? <Medal className="text-amber-600/70" size={20}/> : <span className="text-sm font-black text-slate-400">#{player.rank}</span>}</div>
                <div><p className="font-black">{player.firstName} {player.lastName}{me?.ranking.userId === player.userId && <span className="mr-2 rounded-full bg-[var(--griffin-gold)]/10 px-2 py-1 text-[10px] text-[var(--griffin-gold)]">شما</span>}</p><p className="mt-1 text-[11px] text-slate-400">{player.wins} برد · {player.losses} باخت · {player.draws} مساوی</p></div>
                <p className="font-black text-[var(--griffin-gold)]">{player.rating}</p>
                <p className="font-black">{player.wins}</p>
                <p className="hidden font-bold text-slate-500 dark:text-slate-400 sm:block">{player.matchesPlayed}</p>
              </div>)}
            </div>
          </>}
        </section>
      </div>
    </main>
  );
};

const Summary = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => <div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 dark:border-white/10 dark:bg-white/[.035]"><div className="text-[var(--griffin-gold)]">{icon}</div><p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;

export default ArenaRanking;
