import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Swords, Trophy, Users } from "lucide-react";

import { getLeagueOpponents } from "../services/arenaService";

import type { ArenaLeague, ArenaOpponent } from "../types/arena";

const ArenaLobby = () => {
  const { leagueId } = useParams();
  const navigate = useNavigate();

  const [league, setLeague] = useState<ArenaLeague | null>(null);
  const [opponents, setOpponents] = useState<ArenaOpponent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOpponents = async () => {
      if (!leagueId) return;

      try {
        const data = await getLeagueOpponents(leagueId);

        setLeague(data.league);
        setOpponents(data.opponents);
      } catch (error) {
        console.error("GET LEAGUE OPPONENTS ERROR:", error);

        setError("دریافت بازیکنان لیگ با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    fetchOpponents();
  }, [leagueId]);

  if (loading) {
    return (
      <main
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-gray-50
          dark:bg-[#080B12]
        "
      >
        <p className="dark:text-white">در حال دریافت بازیکنان...</p>
      </main>
    );
  }

  if (error || !league) {
    return (
      <main
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-gray-50
          dark:bg-[#080B12]
        "
      >
        <p className="text-red-500">{error || "لیگ پیدا نشد."}</p>
      </main>
    );
  }

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
      <div className="max-w-6xl mx-auto">
        {/* Back */}

        <button
          type="button"
          onClick={() => navigate("/arena")}
          className="
            flex
            items-center
            gap-2
            text-sm
            text-gray-500
            dark:text-gray-400
            hover:text-[var(--griffin-gold)]
            transition
          "
        >
          <ArrowRight size={18} />
          بازگشت به آرنا
        </button>

        {/* League Header */}

        <div
          className="
            mt-8
            rounded-3xl
            p-8
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
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-6
            "
          >
            <div>
              <span
                className="
                  text-sm
                  text-[var(--griffin-gold)]
                "
              >
                لیگ فعال
              </span>

              <h1
                className="
                  mt-3
                  text-3xl
                  font-bold
                  dark:text-white
                "
              >
                {league.title}
              </h1>

              <p
                className="
                  mt-2
                  text-gray-500
                  dark:text-gray-400
                "
              >
                {league.lesson}
              </p>
            </div>

            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                px-5
                py-4
                bg-[var(--griffin-gold)]/10
              "
            >
              <Users size={22} className="text-[var(--griffin-gold)]" />

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  بازیکنان
                </p>

                <p className="font-bold dark:text-white">{opponents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Opponents */}

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2
              className="
                text-2xl
                font-bold
                dark:text-white
              "
            >
              انتخاب حریف
            </h2>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {opponents.length} بازیکن
            </span>
          </div>

          {opponents.length === 0 ? (
            <div
              className="
                mt-6
                rounded-3xl
                p-10
                text-center
                bg-white/40
                dark:bg-white/10
                backdrop-blur-xl
                border
                border-white/20
              "
            >
              <Users
                size={40}
                className="
                  mx-auto
                  text-gray-400
                "
              />

              <p
                className="
                  mt-4
                  text-gray-500
                  dark:text-gray-400
                "
              >
                در حال حاضر بازیکن دیگری برای رقابت وجود ندارد.
              </p>
            </div>
          ) : (
            <div
              className="
                mt-6
                grid
                grid-cols-1
                md:grid-cols-2
                gap-5
              "
            >
              {opponents.map((opponent) => (
                <div
                  key={opponent.userId}
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
                  {/* Player */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <div>
                      <h3
                        className="
                          text-lg
                          font-bold
                          dark:text-white
                        "
                      >
                        {opponent.firstName} {opponent.lastName}
                      </h3>

                      <div
                        className="
                          mt-2
                          flex
                          items-center
                          gap-2
                          text-sm
                          text-gray-500
                          dark:text-gray-400
                        "
                      >
                        <Trophy size={16} />
                        Rating: {opponent.rating}
                      </div>
                    </div>

                    <span
                      className={`
                        rounded-full
                        px-3
                        py-1
                        text-xs
                        ${
                          opponent.isAvailable
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }
                      `}
                    >
                      {opponent.isAvailable ? "آماده" : "مشغول"}
                    </span>
                  </div>

                  {/* Stats */}

                  <div
                    className="
                      mt-6
                      grid
                      grid-cols-3
                      gap-3
                      text-center
                    "
                  >
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        بازی
                      </p>

                      <p className="mt-1 font-bold dark:text-white">
                        {opponent.matchesPlayed}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        برد
                      </p>

                      <p className="mt-1 font-bold text-green-500">
                        {opponent.wins}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        باخت
                      </p>

                      <p className="mt-1 font-bold text-red-500">
                        {opponent.losses}
                      </p>
                    </div>
                  </div>

                  {/* Action */}

                  <button
                    type="button"
                    disabled={!opponent.isAvailable}
                    className="
                      mt-6
                      w-full
                      flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      py-3
                      bg-[var(--griffin-gold)]
                      text-white
                      hover:opacity-90
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                      transition
                    "
                  >
                    <Swords size={18} />

                    {opponent.isAvailable
                      ? "دعوت به مبارزه"
                      : "بازیکن مشغول است"}
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

export default ArenaLobby;
