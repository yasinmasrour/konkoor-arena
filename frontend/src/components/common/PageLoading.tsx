import { Sparkles } from "lucide-react";

interface PageLoadingProps {
  message?: string;
  variant?: "default" | "minimal" | "fullscreen";
}

const PageLoading = ({
  message = "در حال بارگذاری...",
  variant = "default",
}: PageLoadingProps) => {
  // ==================== Minimal ====================
  if (variant === "minimal") {
    return (
      <div
        className="inline-flex items-center gap-2"
        role="status"
        aria-live="polite"
      >
        <div className="relative w-4 h-4">
          <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--griffin-gold)] animate-spin" />
        </div>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
          {message}
        </span>
      </div>
    );
  }

  // ==================== Content ====================
  const content = (
    <div className="text-center space-y-6">
      {/* ==================== لوگو چرخان ==================== */}
      <div className="relative inline-flex">
        {/* هاله بیرونی پالس */}
        <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-40 animate-pulse" />

        {/* حلقه‌های چرخان */}
        <div className="relative w-20 h-20">
          {/* حلقه بیرونی چرخان */}
          <div
            className="absolute inset-0 rounded-full border-3 border-transparent border-t-[var(--griffin-gold)] border-r-[var(--griffin-gold)]/50 animate-spin"
            style={{ animationDuration: "1.2s" }}
          />

          {/* حلقه میانی چرخان مخالف */}
          <div
            className="absolute inset-2 rounded-full border-2 border-transparent border-b-[var(--griffin-gold)]/70 border-l-purple-500/50 animate-spin"
            style={{
              animationDuration: "1.8s",
              animationDirection: "reverse",
            }}
          />

          {/* حلقه داخلی */}
          <div
            className="absolute inset-4 rounded-full border border-dashed border-[var(--griffin-gold)]/30 animate-spin"
            style={{ animationDuration: "3s" }}
          />

          {/* آیکون مرکزی */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-60 animate-pulse" />
              <div className="relative w-full h-full rounded-lg bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center shadow-lg rotate-3">
                <Sparkles size={14} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== متن ==================== */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)] animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
            Loading
          </span>
        </div>

        <p className="font-heading text-base font-black text-gray-900 dark:text-white">
          {message}
        </p>

        {/* ==================== سه نقطه پرشی ==================== */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-[var(--griffin-gold)] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // ==================== Fullscreen ====================
  if (variant === "fullscreen") {
    return (
      <main
        className="fixed inset-0 z-[9999] grid place-items-center bg-white/80 dark:bg-[#0a0d14]/80 backdrop-blur-xl px-6"
        role="status"
        aria-live="polite"
      >
        {content}
      </main>
    );
  }

  // ==================== Default ====================
  return (
    <main
      className="min-h-[60vh] grid place-items-center px-6 py-16"
      role="status"
      aria-live="polite"
    >
      {content}
    </main>
  );
};

export default PageLoading;
