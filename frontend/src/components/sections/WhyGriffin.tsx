import {
  Brain,
  ChartNoAxesCombined,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

const reasons = [
  {
    title: "یادگیری هدفمند",
    description:
      "با برنامه‌ریزی درست و مسیر مشخص، زمان خود را بهتر مدیریت کنید.",
    icon: GraduationCap,
  },
  {
    title: "تحلیل عملکرد",
    description:
      "نتایج آزمون‌ها را بررسی کنید و نقاط قوت و ضعف خود را بشناسید.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "رقابت هوشمند",
    description: "در Griffin Arena مهارت خود را در یک رقابت واقعی بسنجید.",
    icon: Brain,
  },
  {
    title: "مسیر امن موفقیت",
    description: "با ابزارهای آموزشی مناسب، قدم به قدم پیشرفت کنید.",
    icon: ShieldCheck,
  },
];

const WhyGriffin = () => {
  return (
    <section
      className="
        px-6
        py-24
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
            mb-14
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
            ابزارهایی برای ساختن یک مسیر موفقیت هوشمند
          </p>
        </div>

        <div
          className="
            grid
            sm:grid-cols-2
            gap-6
          "
        >
          {reasons.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="
                    rounded-3xl
                    border
                    border-gray-200
                    dark:border-gray-800
                    bg-white
                    dark:bg-white/5
                    p-8
                    transition
                    hover:-translate-y-1
                  "
              >
                <div
                  className="
                      w-12
                      h-12
                      rounded-2xl
                      bg-[var(--griffin-gold)]
                      flex
                      items-center
                      justify-center
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
                      dark:text-white
                    "
                >
                  {item.title}
                </h3>

                <p
                  className="
                      mt-3
                      leading-8
                      text-gray-600
                      dark:text-gray-300
                    "
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyGriffin;
