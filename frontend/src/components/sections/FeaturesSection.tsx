import { BookOpen, Trophy, Users, Target } from "lucide-react";

const features = [
  {
    title: "آزمون‌های هوشمند",
    description: "تمرین، ارزیابی و بررسی عملکرد برای رسیدن به بهترین نتیجه.",
    icon: BookOpen,
  },
  {
    title: "Griffin Arena",
    description: "رقابت آنلاین با دیگر دانش‌آموزان و سنجش سرعت و دقت.",
    icon: Trophy,
  },
  {
    title: "مشاوره تخصصی",
    description: "برنامه‌ریزی و همراهی در مسیر موفقیت تحصیلی.",
    icon: Users,
  },
  {
    title: "مسیر پیشرفت",
    description: "مشاهده رشد، امتیازها و دستاوردهای شخصی.",
    icon: Target,
  },
];

const FeaturesSection = () => {
  return (
    <section className="px-6 py-20">
      <div className="max-w-7xl mx-auto">
        {/* 🔹 هدر بخش */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            چرا آکادمی گریفین؟
          </h2>

          {/* خط طلایی زیر تیتر */}
          <div className="w-20 h-1 bg-[var(--griffin-gold)] mx-auto mt-4 rounded-full" />

          <p className="mt-5 text-gray-600 dark:text-gray-300">
            همه ابزارهای لازم برای یک مسیر موفقیت هوشمند
          </p>
        </div>

        {/* 🔹 گرید ویژگی‌ها - چیدمان اصلی حفظ شد */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className={`
                  group
                  relative
                  rounded-3xl
                  border border-gray-200 dark:border-gray-800
                  bg-white dark:bg-white/5
                  p-8
                  transition-all duration-300
                  hover:-translate-y-2
                  hover:shadow-2xl
                  hover:shadow-[var(--griffin-gold)]/10
                  hover:border-[var(--griffin-gold)]/40
                  overflow-hidden
                  ${index === 0 ? "md:col-span-2" : ""}
                `}
              >
                {/* 🔹 گرادیان تزئینی در پس‌زمینه کارت */}
                <div
                  className="
                    absolute -top-16 -right-16
                    w-40 h-40 rounded-full
                    bg-[var(--griffin-gold)]/10
                    blur-3xl
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity duration-500
                    pointer-events-none
                  "
                />

                {/* 🔹 آیکون */}
                <div
                  className="
                    relative
                    w-12 h-12
                    rounded-2xl
                    flex items-center justify-center
                    bg-gradient-to-br
                    from-[var(--griffin-gold)]
                    to-amber-600
                    text-white
                    mb-6
                    shadow-lg shadow-[var(--griffin-gold)]/30
                    transition-transform duration-300
                    group-hover:scale-110
                    group-hover:rotate-3
                  "
                >
                  <Icon size={24} strokeWidth={2.2} />
                </div>

                {/* 🔹 متن */}
                <h3 className="font-heading relative text-xl font-bold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>

                <p className="relative mt-3 leading-8 text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>

                {/* 🔹 خط طلایی در پایین کارت هنگام hover */}
                <div
                  className="
                    absolute bottom-0 left-0 right-0
                    h-1
                    bg-gradient-to-r
                    from-transparent
                    via-[var(--griffin-gold)]
                    to-transparent
                    scale-x-0
                    group-hover:scale-x-100
                    transition-transform duration-500
                    origin-center
                  "
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;