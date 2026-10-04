import {
  Brain,
  ChartNoAxesCombined,
  GraduationCap,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface Reason {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  glowColor: string;
}

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

const WhyGriffin = () => {
  return (
    <section className="relative px-6 py-24 overflow-hidden">
      {/* 🆕 هاله‌های پس‌زمینه (سبک) */}
      <div className="absolute -top-40 right-1/3 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/8 blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-purple-600/8 blur-[80px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* ==================== هدر ==================== */}
        <div className="text-center mb-16">
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
            چهار قدم برای ساختن یک مسیر موفقیت هوشمند و متفاوت.
          </p>
        </div>

        {/* ==================== Timeline / Journey ==================== */}
        <div className="relative">
          {/* 🆕 خط عمودی مرکزی (فقط دسکتاپ) */}
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-[var(--griffin-gold)]/30 to-transparent pointer-events-none" />

          {/* 🆕 دایره‌های تزئینی روی خط */}
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

// ==================== کامپوننت کارت ====================
interface ReasonCardProps {
  reason: Reason;
  index: number;
}

const ReasonCard = ({ reason, index }: ReasonCardProps) => {
  const Icon = reason.icon;
  const isEven = index % 2 === 0;

  return (
    <div
      className={`
        relative
        grid md:grid-cols-2 gap-6 md:gap-12 items-center
      `}
    >
      {/* ==================== سمت راست (متن + کارت) ==================== */}
      {isEven ? (
        <>
          {/* کارت */}
          <div className="md:order-1">
            <CardContent reason={reason} Icon={Icon} />
          </div>

          {/* شماره بزرگ (کنار خط) */}
          <div className="hidden md:flex md:order-2 justify-start md:justify-start pr-12">
            <BigNumber number={reason.number} gradient={reason.gradient} />
          </div>
        </>
      ) : (
        <>
          {/* شماره بزرگ (کنار خط) */}
          <div className="hidden md:flex md:order-1 justify-end md:justify-end pl-12">
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

// ==================== محتوای کارت ====================
interface CardContentProps {
  reason: Reason;
  Icon: LucideIcon;
}

const CardContent = ({ reason, Icon }: CardContentProps) => {
  return (
    <div className="group relative rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 md:p-7 transition-transform duration-300 hover:-translate-y-1 hover:border-[var(--griffin-gold)]/40">
      {/* 🆕 هاله‌ی گوشه (سبک) */}
      <div
        className={`
          absolute -top-16 -right-16 w-32 h-32 rounded-full
          ${reason.glowColor} blur-2xl
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          pointer-events-none
        `}
      />

      {/* 🆕 خط طلایی بالای کارت */}
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

export default WhyGriffin;