import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  LoaderCircle,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import api from "../api/axios";
import AchievementFamilyCard from "../components/achievements/AchievementFamilyCard";

interface AchievementFamily {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  sortOrder: number;
  tiers: Array<{
    id: string;
    tier: "bronze" | "silver" | "gold" | "platinum";
    title: string;
    description: string;
    conditionValue: number;
    points: number;
    unlocked: boolean;
    unlockedAt: string | null;
    seen: boolean;
    currentProgress: number;
  }>;
  highestUnlockedTier: string | null;
  currentProgress: number;
}

interface UserStats {
  totalAttempts: number;
  totalCorrect: number;
  achievementPoints: number;
  max90Streak: number;
  max70Streak: number;
  maxAttemptStreak: number;
  arenaWins: number;
  fastAnswers: number;
  earlyFinishes: number;
}

const categoryLabels: Record<string, string> = {
  all: "همه",
  exam: "آزمون‌ها",
  question: "سوال‌ها",
  subject: "درس‌ها",
  arena: "آرنا",
  time: "زمانی",
  special: "ویژه",
};

const Achievements = () => {
  const navigate = useNavigate();
  const [families, setFamilies] = useState<AchievementFamily[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // ==================== Load ====================
  useEffect(() => {
    void (async () => {
      try {
        const res = await api.get("/achievements");
        setFamilies(res.data.families || []);
        setStats(res.data.stats);
      } catch (err) {
        console.error("Failed to load achievements:", err);
        setError("دریافت دستاوردها انجام نشد.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ==================== Stats ====================
  const totalStats = useMemo(() => {
    let totalUnlocked = 0;
    let totalTiers = 0;
    let totalPoints = 0;

    for (const family of families) {
      totalTiers += family.tiers.length;
      for (const tier of family.tiers) {
        if (tier.unlocked) {
          totalUnlocked++;
          totalPoints += tier.points;
        }
      }
    }

    return { totalUnlocked, totalTiers, totalPoints };
  }, [families]);

  // ==================== Categories ====================
  const categories = useMemo(() => {
    const cats = new Set(families.map((f) => f.category));
    return ["all", ...Array.from(cats)];
  }, [families]);

  // ==================== Filter ====================
  const filteredFamilies = useMemo(() => {
    if (activeCategory === "all") return families;
    return families.filter((f) => f.category === activeCategory);
  }, [families, activeCategory]);

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <LoaderCircle size={28} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت دستاوردها...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <p className="text-sm font-bold text-rose-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg"
          >
            <ArrowLeft size={13} />
            بازگشت
          </button>
        </div>
      </main>
    );
  }

  const progressPercent =
    totalStats.totalTiers > 0
      ? (totalStats.totalUnlocked / totalStats.totalTiers) * 100
      : 0;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-[var(--griffin-gold)] transition-colors"
        >
          <ArrowLeft
            size={13}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت به داشبورد
        </button>

        {/* HERO */}
        <section className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080B12] p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative shrink-0 self-center sm:self-auto">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-60 animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/10">
                <Trophy size={28} />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Achievements
              </p>
              <h1 className="font-heading text-2xl sm:text-3xl font-black text-white -mt-0.5">
                دستاوردهای من
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {totalStats.totalUnlocked.toLocaleString("fa-IR")} از{" "}
                {totalStats.totalTiers.toLocaleString("fa-IR")} دستاورد باز شده
              </p>

              {/* Progress bar */}
              <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="shrink-0 grid grid-cols-2 gap-2">
              <div className="text-center rounded-xl bg-white/5 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  امتیاز
                </p>
                <p className="font-heading text-lg font-black text-[var(--griffin-gold)] tabular-nums">
                  {(stats?.achievementPoints || 0).toLocaleString("fa-IR")}
                </p>
              </div>
              <div className="text-center rounded-xl bg-white/5 px-3 py-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  آزمون
                </p>
                <p className="font-heading text-lg font-black text-emerald-500 tabular-nums">
                  {(stats?.totalAttempts || 0).toLocaleString("fa-IR")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-4 py-2 text-[11px] font-black transition-all ${
                activeCategory === cat
                  ? "bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 text-white shadow-lg shadow-[var(--griffin-gold)]/30"
                  : "border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]"
              }`}
            >
              {categoryLabels[cat] ?? cat}
            </button>
          ))}
        </div>

        {/* Families Grid */}
        {filteredFamilies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-white/10 p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
              <Target size={28} className="text-gray-400 dark:text-gray-600" />
            </div>
            <p className="font-heading text-sm font-black text-gray-500 dark:text-gray-400">
              دستاوردی توی این دسته وجود نداره
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredFamilies.map((family) => (
              <AchievementFamilyCard key={family.id} family={family} />
            ))}
          </div>
        )}

        {/* Footer hint */}
        <div className="rounded-2xl border border-[var(--griffin-gold)]/30 bg-[var(--griffin-gold)]/5 p-4 text-center">
          <Sparkles
            size={16}
            className="mx-auto text-[var(--griffin-gold)] mb-2"
          />
          <p className="text-xs font-black text-[var(--griffin-gold)]">
            با هر آزمون، سوال درست و برد توی آرنا، یه قدم به دستاورد بعدی
            نزدیک‌تر می‌شی!
          </p>
        </div>
      </div>
    </main>
  );
};

export default Achievements;
