const TestHero = () => {
  return (
    <section
      className="
        rounded-3xl
        p-8
        md:p-12

        bg-white/40
        dark:bg-white/10

        backdrop-blur-xl

        border
        border-white/20

        shadow-lg
      "
    >
      <h1
        className="
          text-3xl
          md:text-5xl

          font-bold

          text-[var(--griffin-gold)]
        "
      >
        آزمون‌های گریفین
      </h1>

      <p
        className="
          mt-4

          max-w-2xl

          text-gray-600
          dark:text-gray-300

          leading-8
        "
      >
        با آزمون‌های استاندارد گریفین، سطح آمادگی خودت را بسنج، نقاط ضعف را پیدا
        کن و برای موفقیت در کنکور آماده‌تر شو.
      </p>
    </section>
  );
};

export default TestHero;
