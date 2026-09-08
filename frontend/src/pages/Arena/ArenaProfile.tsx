import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BarChart3, Crown, Swords, Target, Trophy, TrendingDown, TrendingUp, Flame, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getArenaProfile, getArenaRatingHistory, getArenaMatchHistory, type ArenaProfile as ArenaProfileData, type ArenaRatingHistoryItem, type ArenaHistoryItem } from "../../api/arenaApi";

const ArenaProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ArenaProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingHistory, setRatingHistory] = useState<ArenaRatingHistoryItem[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [historyLoading, setHistoryLoading] = useState(true);
  const [matchHistory, setMatchHistory] = useState<ArenaHistoryItem[]>([]);
  const [matchHistoryLoading, setMatchHistoryLoading] = useState(true);

  useEffect(() => {
    getArenaProfile().then((data) => { setProfile(data); setSelectedLeague(data.leagues[0]?.leagueId ?? ""); }).catch(() => setError("دریافت پروفایل Arena با مشکل مواجه شد.")).finally(() => setLoading(false));
  }, []);

  const winRate = useMemo(() => {
    if (!profile?.statistics.totalMatches) return 0;
    return Math.round((profile.statistics.wins / profile.statistics.totalMatches) * 100);
  }, [profile]);

  useEffect(() => {
    getArenaMatchHistory().then((data) => setMatchHistory(data.matches)).catch(() => setMatchHistory([])).finally(() => setMatchHistoryLoading(false));
  }, []);

  useEffect(() => {
    if (!profile || !selectedLeague) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRatingHistory([]);
       
      setHistoryLoading(false);
      return;
    }
     
    setHistoryLoading(true);
    getArenaRatingHistory(selectedLeague).then((data) => setRatingHistory(data.history)).catch(() => setRatingHistory([])).finally(() => setHistoryLoading(false));
  }, [profile, selectedLeague]);

  const chart = useMemo(() => {
    if (!ratingHistory.length) return null;
    const values = [ratingHistory[0].oldRating, ...ratingHistory.map((item) => item.newRating)];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = Math.max(max - min, 20);
    const width = 760;
    const height = 220;
    const points = values.map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - ((value - (min - spread * 0.12)) / (spread * 1.24)) * height;
      return { x, y, value };
    });
    return { points, min, max, latest: values[values.length - 1] };
  }, [ratingHistory]);

  const progression = useMemo(() => {
    const leagueMatches = matchHistory
      .filter((item) => item.league.id === selectedLeague)
      .sort((a, b) => new Date(a.playedAt ?? 0).getTime() - new Date(b.playedAt ?? 0).getTime());
    const recent = leagueMatches.slice(-5);
    const wins = leagueMatches.filter((item) => item.result === "win").length;
    const losses = leagueMatches.filter((item) => item.result === "loss").length;
    const draws = leagueMatches.filter((item) => item.result === "draw").length;
    const streak = [...leagueMatches].reverse().reduce((count, item, index, arr) => {
      if (index === 0) return 1;
      return item.result === arr[index - 1].result ? count + 1 : count;
    }, 0);
    const currentStreak = leagueMatches.length ? leagueMatches[leagueMatches.length - 1].result : null;
    const netRating = ratingHistory.length ? ratingHistory[ratingHistory.length - 1].newRating - ratingHistory[0].oldRating : 0;
    return { leagueMatches, recent, wins, losses, draws, streak, currentStreak, netRating };
  }, [matchHistory, selectedLeague, ratingHistory]);

  return (
    <main className="arena-battle min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div className="arena-orb arena-orb-one" /><div className="arena-orb arena-orb-two" />
      <div className="relative mx-auto max-w-6xl">
        <button onClick={() => navigate("/arena")} className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-4 py-2 text-sm font-bold text-slate-600 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-slate-300"><ArrowLeft size={16}/> بازگشت به Arena</button>
        <section className="arena-panel overflow-hidden rounded-[2rem] p-6 sm:p-10">
          {loading ? <div className="py-20 text-center font-bold text-slate-500">در حال دریافت پروفایل...</div> : error ? <div className="py-20 text-center text-red-500">{error}</div> : profile && <>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--griffin-gold)]/12 text-2xl font-black text-[var(--griffin-gold)]">{profile.user.firstName?.[0] ?? "G"}</div>
                <div><p className="text-xs font-black tracking-[.22em] text-[var(--griffin-gold)]">GRIFFIN ARENA</p><h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{profile.user.firstName} {profile.user.lastName}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">پروفایل رقابتی و سابقه نبردها</p></div>
              </div>
              <div className="flex gap-3"><button onClick={() => navigate("/arena/history")} className="rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm font-bold dark:border-white/10 dark:bg-white/5">تاریخچه نبردها</button><button onClick={() => navigate("/arena")} className="rounded-xl bg-[var(--griffin-gold)] px-4 py-3 text-sm font-bold text-white">نبرد جدید</button></div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat icon={<Swords/>} label="کل نبردها" value={profile.statistics.totalMatches}/><Stat icon={<Crown/>} label="پیروزی" value={profile.statistics.wins}/><Stat icon={<Target/>} label="نرخ برد" value={`${winRate}%`}/><Stat icon={<BarChart3/>} label="مساوی" value={profile.statistics.draws}/>
            </div>
            <div className="mt-10 flex items-center justify-between"><div><h2 className="text-xl font-black text-slate-900 dark:text-white">Rating لیگ‌ها</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">رتبه و عملکردت را در هر لیگ ببین.</p></div><Trophy className="text-[var(--griffin-gold)]"/></div>
            {profile.leagues.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-white/10">هنوز در هیچ لیگی Rating ثبت نشده است.</div> : <div className="mt-5 grid gap-4 md:grid-cols-2">{profile.leagues.map((league) => <button key={league.leagueId} onClick={() => navigate(`/arena/ranking/${league.leagueId}`)} className="group rounded-3xl border border-slate-200/80 bg-white/55 p-5 text-right transition hover:-translate-y-1 hover:border-[var(--griffin-gold)]/30 dark:border-white/10 dark:bg-white/[.035]"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-slate-400">{league.status === "active" ? "لیگ فعال" : "لیگ"}</p><h3 className="mt-1 text-lg font-black text-slate-900 dark:text-white">{league.title}</h3></div><div className="text-left"><p className="text-2xl font-black text-[var(--griffin-gold)]">{league.rating}</p><p className="text-[11px] text-slate-400">RATING</p></div></div><div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-200/70 pt-4 dark:border-white/10"><Mini label="برد" value={league.wins}/><Mini label="باخت" value={league.losses}/><Mini label="مساوی" value={league.draws}/></div><p className="mt-4 text-xs font-bold text-[var(--griffin-gold)] opacity-0 transition group-hover:opacity-100">مشاهده جدول رتبه‌بندی ←</p></button>)}</div>}
            {profile.leagues.length > 0 && <section className="mt-10 rounded-3xl border border-slate-200/70 bg-white/45 p-5 dark:border-white/10 dark:bg-white/[.025]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-xs font-black tracking-[.2em] text-[var(--griffin-gold)]">PLAYER PROGRESSION</p><h2 className="mt-2 text-xl font-black">روند پیشرفت</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">عملکردت را در طول نبردهای این لیگ دنبال کن.</p></div>
                <div className="rounded-xl bg-[var(--griffin-gold)]/10 px-3 py-2 text-xs font-black text-[var(--griffin-gold)]">{matchHistoryLoading ? "در حال بارگذاری..." : `${progression.leagueMatches.length} نبرد`}</div>
              </div>
              {!matchHistoryLoading && progression.leagueMatches.length === 0 ? <div className="py-10 text-center text-sm text-slate-500">هنوز نبردی در این لیگ ثبت نشده است.</div> : <>
                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  <ProgressStat icon={<Crown size={16}/>} label="برد" value={progression.wins} />
                  <ProgressStat icon={<Swords size={16}/>} label="باخت" value={progression.losses} />
                  <ProgressStat icon={<Minus size={16}/>} label="مساوی" value={progression.draws} />
                  <ProgressStat icon={<Flame size={16}/>} label="استریک" value={`${progression.streak} ${progression.currentStreak === "win" ? "برد" : progression.currentStreak === "loss" ? "باخت" : "مساوی"}`} />
                </div>
                <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-white/10 dark:bg-black/10">
                  <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-slate-400">فرم ۵ نبرد اخیر</p><div className="mt-3 flex gap-2">{progression.recent.map((item) => <span key={item.matchId} title={item.result} className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black ${item.result === "win" ? "bg-emerald-500/12 text-emerald-500" : item.result === "loss" ? "bg-rose-500/12 text-rose-500" : "bg-slate-500/12 text-slate-500"}`}>{item.result === "win" ? "W" : item.result === "loss" ? "L" : "D"}</span>)}</div></div><div className="text-left"><p className="text-xs text-slate-400">تغییر خالص Rating</p><p className={`mt-1 text-xl font-black ${progression.netRating >= 0 ? "text-emerald-500" : "text-rose-500"}`}>{progression.netRating > 0 ? "+" : ""}{progression.netRating}</p></div></div>
                </div>
              </>}
            </section>}

            {profile.leagues.length > 0 && <section className="mt-10 rounded-3xl border border-slate-200/70 bg-white/45 p-5 dark:border-white/10 dark:bg-white/[.025]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-xs font-black tracking-[.2em] text-[var(--griffin-gold)]">RATING JOURNEY</p><h2 className="mt-2 text-xl font-black">مسیر Rating</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">تغییر Rating خودت را بعد از هر نبرد دنبال کن.</p></div>
                <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-bold outline-none dark:border-white/10 dark:bg-white/5">{profile.leagues.map((league) => <option key={league.leagueId} value={league.leagueId}>{league.title}</option>)}</select>
              </div>
              {historyLoading ? <div className="py-12 text-center text-sm font-bold text-slate-500">در حال دریافت مسیر Rating...</div> : !chart ? <div className="py-12 text-center text-sm text-slate-500">برای این لیگ هنوز سابقه Rating ثبت نشده است.</div> : <>
                <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/60 p-3 dark:border-white/10 dark:bg-black/10">
                  <svg viewBox={`0 0 ${760} ${220}`} className="h-56 w-full overflow-visible" role="img" aria-label="نمودار تغییر Rating">
                    <path d={`M ${chart.points.map((p) => `${p.x},${p.y}`).join(" L ")}`} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--griffin-gold)]" />
                    {chart.points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="6" className="fill-white stroke-[var(--griffin-gold)] dark:fill-slate-950" strokeWidth="3" />)}
                  </svg>
                  <div className="mt-1 flex items-center justify-between text-xs font-bold text-slate-400"><span>{chart.min}</span><span>Rating فعلی: <strong className="text-[var(--griffin-gold)]">{chart.latest}</strong></span><span>{chart.max}</span></div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">{ratingHistory.slice(-3).reverse().map((item) => <div key={`${item.matchId}-${item.createdAt}`} className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 dark:border-white/10 dark:bg-white/[.035]"><div className="flex items-center justify-between gap-3"><span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString("fa-IR")}</span><span className={`inline-flex items-center gap-1 text-sm font-black ${item.change >= 0 ? "text-emerald-500" : "text-rose-500"}`}>{item.change >= 0 ? <TrendingUp size={15}/> : <TrendingDown size={15}/>} {item.change > 0 ? "+" : ""}{item.change}</span></div><p className="mt-3 text-sm font-bold">{item.oldRating} → {item.newRating}</p></div>)}</div>
              </>}
            </section>}
          </>}
        </section>
      </div>
    </main>
  );
};
const Stat=({icon,label,value}:{icon:React.ReactNode;label:string;value:string|number})=><div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 dark:border-white/10 dark:bg-white/[.035]"><div className="text-[var(--griffin-gold)]">{icon}</div><p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
const ProgressStat=({icon,label,value}:{icon:React.ReactNode;label:string;value:string|number})=><div className="rounded-2xl border border-slate-200/70 bg-white/55 p-4 dark:border-white/10 dark:bg-white/[.035]"><div className="text-[var(--griffin-gold)]">{icon}</div><p className="mt-2 text-xs font-bold text-slate-400">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>;
const Mini=({label,value}:{label:string;value:number})=><div className="text-center"><p className="text-lg font-black">{value}</p><p className="text-[11px] text-slate-400">{label}</p></div>;
export default ArenaProfile;
