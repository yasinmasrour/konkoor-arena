import {
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  // Wifi,
} from "lucide-react";

export type NetworkQuality = "good" | "fair" | "poor" | "unknown";

interface NetworkStatusProps {
  latencyMs: number | null;
  quality: NetworkQuality;
  label?: string;
}

const NetworkStatus = ({
  latencyMs,
  quality,
  label = "اتصال",
}: NetworkStatusProps) => {
  const Icon =
    quality === "good"
      ? SignalHigh
      : quality === "fair"
      ? SignalMedium
      : quality === "poor"
      ? SignalLow
      : Signal;

  const config = {
    good: {
      tone: "text-emerald-500",
      dot: "bg-emerald-500",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      text: "عالی",
      glow: "shadow-emerald-500/20",
    },
    fair: {
      tone: "text-amber-500",
      dot: "bg-amber-500",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      text: "متوسط",
      glow: "shadow-amber-500/20",
    },
    poor: {
      tone: "text-rose-500",
      dot: "bg-rose-500",
      border: "border-rose-500/30",
      bg: "bg-rose-500/10",
      text: "ضعیف",
      glow: "shadow-rose-500/20",
    },
    unknown: {
      tone: "text-gray-400 dark:text-gray-500",
      dot: "bg-gray-400",
      border: "border-gray-200/70 dark:border-white/10",
      bg: "bg-gray-500/5 dark:bg-white/[0.04]",
      text: "سنجش",
      glow: "shadow-gray-500/10",
    },
  }[quality];

  const valueText =
    quality === "unknown"
      ? "سنجش..."
      : latencyMs !== null
      ? `${latencyMs.toLocaleString("fa-IR")}ms`
      : "—";

  const isPulsing = quality === "good" || quality === "fair";

  return (
    <div
      className={`
        group relative inline-flex items-center gap-2
        rounded-full border
        ${config.border} ${config.bg}
        px-3 py-1.5
        backdrop-blur-md
        shadow-md ${config.glow}
        transition-all duration-300
        hover:scale-105
      `}
      title={`${label}: ${valueText}`}
    >
      {/* 🔹 هاله درخشان پشت */}
      {isPulsing && (
        <div
          className={`
            absolute inset-0 rounded-full blur-md opacity-40
            ${config.dot}
          `}
        />
      )}

      {/* 🔹 آیکون WiFi با نقطه پالس */}
      <div className="relative">
        <Icon
          className={`
            h-3.5 w-3.5 relative z-10
            ${config.tone}
            ${quality === "poor" ? "animate-pulse" : ""}
          `}
        />

        {/* نقطه پالس برای وضعیت خوب/متوسط */}
        {isPulsing && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75 animate-ping`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}
            />
          </span>
        )}
      </div>

      {/* 🔹 متن */}
      <span
        className={`
          relative z-10 text-[10px] font-black tabular-nums
          ${config.tone}
        `}
      >
        {valueText}
      </span>

      {/* 🔹 راهنمای hover (اختیاری) */}
      <span
        className={`
          absolute -bottom-6 left-1/2 -translate-x-1/2
          whitespace-nowrap
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          pointer-events-none
          px-2 py-0.5 rounded-md
          bg-gray-900 dark:bg-white
          text-white dark:text-gray-900
          text-[9px] font-bold
          shadow-lg
        `}
      >
        {label} · {config.text}
      </span>
    </div>
  );
};

export default NetworkStatus;