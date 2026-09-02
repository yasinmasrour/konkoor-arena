import { useNavigate } from "react-router-dom";

interface Props {
  id: string;
  title: string;
  lesson: string;
  grade: string;
  major: string;
  duration: number;
  questionCount: number;
  status: string;
  examDate: string;
}

const TestCard = ({
  id,
  title,
  lesson,
  grade,
  major,
  duration,
  questionCount,
  status,
  examDate,
}: Props) => {
  const navigate = useNavigate();

  return (
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
        transition
        hover:-translate-y-1
      "
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="
            text-sm
            text-[var(--griffin-gold)]
          "
        >
          {lesson}
        </span>

        <span
          className="
            text-xs
            text-gray-500
            dark:text-gray-400
          "
        >
          {status === "published" ? "منتشر شده" : "پیش‌نویس"}
        </span>
      </div>

      <h3
        className="
          mt-4
          text-xl
          font-bold
          dark:text-white
        "
      >
        {title}
      </h3>

      <div
        className="
          mt-5
          space-y-2
          text-sm
          text-gray-600
          dark:text-gray-300
        "
      >
        <p>پایه: {grade}</p>

        <p>رشته: {major}</p>

        <p>تعداد سوالات: {questionCount}</p>

        <p>زمان: {duration} دقیقه</p>

        <p>تاریخ: {new Date(examDate).toLocaleDateString("fa-IR")}</p>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/tests/${id}`)}
        className="
          mt-6
          w-full
          rounded-xl
          bg-[var(--griffin-gold)]
          py-2
          text-white
          transition
          hover:opacity-90
        "
      >
        مشاهده آزمون
      </button>
    </div>
  );
};

export default TestCard;
