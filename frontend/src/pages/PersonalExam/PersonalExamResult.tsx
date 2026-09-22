import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Home,
  LoaderCircle,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPersonalExamResult,
  type PersonalExamQuestionResult,
  type PersonalExamResult as PersonalExamResultType,
} from "../../api/personalExamApi";

const PersonalExamResult = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<PersonalExamResultType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);

  // ==================== Load ====================
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getPersonalExamResult(id);
        setData(result);
      } catch (err) {
        console.error("Failed to load exam result:", err);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "دریافت نتیجه انجام نشد.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
        <div className="text-center space-y-3">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <LoaderCircle size={24} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500">
            در حال دریافت نتیجه...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
          <p className="text-sm font-bold text-rose-400 mb-4">
            {error || "نتیجه پیدا نشد"}
          </p>
          <button
            onClick={() => navigate("/dashboard/study-plans")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-amber-500 to-amber-700 px-4 py-2.5 text-xs font-black text-white shadow-lg"
          >
            <ArrowLeft size={13} />
            بازگشت
          </button>
        </div>
      </main>
    );
  }

  const { exam, questions } = data;
  const percent =
    exam.totalScore > 0 ? Math.round((exam.score / exam.totalScore) * 100) : 0;

  const isExcellent = percent >= 80;
  const isGood = percent >= 60 && percent < 80;
  const isBad = percent < 60;

  const formatTime = (startedAt: string | null, submittedAt: string | null) => {
    if (!startedAt || !submittedAt) return "—";
    const ms = new Date(submittedAt).getTime() - new Date(startedAt).getTime();
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toLocaleString("fa-IR")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-14 bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
      {/* پسزمینه */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className={`
            absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px]
            ${
              isExcellent
                ? "bg-emerald-500/25"
                : isGood
                  ? "bg-amber-500/25"
                  : "bg-rose-500/25"
            }
          `}
        />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-600/20 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto space-y-6">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/dashboard/study-plans")}
          className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-amber-400 transition"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          بازگشت به برنامه‌ها
        </button>

        {/* Main Card */}
        <section
          className={`
            relative rounded-[2rem] overflow-hidden border-2 backdrop-blur-xl p-8 sm:p-12 text-center
            ${
              isExcellent
                ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent shadow-[0_30px_100px_-20px_rgba(16,185,129,0.4)]"
                : isGood
                  ? "border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-transparent to-transparent shadow-[0_30px_100px_-20px_rgba(245,158,11,0.4)]"
                  : "border-rose-500/40 bg-gradient-to-br from-rose-500/15 via-transparent to-transparent shadow-[0_30px_100px_-20px_rgba(244,63,94,0.4)]"
            }
          `}
        >
          {/* خط بالا */}
          <div
            className={`
              absolute top-0 left-0 right-0 h-1
              ${
                isExcellent
                  ? "bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                  : isGood
                    ? "bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                    : "bg-gradient-to-r from-transparent via-rose-500 to-transparent"
              }
            `}
          />

          {/* آیکون */}
          <div className="relative inline-flex mb-6">
            <div
              className={`
                absolute inset-0 blur-3xl opacity-60 animate-pulse
                ${isExcellent ? "bg-emerald-500" : isGood ? "bg-amber-500" : "bg-rose-500"}
              `}
            />
            <div
              className={`
                relative w-24 h-24 rounded-3xl flex items-center justify-center text-white shadow-2xl rotate-3 border-2 border-white/20
                ${
                  isExcellent
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                    : isGood
                      ? "bg-gradient-to-br from-amber-500 to-amber-700"
                      : "bg-gradient-to-br from-rose-500 to-rose-700"
                }
              `}
            >
              {isExcellent ? (
                <Trophy size={44} strokeWidth={2.3} />
              ) : isGood ? (
                <Target size={44} strokeWidth={2.3} />
              ) : (
                <XCircle size={44} strokeWidth={2.3} />
              )}
            </div>
          </div>

          {/* برچسب */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
            <Sparkles
              size={12}
              className={
                isExcellent
                  ? "text-emerald-400"
                  : isGood
                    ? "text-amber-400"
                    : "text-rose-400"
              }
            />
            <span
              className={`
                text-[10px] font-black uppercase tracking-widest
                ${
                  isExcellent
                    ? "text-emerald-400"
                    : isGood
                      ? "text-amber-400"
                      : "text-rose-400"
                }
              `}
            >
              {isExcellent ? "عالی!" : isGood ? "خوب" : "نیاز به تلاش بیشتر"}
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-black leading-tight mb-3">
            {exam.title}
          </h1>

          <p className="text-sm text-gray-400 leading-7 max-w-md mx-auto mb-6">
            {isExcellent
              ? "عملکردت عالیه! ادامه بده 💪"
              : isGood
                ? "خوب بود، ولی هنوز جا برای بهتر شدن هست."
                : "نگران نباش! با تلاش بیشتر می‌تونی بهتر بشی."}
          </p>

          {/* نمره بزرگ */}
          <div className="inline-flex items-baseline gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span
              className={`
                font-heading text-5xl font-black tabular-nums
                ${
                  isExcellent
                    ? "text-emerald-400"
                    : isGood
                      ? "text-amber-400"
                      : "text-rose-400"
                }
              `}
            >
              {exam.score.toLocaleString("fa-IR")}
            </span>
            <span className="font-heading text-xl font-black text-gray-500">
              / {exam.totalScore.toLocaleString("fa-IR")}
            </span>
            <span
              className={`
                mr-3 px-3 py-1 rounded-lg text-sm font-black tabular-nums
                ${
                  isExcellent
                    ? "bg-emerald-500/15 text-emerald-400"
                    : isGood
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-rose-500/15 text-rose-400"
                }
              `}
            >
              {percent.toLocaleString("fa-IR")}٪
            </span>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              icon: CheckCircle2,
              label: "درست",
              value: exam.correctCount,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
            },
            {
              icon: XCircle,
              label: "غلط",
              value: exam.wrongCount,
              color: "text-rose-400",
              bg: "bg-rose-500/10",
              border: "border-rose-500/20",
            },
            {
              icon: Target,
              label: "نزده",
              value: exam.unansweredCount,
              color: "text-gray-400",
              bg: "bg-gray-500/10",
              border: "border-gray-500/20",
            },
            {
              icon: Clock3,
              label: "زمان",
              value: formatTime(exam.startedAt, exam.submittedAt),
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`
                  group relative rounded-2xl overflow-hidden border
                  ${stat.border} ${stat.bg}
                  backdrop-blur-sm p-4 text-center
                  transition-all duration-300 hover:-translate-y-1
                `}
              >
                <div
                  className={`
                    w-10 h-10 mx-auto rounded-xl ${stat.bg}
                    flex items-center justify-center mb-3
                    transition-transform duration-300 group-hover:scale-110
                  `}
                >
                  <Icon size={18} className={stat.color} strokeWidth={2.4} />
                </div>
                <p
                  className={`
                    font-heading text-2xl font-black tabular-nums
                    ${stat.color}
                  `}
                >
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString("fa-IR")
                    : stat.value}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </section>

        {/* Buttons */}
        <section className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setShowAnswers((prev) => !prev)}
            className="
              flex-1 inline-flex items-center justify-center gap-2
              rounded-2xl border border-amber-500/40 bg-amber-500/5 backdrop-blur-sm
              px-6 py-4 font-heading font-black text-amber-400 text-sm
              hover:bg-amber-500/10 hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            <BookOpen size={16} />
            {showAnswers ? "بستن پاسخ‌ها" : "مشاهده پاسخ‌ها"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/study-plans")}
            className="
              flex-1 inline-flex items-center justify-center gap-2
              rounded-2xl bg-gradient-to-l from-amber-500 to-amber-700
              px-6 py-4 font-heading font-black text-white text-sm
              shadow-lg shadow-amber-500/40 hover:shadow-xl hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            <Home size={16} />
            بازگشت به برنامه‌ها
          </button>
        </section>

        {/* Answers */}
        {showAnswers && (
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Answers
                </p>
                <h2 className="font-heading text-base font-black text-white -mt-0.5">
                  پاسخ‌ها و توضیحات
                </h2>
              </div>
            </div>

            {questions.map((q) => (
              <QuestionResultCard key={q.order} question={q} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

// ==================== QuestionResultCard ====================
interface QuestionResultCardProps {
  question: PersonalExamQuestionResult;
}

const QuestionResultCard = ({ question }: QuestionResultCardProps) => {
  const isCorrect = question.isCorrect;
  const isUnanswered = question.selectedAnswer === null;

  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden border p-5
        ${
          isCorrect
            ? "border-emerald-500/30 bg-emerald-500/5"
            : isUnanswered
              ? "border-gray-500/30 bg-gray-500/5"
              : "border-rose-500/30 bg-rose-500/5"
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <div
          className={`
            w-9 h-9 rounded-xl flex items-center justify-center text-white font-heading font-black text-sm shadow-lg
            ${
              isCorrect
                ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                : isUnanswered
                  ? "bg-gradient-to-br from-gray-500 to-gray-700"
                  : "bg-gradient-to-br from-rose-500 to-rose-700"
            }
          `}
        >
          {question.order.toLocaleString("fa-IR")}
        </div>

        <span
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black
            ${
              isCorrect
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : isUnanswered
                  ? "bg-gray-500/15 text-gray-500"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
            }
          `}
        >
          {isCorrect ? (
            <>
              <CheckCircle2 size={10} />
              درست
            </>
          ) : isUnanswered ? (
            <>
              <Target size={10} />
              نزده
            </>
          ) : (
            <>
              <XCircle size={10} />
              غلط
            </>
          )}
        </span>

        {question.lesson && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-gray-400 text-[9px] font-black">
            <BookOpen size={9} />
            {question.lesson}
            {question.chapter && ` · ${question.chapter}`}
          </span>
        )}
      </div>

      {/* Question */}
      <p className="text-sm font-bold text-gray-900 dark:text-white leading-7 mb-4 whitespace-pre-wrap">
        {question.questionText}
      </p>

      {/* Options */}
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = question.selectedAnswer === index;
          const isCorrectOption = question.correctAnswer === index;
          const letter = String.fromCharCode(65 + index);

          return (
            <div
              key={index}
              className={`
                flex items-start gap-3 p-3 rounded-xl border text-sm
                ${
                  isCorrectOption
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : isSelected
                      ? "border-rose-500/40 bg-rose-500/10"
                      : "border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]"
                }
              `}
            >
              <div
                className={`
                  shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-heading font-black text-xs
                  ${
                    isCorrectOption
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white"
                      : isSelected
                        ? "bg-gradient-to-br from-rose-500 to-rose-700 text-white"
                        : "bg-gray-100 dark:bg-white/5 text-gray-500"
                  }
                `}
              >
                {isCorrectOption ? (
                  <CheckCircle2 size={14} strokeWidth={3} />
                ) : isSelected ? (
                  <XCircle size={14} strokeWidth={3} />
                ) : (
                  letter
                )}
              </div>

              <p className="flex-1 leading-6 text-gray-900 dark:text-white pt-1">
                {option}
              </p>
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {question.explanation && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={11} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
              توضیح
            </span>
          </div>
          <p className="text-xs leading-6 text-gray-700 dark:text-gray-300">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalExamResult;
