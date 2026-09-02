const FinalCTA = () => {
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
          rounded-3xl
          bg-[var(--griffin-gold)]
          p-10
          md:p-16
          text-center
          text-white
        "
      >
        <h2
          className="
            text-3xl
            md:text-5xl
            font-bold
            leading-relaxed
          "
        >
          آماده‌ای مسیر موفقیتت را شروع کنی؟
        </h2>

        <p
          className="
            mt-6
            text-lg
            leading-8
            opacity-90
          "
        >
          با آکادمی گریفین یاد بگیر، رقابت کن و پیشرفت کن.
        </p>

        <button
          className="
            mt-8
            rounded-xl
            bg-white
            px-10
            py-3
            font-bold
            text-[var(--griffin-gold)]
            transition
            hover:scale-105
          "
        >
          شروع مسیر
        </button>
      </div>
    </section>
  );
};

export default FinalCTA;
