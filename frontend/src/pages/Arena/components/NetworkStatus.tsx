import { Signal, SignalHigh, SignalLow, SignalMedium } from "lucide-react";

export type NetworkQuality = "good" | "fair" | "poor" | "unknown";

interface NetworkStatusProps {
  latencyMs: number | null;
  quality: NetworkQuality;
  label?: string;
}

const NetworkStatus = ({ latencyMs, quality, label = "اتصال" }: NetworkStatusProps) => {
  const Icon = quality === "good" ? SignalHigh : quality === "fair" ? SignalMedium : quality === "poor" ? SignalLow : Signal;
  const tone = quality === "good" ? "text-emerald-500" : quality === "fair" ? "text-amber-500" : quality === "poor" ? "text-rose-500" : "text-slate-400";
  const text = quality === "unknown" ? "در حال سنجش" : latencyMs !== null ? `${latencyMs}ms` : "—";

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/65 px-2.5 py-1.5 text-[10px] font-black text-slate-500 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400" title={`${label}: ${text}`}>
      <Icon className={`h-3.5 w-3.5 ${tone}`} />
      <span>{text}</span>
    </div>
  );
};

export default NetworkStatus;
