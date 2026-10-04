import { useEffect, useRef, useState } from "react";
import { AlertCircle, LoaderCircle, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  abandonPersonalExam,
  getCurrentPersonalExamQuestion,
  startPersonalExam,
  submitPersonalExam,
  submitPersonalExamAnswer,
  type PersonalExamQuestionData,
  type PersonalExamStartResponse,
} from "../../api/personalExamApi";

import AttemptHero from "../Attempt/components/AttemptHero";
import BookletProgress from "../Attempt/components/BookletProgress";
import QuestionCard from "../Attempt/components/QuestionCard";
import NavigationGrid from "../Attempt/components/NavigationGrid";
import ConfirmSubmitModal from "../Attempt/components/ConfirmSubmitModal";
import ExitWarningModal from "../Attempt/components/ExitWarningModal";

// 🆕 امنیت
import { useExamSecurity } from "../../hooks/useExamSecurity";
import SecurityWatermark from "../../components/security/SecurityWatermark";
import { useAuth } from "../../context/AuthContext";

// ==================== Types ====================
interface QuestionMeta {
  order: number;
  questionId: string;
  index: number;
}

// ==================== کامپوننت ====================
const PersonalExam = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // 🆕 امنیت آزمون
  useExamSecurity();

  const [exam, setExam] = useState<PersonalExamStartResponse["exam"] | null>(
    null,
  );
  const [questionMetas, setQuestionMetas] = useState<QuestionMeta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] =
    useState<PersonalExamQuestionData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // 🔹 پاسخ‌ها (overrides)
  const [answerOverrides, setAnswerOverrides] = useState<
    Record<string, number | null>
  >({});
  const [flagOverrides, setFlagOverrides] = useState<Record<string, boolean>>(
    {},
  );

  // 🔹 تایمر
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);
  // eslint-disable-next-line react-hooks/purity
  const questionStartTimeRef = useRef<number>(Date.now());

  // ==================== Load (شروع) ====================
  useEffect(() => {
    if (!id) return;

    const init = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await startPersonalExam(id);
        setExam(result.exam);
        setQuestionMetas(result.questions);

        if (result.questions.length === 0) {
          throw new Error("این آزمون سوالی ندارد");
        }

        // 🔹 محاسبه timeLeft از startedAt
        if (result.exam.startedAt) {
          const elapsed =
            (Date.now() - new Date(result.exam.startedAt).getTime()) / 1000;
          const remaining = Math.max(0, result.exam.timeLimit * 60 - elapsed);
          setTimeLeft(Math.ceil(remaining));

          if (remaining <= 0) {
            // 🔹 زمان تموم شده → خودکار submit
            // eslint-disable-next-line react-hooks/immutability
            await handleAutoSubmit(id);
            return;
          }
        }

        setCurrentIndex(0);
      } catch (err) {
        console.error("Failed to start exam:", err);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "شروع آزمون انجام نشد";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void init();
    // eslint-disable-next-line react-hooks/immutability
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ==================== Load Question ====================
  useEffect(() => {
    if (!id || questionMetas.length === 0 || !exam) return;
    const meta = questionMetas[currentIndex];
    if (!meta) return;

    let cancelled = false;

    const loadQuestion = async () => {
      try {
        const result = await getCurrentPersonalExamQuestion(id, meta.order);
        if (cancelled) return;
        setCurrentQuestion(result.question);
        questionStartTimeRef.current = Date.now();
      } catch (err) {
        console.error("Failed to load question:", err);
        if (!cancelled) setError("دریافت سوال انجام نشد.");
      }
    };

    void loadQuestion();
    return () => {
      cancelled = true;
    };
  }, [id, currentIndex, questionMetas, exam]);

  // ==================== Timer ====================
  useEffect(() => {
    if (!exam?.startedAt || !exam.timeLimit) return;
    if (exam.status === "completed" || exam.status === "abandoned") return;

    const updateTimer = () => {
      const elapsed = (Date.now() - new Date(exam.startedAt!).getTime()) / 1000;
      const remaining = Math.max(0, exam.timeLimit * 60 - elapsed);
      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0) {
        stopTimer();
        void handleAutoSubmit(id!);
      }
    };

    updateTimer();
    timerRef.current = window.setInterval(updateTimer, 1000);

    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam?.startedAt, exam?.timeLimit, exam?.status]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ==================== Auto Submit ====================
  const handleAutoSubmit = async (examId: string) => {
    setSubmitting(true);
    stopTimer();
    try {
      await submitPersonalExam(examId);
      navigate(`/dashboard/personal-exams/${examId}/result`);
    } catch (err) {
      console.error("Auto-submit failed:", err);
      setSubmitting(false);
    }
  };

  // ==================== Submit Answer ====================
  const handleSelectAnswer = async (index: number) => {
    if (!id || !currentQuestion || !exam) return;
    if (exam.status !== "in_progress") return;
    if (loadingAnswer || submitting) return;

    // 🔹 UI آنی
    setAnswerOverrides((prev) => ({
      ...prev,
      [currentQuestion.questionId]: index,
    }));

    setLoadingAnswer(true);
    try {
      const timeSpent = Date.now() - questionStartTimeRef.current;
      await submitPersonalExamAnswer(id, {
        questionId: currentQuestion.questionId,
        selectedAnswer: index,
        timeSpentMs: timeSpent,
      });
    } catch (err) {
      console.error("Failed to submit answer:", err);
      // rollback
      setAnswerOverrides((prev) => {
        const next = { ...prev };
        delete next[currentQuestion.questionId];
        return next;
      });
    } finally {
      setLoadingAnswer(false);
    }
  };

  // ==================== Clear Answer ====================
  const handleClearAnswer = async () => {
    if (!id || !currentQuestion || !exam) return;
    if (exam.status !== "in_progress") return;
    if (loadingAnswer || submitting) return;

    const previousAnswer =
      answerOverrides[currentQuestion.questionId] ??
      currentQuestion.selectedAnswer ??
      null;

    // 🔹 UI آنی
    setAnswerOverrides((prev) => ({
      ...prev,
      [currentQuestion.questionId]: null,
    }));

    setLoadingAnswer(true);
    try {
      await submitPersonalExamAnswer(id, {
        questionId: currentQuestion.questionId,
        selectedAnswer: null,
      });
    } catch (err) {
      console.error("Failed to clear answer:", err);
      // rollback
      setAnswerOverrides((prev) => ({
        ...prev,
        [currentQuestion.questionId]: previousAnswer,
      }));
    } finally {
      setLoadingAnswer(false);
    }
  };

  // ==================== Toggle Flag (محلی) ====================
  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    setFlagOverrides((prev) => ({
      ...prev,
      [currentQuestion.questionId]: !prev[currentQuestion.questionId],
    }));
  };

  // ==================== Submit Exam ====================
  const handleSubmitExam = async () => {
    if (!id || submitting) return;
    setSubmitting(true);
    stopTimer();
    try {
      await submitPersonalExam(id);
      navigate(`/dashboard/personal-exams/${id}/result`);
    } catch (err) {
      console.error("Submit exam failed:", err);
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // ==================== Abandon ====================
  const handleAbandon = async () => {
    if (!id) return;
    try {
      await abandonPersonalExam(id);
      navigate("/dashboard/study-plans");
    } catch (err) {
      console.error("Failed to abandon:", err);
    }
  };

  // ==================== Loading ====================
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
            در حال شروع آزمون...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error || !exam || !currentQuestion) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-4">
            {error || "آزمون پیدا نشد"}
          </p>
          <button
            onClick={() => navigate("/dashboard/study-plans")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-4 py-2.5 text-xs font-black text-white shadow-lg"
          >
            بازگشت
          </button>
        </div>
      </main>
    );
  }

  // ==================== Computed ====================
  const mergedAnswers: Record<string, number | null> = {};
  const mergedFlags: Record<string, boolean> = {};

  for (const meta of questionMetas) {
    mergedAnswers[meta.questionId] =
      answerOverrides[meta.questionId] !== undefined
        ? answerOverrides[meta.questionId]
        : null;
    mergedFlags[meta.questionId] = flagOverrides[meta.questionId] ?? false;
  }

  // 🔹 پاسخ فعلی
  const currentAnswer =
    answerOverrides[currentQuestion.questionId] !== undefined
      ? answerOverrides[currentQuestion.questionId]
      : currentQuestion.selectedAnswer;

  const answeredCount = questionMetas.filter(
    (m) => mergedAnswers[m.questionId] !== null,
  ).length;
  const flaggedCount = questionMetas.filter(
    (m) => mergedFlags[m.questionId],
  ).length;

  const unansweredNumbers = questionMetas
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => mergedAnswers[m.questionId] === null)
    .map(({ i }) => i + 1);

  const flaggedNumbers = questionMetas
    .map((m, i) => ({ m, i }))
    .filter(({ m }) => mergedFlags[m.questionId])
    .map(({ i }) => i + 1);

  const isLastQuestion = currentIndex === questionMetas.length - 1;

  // ==================== Render ====================
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      {/* 🆕 واترمارک */}
      {user && (
        <SecurityWatermark
          text={`${user.firstName} ${user.lastName} · ${user.phoneNumber ?? user.username}`}
        />
      )}

      <div className="mx-auto max-w-5xl space-y-5">
        {/* Hero */}
        <AttemptHero
          examTitle={exam.title}
          bookletTitle={`${questionMetas.length} سوال`}
          bookletOrder={1}
          totalBooklets={1}
          lesson={exam.plan.title}
          secondsRemaining={timeLeft}
          isResting={false}
        />

        {/* Progress */}
        <BookletProgress
          totalQuestions={questionMetas.length}
          answeredCount={answeredCount}
          flaggedCount={flaggedCount}
        />

        {/* سوال */}
        <div className="select-none">
          <QuestionCard
            number={currentIndex + 1}
            total={questionMetas.length}
            questionText={currentQuestion.questionText}
            questionImage={currentQuestion.questionImage ?? ""}
            options={currentQuestion.options}
            selectedAnswer={currentAnswer}
            isFlagged={mergedFlags[currentQuestion.questionId] ?? false}
            difficulty="medium"
            loadingAnswer={loadingAnswer}
            onSelectAnswer={(index) => void handleSelectAnswer(index)}
            onClearAnswer={() => void handleClearAnswer()}
            onToggleFlag={handleToggleFlag}
          />
        </div>

        {/* ناوبری */}
        <NavigationGrid
          total={questionMetas.length}
          currentIndex={currentIndex}
          answers={mergedAnswers}
          flags={mergedFlags}
          questionIds={questionMetas.map((m) => m.questionId)}
          onSelect={setCurrentIndex}
        />

        {/* پایان آزمون */}
        {isLastQuestion && (
          <section className="rounded-2xl border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 backdrop-blur-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)] mb-1">
                  پایان آزمون
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-7">
                  آخرین سوال هستی. اگه آماده‌ای، آزمون رو تموم کن.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                disabled={submitting}
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 disabled:opacity-40 transition-all overflow-hidden shrink-0"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Send size={16} />
                  پایان آزمون
                </span>
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </div>
          </section>
        )}

        {/* انصراف */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            className="text-xs font-bold text-gray-400 hover:text-rose-500 transition-colors"
          >
            انصراف از آزمون
          </button>
        </div>
      </div>

      {/* Modals */}
      {showSubmitModal && (
        <ConfirmSubmitModal
          totalQuestions={questionMetas.length}
          answeredCount={answeredCount}
          unansweredQuestions={unansweredNumbers}
          flaggedQuestions={flaggedNumbers}
          submitting={submitting}
          onConfirm={handleSubmitExam}
          onClose={() => setShowSubmitModal(false)}
        />
      )}

      {showExitModal && (
        <ExitWarningModal
          onConfirm={() => void handleAbandon()}
          onClose={() => setShowExitModal(false)}
        />
      )}
    </main>
  );
};

export default PersonalExam;
