import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, LoaderCircle, Send } from "lucide-react";

import {
  getAttemptQuestions,
  submitAnswer as submitAnswerApi,
  toggleFlag as toggleFlagApi,
  submitAttempt as submitAttemptApi,
} from "../../services/attemptService";

import type { AttemptStateResponse } from "./types";
import { useAttemptTimer } from "./hooks/useAttemptTimer";

import AttemptHero from "./components/AttemptHero";
import BookletProgress from "./components/BookletProgress";
import QuestionCard from "./components/QuestionCard";
import NavigationGrid from "./components/NavigationGrid";
import RestOverlay from "./components/RestOverlay";
import ConfirmSubmitModal from "./components/ConfirmSubmitModal";
import ExitWarningModal from "./components/ExitWarningModal";

// 🆕 امنیت
import { useExamSecurity } from "../../hooks/useExamSecurity";
import SecurityWatermark from "../../components/security/SecurityWatermark";
import { useAuth } from "../../context/AuthContext";
import LockedFeature from "../LockedFeature";

const STORAGE_KEY = (attemptId: string) => `attempt:${attemptId}:local`;

// ==================== کامپوننت ====================
const Attempt = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const { user, hasExamAccess } = useAuth();

  // 🆕 امنیت آزمون
  useExamSecurity();

  const [state, setState] = useState<AttemptStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // 🆕 چک دسترسی
  const [accessDenied, setAccessDenied] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const [answerOverrides, setAnswerOverrides] = useState<
    Record<string, number>
  >({});
  const [flagOverrides, setFlagOverrides] = useState<Record<string, boolean>>(
    {},
  );

  const dataLoadedRef = useRef(false);

  // ==================== Fetch ====================
  const fetchState = useCallback(
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    async (silent = false) => {
      if (!attemptId) return;
      if (!silent) setLoading(true);
      try {
        const data = await getAttemptQuestions(attemptId);

        // 🆕 چک دسترسی
        const examId = data.exam?.id;
        if (examId && !hasExamAccess(examId)) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        // 🆕 اگه آزمون submit شده، برو به نتیجه
        if (data.status === "submitted") {
          localStorage.removeItem(STORAGE_KEY(attemptId));
          navigate(`/attempts/${attemptId}/result`);
          return;
        }

        setState(data);
        setAccessDenied(false);

        if (data.restingBookletId) {
          setCurrentQuestionIndex(0);
        }

        const activeBooklet = data.booklets.find(
          (b) => b.id === data.activeBookletId,
        );
        if (activeBooklet && dataLoadedRef.current) {
          const prevActive = state?.activeBookletId;
          if (prevActive && prevActive !== data.activeBookletId) {
            setCurrentQuestionIndex(0);
          }
        }
        dataLoadedRef.current = true;
      } catch (err) {
        console.error("Fetch attempt error:", err);

        // 🆕 اگه Backend 403 داد
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (status === 403) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        if (!silent) setError("دریافت آزمون با مشکل مواجه شد.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [attemptId, navigate, state?.activeBookletId, hasExamAccess],
  );

  // ==================== Initial Load ====================
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchState(false);

    if (attemptId) {
      const saved = localStorage.getItem(STORAGE_KEY(attemptId));
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.answerOverrides)
            setAnswerOverrides(parsed.answerOverrides);
          if (parsed.flagOverrides) setFlagOverrides(parsed.flagOverrides);
          if (typeof parsed.currentQuestionIndex === "number") {
            setCurrentQuestionIndex(parsed.currentQuestionIndex);
          }
        } catch (e) {
          console.error("Failed to parse localStorage:", e);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  // ... (بقیه useEffectها بدون تغییر)

  // ==================== Save to localStorage ====================
  useEffect(() => {
    if (!attemptId) return;
    const data = {
      currentQuestionIndex,
      answerOverrides,
      flagOverrides,
    };
    localStorage.setItem(STORAGE_KEY(attemptId), JSON.stringify(data));
  }, [attemptId, currentQuestionIndex, answerOverrides, flagOverrides]);

  // ==================== Polling (هر 3 ثانیه در حالت resting) ====================
  useEffect(() => {
    if (!state?.restingBookletId) return;

    const interval = setInterval(() => {
      void fetchState(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [state?.restingBookletId, fetchState]);

  // ==================== Timer ====================
  const activeBooklet = useMemo(
    () => state?.booklets.find((b) => b.id === state.activeBookletId) ?? null,
    [state],
  );

  const { seconds: timerSeconds, sync: syncTimer } = useAttemptTimer({
    initialSeconds: activeBooklet?.secondsRemaining ?? null,
    onExpire: () => {
      void fetchState(true);
    },
    enabled: Boolean(activeBooklet),
  });

  useEffect(() => {
    if (activeBooklet?.secondsRemaining != null) {
      syncTimer(activeBooklet.secondsRemaining);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBooklet?.id, activeBooklet?.secondsRemaining]);

  // ==================== Sync هر 30 ثانیه ====================
  useEffect(() => {
    if (!activeBooklet) return;
    const interval = setInterval(() => {
      void fetchState(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [activeBooklet, fetchState]);

  // ==================== Exit Warning ====================
  useEffect(() => {
    if (!state || state.status !== "started") return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state]);

  // ==================== Actions ====================
  const currentBooklet = activeBooklet;
  const currentQuestion = currentBooklet?.questions[currentQuestionIndex];
  const currentQuestionId = currentQuestion?.id;

  const handleSelectAnswer = async (index: number) => {
    if (!attemptId || !currentQuestionId || !currentBooklet) return;
    if (currentBooklet.status !== "active") return;
    if (loadingAnswer) return;

    setAnswerOverrides((prev) => ({ ...prev, [currentQuestionId]: index }));

    setLoadingAnswer(true);
    try {
      await submitAnswerApi(attemptId, currentQuestionId, index);
    } catch (err) {
      console.error("Submit answer error:", err);
      setAnswerOverrides((prev) => {
        const next = { ...prev };
        delete next[currentQuestionId];
        return next;
      });
      void fetchState(true);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleClearAnswer = async () => {
    if (!attemptId || !currentQuestionId || !currentBooklet) return;
    if (currentBooklet.status !== "active") return;
    if (loadingAnswer) return;

    const previousAnswer =
      answerOverrides[currentQuestionId] ??
      currentQuestion?.selectedAnswer ??
      null;

    setAnswerOverrides((prev) => {
      const next = { ...prev };
      delete next[currentQuestionId];
      return next;
    });

    setLoadingAnswer(true);
    try {
      await submitAnswerApi(attemptId, currentQuestionId, null);
    } catch (err) {
      console.error("Clear answer error:", err);
      if (previousAnswer !== null) {
        setAnswerOverrides((prev) => ({
          ...prev,
          [currentQuestionId]: previousAnswer,
        }));
      }
      void fetchState(true);
    } finally {
      setLoadingAnswer(false);
    }
  };

  const handleToggleFlag = async () => {
    if (!attemptId || !currentQuestionId) return;

    const currentFlag =
      flagOverrides[currentQuestionId] ?? currentQuestion?.isFlagged ?? false;
    setFlagOverrides((prev) => ({
      ...prev,
      [currentQuestionId]: !currentFlag,
    }));

    try {
      await toggleFlagApi(attemptId, currentQuestionId);
    } catch (err) {
      console.error("Toggle flag error:", err);
      setFlagOverrides((prev) => ({
        ...prev,
        [currentQuestionId]: currentFlag,
      }));
    }
  };

  const handleSubmitAttempt = async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    try {
      await submitAttemptApi(attemptId);
      localStorage.removeItem(STORAGE_KEY(attemptId));
      navigate(`/attempts/${attemptId}/result`);
    } catch (err) {
      console.error("Submit attempt error:", err);
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // ==================== 🆕 دسترسی نداشتن ====================
  if (accessDenied) {
    return <LockedFeature feature="exams" />;
  }

  // ==================== Loading / Error ====================
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
            در حال دریافت آزمون...
          </p>
        </div>
      </main>
    );
  }

  if (error || !state) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-rose-500 mb-3" />
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
            {error || "آزمون پیدا نشد"}
          </p>
        </div>
      </main>
    );
  }

  // ==================== حالت resting ====================
  if (state.restingBookletId && state.restSecondsRemaining != null) {
    const currentRestingBooklet = state.booklets.find(
      (b) => b.id === state.restingBookletId,
    );
    const nextBooklet = state.booklets.find(
      (b) => b.order === (currentRestingBooklet?.order ?? 0) + 1,
    );

    return (
      <main className="min-h-screen px-4 py-8 sm:px-6">
        {user && (
          <SecurityWatermark
            text={`${user.firstName} ${user.lastName} · ${user.phoneNumber ?? user.username}`}
          />
        )}

        <div className="mx-auto max-w-5xl">
          <AttemptHero
            examTitle={state.exam.title}
            bookletTitle={currentRestingBooklet?.title ?? ""}
            bookletOrder={currentRestingBooklet?.order ?? 0}
            totalBooklets={state.booklets.length}
            lesson={currentRestingBooklet?.lesson ?? ""}
            secondsRemaining={0}
            isResting
          />
        </div>
        <RestOverlay
          nextBookletTitle={nextBooklet?.title ?? "دفترچه بعدی"}
          initialSeconds={state.restSecondsRemaining}
        />
      </main>
    );
  }

  // ==================== حالت عادی ====================
  if (!currentBooklet || !currentQuestion) {
    if (state.status === "started") {
      // eslint-disable-next-line react-hooks/refs
      setTimeout(() => void fetchState(true), 500);
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
              در حال اتمام آزمون...
            </p>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            سوالی برای نمایش وجود ندارد.
          </p>
        </div>
      </main>
    );
  }

  const questions = currentBooklet.questions;
  const questionIds = questions.map((q) => q.id);

  const mergedAnswers: Record<string, number | null> = {};
  const mergedFlags: Record<string, boolean> = {};
  for (const q of questions) {
    mergedAnswers[q.id] = answerOverrides[q.id] ?? q.selectedAnswer;
    mergedFlags[q.id] = flagOverrides[q.id] ?? q.isFlagged;
  }

  const answeredCount = questions.filter(
    (q) => mergedAnswers[q.id] !== null && mergedAnswers[q.id] !== undefined,
  ).length;
  const flaggedCount = questions.filter((q) => mergedFlags[q.id]).length;

  const unansweredNumbers = questions
    .map((q, i) => ({ q, i }))
    .filter(
      ({ q }) =>
        mergedAnswers[q.id] === null || mergedAnswers[q.id] === undefined,
    )
    .map(({ i }) => i + 1);

  const flaggedNumbers = questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => mergedFlags[q.id])
    .map(({ i }) => i + 1);

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isLastBooklet = currentBooklet.order === state.booklets.length;

  const selectedAnswer = mergedAnswers[currentQuestionId!] ?? null;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6">
      {user && (
        <SecurityWatermark
          text={`${user.firstName} ${user.lastName} · ${user.phoneNumber ?? user.username}`}
        />
      )}

      <div className="mx-auto max-w-5xl space-y-5">
        <AttemptHero
          examTitle={state.exam.title}
          bookletTitle={currentBooklet.title}
          bookletOrder={currentBooklet.order}
          totalBooklets={state.booklets.length}
          lesson={currentBooklet.lesson}
          secondsRemaining={timerSeconds}
          isResting={false}
        />

        <BookletProgress
          totalQuestions={questions.length}
          answeredCount={answeredCount}
          flaggedCount={flaggedCount}
        />

        <div className="select-none">
          <QuestionCard
            number={currentQuestionIndex + 1}
            total={questions.length}
            questionText={currentQuestion.questionText}
            questionImage={currentQuestion.questionImage}
            options={currentQuestion.options}
            selectedAnswer={selectedAnswer}
            isFlagged={mergedFlags[currentQuestionId!]}
            difficulty={currentQuestion.difficulty}
            loadingAnswer={loadingAnswer}
            onSelectAnswer={handleSelectAnswer}
            onClearAnswer={handleClearAnswer}
            onToggleFlag={handleToggleFlag}
          />
        </div>

        <NavigationGrid
          total={questions.length}
          currentIndex={currentQuestionIndex}
          answers={mergedAnswers}
          flags={mergedFlags}
          questionIds={questionIds}
          onSelect={setCurrentQuestionIndex}
        />

        {isLastQuestion && isLastBooklet && (
          <section className="rounded-2xl border border-[var(--griffin-gold)]/30 bg-gradient-to-br from-[var(--griffin-gold)]/10 via-transparent to-purple-600/10 backdrop-blur-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--griffin-gold)] mb-1">
                  پایان آزمون
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-7">
                  آخرین دفترچه و آخرین سوال هستی. اگه آماده‌ای، آزمون رو تموم
                  کن.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-[var(--griffin-gold)]/40 hover:shadow-xl hover:shadow-[var(--griffin-gold)]/60 hover:-translate-y-0.5 transition-all overflow-hidden shrink-0"
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
      </div>

      {showSubmitModal && (
        <ConfirmSubmitModal
          totalQuestions={questions.length}
          answeredCount={answeredCount}
          unansweredQuestions={unansweredNumbers}
          flaggedQuestions={flaggedNumbers}
          submitting={submitting}
          onConfirm={handleSubmitAttempt}
          onClose={() => setShowSubmitModal(false)}
        />
      )}

      {showExitModal && (
        <ExitWarningModal
          onConfirm={() => {
            localStorage.removeItem(STORAGE_KEY(attemptId!));
            navigate(-1);
          }}
          onClose={() => setShowExitModal(false)}
        />
      )}
    </main>
  );
};

export default Attempt;