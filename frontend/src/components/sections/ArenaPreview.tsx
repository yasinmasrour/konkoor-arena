import { Swords, Timer, Trophy } from "lucide-react";

const ArenaPreview = () => {
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
          overflow-hidden
          bg-[#080B12]
          p-8
          md:p-12
          text-white
        "
      >
        <div
          className="
            grid
            md:grid-cols-2
            gap-10
            items-center
          "
        >
          {/* Text */}

          <div
            className="
              space-y-6
              text-center
              md:text-right
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
                justify-center
                md:justify-start
                text-[var(--griffin-gold)]
              "
            >
              <Swords size={28} />

              <span>Griffin Arena</span>
            </div>

            <h2
              className="
                text-3xl
                md:text-5xl
                font-bold
                leading-relaxed
              "
            >
              رقابت واقعی،
              <br />
              برای موفقیت واقعی
            </h2>

            <p
              className="
                text-gray-300
                leading-8
              "
            >
              با دانش‌آموزان دیگر رقابت کن، سرعت و دقت خود را بسنج و جایگاه خود
              را ارتقا بده.
            </p>

            <button
              className="
                rounded-xl
                bg-[var(--griffin-gold)]
                px-8
                py-3
                text-white
                transition
                hover:opacity-90
              "
            >
              ورود به Arena
            </button>
          </div>

          {/* Arena Card */}

          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/5
              backdrop-blur-xl
              p-8
            "
          >
            <div
              className="
                grid
                grid-cols-3
                gap-4
                items-center
                text-center
              "
            >
              <div>
                <Trophy className="mx-auto mb-3 text-yellow-400" />

                <span>رتبه</span>

                <p
                  className="
                    mt-2
                    text-xl
                    font-bold
                  "
                >
                  125
                </p>
              </div>

              <div
                className="
                  text-2xl
                  font-bold
                  text-[var(--griffin-gold)]
                "
              >
                VS
              </div>

              <div>
                <Timer className="mx-auto mb-3 text-yellow-400" />

                <span>زمان</span>

                <p
                  className="
                    mt-2
                    text-xl
                    font-bold
                  "
                >
                  00:30
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArenaPreview;
