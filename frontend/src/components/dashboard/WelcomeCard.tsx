import { Sparkles, Zap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const WelcomeCard = () => {
  const { user } = useAuth();

  return (
    <section className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/15 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

      <div className="relative flex items-start gap-4">
        {/* آواتار */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-60 animate-pulse" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white font-heading font-black text-xl shadow-lg rotate-3 border-2 border-white/20">
            {user?.firstName?.charAt(0) || "?"}
          </div>
        </div>

        {/* متن */}
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 mb-2">
            <Zap
              size={12}
              className="text-[var(--griffin-gold)] animate-pulse"
            />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
              Welcome Back
            </span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            خوش آمدی، {user?.firstName || "کاربر"}!
          </h1>

          <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-400">
            مسیر موفقیت تو در آکادمی گریفین از اینجا شروع می‌شه. بزن بریم!
          </p>
        </div>

        {/* آیکون تزئینی */}
        <div className="shrink-0 hidden sm:block">
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-xl opacity-40" />
            <div className="relative w-12 h-12 rounded-2xl bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30 flex items-center justify-center text-[var(--griffin-gold)]">
              <Sparkles size={20} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeCard;
