import { useEffect, useState } from "react";
import { Swords } from "lucide-react";

import { getActiveLeagues } from "../api/arenaApi";
import type { ArenaLeague } from "../types/arena";

import { useNavigate } from "react-router-dom";
const Arena = () => {
  const navigate = useNavigate();

  const [leagues, setLeagues] = useState<ArenaLeague[]>([]);

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
                    onClick={() => navigate(`/arena/leagues/${league.id}`)}
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
      </div>
    </main>
  );
};

export default Arena;
