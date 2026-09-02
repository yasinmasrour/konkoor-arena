import { useEffect, useState } from "react";
import {
  getAttemptQuestions,
  submitAnswer,
  submitAttempt,
} from "../services/attemptService";
import type {
  AttemptQuestion,
  AttemptQuestionsResponse,
} from "../types/attempt";
import { useNavigate, useParams } from "react-router-dom";

const Attempt = () => {
  const { attemptId } = useParams();

  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<AttemptQuestionsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!attemptId) return;

      try {
        const data = await getAttemptQuestions(attemptId);

        setAttempt(data);
      } catch (error) {
        console.error(error);

        setError("دریافت سؤالات آزمون با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [attemptId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080B12]">
        <p className="dark:text-white">در حال دریافت آزمون...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080B12]">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  if (!attempt || attempt.questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080B12]">
        <p className="dark:text-white">سؤالی برای این آزمون پیدا نشد.</p>
      </main>
    );
  }

  const question: AttemptQuestion = attempt.questions[currentQuestion];

  const handleSelectAnswer = async (selectedAnswer: number) => {
    if (!attempt) return;

    try {
      setSelectedAnswers((prev) => ({
        ...prev,
        [question.id]: selectedAnswer,
      }));

      await submitAnswer(attempt.attemptId, question.id, selectedAnswer);
    } catch (error) {
      console.error("SUBMIT ANSWER ERROR:", error);
    }
  };

  const handleSubmitAttempt = async () => {
    if (!attempt) return;

    try {
      const data = await submitAttempt(attempt.attemptId);

      console.log("ATTEMPT SUBMITTED:", data);

      navigate(`/attempts/${attempt.attemptId}/result`);
    } catch (error) {
      console.error("SUBMIT ATTEMPT ERROR:", error);
    }
  };

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
      <div className="max-w-5xl mx-auto">
        {/* Header */}

        <div
          className="
            mb-8
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <div>
            <h1
              className="
                text-2xl
                font-bold
                dark:text-white
              "
            >
              {attempt.exam.title}
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              سؤال {currentQuestion + 1} از {attempt.questions.length}
            </p>
          </div>

          <div
            className="
              rounded-xl
              px-4
              py-2
              bg-white/60
              dark:bg-white/10
              backdrop-blur-xl
              border
              border-white/20
              dark:text-white
            "
          >
            زمان آزمون
          </div>
        </div>

        {/* Question */}

        <div
          className="
            rounded-3xl
            p-8
            bg-white/50
            dark:bg-white/10
            backdrop-blur-xl
            border
            border-white/20
            shadow-lg
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              mb-6
            "
          >
            <span
              className="
                text-sm
                text-[var(--griffin-gold)]
              "
            >
              سؤال {currentQuestion + 1}
            </span>

            <span
              className="
                text-xs
                text-gray-500
                dark:text-gray-400
              "
            >
              درجه سختی: {question.difficulty}
            </span>
          </div>

          <h2
            className="
              text-lg
              leading-8
              font-semibold
              dark:text-white
            "
          >
            {question.questionText}
          </h2>

          {/* Question Image */}

          {question.questionImage && (
            <img
              src={question.questionImage}
              alt="تصویر سؤال"
              className="
                mt-6
                max-h-80
                mx-auto
                rounded-xl
                object-contain
              "
            />
          )}

          {/* Options */}

          <div className="mt-8 grid gap-4">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswers[question.id] === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectAnswer(index)}
                  className={`
                      w-full
                      rounded-2xl
                      border
                      px-5
                      py-4
                      text-right
                      transition
                      dark:text-gray-200
                  
                      ${
                        isSelected
                          ? `
                            border-[var(--griffin-gold)]
                            bg-[var(--griffin-gold)]/15
                            shadow-md
                          `
                          : `
                            border-gray-200
                            dark:border-gray-700
                            hover:border-[var(--griffin-gold)]
                            hover:bg-[var(--griffin-gold)]/10
                          `
                      }
                    `}
                >
                  <span className="font-semibold ml-3">{index + 1}.</span>

                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}

        <div
          className="
            mt-6
            flex
            items-center
            justify-between
          "
        >
          <button
            type="button"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion((prev) => prev - 1)}
            className="
              rounded-xl
              px-6
              py-3
              bg-white
              dark:bg-white/10
              dark:text-white
              disabled:opacity-40
            "
          >
            سؤال قبل
          </button>

          {currentQuestion < attempt.questions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              className="
                rounded-xl
                px-6
                py-3
                bg-[var(--griffin-gold)]
                text-white
                hover:opacity-90
              "
            >
              سؤال بعد
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitAttempt}
              className="
                rounded-xl
                px-6
                py-3
                bg-[var(--griffin-gold)]
                text-white
                hover:opacity-90
              "
            >
              پایان آزمون
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Attempt;
