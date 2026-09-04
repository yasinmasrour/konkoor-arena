import { useEffect, useState } from "react";
import { Archive, Swords, Trophy } from "lucide-react";

import { getActiveLeagues, getFinishedArenaLeagues } from "../api/arenaApi";
import type { ArenaLeague } from "../types/arena";

import { useNavigate } from "react-router-dom";
const Arena = () => {
  const navigate = useNavigate();

  const [leagues, setLeagues] = useState<ArenaLeague[]>([]);
  const [finishedLeagues, setFinishedLeagues] = useState<ArenaLeague[]>([]);
  const [finishedLoading, setFinishedLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const data = await getActiveLeagues();

        setLeagues(data.leagues);
      } catch (error) {
        console.error("GET ACTIVE LEAGUES ERROR:", error);

        setError("دریافت لیگ‌های آرنا با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();

    const fetchFinishedLeagues = async () => {
      try {
        const data = await getFinishedArenaLeagues();
        setFinishedLeagues(data.leagues);
      } catch (error) {
        console.error("GET FINISHED LEAGUES ERROR:", error);
      } finally {
        setFinishedLoading(false);
      }
    };

    fetchFinishedLeagues();
  }, []);

  return (
    <main
      className="
        min-h-screen
        px-6
        py-10
        bg-gray-50
        dark:bg-[#080B12]
      "
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        <div className="text-center">
          <div
            className="
              mx-auto
              w-20
              h-20
              rounded-3xl
              flex
              items-center
              justify-center
              bg-[var(--griffin-gold)]/15
            "
          >
            <Swords size={40} className="text-[var(--griffin-gold)]" />
          </div>

          <h1
            className="
              mt-6
              text-4xl
              font-bold
              dark:text-white
            "
          >
            کنکورآرنا
          </h1>

          <p
            className="
              mt-3
              text-gray-500
              dark:text-gray-400
            "
          >
            با دیگر داوطلبان رقابت کن و سریع‌تر پاسخ بده.
          </p>
        </div>

        {/* Leagues */}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => navigate("/arena/profile")} className="rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5 text-sm font-bold dark:border-white/10 dark:bg-white/5 dark:text-white">پروفایل و Rating</button>
          <button type="button" onClick={() => navigate("/arena/history")} className="rounded-xl border border-slate-200 bg-white/60 px-4 py-2.5 text-sm font-bold dark:border-white/10 dark:bg-white/5 dark:text-white">تاریخچه نبردها</button>
        </div>

        <section className="mt-12">
          <h2
            className="
              text-2xl
              font-bold
              dark:text-white
            "
          >
            لیگ‌های فعال
          </h2>

          {loading && (
            <p className="mt-6 dark:text-white">در حال دریافت لیگ‌ها...</p>
          )}

          {error && <p className="mt-6 text-red-500">{error}</p>}

          {!loading && !error && leagues.length === 0 && (
            <p className="mt-6 text-gray-500 dark:text-gray-400">
              در حال حاضر لیگ فعالی وجود ندارد.
            </p>
          )}

          {!loading && !error && leagues.length > 0 && (
            <div
              className="
                mt-6
                grid
                grid-cols-1
                md:grid-cols-2
                lg:grid-cols-3
                gap-6
              "
            >
              {leagues.map((league) => (
                <div
                  key={league.id}
                  className="
                    rounded-3xl
                    p-6
                    bg-white/40
                    dark:bg-white/10
                    backdrop-blur-xl
                    border
                    border-white/20
                    shadow-lg
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <span
                      className="
                        text-sm
                        text-[var(--griffin-gold)]
                      "
                    >
                      لیگ فعال
                    </span>

                    <Swords size={20} className="text-[var(--griffin-gold)]" />
                  </div>

                  <h3
                    className="
                      mt-5
                      text-xl
                      font-bold
                      dark:text-white
                    "
                  >
                    {league.title}
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      text-gray-500
                      dark:text-gray-400
                    "
                  >
                    {league.lesson}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/arena/leagues/${league.id}`, {
                        state: {
                          league: {
                            title: league.title,
                            lesson: league.lesson,
                          },
                        },
                      })
                    }
                    className="
                      mt-6
                      w-full
                      rounded-xl
                      py-3
                      bg-[var(--griffin-gold)]
                      text-white
                      hover:opacity-90
                      transition
                    "
                  >
                    ورود به لیگ
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-14">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">فصل‌های گذشته</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">نتایج نهایی و رتبه‌بندی فصل‌های به پایان رسیده.</p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400">
              <Archive size={16} /> آرشیو رقابت‌ها
            </div>
          </div>

          {finishedLoading ? (
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">در حال دریافت آرشیو...</p>
          ) : finishedLeagues.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-slate-200/70 bg-white/45 p-8 text-center dark:border-white/10 dark:bg-white/[.03]">
              <Trophy className="mx-auto text-slate-400" size={26} />
              <p className="mt-3 font-bold text-slate-600 dark:text-slate-300">هنوز فصلی به پایان نرسیده است.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {finishedLeagues.map((league) => (
                <div key={league.id} className="rounded-3xl border border-slate-200/70 bg-white/45 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[.03]">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-slate-500/10 px-3 py-1 text-xs font-black text-slate-500 dark:text-slate-400">فصل پایان‌یافته</span>
                    <Trophy size={20} className="text-[var(--griffin-gold)]" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold dark:text-white">{league.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{league.lesson}</p>
                  <button type="button" onClick={() => navigate(`/arena/season/${league.id}`)} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--griffin-gold)]/30 bg-[var(--griffin-gold)]/10 py-3 font-bold text-[var(--griffin-gold)] transition hover:bg-[var(--griffin-gold)]/15">
                    مشاهده نتایج فصل
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Arena;
