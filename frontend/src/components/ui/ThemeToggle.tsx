import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);

  // 🔹 افکت ذرات هنگام تغییر تم
  const handleToggle = () => {
    const newSparkles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 800);
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isDark ? "تغییر به تم روشن" : "تغییر به تم تیره"}
      className="
        group relative
        w-14 h-8
        rounded-full
        overflow-hidden
        transition-all duration-500
        bg-gradient-to-r
        from-slate-200 to-slate-300
        dark:from-[#0a0d14] dark:to-[#05070a]
        border border-slate-300 dark:border-[var(--griffin-gold)]/30
        shadow-inner
        hover:shadow-lg
        hover:shadow-[var(--griffin-gold)]/20
        dark:hover:shadow-[var(--griffin-gold)]/40
      "
    >
      {/* 🔹 گرادیان پس‌زمینه */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 dark:from-indigo-950 dark:via-[#0a0d14] dark:to-indigo-950 opacity-0 dark:opacity-100 transition-opacity duration-500" />

      {/* 🔹 ذرات پرنده هنگام تغییر تم */}
      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="absolute w-1 h-1 rounded-full bg-[var(--griffin-gold)] pointer-events-none"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            animation: "sparkle-fly 0.8s ease-out forwards",
          }}
        />
      ))}

      {/* 🔹 توپ متحرک (Circle) */}
      <div
        className={`
          absolute top-1
          w-6 h-6
          rounded-full
          flex items-center justify-center
          transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]
          ${isDark ? "right-1" : "right-[calc(100%-1.75rem)]"}
          bg-gradient-to-br
          ${
            isDark
              ? "from-[var(--griffin-gold)] to-amber-700 shadow-lg shadow-[var(--griffin-gold)]/50"
              : "from-white to-slate-100 shadow-md shadow-slate-400/30"
          }
        `}
      >
        {/* 🔹 هاله درخشان */}
        <div
          className={`
            absolute inset-0 rounded-full
            transition-opacity duration-500
            ${isDark ? "bg-[var(--griffin-gold)]/40 blur-md opacity-100" : "opacity-0"}
          `}
        />

        {/* 🔹 آیکون‌ها با انیمیشن چرخش */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* خورشید */}
          <Sun
            size={14}
            strokeWidth={2.5}
            className={`
              absolute
              text-amber-600
              transition-all duration-500
              ${isDark ? "rotate-180 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}
            `}
          />

          {/* ماه */}
          <Moon
            size={13}
            strokeWidth={2.5}
            className={`
              absolute
              text-white
              transition-all duration-500
              ${isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-180 scale-0 opacity-0"}
            `}
          />
        </div>
      </div>

      {/* 🔹 نقاط تزئینی پس‌زمینه (ستاره‌ها در تم تیره) */}
      <div
        className={`
          absolute inset-0 pointer-events-none
          transition-opacity duration-500
          ${isDark ? "opacity-100" : "opacity-0"}
        `}
      >
        <span className="absolute top-1.5 left-2 w-[2px] h-[2px] rounded-full bg-white/70" />
        <span className="absolute top-4 left-4 w-[1.5px] h-[1.5px] rounded-full bg-white/50" />
        <span className="absolute bottom-1.5 left-5 w-[2px] h-[2px] rounded-full bg-white/60" />
      </div>

      {/* 🔹 ابرهای تزئینی (فقط تم روشن) */}
      <div
        className={`
          absolute inset-0 pointer-events-none
          transition-opacity duration-500
          ${isDark ? "opacity-0" : "opacity-100"}
        `}
      >
        <span className="absolute top-2 left-3 w-2 h-1 rounded-full bg-white/70" />
        <span className="absolute bottom-2 left-2 w-2.5 h-1 rounded-full bg-white/60" />
      </div>
    </button>
  );
};

export default ThemeToggle;