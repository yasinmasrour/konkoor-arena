import logoLight from "../../assets/logo-light.webp";
import logoDark from "../../assets/logo-dark.webp";
import { useTheme } from "../../context/ThemeContext";

const HeroSection = () => {
  const { theme } = useTheme();

  return (
    <section
      className="
        min-h-[85vh]
        flex
        items-center
        px-6
        py-20
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          w-full
          grid
          md:grid-cols-2
          gap-12
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
          <h1
            className="
              text-4xl
              md:text-6xl
              font-bold
              leading-relaxed
              text-gray-900
              dark:text-white
            "
          >
            مسیر موفقیت
            <br />
            با آکادمی{" "}
            <span
              className="
                text-[var(--griffin-gold)]
              "
            >
              گریفین
            </span>
          </h1>

          <p
            className="
              text-lg
              text-gray-600
              dark:text-gray-300
              max-w-xl
              leading-9
            "
          >
            یادگیری، آزمون و رقابت را در یک مسیر هوشمند تجربه کنید. برای کنکور
            آماده شوید و مهارت‌های خود را به چالش بکشید.
          </p>

          <div
            className="
              flex
              flex-col
              sm:flex-row
              gap-4
              justify-center
              md:justify-start
            "
          >
            <button
              className="
                rounded-xl
                bg-[var(--griffin-gold)]
                px-8
                py-3
                text-white
                font-medium
                hover:opacity-90
                transition
              "
            >
              شروع مسیر
            </button>

            <button
              className="
                rounded-xl
                border
                border-[var(--griffin-gold)]
                px-8
                py-3
                text-[var(--griffin-gold)]
                hover:bg-[var(--griffin-gold)]
                hover:text-white
                transition
              "
            >
              ورود به Arena
            </button>
          </div>
        </div>

        {/* Logo Card */}

        <div
          className="
            flex
            justify-center
          "
        >
          <div
            className="
              relative
              rounded-3xl
              border
              border-gray-200
              dark:border-gray-800
              bg-white
              dark:bg-white/5
              backdrop-blur-xl
              p-10
              shadow-lg
            "
          >
            <img
              src={theme === "dark" ? logoLight : logoDark}
              alt="Griffin Academy"
              className="
                w-64
                md:w-80
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
