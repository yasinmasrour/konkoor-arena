import * as Icons from "lucide-react";
import { Lock } from "lucide-react";

// ==================== Tier Styles ====================
const tierStyles = {
  bronze: {
    bg: "from-amber-600 to-amber-900",
    ring: "ring-amber-500/50",
    glow: "bg-amber-500/40",
    label: "برنز",
    labelColor: "text-amber-600 dark:text-amber-400",
  },
  silver: {
    bg: "from-slate-300 to-slate-600",
    ring: "ring-slate-400/50",
    glow: "bg-slate-300/40",
    label: "نقره",
    labelColor: "text-slate-500 dark:text-slate-300",
  },
  gold: {
    bg: "from-yellow-300 to-amber-600",
    ring: "ring-yellow-400/60",
    glow: "bg-yellow-400/50",
    label: "طلا",
    labelColor: "text-yellow-600 dark:text-yellow-400",
  },
  platinum: {
    bg: "from-cyan-300 via-purple-400 to-purple-600",
    ring: "ring-cyan-300/60",
    glow: "bg-cyan-300/50",
    label: "پلاتینیوم",
    labelColor: "text-cyan-500 dark:text-cyan-300",
  },
};

interface AchievementBadgeProps {
  tier: "bronze" | "silver" | "gold" | "platinum";
  icon?: string;
  unlocked: boolean;
  size?: "sm" | "md" | "lg";
  showLock?: boolean;
}

const sizeMap = {
  sm: { box: "w-11 h-11", icon: 18, ring: "ring-1" },
  md: { box: "w-14 h-14", icon: 24, ring: "ring-2" },
  lg: { box: "w-20 h-20", icon: 34, ring: "ring-2" },
};

const AchievementBadge = ({
  tier,
  icon = "Trophy",
  unlocked,
  size = "md",
  showLock = true,
}: AchievementBadgeProps) => {
  const Icon = (Icons as any)[icon] || Icons.Trophy;
  const style = tierStyles[tier] || tierStyles.bronze;
  const s = sizeMap[size];

  return (
    <div className="relative">
      {/* Glow (اگه unlock شده) */}
      {unlocked && (
        <div
          className={`absolute inset-0 ${style.glow} blur-xl opacity-70 animate-pulse`}
        />
      )}

      <div
        className={`
          relative ${s.box} rounded-2xl
          flex items-center justify-center
          shadow-lg
          transition-transform duration-300
          group-hover:scale-110 group-hover:rotate-3
          ${s.ring} ${style.ring}
          ${
            unlocked
              ? `bg-gradient-to-br ${style.bg}`
              : "bg-gray-200 dark:bg-white/5"
          }
        `}
      >
        {unlocked ? (
          <Icon
            size={s.icon}
            className="text-white drop-shadow-lg"
            strokeWidth={2.3}
          />
        ) : showLock ? (
          <Lock
            size={s.icon * 0.7}
            className="text-gray-400 dark:text-gray-600"
          />
        ) : (
          <Icon
            size={s.icon}
            className="text-gray-400 dark:text-gray-600 opacity-40"
          />
        )}
      </div>
    </div>
  );
};

export { tierStyles };
export default AchievementBadge;
