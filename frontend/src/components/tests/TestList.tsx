import { CalendarDays, Clock, FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

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
  const formattedDate = new Date(examDate).toLocaleDateString("fa-IR");

  return (
    <div
      className="
      rounded-3xl
      border
      border-gray-200
      dark:border-gray-700
      bg-white
      dark:bg-[#111827]
      p-6
      shadow-sm
      hover:shadow-xl
      transition
      "
    >
      <div className="flex justify-between items-start">
        <h3
          className="
          text-lg
          font-bold
          dark:text-white
          "
        >
          {title}
        </h3>

        <span
          className="
          text-xs
          rounded-full
          px-3
          py-1
          bg-[var(--griffin-gold)]
          text-white
          "
        >
          {status === "published" ? "منتشر شده" : "در انتظار"}
        </span>
      </div>

      <div
        className="
        mt-5
        space-y-3
        text-sm
        text-gray-600
        dark:text-gray-300
        "
      >
        <p>
          {lesson} | {grade} | {major}
        </p>

        <div className="flex items-center gap-2">
          <FileQuestion size={18} />

          <span>{questionCount} سوال</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={18} />

          <span>{duration} دقیقه</span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays size={18} />

          <span>{formattedDate}</span>
        </div>
      </div>

      <Link
        to={`/tests/${id}`}
        className="
        block
        mt-6
        text-center
        rounded-xl
        bg-[var(--griffin-gold)]
        py-3
        text-white
        hover:opacity-90
        transition
        "
      >
        شروع آزمون
      </Link>
    </div>
  );
};

export default TestCard;
