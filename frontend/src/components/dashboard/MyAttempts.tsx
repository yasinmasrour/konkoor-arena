import { useEffect, useState } from "react";
import { Eye, RotateCcw } from "lucide-react";

import { getMyAttempts } from "../../services/attemptService";

import type { MyAttempt } from "../../types/attempt";

import { useNavigate } from "react-router-dom";

const MyAttempts = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState<MyAttempt[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const data = await getMyAttempts();

        setAttempts(data.attempts);
      } catch (error) {
        console.error("GET MY ATTEMPTS ERROR:", error);

        setError("دریافت آزمون‌های شما با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  if (loading) {
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
        "
      >
        <p className="dark:text-white">در حال دریافت آزمون‌ها...</p>
      </div>
    );
  }

  if (error) {
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
        "
      >
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="
              text-2xl
              font-bold
              dark:text-white
            "
          >
            آزمون‌های من
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            آزمون‌هایی که تاکنون شرکت کرده‌اید
          </p>
        </div>
      </div>

      {attempts.length === 0 ? (
        <div
          className="
            mt-6
            rounded-3xl
            p-8
            text-center
            bg-white/40
            dark:bg-white/10
            backdrop-blur-xl
            border
            border-white/20
          "
        >
          <p className="dark:text-white">هنوز در هیچ آزمونی شرکت نکرده‌اید.</p>

          <button
            type="button"
            onClick={() => navigate("/tests")}
            className="
              mt-5
              rounded-xl
              px-6
              py-3
              bg-[var(--griffin-gold)]
              text-white
              hover:opacity-90
              transition
            "
          >
            مشاهده آزمون‌ها
          </button>
        </div>
      ) : (
        <div
          className="
            mt-6
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-5
          "
        >
          {attempts.map((attempt) => {
            const isSubmitted = attempt.status === "submitted";

            return (
              <div
                key={attempt.id}
                className="
                  rounded-3xl
                  p-6
                  bg-white/40
                  dark:bg-white/10
                  backdrop-blur-xl
                  border
                  border-white/20
                  shadow-lg
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3
                      className="
                        text-lg
                        font-bold
                        dark:text-white
                      "
                    >
                      {attempt.exam.title}
                    </h3>

                    <p
                      className="
                        mt-2
                        text-sm
                        text-gray-500
                        dark:text-gray-400
                      "
                    >
                      تاریخ آزمون:{" "}
                      {new Date(attempt.exam.examDate).toLocaleDateString(
                        "fa-IR",
                      )}
                    </p>
                  </div>

                  <span
                    className={`
                      shrink-0
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      ${
                        isSubmitted
                          ? `
                            bg-green-500/10
                            text-green-500
                          `
                          : `
                            bg-[var(--griffin-gold)]/10
                            text-[var(--griffin-gold)]
                          `
                      }
                    `}
                  >
                    {isSubmitted ? "تکمیل شده" : "در حال انجام"}
                  </span>
                </div>

                {isSubmitted ? (
                  <div
                    className="
                      mt-6
                      grid
                      grid-cols-2
                      gap-4
                    "
                  >
                    <div
                      className="
                        rounded-2xl
                        p-4
                        bg-white/40
                        dark:bg-black/20
                      "
                    >
                      <p
                        className="
                          text-xs
                          text-gray-500
                          dark:text-gray-400
                        "
                      >
                        درصد
                      </p>

                      <p
                        className="
                          mt-1
                          text-2xl
                          font-bold
                          text-[var(--griffin-gold)]
                        "
                      >
                        {attempt.percentage}%
                      </p>
                    </div>

                    <div
                      className="
                        rounded-2xl
                        p-4
                        bg-white/40
                        dark:bg-black/20
                      "
                    >
                      <p
                        className="
                          text-xs
                          text-gray-500
                          dark:text-gray-400
                        "
                      >
                        امتیاز
                      </p>

                      <p
                        className="
                          mt-1
                          text-2xl
                          font-bold
                          dark:text-white
                        "
                      >
                        {attempt.score}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="mt-6">
                  {isSubmitted ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/attempts/${attempt.id}/result`)}
                      className="
                        w-full
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        px-5
                        py-3
                        bg-[var(--griffin-gold)]
                        text-white
                        hover:opacity-90
                        transition
                      "
                    >
                      <Eye size={18} />
                      مشاهده نتیجه
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(`/attempts/${attempt.id}`)}
                      className="
                        w-full
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        px-5
                        py-3
                        bg-[var(--griffin-gold)]
                        text-white
                        hover:opacity-90
                        transition
                      "
                    >
                      <RotateCcw size={18} />
                      ادامه آزمون
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MyAttempts;
