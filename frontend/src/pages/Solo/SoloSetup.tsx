import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Crown,
  Flame,
  Gauge,
  LoaderCircle,
  PlayCircle,
  Swords,
  Target,
  Zap,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getSoloLevels,
  startSolo,
  LEVEL_COLORS,
  LEVEL_LABELS,
  type SoloLevel,
  type SoloLevelInfo,
} from "../../api/soloApi";
import { getActiveLeagues } from "../../api/arenaApi";
import type { ArenaLeague } from "../../types/arena";
import RevealOnScroll from "../../components/common/RevealOnScroll";

const SoloSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedLeagueId = searchParams.get("leagueId");

  const [leagues, setLeagues] = useState<ArenaLeague[]>([]);
  const [levels, setLevels] = useState<SoloLevelInfo[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<SoloLevel>("easy");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  // ==================== Load ====================
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [leaguesData, levelsData] = await Promise.all([
          getActiveLeagues(),
          getSoloLevels(),
        ]);

        if (cancelled) return;

        setLeagues(leaguesData.leagues);
        setLevels(levelsData.levels);

        // 🔹 انتخاب لیگ پیشفرض
        if (preselectedLeagueId) {
          setSelectedLeagueId(preselectedLeagueId);
        } else if (leaguesData.leagues.length > 0) {
          setSelectedLeagueId(leaguesData.leagues[0].id);
        }
      } catch (err) {
        console.error("Failed to load setup data:", err);
        if (!cancelled) {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "دریافت اطلاعات انجام نشد.";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [preselectedLeagueId]);

  // ==================== Start ====================
  const handleStart = async () => {
    if (!selectedLeagueId) {
      setError("لطفاً یک لیگ انتخاب کن");
      return;
    }

    setStarting(true);
    setError("");
    try {
      const result = await startSolo({
        leagueId: selectedLeagueId,
        level: selectedLevel,
      });
      navigate(`/solo/${result.solo.id}`);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "شروع بازی انجام نشد";
      setError(message);
      setStarting(false);
    }
  };

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-3">
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
                  <LoaderCircle size={24} className="text-white animate-spin" />
                </div>
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                در حال بارگذاری...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==================== JSX ====================
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ==================== Back ==================== */}
        <button
          type="button"
          onClick={() => navigate("/arena")}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت به آرنا
        </button>

        {/* ==================== هدر ==================== */}
        <RevealOnScroll>
          <header className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30">
              <Swords size={14} className="text-purple-500" />
              <span className="text-xs font-bold text-purple-500 tracking-wider">
                SOLO MODE
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl font-black leading-tight text-gray-900 dark:text-white">
              بازی{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-purple-500 to-purple-300">
                انفرادی
              </span>
            </h1>

            <div className="w-20 h-1 bg-purple-500 mx-auto rounded-full" />

            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-300 leading-8">
              با خودت رقابت کن! ۵ سوال، ۳ جان. هر پاسخ اشتباه یا اتمام زمان = یه
              جان.
            </p>
          </header>
        </RevealOnScroll>

        {/* ==================== خطا ==================== */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-6">
              {error}
            </p>
          </div>
        )}

        {/* ==================== لیگها ==================== */}
        {leagues.length === 0 ? (
          <RevealOnScroll>
            <div className="rounded-3xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <Swords
                  size={28}
                  className="text-gray-400 dark:text-gray-600"
                />
              </div>
              <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
                لیگ فعالی برای بازی انفرادی وجود ندارد
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                برای بازی انفرادی، اول باید یه لیگ فعال داشته باشی
              </p>
            </div>
          </RevealOnScroll>
        ) : (
          <>
            {/* ==================== انتخاب لیگ ==================== */}
            <RevealOnScroll>
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <Target size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Step 1
                    </p>
                    <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white -mt-0.5">
                      انتخاب لیگ
                    </h2>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {leagues.map((league) => {
                    const isSelected = selectedLeagueId === league.id;
                    return (
                      <button
                        key={league.id}
                        type="button"
                        onClick={() => setSelectedLeagueId(league.id)}
                        className={`
                          group relative rounded-2xl overflow-hidden border p-4 text-right
                          transition-all duration-300 hover:-translate-y-1
                          ${
                            isSelected
                              ? "border-[var(--griffin-gold)]/60 bg-gradient-to-br from-[var(--griffin-gold)]/15 to-transparent shadow-lg shadow-[var(--griffin-gold)]/20"
                              : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:border-[var(--griffin-gold)]/40"
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
                        )}

                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`
                              w-10 h-10 rounded-xl flex items-center justify-center
                              ${
                                isSelected
                                  ? "bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 text-white"
                                  : "bg-gray-100 dark:bg-white/5 text-gray-500"
                              }
                            `}
                          >
                            <Swords size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white truncate">
                              {league.title}
                            </h3>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                              {league.lesson}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-[var(--griffin-gold)]">
                            <Zap size={10} fill="currentColor" />
                            انتخاب شده
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            </RevealOnScroll>

            {/* ==================== انتخاب سطح ==================== */}
            <RevealOnScroll>
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                    <Gauge size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                      Step 2
                    </p>
                    <h2 className="font-heading text-lg font-black text-gray-900 dark:text-white -mt-0.5">
                      انتخاب سطح
                    </h2>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {levels.map((level) => {
                    const isSelected = selectedLevel === level.key;
                    const colors = LEVEL_COLORS[level.key];
                    return (
                      <button
                        key={level.key}
                        type="button"
                        onClick={() => setSelectedLevel(level.key)}
                        className={`
                          group relative rounded-2xl overflow-hidden border p-5 text-center
                          transition-all duration-300 hover:-translate-y-1
                          ${
                            isSelected
                              ? `${colors.border} bg-gradient-to-br ${colors.bg} to-transparent shadow-lg`
                              : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] hover:border-gray-300 dark:hover:border-white/20"
                          }
                        `}
                      >
                        {isSelected && (
                          <div
                            className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent to-transparent`}
                            style={{
                              backgroundImage: `linear-gradient(to right, transparent, currentColor, transparent)`,
                            }}
                          />
                        )}

                        <div
                          className={`
                            w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3
                            transition-transform duration-300 group-hover:scale-110
                            ${
                              isSelected
                                ? `bg-gradient-to-br ${colors.gradient} text-white shadow-lg`
                                : "bg-gray-100 dark:bg-white/5 text-gray-500"
                            }
                          `}
                        >
                          <Gauge size={24} />
                        </div>

                        <h3
                          className={`
                            font-heading text-base font-black
                            ${
                              isSelected
                                ? colors.text
                                : "text-gray-900 dark:text-white"
                            }
                          `}
                        >
                          {level.label}
                        </h3>

                        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                          {level.timeLimit.toLocaleString("fa-IR")} ثانیه برای
                          هر سوال
                        </p>

                        {level.key === "hard" && (
                          <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[9px] font-black">
                            <Flame size={9} />
                            چالشی
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            </RevealOnScroll>

            {/* ==================== شروع ==================== */}
            <RevealOnScroll>
              <section className="relative rounded-[2rem] overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-transparent to-[var(--griffin-gold)]/10 backdrop-blur-xl p-8 text-center">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/10 blur-3xl pointer-events-none" />

                <div className="relative space-y-5">
                  <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Crown size={14} className="text-[var(--griffin-gold)]" />۵
                    سوال · ۳ جان · {LEVEL_LABELS[selectedLevel]} (
                    {levels.find((l) => l.key === selectedLevel)?.timeLimit ??
                      0}{" "}
                    ثانیه)
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleStart()}
                    disabled={starting || !selectedLeagueId}
                    className="
                      group relative
                      inline-flex items-center justify-center gap-2
                      rounded-2xl
                      bg-gradient-to-l from-purple-500 to-purple-700
                      px-8 py-4
                      font-heading font-black text-white text-base
                      shadow-2xl shadow-purple-500/40
                      hover:shadow-xl hover:shadow-purple-500/60
                      hover:-translate-y-1
                      disabled:opacity-40 disabled:cursor-not-allowed
                      transition-all duration-300
                      overflow-hidden
                    "
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {starting ? (
                        <>
                          <LoaderCircle size={18} className="animate-spin" />
                          در حال شروع...
                        </>
                      ) : (
                        <>
                          <PlayCircle size={18} />
                          شروع بازی
                        </>
                      )}
                    </span>
                    {!starting && (
                      <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    )}
                  </button>
                </div>
              </section>
            </RevealOnScroll>
          </>
        )}
      </div>
    </main>
  );
};

export default SoloSetup;
