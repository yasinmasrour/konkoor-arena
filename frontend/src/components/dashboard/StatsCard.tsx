const stats = [
  {
    title: "آزمون‌های شرکت کرده",
    value: "12",
  },

  {
    title: "امتیاز Arena",
    value: "850",
  },

  {
    title: "درصد پیشرفت",
    value: "75%",
  },
];

const StatsCard = () => {
  return (
    <section
      className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-6
      "
    >
      {stats.map((item) => (
        <div
          key={item.title}
          className="
              rounded-3xl
              p-6

              bg-white/40
              dark:bg-white/10

              backdrop-blur-xl

              border
              border-white/20

              shadow-lg

              transition
              hover:-translate-y-1
            "
        >
          <p
            className="
                text-sm
                text-gray-600
                dark:text-gray-300
              "
          >
            {item.title}
          </p>

          <h2
            className="
                mt-4
                text-4xl
                font-bold
                text-[var(--griffin-gold)]
              "
          >
            {item.value}
          </h2>
        </div>
      ))}
    </section>
  );
};

export default StatsCard;
