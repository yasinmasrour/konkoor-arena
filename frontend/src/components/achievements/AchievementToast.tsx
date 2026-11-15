import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import AchievementBadge from "./AchievementBadge";

interface NewAchievement {
  id: string;
  tier: {
    tier: "bronze" | "silver" | "gold" | "platinum";
    title: string;
    description: string;
    points: number;
    family: {
      title: string;
      icon: string;
      category: string;
    };
  };
}

interface AchievementToastProps {
  achievements: NewAchievement[];
  onClose: () => void;
  onMarkSeen: () => void;
}

const AchievementToast = ({
  achievements,
  onClose,
  onMarkSeen,
}: AchievementToastProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (achievements.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        // eslint-disable-next-line react-hooks/immutability
        handleClose();
      }
    }, 5000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, achievements.length]);

  const handleClose = () => {
    onMarkSeen();
    onClose();
  };

  if (achievements.length === 0) return null;

  const current = achievements[currentIndex];
  if (!current) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[300] animate-[fadeInUp_0.4s_ease-out]">
      <div className="relative max-w-sm mx-auto sm:mx-0 rounded-2xl border border-[var(--griffin-gold)]/40 bg-gradient-to-br from-[var(--griffin-gold)]/20 via-white/5 to-purple-500/20 backdrop-blur-xl shadow-2xl p-4 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[var(--griffin-gold)]/30 blur-3xl pointer-events-none" />

        <button
          onClick={handleClose}
          className="absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors z-10"
        >
          <X size={12} />
        </button>

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles
              size={14}
              className="text-[var(--griffin-gold)] animate-pulse"
            />
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
              دستاورد جدید!
            </p>
            {achievements.length > 1 && (
              <span className="text-[9px] font-black text-gray-300 bg-white/10 px-1.5 py-0.5 rounded-md">
                {(currentIndex + 1).toLocaleString("fa-IR")} /{" "}
                {achievements.length.toLocaleString("fa-IR")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <AchievementBadge
              tier={current.tier.tier}
              icon={current.tier.family.icon}
              unlocked
              size="md"
            />

            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                {current.tier.family.title}
              </p>
              <p className="font-heading text-sm font-black text-white mt-0.5 truncate">
                {current.tier.title}
              </p>
              <p className="text-[11px] text-gray-300 mt-0.5 line-clamp-2">
                {current.tier.description}
              </p>
              <p className="text-[10px] text-[var(--griffin-gold)] mt-1 font-black">
                +{current.tier.points.toLocaleString("fa-IR")} امتیاز
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
