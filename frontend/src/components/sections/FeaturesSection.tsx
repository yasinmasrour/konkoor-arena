import {
  BookOpen,
  Trophy,
  Users,
  Target,
  Sparkles,
  Brain,
  GraduationCap,
  ChartNoAxesCombined,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import RevealOnScroll from "../common/RevealOnScroll";
import { usePublicStats } from "../../hooks/usePublicStats";

// ==================== Types ====================
interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  glowColor: string;
  tag: string;
  metric?: { value: string; label: string };
  bullets?: string[];
  size: "large" | "medium" | "small";
}

interface Reason {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  glowColor: string;
}

// ==================== Features (بخش امکانات) ====================
const features: Feature[] = [
  {
    id: "exams",
    title: "آزمون‌های هوشمند",
    description:
      "آزمون‌های استاندارد کنکور با تحلیل لحظه‌ای و بازخورد دقیق. تمرین کن، اشتباهاتت رو بشناس و پیشرفتت رو ببین.",
    icon: BookOpen,
    gradient: "from-emerald-500 to-emerald-700",
    glowColor: "bg-emerald-500/20",
    tag: "آزمون و تحلیل",
    metric: { value: "", label: "سوال استاندارد" },
    bullets: ["تحلیل لحظه‌ای", "بازخورد شخصی", "بانک سوال جامع"],
    size: "large",
  },
  {
    id: "arena",
    title: "Griffin Arena",
    description:
      "رقابت زنده با دانش‌آموزان هم‌سطح. سرعت و دقتت رو بسنج و در جدول رده‌بندی بالا برو.",
    icon: Trophy,
    gradient: "from-[var(--griffin-gold)] to-amber-700",
    glowColor: "bg-[var(--griffin-gold)]/20",
    tag: "رقابت زنده",
    metric: { value: "", label: "نبرد روزانه" },
    size: "medium",
  },
  {
    id: "counselor",
    title: "مشاوره تخصصی",
    description: "برنامه‌ریزی شخصی و همراهی در مسیر موفقیت تحصیلی.",
    icon: Users,
    gradient: "from-blue-500 to-blue-700",
    glowColor: "bg-blue-500/20",
    tag: "پشتیبانی",
    size: "medium",
  },
  {
    id: "progress",
    title: "مسیر پیشرفت",
    description:
      "مشاهده روند رشد، امتیازها و دستاوردهای شخصی در یک داشبورد حرفه‌ای. تحلیلی هوشمند از عملکرد تو در هر آزمون.",
    icon: Target,
    gradient: "from-purple-500 to-purple-700",
    glowColor: "bg-purple-500/20",
    tag: "داشبورد تحلیلی",
    metric: { value: "", label: "آزمون برگزارشده" },
    size: "large",
  },
  {
    id: "ai",
    title: "تحلیل هوشمند AI",
    description: "با هوش مصنوعی، نقاط قوت و ضعفت رو بشناس.",
    icon: Brain,
    gradient: "from-rose-500 to-rose-700",
    glowColor: "bg-rose-500/20",
    tag: "هوش مصنوعی",
    size: "small",
  },
  {
    id: "live",
    title: "امکانات ویژه",
    description: "ابزارهای حرفه‌ای برای موفقیت در کنکور.",
    icon: Sparkles,
    gradient: "from-cyan-500 to-cyan-700",
    glowColor: "bg-cyan-500/20",
    tag: "به‌زودی",
    size: "small",
  },
];

// ==================== Reasons (بخش مسیر موفقیت) ====================
const reasons: Reason[] = [
  {
    number: "۰۱",
    title: "یادگیری هدفمند",
    description:
      "با برنامه‌ریزی درست و مسیر مشخص، زمان خود را بهتر مدیریت کنید و از سردرگمی فاصله بگیرید.",
    icon: GraduationCap,
    gradient: "from-emerald-500 to-emerald-700",
    glowColor: "bg-emerald-500/20",
  },
  {
    number: "۰۲",
    title: "تحلیل عملکرد",
    description:
      "نتایج آزمون‌ها را بررسی کنید، نقاط قوت و ضعف خود را بشناسید و روی نقاط ضعف تمرکز کنید.",
    icon: ChartNoAxesCombined,
    gradient: "from-blue-500 to-blue-700",
    glowColor: "bg-blue-500/20",
  },
  {
    number: "۰۳",
    title: "رقابت هوشمند",
    description:
      "در Griffin Arena مهارت خود را در یک رقابت واقعی بسنجید و با دیگران مقایسه کنید.",
    icon: Brain,
    gradient: "from-purple-500 to-purple-700",
    glowColor: "bg-purple-500/20",
  },
  {
    number: "۰۴",
    title: "مسیر امن موفقیت",
    description:
      "با ابزارهای آموزشی مناسب، قدم به قدم پیشرفت کنید و با اطمینان به هدف برسید.",
    icon: ShieldCheck,
    gradient: "from-[var(--griffin-gold)] to-amber-700",
    glowColor: "bg-[var(--griffin-gold)]/20",
  },
];

// ==================== کامپوننت اصلی ====================
const FeaturesSection = () => {
  const { stats } = usePublicStats();

  const formatCompact = (n: number) => {
    if (n >= 1000) {
      const k = Math.floor(n / 100) / 10;
      return `${k.toLocaleString("fa-IR")}K+`;
    }
    return `${n.toLocaleString("fa-IR")}+`;
  };

  // 🆕 به‌روزرسانی metrics با آمار واقعی
  const featuresWithMetrics: Feature[] = features.map((feature) => {
    if (feature.id === "exams") {
      return {
        ...feature,
        metric: {
          value: formatCompact(stats.totalQuestions),
          label: "سوال استاندارد",
        },
      };
    }
    if (feature.id === "arena") {
      return {
        ...feature,
        metric: {
          value: formatCompact(stats.totalArenaMatches),
          label: "نبرد روزانه",
        },
      };
    }
    if (feature.id === "progress") {
      return {
        ...feature,
        metric: {
          value: formatCompact(stats.totalExams),
          label: "آزمون برگزارشده",
        },
      };
    }
    return feature;
  });

  return (
    <section className="relative px-6 py-20 overflow-hidden">
      {/* هاله‌های پس‌زمینه */}
      <div className="absolute -top-32 right-1/4 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/10 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* ==================== هدر ==================== */}
        <RevealOnScroll>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--griffin-gold)]/10 border border-[var(--griffin-gold)]/30 mb-5">
              <Sparkles size={14} className="text-[var(--griffin-gold)]" />
              <span className="text-xs font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Why Griffin
              </span>
            </div>

            <h2 className="font-heading text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
              چرا آکادمی{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-l from-[var(--griffin-gold)] to-amber-300">
                  گریفین
                </span>
                <span className="absolute bottom-1 right-0 left-0 h-3 bg-[var(--griffin-gold)]/20 -z-0 rounded" />
              </span>
              ؟
            </h2>

            <p className="mt-5 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-8">
              همه‌چیز برای یک مسیر موفقیت هوشمند، در یک پلتفرم یکپارچه.
            </p>
          </div>
        </RevealOnScroll>

        {/* ==================== بخش ۱: امکانات (Bento Grid) ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5 auto-rows-[minmax(180px,auto)]">
          <FeatureCard
            feature={featuresWithMetrics[0]}
            className="md:col-span-2 md:row-span-2 lg:col-span-3 lg:row-span-2"
          />
          <FeatureCard
            feature={featuresWithMetrics[1]}
            className="md:col-span-2 md:row-span-1 lg:col-span-3 lg:row-span-1"
          />
          <FeatureCard
            feature={featuresWithMetrics[2]}
            className="md:col-span-2 md:row-span-1 lg:col-span-2 lg:row-span-1"
          />
          <FeatureCard
            feature={featuresWithMetrics[3]}
            className="md:col-span-2 md:row-span-1 lg:col-span-4 lg:row-span-1"
          />
          <FeatureCard
            feature={featuresWithMetrics[4]}
            className="md:col-span-1 md:row-span-1 lg:col-span-2 lg:row-span-1"
          />
          <FeatureCard
            feature={featuresWithMetrics[5]}
            className="md:col-span-1 md:row-span-1 lg:col-span-2 lg:row-span-1"
          />
        </div>

        {/* ==================== جداکننده ==================== */}
        <RevealOnScroll>
          <div className="relative my-20">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-200 dark:border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-[#080B12] px-4 inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)]" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  چهار قدم تا موفقیت
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)]" />
              </span>
            </div>
          </div>
        </RevealOnScroll>

        {/* ==================== بخش ۲: مزیت‌ها (Timeline زیگزاگ) ==================== */}
        <div className="relative max-w-6xl mx-auto">
          {/* خط عمودی مرکزی (فقط دسکتاپ) */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-[var(--griffin-gold)]/30 to-transparent pointer-events-none" />

          {/* دایره‌های تزئینی روی خط */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_8px_var(--griffin-gold)]"
                style={{ top: `${12 + i * 25}%` }}
              />
            ))}
          </div>

          {/* کارت‌ها */}
          <div className="space-y-8 md:space-y-12">
            {reasons.map((reason, index) => (
              <ReasonCard key={reason.number} reason={reason} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== کارت ویژگی (Bento) ====================
interface FeatureCardProps {
  feature: Feature;
  className?: string;
}

const FeatureCard = ({ feature, className = "" }: FeatureCardProps) => {
  const Icon = feature.icon;
  const isLarge = feature.size === "large";
  const isSmall = feature.size === "small";

  return (
    <div
      className={`
        group relative rounded-3xl overflow-hidden
        border border-gray-200 dark:border-white/10
        bg-white dark:bg-white/[0.03]
        p-6 md:p-7
        transition-transform duration-300
        hover:-translate-y-1
        hover:border-[var(--griffin-gold)]/40
        ${className}
      `}
    >
      {/* هاله گوشه */}
      <div
        className={`
          absolute -top-20 -right-20 w-56 h-56 rounded-full
          ${feature.glowColor} blur-[60px]
          opacity-0 group-hover:opacity-100
          transition-opacity duration-500
          pointer-events-none
        `}
      />

      {/* خط طلایی بالا */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative h-full flex flex-col">
        {/* هدر */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div
            className={`
              relative w-12 h-12 rounded-2xl
              bg-gradient-to-br ${feature.gradient}
              flex items-center justify-center
              text-white shadow-lg
              transition-transform duration-300
              group-hover:scale-110
            `}
          >
            <Icon size={isLarge ? 26 : 22} strokeWidth={2.2} />
          </div>

          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">
            {feature.tag}
          </span>
        </div>

        {/* عنوان */}
        <h3
          className={`
            font-heading font-black text-gray-900 dark:text-white
            ${isLarge ? "text-2xl md:text-3xl" : isSmall ? "text-lg" : "text-xl"}
            leading-tight
          `}
        >
          {feature.title}
        </h3>

        {/* توضیحات */}
        <p
          className={`
            mt-3 leading-7 text-gray-600 dark:text-gray-300
            ${isLarge ? "text-sm md:text-base max-w-md" : "text-xs md:text-sm"}
          `}
        >
          {feature.description}
        </p>

        {/* بولت‌ها */}
        {isLarge && feature.bullets && (
          <ul className="mt-5 space-y-2">
            {feature.bullets.map((bullet, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* متریک */}
        {feature.metric && feature.metric.value && (
          <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/5">
            <p
              className={`
                font-heading font-black text-transparent
                bg-clip-text bg-gradient-to-l ${feature.gradient}
                ${isLarge ? "text-3xl" : "text-2xl"}
                tabular-nums leading-none
              `}
            >
              {feature.metric.value}
            </p>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1.5">
              {feature.metric.label}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== کارت مزیت (Timeline) ====================
interface ReasonCardProps {
  reason: Reason;
  index: number;
}

const ReasonCard = ({ reason, index }: ReasonCardProps) => {
  const Icon = reason.icon;
  const isEven = index % 2 === 0;

  return (
    <div className="relative grid md:grid-cols-2 gap-6 md:gap-12 items-center">
      {isEven ? (
        <>
          {/* کارت */}
          <div className="md:order-1">
            <CardContent reason={reason} Icon={Icon} />
          </div>

          {/* شماره بزرگ (کنار خط) */}
          <div className="hidden md:flex md:order-2 justify-start pr-12">
            <BigNumber number={reason.number} gradient={reason.gradient} />
          </div>
        </>
      ) : (
        <>
          {/* شماره بزرگ (کنار خط) */}
          <div className="hidden md:flex md:order-1 justify-end pl-12">
            <BigNumber number={reason.number} gradient={reason.gradient} />
          </div>

          {/* کارت */}
          <div className="md:order-2">
            <CardContent reason={reason} Icon={Icon} />
          </div>
        </>
      )}
    </div>
  );
};

// ==================== محتوای کارت مزیت ====================
interface CardContentProps {
  reason: Reason;
  Icon: LucideIcon;
}

const CardContent = ({ reason, Icon }: CardContentProps) => {
  return (
    <div className="group relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 md:p-7 transition-transform duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40">
      {/* هاله گوشه */}
      <div
        className={`
          absolute -top-16 -right-16 w-32 h-32 rounded-full
          ${reason.glowColor} blur-2xl
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          pointer-events-none
        `}
      />

      {/* خط طلایی بالا */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[var(--griffin-gold)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start gap-4">
        {/* آیکون */}
        <div
          className={`
            shrink-0 w-12 h-12 rounded-2xl
            bg-gradient-to-br ${reason.gradient}
            flex items-center justify-center
            text-white shadow-lg
            transition-transform duration-300
            group-hover:scale-110
          `}
        >
          <Icon size={22} strokeWidth={2.2} />
        </div>

        {/* متن */}
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg md:text-xl font-black text-gray-900 dark:text-white">
            {reason.title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">
            {reason.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// ==================== شماره بزرگ ====================
interface BigNumberProps {
  number: string;
  gradient: string;
}

const BigNumber = ({ number, gradient }: BigNumberProps) => {
  return (
    <div className="relative">
      <span
        className={`
          font-heading text-[8rem] md:text-[10rem] font-black
          text-transparent bg-clip-text bg-gradient-to-br ${gradient}
          opacity-15 select-none leading-none
        `}
      >
        {number}
      </span>
    </div>
  );
};

export default FeaturesSection;
