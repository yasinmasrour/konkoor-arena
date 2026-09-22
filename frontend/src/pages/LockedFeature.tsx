import {
  Crown,
  Lock,
  Sparkles,
  Target,
  FileText,
  Swords,
  ClipboardList,
  Brain,
  Compass,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const FEATURE_INFO: Record<
  string,
  {
    label: string;
    description: string;
    icon: typeof Lock;
    color: string;
    gradient: string;
  }
> = {
  exams: {
    label: "آزمون‌ها",
    description:
      "برای دسترسی به آزمون‌های آزمایشی و شرکت در آن‌ها، نیاز به اشتراک دارید. با خرید اشتراک برنزی یا بالاتر، به همه آزمون‌ها دسترسی پیدا می‌کنید.",
    icon: FileText,
    color: "text-blue-500",
    gradient: "from-blue-500 to-blue-700",
  },
  arena: {
    label: "آرنا",
    description:
      "آرنا بخش رقابت زنده گریفینه! با خرید اشتراک نقره‌ای یا بالاتر، می‌تونی با بقیه دانش‌آموزان رقابت کنی، امتیاز بگیری و در جدول رتبه‌بندی بالا بری.",
    icon: Swords,
    color: "text-purple-500",
    gradient: "from-purple-500 to-purple-700",
  },
  solo: {
    label: "بازی انفرادی",
    description:
      "بازی انفرادی بهت اجازه می‌ده بدون نیاز به حریف، مهارت‌هات رو در سه سطح دشواری محک بزنی. برای دسترسی، نیاز به اشتراک نقره‌ای یا بالاتری.",
    icon: Target,
    color: "text-[var(--griffin-gold)]",
    gradient: "from-[var(--griffin-gold)] to-amber-700",
  },
  "study-plans": {
    label: "برنامه مطالعاتی",
    description:
      "برنامه مطالعاتی شخصی توسط مشاور برای تو طراحی می‌شه. برای دیدن برنامه و انجام تسک‌ها، نیاز به اشتراک طلایی (VIP) داری.",
    icon: ClipboardList,
    color: "text-emerald-500",
    gradient: "from-emerald-500 to-emerald-700",
  },
  "ai-analysis": {
    label: "تحلیل هوشمند AI",
    description:
      "تحلیل هوشمند AI عملکردت رو در آزمون‌ها بررسی می‌کنه و نقاط قوت و ضعفت رو نشون می‌ده. این قابلیت مخصوص اشتراک طلایی (VIP) هست.",
    icon: Brain,
    color: "text-rose-500",
    gradient: "from-rose-500 to-rose-700",
  },
  strategy: {
    label: "برنامه راهبردی",
    description:
      "این بخش برای همه آزاده. اگه این پیام رو می‌بینید با پشتیبانی تماس بگیرید.",
    icon: Compass,
    color: "text-blue-500",
    gradient: "from-blue-500 to-blue-700",
  },
  comments: {
    label: "کامنت روی آزمون‌ها",
    description:
      "برای ثبت نظر و امتیاز روی آزمون‌ها، باید اشتراک فعال داشته باشی یا اون آزمون رو تکی خریداری کنی.",
    icon: MessageSquare,
    color: "text-amber-500",
    gradient: "from-amber-500 to-amber-700",
  },
};

interface LockedFeatureProps {
  feature: string;
}

const LockedFeature = ({ feature }: LockedFeatureProps) => {
  const navigate = useNavigate();
  const info = FEATURE_INFO[feature] || {
    label: feature,
    description: "برای دسترسی به این بخش نیاز به اشتراک دارید",
    icon: Lock,
    color: "text-[var(--griffin-gold)]",
    gradient: "from-[var(--griffin-gold)] to-amber-700",
  };

  const Icon = info.icon;

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14 flex items-center justify-center">
      <div className="max-w-lg w-full">
        <section className="relative rounded-[2rem] overflow-hidden border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 backdrop-blur-xl p-8 sm:p-12 text-center">
          {/* پس‌زمینه */}
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-[var(--griffin-gold)]/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

          {/* آیکون قفل */}
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-3xl opacity-60 animate-pulse" />
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/20">
              <Lock size={44} strokeWidth={2.3} />
            </div>
            {/* بج آیکون feature */}
            <span
              className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-gradient-to-br ${info.gradient} flex items-center justify-center text-white shadow-lg border-2 border-[#080B12]`}
            >
              <Icon size={20} strokeWidth={2.3} />
            </span>
          </div>

          {/* برچسب */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
            <Crown size={12} className="text-[var(--griffin-gold)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
              اشتراک لازم
            </span>
          </div>

          {/* تیتر */}
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">
            {info.label}
          </h1>

          <p className="text-sm leading-7 text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-8">
            {info.description}
          </p>

          {/* دکمه‌ها */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/subscriptions")}
              className="
                group relative inline-flex items-center justify-center gap-2
                rounded-2xl
                bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500
                px-6 py-3.5
                font-heading font-black text-white text-sm
                shadow-lg shadow-[var(--griffin-gold)]/40
                hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60
                hover:-translate-y-0.5
                transition-all duration-300
                overflow-hidden
              "
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles size={16} />
                مشاهده پلن‌ها
              </span>
              <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            <button
              onClick={() => navigate(-1)}
              className="
                inline-flex items-center justify-center gap-2
                rounded-2xl border border-gray-200 dark:border-white/10
                bg-white/60 dark:bg-white/[0.03] backdrop-blur-sm
                px-6 py-3.5
                font-heading font-black text-gray-700 dark:text-gray-300 text-sm
                hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)]
                hover:-translate-y-0.5
                transition-all duration-300
              "
            >
              <ArrowLeft size={16} className="rotate-180" />
              بازگشت
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default LockedFeature;
