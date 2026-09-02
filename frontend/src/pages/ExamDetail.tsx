import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Clock, FileQuestion } from "lucide-react";

import { getExamById } from "../services/examService";
import type { ExamDetail as ExamDetailType } from "../types/examDetail";
import { startAttempt } from "../services/attemptService";

const ExamDetail = () => {
  const { id } = useParams();

  const [exam, setExam] = useState<ExamDetailType | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleStartAttempt = async () => {
    if (!exam) return;

    try {
      const data = await startAttempt(exam.id);

      console.log("ATTEMPT STARTED:", data);

      navigate(`/attempts/${data.result.attempt.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchExam = async () => {
      if (!id) return;

      try {
        const data = await getExamById(id);

        console.log("EXAM DETAIL RESPONSE:", data);

        setExam(data.exam);
      } catch (error) {
        console.error(error);

        setError("دریافت اطلاعات آزمون با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id]);

  if (loading) {
    return (
      <main
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-gray-50
          dark:bg-[#080B12]
        "
      >
        <p className="dark:text-white">در حال دریافت اطلاعات آزمون...</p>
      </main>
    );
  }

  if (error || !exam) {
    return (
      <main
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-gray-50
          dark:bg-[#080B12]
        "
      >
        <p className="text-red-500">{error || "آزمون پیدا نشد."}</p>
      </main>
    );
  }

  const questionCount = exam.booklets.reduce(
    (total, item) => total + item.booklet.questions.length,
    0,
  );

  const duration = exam.booklets.reduce(
    (total, item) => total + item.booklet.duration,
    0,
  );

  return (
    <main
      className="
        min-h-screen
        px-6
        py-10
        bg-gray-50
        dark:bg-[#080B12]
      "
    >
      <div
        className="
          max-w-4xl
          mx-auto
        "
      >
        <div
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
          {/* Header */}

          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className="
                  text-sm
                  text-[var(--griffin-gold)]
                "
              >
                آزمون
              </span>

              <h1
                className="
                  mt-3
                  text-3xl
                  font-bold
                  dark:text-white
                "
              >
                {exam.title}
              </h1>
            </div>

            <span
              className="
                shrink-0
                rounded-full
                px-4
                py-2
                text-xs
                bg-[var(--griffin-gold)]
                text-white
              "
            >
              {exam.status === "published" ? "منتشر شده" : "پیش‌نویس"}
            </span>
          </div>

          {/* Info */}

          <div
            className="
              mt-8
              grid
              grid-cols-1
              sm:grid-cols-3
              gap-4
            "
          >
            <div
              className="
                rounded-2xl
                bg-white/50
                dark:bg-black/20
                p-5
              "
            >
              <FileQuestion size={22} className="text-[var(--griffin-gold)]" />

              <p className="mt-3 text-sm dark:text-gray-300">تعداد سوال</p>

              <p className="mt-1 font-bold dark:text-white">
                {questionCount} سوال
              </p>
            </div>

            <div
              className="
                rounded-2xl
                bg-white/50
                dark:bg-black/20
                p-5
              "
            >
              <Clock size={22} className="text-[var(--griffin-gold)]" />

              <p className="mt-3 text-sm dark:text-gray-300">مدت آزمون</p>

              <p className="mt-1 font-bold dark:text-white">{duration} دقیقه</p>
            </div>

            <div
              className="
                rounded-2xl
                bg-white/50
                dark:bg-black/20
                p-5
              "
            >
              <CalendarDays size={22} className="text-[var(--griffin-gold)]" />

              <p className="mt-3 text-sm dark:text-gray-300">تاریخ آزمون</p>

              <p className="mt-1 font-bold dark:text-white">
                {new Date(exam.examDate).toLocaleDateString("fa-IR")}
              </p>
            </div>
          </div>

          {/* Booklets */}

          <div className="mt-8">
            <h2
              className="
                text-xl
                font-bold
                dark:text-white
              "
            >
              دفترچه‌های آزمون
            </h2>

            <div className="mt-4 space-y-3">
              {exam.booklets.map((item) => (
                <div
                  key={item.id}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-2xl
                    border
                    border-gray-200
                    dark:border-gray-700
                    p-4
                  "
                >
                  <div>
                    <p className="font-medium dark:text-white">
                      {item.booklet.lesson}
                    </p>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {item.booklet.grade} | {item.booklet.major}
                    </p>
                  </div>

                  <div
                    className="
                      text-sm
                      text-gray-600
                      dark:text-gray-300
                    "
                  >
                    {item.booklet.questions.length} سوال
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start */}

          <button
            onClick={handleStartAttempt}
            className="
              w-full
              rounded-xl
              bg-[var(--griffin-gold)]
              py-3
              text-white
              hover:opacity-90
              transition
            "
          >
            شروع آزمون
          </button>
        </div>
      </div>
    </main>
  );
};

export default ExamDetail;
