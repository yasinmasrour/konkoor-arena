const activities = [
  {
    title: "آزمون ریاضی پایه دوازدهم",
    description: "کسب امتیاز 85 درصد",
    time: "امروز",
  },

  {
    title: "شرکت در کنکور Arena",
    description: "دریافت 50 امتیاز",
    time: "دیروز",
  },

  {
    title: "مشاهده دوره فیزیک",
    description: "ادامه یادگیری دوره",
    time: "10 دقیقه پیش",
  },
];

const ActivityCard = () => {
  return (
    <section>
      <h2
        className="
          text-2xl
          font-bold
          mb-5
          dark:text-white
        "
      >
        آخرین فعالیت‌ها
      </h2>

      <div
        className="
          rounded-3xl
          p-6

          bg-white/40
          dark:bg-white/10

          backdrop-blur-xl

          border
          border-white/20

          shadow-lg
        "
      >
        <div
          className="
            space-y-5
          "
        >
          {activities.map((item) => (
            <div
              key={item.title}
              className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between

                  gap-2

                  border-b
                  last:border-none

                  border-gray-200
                  dark:border-gray-700

                  pb-4
                  last:pb-0
                "
            >
              <div>
                <h3
                  className="
                      font-semibold
                      dark:text-white
                    "
                >
                  {item.title}
                </h3>

                <p
                  className="
                      text-sm
                      text-gray-600
                      dark:text-gray-300
                    "
                >
                  {item.description}
                </p>
              </div>

              <span
                className="
                    text-sm
                    text-[var(--griffin-gold)]
                  "
              >
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivityCard;
