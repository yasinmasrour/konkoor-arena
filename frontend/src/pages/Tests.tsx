import TestHero from "../components/tests/TestHero";
import TestFilters from "../components/tests/TestFilters";
import TestCard from "../components/tests/TestCard";
import { useEffect, useState } from "react";
import type { Exam } from "../types/exam";
import { getExams } from "../services/examService";

const Tests = () => {
  const [exams, setExams] = useState<Exam[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await getExams();

        console.log("EXAMS RESPONSE:", data);

        setExams(data.exams);
      } catch (error) {
        console.error(error);

        setError("دریافت آزمون‌ها با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

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
          max-w-7xl
          mx-auto
          space-y-8
        "
      >
        <TestHero />

        <TestFilters />

        {loading ? (
          <p className="dark:text-white">در حال دریافت آزمون‌ها...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : exams.length === 0 ? (
          <p className="text-center dark:text-white">
            در حال حاضر آزمونی برای نمایش وجود ندارد.
          </p>
        ) : (
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              lg:grid-cols-3
              gap-6
            "
          >
            {exams.map((exam) => (
              <TestCard
                key={exam.id}
                id={exam.id}
                title={exam.title}
                lesson={exam.booklets?.[0]?.booklet?.lesson ?? "آزمون جامع"}
                grade={exam.booklets?.[0]?.booklet?.grade ?? "-"}
                major={exam.booklets?.[0]?.booklet?.major ?? "-"}
                duration={
                  exam.booklets?.reduce(
                    (total, item) => total + (item.booklet?.duration ?? 0),
                    0,
                  ) ?? 0
                }
                questionCount={
                  exam.booklets?.reduce(
                    (total, item) =>
                      total + (item.booklet?.questions?.length ?? 0),
                    0,
                  ) ?? 0
                }
                status={exam.status}
                examDate={exam.examDate}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Tests;
