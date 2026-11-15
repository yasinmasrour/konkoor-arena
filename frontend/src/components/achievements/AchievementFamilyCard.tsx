import { Sparkles } from "lucide-react";
import AchievementBadge, { tierStyles } from "./AchievementBadge";

interface Tier {
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
}

interface AchievementFamilyCardProps {
  family: {
    id: string;
    code: string;
    title: string;
    description: string;
    category: string;
    icon: string;
    tiers: Tier[];
    highestUnlockedTier: string | null;
    currentProgress: number;
  };
}

const AchievementFamilyCard = ({ family }: AchievementFamilyCardProps) => {
  const unlockedCount = family.tiers.filter((t) => t.unlocked).length;
  const totalCount = family.tiers.length;

  // بالاترین tier unlocked
  const highestTier = family.tiers
    .slice()
    .reverse()
    .find((t) => t.unlocked);

  // tier بعدی برای نمایش progress
  const nextTier = family.tiers.find((t) => !t.unlocked);

  // درصد پیشرفت نسبت به tier بعدی
  const progressPercent = nextTier
    ? Math.min((family.currentProgress / nextTier.conditionValue) * 100, 100)
    : 100;

  return (
    <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm p-5 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 mb-1">
            <Sparkles size={10} className="text-[var(--griffin-gold)]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {family.category}
            </span>
          </div>
          <h3 className="font-heading text-sm font-black text-gray-900 dark:text-white">
            {family.title}
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {family.description}
          </p>
        </div>

        {highestTier && (
          <div className="shrink-0 text-center">
            <AchievementBadge
              tier={highestTier.tier}
              icon={family.icon}
              unlocked
              size="md"
              showLock={false}
            />
            <p
              className={`text-[9px] font-black mt-1 ${
                tierStyles[highestTier.tier]?.labelColor ?? ""
              }`}
            >
              {tierStyles[highestTier.tier]?.label ?? ""}
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {nextTier && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] mb-1.5">
            <span className="font-black text-gray-500 dark:text-gray-400">
              {family.currentProgress.toLocaleString("fa-IR")} /{" "}
              {nextTier.conditionValue.toLocaleString("fa-IR")}
            </span>
            <span className="font-black text-[var(--griffin-gold)]">
              {Math.round(progressPercent)}٪
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1.5">
            تا سطح بعدی:{" "}
            <span className="font-black text-gray-700 dark:text-gray-300">
              {nextTier.title}
            </span>
          </p>
        </div>
      )}

      {/* Tiers */}
      <div className="grid grid-cols-4 gap-2">
        {family.tiers.map((tier) => (
          <button
            key={tier.id}
            type="button"
            title={`${tier.title} - ${tier.description}`}
            className="group flex flex-col items-center gap-1.5 p-1"
          >
            <AchievementBadge
              tier={tier.tier}
              icon={family.icon}
              unlocked={tier.unlocked}
              size="sm"
              showLock={false}
            />
            <span
              className={`text-[9px] font-black ${
                tier.unlocked
                  ? "text-gray-700 dark:text-gray-300"
                  : "text-gray-400 dark:text-gray-600"
              }`}
            >
              {tier.title}
            </span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200/70 dark:border-white/5 flex items-center justify-between text-[10px]">
        <span className="text-gray-500 dark:text-gray-400">
          {unlockedCount.toLocaleString("fa-IR")} از{" "}
          {totalCount.toLocaleString("fa-IR")} سطح
        </span>
        <span className="font-black text-[var(--griffin-gold)]">
          {family.tiers
            .filter((t) => t.unlocked)
            .reduce((sum, t) => sum + t.points, 0)
            .toLocaleString("fa-IR")}{" "}
          امتیاز
        </span>
      </div>
    </div>
  );
};

export default AchievementFamilyCard;
