import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  Trophy,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

import { getAttemptResult } from "../services/attemptService";

import type { AttemptResultResponse } from "../types/attempt";
import AIAnalysisSection from "./components/AIAnalysisSection";

const AttemptResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<AttemptResultResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;

      try {
        const result = await getAttemptResult(id);

        console.log("ATTEMPT RESULT:", result);

        setData(result);
      } catch (error) {
        console.error("GET ATTEMPT RESULT ERROR:", error);

        setError("دریافت نتیجه آزمون با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
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
        <p className="dark:text-white">در حال دریافت نتیجه آزمون...</p>
      </main>
    );
  }

  if (error || !data) {
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
        <p className="text-red-500">{error || "نتیجه آزمون پیدا نشد."}</p>
      </main>
    );
  }

  const { exam, result } = data;

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
        <div className="text-center mb-10">
          <div
            className="
              mx-auto
              w-20
              h-20
              rounded-full
              flex
              items-center
              justify-center
              bg-[var(--griffin-gold)]/15
            "
          >
            <Trophy size={40} className="text-[var(--griffin-gold)]" />
          </div>

          <h1
            className="
              mt-5
              text-3xl
              font-bold
              dark:text-white
            "
          >
            نتیجه آزمون
          </h1>

          <p
            className="
              mt-3
              text-gray-500
              dark:text-gray-400
            "
          >
            {exam.title}
          </p>
        </div>
        {/* Score */}
        <div
          className="
            rounded-3xl
            p-8
            text-center
            bg-white/40
            dark:bg-white/10
            backdrop-blur-xl
            border
            border-white/20
            shadow-lg
          "
        >
          <p
            className="
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            درصد کسب‌شده
          </p>

          <div
            className="
              mt-3
              text-6xl
              font-bold
              text-[var(--griffin-gold)]
            "
          >
            {result.percentage}%
          </div>

          <p
            className="
              mt-4
              text-sm
              text-gray-500
              dark:text-gray-400
            "
          >
            امتیاز نهایی: {result.score}
          </p>
        </div>
        {/* Statistics */}
        <div
          className="
            mt-6
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-4
          "
        >
          {/* Correct */}

          <div
            className="
              rounded-2xl
              p-6
              bg-white/40
              dark:bg-white/10
              backdrop-blur-xl
              border
              border-white/20
            "
          >
            <CheckCircle2 size={26} className="text-green-500" />

            <p
              className="
                mt-4
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              پاسخ صحیح
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-bold
                dark:text-white
              "
            >
              {result.correctAnswers}
            </p>
          </div>

          {/* Wrong */}

          <div
            className="
              rounded-2xl
              p-6
              bg-white/40
              dark:bg-white/10
              backdrop-blur-xl
              border
              border-white/20
            "
          >
            <XCircle size={26} className="text-red-500" />

            <p
              className="
                mt-4
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              پاسخ غلط
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-bold
                dark:text-white
              "
            >
              {result.wrongAnswers}
            </p>
          </div>

          {/* Unanswered */}

          <div
            className="
              rounded-2xl
              p-6
              bg-white/40
              dark:bg-white/10
              backdrop-blur-xl
              border
              border-white/20
            "
          >
            <MinusCircle size={26} className="text-gray-400" />

            <p
              className="
                mt-4
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              بدون پاسخ
            </p>

            <p
              className="
                mt-1
                text-2xl
                font-bold
                dark:text-white
              "
            >
              {result.unansweredQuestions}
            </p>
          </div>
        </div>
        {/* Details */}
        <div
          className="
            mt-6
            rounded-3xl
            p-6
            bg-white/40
            dark:bg-white/10
            backdrop-blur-xl
            border
            border-white/20
          "
        >
          <h2
            className="
              text-xl
              font-bold
              dark:text-white
            "
          >
            جزئیات نتیجه
          </h2>

          <div
            className="
              mt-5
              space-y-4
              text-sm
              dark:text-gray-300
            "
          >
            <div className="flex justify-between">
              <span>تعداد کل سؤالات</span>
              <span className="font-semibold">{result.totalQuestions}</span>
            </div>

            <div className="flex justify-between">
              <span>پاسخ صحیح</span>
              <span className="font-semibold">{result.correctAnswers}</span>
            </div>

            <div className="flex justify-between">
              <span>پاسخ غلط</span>
              <span className="font-semibold">{result.wrongAnswers}</span>
            </div>

            <div className="flex justify-between">
              <span>بدون پاسخ</span>
              <span className="font-semibold">
                {result.unansweredQuestions}
              </span>
            </div>

            <div className="flex justify-between">
              <span>نمره منفی</span>
              <span className="font-semibold">{result.negativeScore}</span>
            </div>
          </div>
        </div>

        {/* Subject Analysis */}
        {result.subjects && result.subjects.length > 0 && (
          <div
            className="
              mt-6
              rounded-3xl
              p-6
              bg-white/40
              dark:bg-white/10
              backdrop-blur-xl
              border
              border-white/20
            "
          >
            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  dark:text-white
                "
              >
                تحلیل عملکرد
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-gray-500
                  dark:text-gray-400
                "
              >
                عملکرد شما در هر درس
              </p>
            </div>

            <div className="mt-6 space-y-6">
              {result.subjects.map((subject) => (
                <div key={subject.lesson}>
                  {/* Subject Header */}

                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="
                        font-semibold
                        dark:text-white
                      "
                    >
                      {subject.lesson}
                    </span>

                    <span
                      className="
                        font-bold
                        text-[var(--griffin-gold)]
                      "
                    >
                      {subject.percentage}%
                    </span>
                  </div>

                  {/* Progress */}

                  <div
                    className="
                      mt-3
                      h-3
                      w-full
                      overflow-hidden
                      rounded-full
                      bg-gray-200
                      dark:bg-gray-700
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                        bg-[var(--griffin-gold)]
                        transition-all
                        duration-500
                      "
                      style={{
                        width: `${Math.min(Math.max(subject.percentage, 0), 100)}%`,
                      }}
                    />
                  </div>

                  {/* Statistics */}

                  <div
                    className="
                      mt-3
                      flex
                      flex-wrap
                      gap-x-5
                      gap-y-2
                      text-xs
                      text-gray-500
                      dark:text-gray-400
                    "
                  >
                    <span>
                      صحیح:{" "}
                      <strong className="text-green-500">
                        {subject.correct}
                      </strong>
                    </span>

                    <span>
                      غلط:{" "}
                      <strong className="text-red-500">{subject.wrong}</strong>
                    </span>

                    <span>
                      نزده:{" "}
                      <strong className="dark:text-gray-200">
                        {subject.unanswered}
                      </strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis */}
        <AIAnalysisSection attemptId={data.attemptId} />

        {/* Actions */}
        <div
          className="
            mt-8
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
          "
        >
          <button
            type="button"
            onClick={() => navigate(`/attempts/${data.attemptId}/review`)}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              px-6
              py-3
              bg-[var(--griffin-gold)]
              text-white
              hover:opacity-90
              transition
            "
          >
            <ArrowLeft size={18} />
            مرور پاسخ‌ها
          </button>

          <button
            type="button"
            onClick={() => navigate("/tests")}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              px-6
              py-3
              bg-white
              dark:bg-white/10
              dark:text-white
              hover:bg-gray-100
              dark:hover:bg-white/15
              transition
            "
          >
            <RotateCcw size={18} />
            بازگشت به آزمون‌ها
          </button>
        </div>
      </div>
    </main>
  );
};

export default AttemptResult;
