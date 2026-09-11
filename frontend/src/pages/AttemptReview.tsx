import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, MinusCircle, ArrowRight } from "lucide-react";
import MathText from "../components/questions/MathText";
import { getAttemptReview } from "../services/attemptService";
import type {
  AttemptReviewQuestion,
  AttemptReviewResponse,
} from "../types/attempt";

const AttemptReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [review, setReview] = useState<AttemptReviewResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    const fetchReview = async () => {
      if (!id) return;

      try {
        const data = await getAttemptReview(id);

        console.log("ATTEMPT REVIEW RESPONSE:", data);

        setReview(data);
      } catch (error) {
        console.error("GET ATTEMPT REVIEW ERROR:", error);

        setError("دریافت مرور آزمون با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080B12]">
        <p className="dark:text-white">
          در حال دریافت مرور آزمون...
        </p>
      </main>
    );
  }

  if (error || !review) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080B12]">
        <p className="text-red-500">
          {error || "اطلاعات مرور آزمون پیدا نشد."}
        </p>
      </main>
    );
  }

  if (review.questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#080B12]">
        <p className="dark:text-white">
          سؤالی برای مرور وجود ندارد.
        </p>
      </main>
    );
  }

  const question: AttemptReviewQuestion =
    review.questions[currentQuestion];

  const isUnanswered = question.selectedAnswer === null;

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
              مرور آزمون
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              {review.exam.title}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/attempts/${review.attemptId}/result`)}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              px-4
              py-2
              bg-white
              dark:bg-white/10
              dark:text-white
              border
              border-gray-200
              dark:border-gray-700
              hover:border-[var(--griffin-gold)]
              transition
            "
          >
            <ArrowRight size={18} />

            نتیجه آزمون
          </button>
        </div>

        {/* Question Navigation */}

        <div
          className="
            mb-6
            rounded-3xl
            p-5
            bg-white/40
            dark:bg-white/10
            backdrop-blur-xl
            border
            border-white/20
            shadow-lg
          "
        >
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            انتخاب سؤال
          </p>

          <div className="flex flex-wrap gap-2">
            {review.questions.map((item, index) => {
              const unanswered = item.selectedAnswer === null;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentQuestion(index)}
                  className={`
                    h-10
                    w-10
                    rounded-xl
                    text-sm
                    font-semibold
                    transition

                    ${
                      currentQuestion === index
                        ? "bg-[var(--griffin-gold)] text-white"
                        : unanswered
                          ? "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          : item.isCorrect
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    }
                  `}
                >
                  {index + 1}
                </button>
              );
            })}
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

          {/* Question Header */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
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

          {/* Result Status */}

          <div className="mb-6">

            {isUnanswered ? (
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  py-2
                  bg-gray-100
                  dark:bg-gray-800
                  text-gray-600
                  dark:text-gray-300
                  text-sm
                "
              >
                <MinusCircle size={18} />

                بدون پاسخ
              </div>
            ) : question.isCorrect ? (
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  py-2
                  bg-green-100
                  dark:bg-green-900/30
                  text-green-600
                  dark:text-green-400
                  text-sm
                "
              >
                <CheckCircle2 size={18} />

                پاسخ صحیح
              </div>
            ) : (
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  py-2
                  bg-red-100
                  dark:bg-red-900/30
                  text-red-600
                  dark:text-red-400
                  text-sm
                "
              >
                <XCircle size={18} />

                پاسخ اشتباه
              </div>
            )}

          </div>

          {/* Question Text */}

          <div
            className="
              text-lg
              leading-8
              font-semibold
              dark:text-white
            "
          >
            <MathText content={question.questionText} />
          </div>

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

              const isCorrectAnswer =
                question.correctAnswer === index;

              const isSelectedAnswer =
                question.selectedAnswer === index;

              return (
                <div
                  key={index}
                  className={`
                    w-full
                    rounded-2xl
                    border
                    px-5
                    py-4
                    text-right

                    ${
                      isCorrectAnswer
                        ? `
                          border-green-500
                          bg-green-500/10
                        `
                        : isSelectedAnswer
                          ? `
                            border-red-500
                            bg-red-500/10
                          `
                          : `
                            border-gray-200
                            dark:border-gray-700
                          `
                    }
                  `}
                >

                  <div className="flex items-center gap-3">

                    <span className="font-semibold dark:text-white">
                      {index + 1}.
                    </span>

                    <span className="dark:text-gray-200">
                      <MathText content={option} />
                    </span>

                    <div className="mr-auto">

                      {isCorrectAnswer && (
                        <CheckCircle2
                          size={20}
                          className="text-green-500"
                        />
                      )}

                      {isSelectedAnswer && !isCorrectAnswer && (
                        <XCircle
                          size={20}
                          className="text-red-500"
                        />
                      )}

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

          {/* Explanation */}

          {question.explanation && (
            <div
              className="
                mt-8
                rounded-2xl
                p-5
                bg-gray-100/70
                dark:bg-black/20
              "
            >
              <h3
                className="
                  font-bold
                  dark:text-white
                "
              >
                توضیح پاسخ
              </h3>

              <p
                className="
                  mt-3
                  leading-8
                  text-gray-600
                  dark:text-gray-300
                "
              >
                {question.explanation}
              </p>
            </div>
          )}

          {/* Lesson / Chapter */}

          <div
            className="
              mt-6
              flex
              flex-wrap
              gap-3
              text-sm
            "
          >
            <span
              className="
                rounded-full
                px-4
                py-2
                bg-white/60
                dark:bg-white/10
                dark:text-gray-300
              "
            >
              درس: {question.lesson}
            </span>

            <span
              className="
                rounded-full
                px-4
                py-2
                bg-white/60
                dark:bg-white/10
                dark:text-gray-300
              "
            >
              فصل: {question.chapter}
            </span>
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
            onClick={() =>
              setCurrentQuestion((prev) => prev - 1)
            }
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

          <span
            className="
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            {currentQuestion + 1} / {review.questions.length}
          </span>

          <button
            type="button"
            disabled={
              currentQuestion === review.questions.length - 1
            }
            onClick={() =>
              setCurrentQuestion((prev) => prev + 1)
            }
            className="
              rounded-xl
              px-6
              py-3
              bg-[var(--griffin-gold)]
              text-white
              hover:opacity-90
              disabled:opacity-40
            "
          >
            سؤال بعد
          </button>

        </div>

      </div>
    </main>
  );
};

export default AttemptReview;
