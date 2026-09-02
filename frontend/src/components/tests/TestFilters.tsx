const categories = ["همه", "ریاضی", "فیزیک", "شیمی", "زیست"];

const TestFilters = () => {
  return (
    <section>
      <div
        className="
          flex
          flex-wrap
          gap-3
        "
      >
        {categories.map((category) => (
          <button
            key={category}
            className="
                rounded-full

                px-5
                py-2

                bg-white/40
                dark:bg-white/10

                backdrop-blur-xl

                border
                border-white/20

                text-sm

                dark:text-white

                hover:bg-[var(--griffin-gold)]
                hover:text-white

                transition
              "
          >
            {category}
          </button>
        ))}
      </div>
    </section>
  );
};

export default TestFilters;
