import { ShieldCheck, Zap, Headphones, Award } from "lucide-react";
import RevealOnScroll from "../common/RevealOnScroll";

const badges = [
  { icon: ShieldCheck, text: "پرداخت امن" },
  { icon: Zap, text: "راه‌اندازی سریع" },
  { icon: Headphones, text: "پشتیبانی ۲۴/۷" },
  { icon: Award, text: "محتوای تخصصی" },
];

const TrustBadges = () => {
  return (
    <section className="relative px-6 py-8">
      <RevealOnScroll>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {badges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div
                  key={i}
                  className="
                    group relative flex items-center justify-center gap-2.5
                    rounded-2xl
                    border border-gray-200 dark:border-white/10
                    bg-white dark:bg-white/[0.03]
                    px-4 py-3.5
                    transition-colors duration-300
                    hover:border-[var(--griffin-gold)]/40
                  "
                >
                  <div className="w-8 h-8 rounded-xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20 flex items-center justify-center text-[var(--griffin-gold)] shrink-0">
                    <Icon size={16} strokeWidth={2.2} />
                  </div>
                  <span className="text-xs md:text-sm font-black text-gray-700 dark:text-gray-200">
                    {badge.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
};

export default TrustBadges;
