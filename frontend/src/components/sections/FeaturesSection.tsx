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
    <section
      className="
        px-6
        py-20
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
        "
      >
        <div
          className="
            text-center
            mb-12
          "
        >
          <h2
            className="
              text-3xl
              md:text-4xl
              font-bold
              text-gray-900
              dark:text-white
            "
          >
            چرا آکادمی گریفین؟
          </h2>

          <p
            className="
              mt-4
              text-gray-600
              dark:text-gray-300
            "
          >
            همه ابزارهای لازم برای یک مسیر موفقیت هوشمند
          </p>
        </div>

        <div
          className="
            grid
            md:grid-cols-3
            gap-6
          "
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className={`
                  rounded-3xl
                  border
                  border-gray-200
                  dark:border-gray-800
                  bg-white
                  dark:bg-white/5
                  p-8
                  transition
                  hover:-translate-y-1
                  hover:shadow-xl
                  ${index === 0 ? "md:col-span-2" : ""}
                `}
              >
                <div
                  className="
                    w-12
                    h-12
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    bg-[var(--griffin-gold)]
                    text-white
                    mb-6
                  "
                >
                  <Icon size={24} />
                </div>

                <h3
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  {feature.title}
                </h3>

                <p
                  className="
                    mt-3
                    leading-8
                    text-gray-600
                    dark:text-gray-300
                  "
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
