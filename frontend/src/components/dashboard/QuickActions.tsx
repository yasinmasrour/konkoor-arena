import { ClipboardList, Swords, BookOpen, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const actions = [
  {
    title: "آزمون‌ها",
    description: "شرکت در آزمون‌های آزمایشی",
    icon: ClipboardList,
    path: "/tests",
  },

  {
    title: "کنکور Arena",
    description: "رقابت سریع با دیگران",
    icon: Swords,
    path: "/arena",
  },

  {
    title: "دوره‌ها",
    description: "مشاهده کلاس‌ها و دوره‌ها",
    icon: BookOpen,
    path: "/courses",
  },

  {
    title: "مشاوره",
    description: "برنامه‌ریزی و راهنمایی",
    icon: MessageCircle,
    path: "/counseling",
  },
];

const QuickActions = () => {
  const navigate = useNavigate();

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
        دسترسی سریع
      </h2>

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-6
        "
      >
        {actions.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              onClick={() => navigate(item.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") navigate(item.path);
              }}
              className="
                  rounded-3xl
                  p-6

                  bg-white/40
                  dark:bg-white/10

                  backdrop-blur-xl

                  border
                  border-white/20

                  shadow-lg

                  cursor-pointer

                  transition

                  hover:-translate-y-1
                "
            >
              <Icon
                size={32}
                className="
                    text-[var(--griffin-gold)]
                  "
              />

              <h3
                className="
                    mt-5
                    text-xl
                    font-bold
                    dark:text-white
                  "
              >
                {item.title}
              </h3>

              <p
                className="
                    mt-2
                    text-sm
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
    </section>
  );
};

export default QuickActions;
