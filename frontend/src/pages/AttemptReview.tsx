import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Flag,
  GraduationCap,
  Lightbulb,
  LoaderCircle,
  MinusCircle,
  Sparkles,
  Star,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import MathText from "../components/questions/MathText";
import { getAttemptReview } from "../services/attemptService";
import type { AttemptReviewResponse } from "../types/attempt";

// ==================== ثابت‌ها ====================
const difficultyLabels: Record<string, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "سخت",
  tricky: "مفهومی",
};

const difficultyBorder: Record<string, string> = {
  easy: "border-sky-500/50",
  medium: "border-gray-200 dark:border-white/15",
  hard: "border-rose-500/50",
  tricky: "border-amber-500/50",
};

const difficultyGlow: Record<string, string> = {
  easy: "shadow-sky-500/10",
  medium: "",
  hard: "shadow-rose-500/10",
  tricky: "shadow-amber-500/10",
};

const difficultyBadge: Record<string, { bg: string; text: string }> = {
  easy: { bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400" },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  hard: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400" },
  tricky: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
};

// ==================== کامپوننت اصلی ====================
const AttemptReview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [review, setReview] = useState<AttemptReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchReview = async () => {
      try {
        const data = await getAttemptReview(id);
        setReview(data);
      } catch (err) {
        console.error("GET ATTEMPT REVIEW ERROR:", err);
        setError("دریافت مرور آزمون با مشکل مواجه شد.");
      } finally {
        setLoading(false);
      }
    };

    void fetchReview();
  }, [id]);

  useEffect(() => {
    if (selectedIndex === null || !review) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowRight")
        setSelectedIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : prev,
        );
      if (e.key === "ArrowLeft")
        setSelectedIndex((prev) =>
          prev !== null && prev < review.questions.length - 1 ? prev + 1 : prev,
        );
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, review]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <LoaderCircle size={28} className="text-white animate-spin" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            در حال دریافت پاسخنامه...
          </p>
        </div>
      </main>
    );
  }

  if (error || !review) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-4">
            {error || "اطلاعات مرور آزمون پیدا نشد"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg"
          >
            <ArrowRight size={13} />
            بازگشت
          </button>
        </div>
      </main>
    );
  }

  const total = review.questions.length;
  const correct = review.questions.filter((q) => q.isCorrect).length;
  const unanswered = review.questions.filter(
    (q) => q.selectedAnswer === null,
  ).length;
  const wrong = total - correct - unanswered;

  const selectedQuestion =
    selectedIndex !== null ? review.questions[selectedIndex] : null;

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#080B12] pb-32">
      <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-[#080B12]/90 backdrop-blur-lg">
        <div className="mx-auto max-w-3xl px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(`/attempts/${review.attemptId}/result`)}
            className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-xs font-black text-gray-700 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] transition-colors shrink-0"
          >
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
            بازگشت
          </button>

          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5">
              <Sparkles size={10} className="text-[var(--griffin-gold)]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                Answer Sheet
              </span>
            </div>
            <h1 className="font-heading text-sm font-black text-gray-900 dark:text-white -mt-0.5 truncate">
              پاسخنامه
            </h1>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <StatPill
              icon={CheckCircle2}
              value={correct}
              color="text-emerald-600 dark:text-emerald-400"
              bg="bg-emerald-500/10"
            />
            <StatPill
              icon={XCircle}
              value={wrong}
              color="text-rose-600 dark:text-rose-400"
              bg="bg-rose-500/10"
            />
            <StatPill
              icon={MinusCircle}
              value={unanswered}
              color="text-gray-600 dark:text-gray-400"
              bg="bg-gray-500/10"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-5 space-y-5">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {review.exam.title}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-bold text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            صحیح
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            اشتباه
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm border border-gray-300 dark:border-white/20" />
            نزده
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Flag size={9} className="text-amber-500" fill="currentColor" />
            علامت‌دار
          </span>
        </div>

        <div className="flex flex-col items-start gap-2">
          {review.questions.map((question, index) => (
            <AnswerRow
              key={question.id}
              question={question}
              index={index}
              isSelected={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      </div>

      {selectedQuestion && selectedIndex !== null && (
        <div className="fixed bottom-0 left-0 right-0 z-40 animate-[slideUp_0.3s_ease-out]">
          <div className="mx-auto max-w-3xl">
            <QuestionDetailDock
              question={selectedQuestion}
              index={selectedIndex}
              total={total}
              onClose={() => setSelectedIndex(null)}
              onPrev={() =>
                setSelectedIndex((prev) =>
                  prev !== null && prev > 0 ? prev - 1 : prev,
                )
              }
              onNext={() =>
                setSelectedIndex((prev) =>
                  prev !== null && prev < total - 1 ? prev + 1 : prev,
                )
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AttemptReview;

// ==================== StatPill ====================
interface StatPillProps {
  icon: React.ComponentType<{ size: number; className: string }>;
  value: number;
  color: string;
  bg: string;
}

const StatPill = ({ icon: Icon, value, color, bg }: StatPillProps) => (
  <div
    className={`inline-flex items-center gap-1 rounded-lg ${bg} px-2 py-1.5`}
  >
    <Icon size={11} className={color} />
    <span className={`font-heading text-xs font-black tabular-nums ${color}`}>
      {value.toLocaleString("fa-IR")}
    </span>
  </div>
);

// ==================== AnswerRow ====================
interface AnswerRowProps {
  question: {
    id: string;
    selectedAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    isFlagged: boolean;
    difficulty: string;
  };
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

const AnswerRow = ({
  question,
  index,
  isSelected,
  onClick,
}: AnswerRowProps) => {
  const optionCount = 4;
  const isUnanswered = question.selectedAnswer === null;

  const borderClass =
    difficultyBorder[question.difficulty] || difficultyBorder.medium;
  const glowClass = difficultyGlow[question.difficulty] || "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group relative rounded-md border ${borderClass} ${glowClass}
        bg-white dark:bg-white/[0.03]
        flex items-center gap-1.5
        hover:-translate-y-0.5 hover:shadow-md
        transition-all duration-200
        ${isSelected ? "ring-2 ring-[var(--griffin-gold)] ring-offset-1 ring-offset-[#F8F9FB] dark:ring-offset-[#080B12]" : ""}
        ${isUnanswered ? "opacity-80" : ""}
      `}
      style={{ padding: "5px 7px" }}
    >
      <div className="relative shrink-0">
        <div
          className={`
            flex items-center justify-center font-heading font-black tabular-nums rounded-md
            ${
              isUnanswered
                ? "bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/30"
                : question.isCorrect
                  ? "bg-emerald-500 text-white"
                  : "bg-rose-500 text-white"
            }
          `}
          style={{ width: "20px", height: "20px", fontSize: "10px" }}
        >
          {(index + 1).toLocaleString("fa-IR")}
        </div>

        {question.isFlagged && (
          <span
            className="absolute rounded-full bg-amber-500 border border-white dark:border-[#080B12] flex items-center justify-center"
            style={{
              width: "8px",
              height: "8px",
              top: "-2px",
              right: "-2px",
            }}
          >
            <Star size={4} className="text-white" fill="currentColor" />
          </span>
        )}
      </div>

      <div className="flex items-center" style={{ gap: "3px" }}>
        {Array.from({ length: optionCount }).map((_, optIndex) => {
          const isCorrect = optIndex === question.correctAnswer;
          const isSelected = optIndex === question.selectedAnswer;

          return (
            <span
              key={optIndex}
              className={`
                rounded-[2px] transition-all duration-200
                ${
                  isCorrect
                    ? "bg-emerald-500"
                    : isSelected
                      ? "bg-rose-500"
                      : "border border-gray-300 dark:border-white/25 bg-transparent"
                }
              `}
              style={{ width: "8px", height: "8px" }}
            />
          );
        })}
      </div>
    </button>
  );
};

// ==================== QuestionDetailDock ====================
interface QuestionDetailDockProps {
  question: {
    id: string;
    questionText: string;
    questionImage: string;
    options: string[];
    selectedAnswer: number | null;
    correctAnswer: number;
    isCorrect: boolean;
    isFlagged: boolean;
    explanation: string;
    difficulty: string;
    lesson: string;
    chapter: string;
  };
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

const QuestionDetailDock = ({
  question,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: QuestionDetailDockProps) => {
  const isUnanswered = question.selectedAnswer === null;

  const status = isUnanswered
    ? {
        label: "بدون پاسخ",
        color: "text-gray-600 dark:text-gray-400",
        bg: "bg-gray-500/10",
        border: "border-gray-500/30",
        icon: MinusCircle,
      }
    : question.isCorrect
      ? {
          label: "پاسخ صحیح",
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          icon: CheckCircle2,
        }
      : {
          label: "پاسخ اشتباه",
          color: "text-rose-600 dark:text-rose-400",
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          icon: XCircle,
        };

  const StatusIcon = status.icon;
  const diffBadge =
    difficultyBadge[question.difficulty] || difficultyBadge.medium;

  return (
    <div className="relative rounded-t-3xl border-t-2 border-x-2 border-[var(--griffin-gold)]/40 bg-white dark:bg-[#0a0d14] shadow-2xl">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--griffin-gold)] to-transparent" />

      <div className="relative px-4 py-3 border-b border-gray-200/70 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div
            className={`shrink-0 w-9 h-9 rounded-xl ${status.bg} border ${status.border} flex items-center justify-center ${status.color} font-heading font-black text-sm tabular-nums`}
          >
            {(index + 1).toLocaleString("fa-IR")}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black ${status.bg} ${status.color} border ${status.border}`}
              >
                <StatusIcon size={10} />
                {status.label}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black ${diffBadge.bg} ${diffBadge.text}`}
              >
                <Zap size={10} />
                {difficultyLabels[question.difficulty] || question.difficulty}
              </span>

              {question.isFlagged && (
                <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Star size={10} fill="currentColor" />
                  علامت‌دار
                </span>
              )}
            </div>

            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              سوال {(index + 1).toLocaleString("fa-IR")} از{" "}
              {total.toLocaleString("fa-IR")}
            </p>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-rose-500/15 hover:text-rose-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="relative max-h-[50vh] overflow-y-auto p-4 space-y-3">
        {/* 🆕 صورت سوال با تصویر گوشه‌ی پایین-چپ */}
        <div className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 p-3.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
            صورت سوال
          </p>

          <div className="relative pb-24 sm:pb-28">
            {/* متن سوال */}
            <div className="text-sm leading-7 font-semibold text-gray-900 dark:text-white">
              <MathText content={question.questionText} />
            </div>

            {/* 🆕 تصویر - گوشه‌ی پایین-چپ */}
            {question.questionImage && (
              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  w-24 h-24
                  sm:w-28 sm:h-28
                  rounded-xl
                  overflow-hidden
                  border border-gray-200 dark:border-white/10
                  bg-white dark:bg-white/[0.02]
                  p-1
                "
              >
                <img
                  src={question.questionImage}
                  alt="تصویر سوال"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {question.options.map((option, optIndex) => {
            const isCorrectAnswer = question.correctAnswer === optIndex;
            const isSelectedAnswer = question.selectedAnswer === optIndex;
            const letter = String.fromCharCode(65 + optIndex);

            return (
              <div
                key={optIndex}
                className={`
                  rounded-xl border-2 p-2.5 transition-colors
                  ${
                    isCorrectAnswer
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : isSelectedAnswer
                        ? "border-rose-500/50 bg-rose-500/5"
                        : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02]"
                  }
                `}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`
                      shrink-0 w-6 h-6 rounded-md flex items-center justify-center font-heading font-black text-[11px]
                      ${
                        isCorrectAnswer
                          ? "bg-emerald-500 text-white"
                          : isSelectedAnswer
                            ? "bg-rose-500 text-white"
                            : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
                      }
                    `}
                  >
                    {letter}
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5 text-xs leading-6 text-gray-900 dark:text-white">
                    <MathText content={option} />
                  </div>

                  <div className="shrink-0 mt-0.5">
                    {isCorrectAnswer && (
                      <CheckCircle2
                        size={14}
                        className="text-emerald-500"
                        strokeWidth={2.5}
                      />
                    )}
                    {isSelectedAnswer && !isCorrectAnswer && (
                      <XCircle
                        size={14}
                        className="text-rose-500"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {question.explanation && (
          <div className="relative rounded-2xl overflow-hidden border border-[var(--griffin-gold)]/30 bg-[var(--griffin-gold)]/5 p-3.5">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--griffin-gold)]/15 border border-[var(--griffin-gold)]/30 flex items-center justify-center text-[var(--griffin-gold)]">
                <Lightbulb size={12} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--griffin-gold)]">
                  Explanation
                </p>
                <p className="font-heading text-[11px] font-black text-gray-900 dark:text-white -mt-0.5">
                  پاسخ تشریحی
                </p>
              </div>
            </div>

            <div className="leading-7 text-xs text-gray-700 dark:text-gray-200">
              <MathText content={question.explanation} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 pb-1">
          {question.lesson && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black">
              <GraduationCap size={10} />
              {question.lesson}
            </span>
          )}
          {question.chapter && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black">
              <FileText size={10} />
              {question.chapter}
            </span>
          )}
        </div>
      </div>

      <div className="relative px-4 py-3 border-t border-gray-200/70 dark:border-white/5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={index === 0}
          className="group inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-[11px] font-black text-gray-700 dark:text-gray-300 hover:border-[var(--griffin-gold)]/40 hover:text-[var(--griffin-gold)] disabled:opacity-30 transition-colors"
        >
          <ChevronRight
            size={12}
            className="transition-transform group-hover:translate-x-0.5"
          />
          قبلی
        </button>

        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tabular-nums">
          {(index + 1).toLocaleString("fa-IR")} /{" "}
          {total.toLocaleString("fa-IR")}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={index === total - 1}
          className="group inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-3 py-2 text-[11px] font-black text-white shadow-md shadow-[var(--griffin-gold)]/30 hover:shadow-lg disabled:opacity-30 transition-all"
        >
          بعدی
          <ChevronLeft
            size={12}
            className="transition-transform group-hover:-translate-x-0.5"
          />
        </button>
      </div>
    </div>
  );
};
