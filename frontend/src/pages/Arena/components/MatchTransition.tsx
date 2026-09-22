import { Flame, Sparkles, Swords, Zap } from "lucide-react";

interface MatchTransitionProps {
  round: number;
  message?: string;
}

// 🔹 ذرات ثابت (بدون Math.random)
const PARTICLES = [
  { top: "15%", left: "10%", delay: "0s", size: 3 },
  { top: "25%", left: "85%", delay: "0.3s", size: 2 },
  { top: "45%", left: "20%", delay: "0.6s", size: 3 },
  { top: "60%", left: "75%", delay: "0.2s", size: 2 },
  { top: "75%", left: "30%", delay: "0.5s", size: 3 },
  { top: "85%", left: "60%", delay: "0.8s", size: 2 },
  { top: "30%", left: "50%", delay: "0.4s", size: 2 },
  { top: "70%", left: "90%", delay: "0.7s", size: 3 },
];

const MatchTransition = ({
  round,
  message = "راند بعدی در حال آماده‌سازی است",
}: MatchTransitionProps) => (
  <div
    className="
      absolute inset-0 z-20
      flex items-center justify-center
      bg-[#080B12]/90 backdrop-blur-xl
      p-4 overflow-hidden
      animate-[fadeIn_0.2s_ease-out]
    "
  >
    {/* ==================== پس‌زمینه تزئینی ==================== */}
    <div className="absolute inset-0 pointer-events-none">
      {/* گرادیان طلایی/بنفش */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15" />

      {/* هاله‌های درخشان */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[var(--griffin-gold)]/25 blur-[100px] animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-purple-600/25 blur-[100px] animate-pulse" />

      {/* ذرات ثابت */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-[var(--griffin-gold)]"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
            animationDelay: p.delay,
            opacity: 0.4,
          }}
        />
      ))}
    </div>

    {/* ==================== حلقه پالس مرکزی ==================== */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className="w-56 h-56 rounded-full border-2 border-[var(--griffin-gold)]/20 animate-ping"
        style={{ animationDuration: "2s" }}
      />
    </div>

    {/* ==================== کارت اصلی ==================== */}
    <div className="arena-transition-card relative max-w-xs sm:max-w-sm w-full">
      {/* هاله درخشان پشت کارت */}
      <div className="absolute inset-0 bg-[var(--griffin-gold)]/20 blur-3xl rounded-2xl" />

      <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.1] to-white/[0.03] backdrop-blur-2xl px-5 py-5 sm:px-7 sm:py-6 text-white shadow-2xl shadow-[var(--griffin-gold)]/20 text-center overflow-hidden">
        {/* خط طلایی بالای کارت */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent" />

        {/* گرادیان تزئینی گوشه */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[var(--griffin-gold)]/20 blur-3xl animate-pulse" />

        {/* ==================== آیکون شمشیر ==================== */}
        <div className="relative inline-flex">
          <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-70 animate-pulse" />
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center shadow-xl shadow-[var(--griffin-gold)]/50 rotate-3">
            <Swords
              className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-pulse"
              strokeWidth={2.3}
            />
          </div>

          <Sparkles
            size={14}
            className="absolute -top-2 -right-2 text-[var(--griffin-gold)] animate-pulse"
          />
          <Zap
            size={12}
            className="absolute -bottom-1 -left-2 text-purple-400 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        {/* ==================== برچسب ==================== */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30 backdrop-blur-sm">
          <Flame
            size={10}
            className="text-[var(--griffin-gold)] animate-pulse"
          />
          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[var(--griffin-gold)]">
            Next Round
          </span>
        </div>

        {/* ==================== شماره راند ==================== */}
        <div className="mt-3 relative">
          {/* عدد پشت */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-7xl sm:text-8xl font-black text-[var(--griffin-gold)]/10 select-none">
              {round.toLocaleString("fa-IR")}
            </span>
          </div>

          {/* متن اصلی */}
          <h3 className="relative font-heading text-3xl sm:text-4xl font-black leading-tight">
            راند{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
              {round.toLocaleString("fa-IR")}
            </span>
          </h3>
        </div>

        {/* ==================== پیام ==================== */}
        <p className="mt-3 text-xs sm:text-sm leading-6 text-gray-300">
          {message}
        </p>

        {/* ==================== سه نقطه پرشی ==================== */}
        <div className="mt-4 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default MatchTransition;
