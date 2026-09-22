import { Clock3, Flame, Zap } from "lucide-react";
import { useMemo } from "react";

interface MatchTimerProps {
  timeLeft: number;
  timeLimit: number;
  variant?: "default" | "compact" | "inline";
}

const MatchTimer = ({
  timeLeft,
  timeLimit,
  variant = "default",
}: MatchTimerProps) => {
  const progress =
    timeLimit > 0
      ? Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100))
      : 0;

  // 🔹 سطوح فوریت
  const level = useMemo(() => {
    if (timeLeft <= 3) return "critical";
    if (timeLeft <= 5) return "urgent";
    if (timeLeft <= 10) return "warning";
    return "normal";
  }, [timeLeft]);

  const config = {
    critical: {
      color: "text-red-500",
      stroke: "#ef4444",
      bg: "bg-red-500/15",
      border: "border-red-500/40",
      glow: "bg-red-500",
      label: "بحرانی",
      icon: Flame,
    },
    urgent: {
      color: "text-rose-500",
      stroke: "#f43f5e",
      bg: "bg-rose-500/15",
      border: "border-rose-500/40",
      glow: "bg-rose-500",
      label: "فوری",
      icon: Flame,
    },
    warning: {
      color: "text-amber-500",
      stroke: "#f59e0b",
      bg: "bg-amber-500/15",
      border: "border-amber-500/40",
      glow: "bg-amber-500",
      label: "هشدار",
      icon: Zap,
    },
    normal: {
      color: "text-[var(--griffin-gold)]",
      stroke: "#c58b2a",
      bg: "bg-[var(--griffin-gold)]/10",
      border: "border-[var(--griffin-gold)]/30",
      glow: "bg-[var(--griffin-gold)]",
      label: "زمان",
      icon: Clock3,
    },
  }[level];

  const Icon = config.icon;
  const isCritical = level === "critical";
  const isUrgentOrCritical = level === "critical" || level === "urgent";

  // ==================== حالت Inline (خیلی فشرده) ====================
  if (variant === "inline") {
    return (
      <div
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-xl
          border backdrop-blur-sm
          transition-all duration-300
          ${config.border} ${config.bg}
          ${isCritical ? "animate-pulse" : ""}
        `}
      >
        <Icon
          size={14}
          className={`${config.color} ${isCritical ? "animate-bounce" : ""}`}
        />
        <span
          className={`
            font-heading text-lg font-black tabular-nums leading-none
            ${config.color}
            ${isUrgentOrCritical ? "drop-shadow-md" : ""}
          `}
        >
          {timeLeft.toLocaleString("fa-IR")}
        </span>
        <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-linear"
            style={{
              width: `${progress}%`,
              background: config.stroke,
              boxShadow: isUrgentOrCritical
                ? `0 0 8px ${config.stroke}`
                : "none",
            }}
          />
        </div>
      </div>
    );
  }

  // ==================== حالت Compact (متوسط) ====================
  if (variant === "compact") {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const dash = (progress / 100) * circumference;

    return (
      <div className="relative flex items-center gap-2.5">
        {/* دایره کوچک */}
        <div
          className={`
            relative flex h-14 w-14 items-center justify-center rounded-full
            ${isCritical ? "animate-pulse" : ""}
          `}
        >
          {/* هاله */}
          <div
            className={`
              absolute inset-1 rounded-full blur-lg opacity-60
              ${config.glow}
              ${isUrgentOrCritical ? "animate-pulse" : ""}
            `}
          />

          {/* SVG */}
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 56 56"
            aria-hidden="true"
          >
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-white/10"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="none"
              stroke={config.stroke}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              className="transition-[stroke-dasharray] duration-300 ease-linear"
              style={{
                filter: isUrgentOrCritical
                  ? `drop-shadow(0 0 6px ${config.stroke})`
                  : "none",
              }}
            />
          </svg>

          {/* عدد وسط */}
          <span
            className={`
              relative font-heading text-lg font-black tabular-nums leading-none
              ${config.color}
              ${isUrgentOrCritical ? "drop-shadow-md" : ""}
            `}
          >
            {timeLeft.toLocaleString("fa-IR")}
          </span>
        </div>

        {/* نوار خطی */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Icon size={11} className={config.color} />
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}
            >
              {config.label}
            </span>
          </div>
          <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-linear"
              style={{
                width: `${progress}%`,
                background: config.stroke,
                boxShadow: isUrgentOrCritical
                  ? `0 0 8px ${config.stroke}`
                  : "none",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ==================== حالت Default (پیش‌فرض - کوچک‌تر از قبل) ====================
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dash = (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center gap-1.5">
      {/* دایره */}
      <div
        className={`
          relative flex h-20 w-20 items-center justify-center rounded-full
          ${isCritical ? "animate-pulse" : ""}
        `}
      >
        {/* هاله درخشان پشت */}
        <div
          className={`
            absolute inset-1.5 rounded-full blur-xl opacity-60
            ${config.glow}
            ${isUrgentOrCritical ? "animate-pulse" : ""}
          `}
        />

        {/* حلقه پالس بحرانی */}
        {isCritical && (
          <div
            className="absolute inset-0 rounded-full border-2 border-red-500/40 animate-ping"
            style={{ animationDuration: "1s" }}
          />
        )}

        {/* SVG دایره */}
        <svg
          className="absolute inset-0 h-full w-full -rotate-90"
          viewBox="0 0 72 72"
          aria-hidden="true"
        >
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            className="text-white/10"
          />
          <circle
            cx="36"
            cy="36"
            r={radius}
            fill="none"
            stroke={config.stroke}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            className="transition-[stroke-dasharray] duration-300 ease-linear"
            style={{
              filter: isUrgentOrCritical
                ? `drop-shadow(0 0 8px ${config.stroke})`
                : "none",
            }}
          />
        </svg>

        {/* محتوای وسط */}
        <div className="relative flex flex-col items-center">
          <Icon
            className={`
              h-3 w-3 mb-0.5 ${config.color}
              ${isCritical ? "animate-bounce" : ""}
            `}
          />
          <span
            className={`
              font-heading block text-xl font-black tabular-nums leading-none
              ${config.color}
              ${isUrgentOrCritical ? "drop-shadow-md" : ""}
            `}
          >
            {timeLeft.toLocaleString("fa-IR")}
          </span>
        </div>
      </div>

      {/* نوار خطی */}
      <div className="w-24">
        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-linear"
            style={{
              width: `${progress}%`,
              background: config.stroke,
              boxShadow: isUrgentOrCritical
                ? `0 0 8px ${config.stroke}`
                : "none",
            }}
          />
        </div>
      </div>

      {/* برچسب وضعیت */}
      <span
        className={`
          inline-flex items-center gap-1 px-2 py-0.5 rounded-full
          text-[9px] font-black uppercase tracking-widest
          border backdrop-blur-sm
          transition-all duration-300
          ${config.border} ${config.bg} ${config.color}
          ${isCritical ? "animate-pulse" : ""}
        `}
      >
        <Icon size={8} />
        {config.label}
      </span>
    </div>
  );
};

export default MatchTimer;
