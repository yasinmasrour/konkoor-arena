import { useAuth } from "../../context/AuthContext";

const WelcomeCard = () => {
  const { user } = useAuth();

  return (
    <section
      className="
        rounded-3xl
        p-8

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
          font-bold
          text-[var(--griffin-gold)]
        "
      >
        خوش آمدید، {user?.firstName}
      </h1>

      <p
        className="
          mt-3
          text-gray-600
          dark:text-gray-300
        "
      >
        مسیر موفقیت شما در آکادمی گریفین از اینجا شروع می‌شود.
      </p>
    </section>
  );
};

export default WelcomeCard;
