import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Heart,
  LoaderCircle,
  Swords,
  Target,
  X,
  XCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  abandonSolo,
  answerSolo,
  getSoloStatus,
  LEVEL_LABELS,
  type AnswerSoloResponse,
  type CurrentSoloQuestion,
  type SoloInfo,
} from "../../api/soloApi";
import QuestionCard from "../Arena/components/QuestionCard";
import AnswerOptions from "../Arena/components/AnswerOptions";
import MatchTimer from "../Arena/components/MatchTimer";
import MathText from "../../components/questions/MathText";
// 🆕 امنیت
import { useExamSecurity } from "../../hooks/useExamSecurity";
import SecurityWatermark from "../../components/security/SecurityWatermark";
import { useAuth } from "../../context/AuthContext";

// ==================== Types ====================
type AnswerState = "idle" | "answered";

const SoloMatch = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // 🆕 امنیت آزمون
  useExamSecurity();

  const [solo, setSolo] = useState<SoloInfo | null>(null);
  const [currentQuestion, setCurrentQuestion] =
    useState<CurrentSoloQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 پاسخ
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [answerResult, setAnswerResult] = useState<
    AnswerSoloResponse["result"] | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  // 🔹 تایمر
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<number | null>(null);
  // eslint-disable-next-line react-hooks/purity
  const questionStartTimeRef = useRef<number>(Date.now());

  // 🆕 Refs برای جلوگیری از closure قدیمی
  const currentQuestionRef = useRef<CurrentSoloQuestion | null>(null);
  const soloRef = useRef<SoloInfo | null>(null);
  const submittingRef = useRef<boolean>(false);

  // 🔹 Modal انصراف
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [abandoning, setAbandoning] = useState(false);

  // ==================== Sync Refs ====================
  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  useEffect(() => {
    soloRef.current = solo;
  }, [solo]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  // ==================== Load ====================
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getSoloStatus(id);
        setSolo(result.solo);

        if (result.solo.status !== "playing") {
          navigate(`/solo/${id}/result`);
          return;
        }

        setCurrentQuestion(result.currentQuestion);

        if (result.currentQuestion) {
          // eslint-disable-next-line react-hooks/immutability
          startTimer(result.currentQuestion.timeLimit);
        }
      } catch (err) {
        console.error("Failed to load solo:", err);
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "دریافت بازی انجام نشد";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void load();

    return () => {
      // eslint-disable-next-line react-hooks/immutability
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ==================== Timer ====================
  const startTimer = (seconds: number) => {
    stopTimer();
    setTimeLeft(seconds);
    // eslint-disable-next-line react-hooks/purity
    questionStartTimeRef.current = Date.now();

    let remaining = seconds;

    timerRef.current = window.setInterval(() => {
      remaining -= 1;
      setTimeLeft(Math.max(0, remaining));

      if (remaining <= 0) {
        stopTimer();
        window.setTimeout(() => {
          void handleTimeout();
        }, 0);
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ==================== Timeout ====================
  const handleTimeout = async () => {
    const question = currentQuestionRef.current;
    const currentSolo = soloRef.current;

    if (!question || !currentSolo || submittingRef.current) return;

    setSubmitting(true);
    try {
      const timeSpent = question.timeLimit * 1000;
      const result = await answerSolo(currentSolo.id, {
        order: question.order,
        selectedAnswer: null,
        timeSpentMs: timeSpent,
      });

      setAnswerResult(result.result);
      setAnswerState("answered");

      setTimeout(() => {
        goToNext(result);
      }, 2500);
    } catch (err) {
      console.error("Failed to submit timeout:", err);
      setSubmitting(false);
    }
  };

  // ==================== Answer (مستقیم) ====================
  const handleSelectAnswer = async (index: number) => {
    const question = currentQuestionRef.current;
    const currentSolo = soloRef.current;

    if (!question || !currentSolo || answerState !== "idle" || submitting)
      return;

    setSelectedAnswer(index);
    setAnswerState("answered");
    stopTimer();
    setSubmitting(true);

    try {
      // eslint-disable-next-line react-hooks/purity
      const timeSpent = Date.now() - questionStartTimeRef.current;
      const result = await answerSolo(currentSolo.id, {
        order: question.order,
        selectedAnswer: index,
        timeSpentMs: timeSpent,
      });

      setAnswerResult(result.result);
      setSubmitting(false);

      setTimeout(() => {
        goToNext(result);
      }, 2500);
    } catch (err) {
      console.error("Failed to submit answer:", err);
      setSubmitting(false);
      setAnswerState("idle");
      setSelectedAnswer(null);
    }
  };

  // ==================== Next ====================
  const goToNext = (result: AnswerSoloResponse) => {
    const currentSolo = soloRef.current;
    if (!currentSolo) return;

    const updatedSolo = {
      ...currentSolo,
      correctAnswers: result.stats.correctAnswers,
      wrongAnswers: result.stats.wrongAnswers,
      timeouts: result.stats.timeouts,
      livesRemaining: result.stats.livesRemaining,
      answeredCount: result.stats.answeredCount,
      status: result.status,
    };
    setSolo(updatedSolo);

    if (result.status !== "playing") {
      navigate(`/solo/${currentSolo.id}/result`);
      return;
    }

    if (result.nextQuestion) {
      setCurrentQuestion(result.nextQuestion);
      setSelectedAnswer(null);
      setAnswerState("idle");
      setAnswerResult(null);
      setSubmitting(false);
      startTimer(result.nextQuestion.timeLimit);
    }
  };

  // ==================== Abandon ====================
  const handleAbandon = async () => {
    const currentSolo = soloRef.current;
    if (!currentSolo || abandoning) return;
    setAbandoning(true);
    try {
      await abandonSolo(currentSolo.id);
      navigate(`/solo/${currentSolo.id}/result`);
    } catch (err) {
      console.error("Failed to abandon:", err);
      setAbandoning(false);
    }
  };

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <Swords size={28} className="text-white animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500">
            در حال ورود به بازی انفرادی...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error || !solo) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center">
            <AlertCircle size={28} className="text-rose-500" />
          </div>
          <p className="font-bold text-rose-500">{error || "بازی پیدا نشد"}</p>
          <button
            onClick={() => navigate("/solo/setup")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white text-sm font-bold hover:opacity-90 transition"
          >
            بازگشت
          </button>
        </div>
      </main>
    );
  }

  // ==================== Computed ====================
  const question = currentQuestion;
  const answered = answerState === "answered";

  // ==================== Render ====================
  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
      {/* پس‌زمینه */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* 🆕 واترمارک امنیتی */}
      {user && (
        <SecurityWatermark
          text={`${user.firstName} ${user.lastName} · ${user.phoneNumber ?? user.username}`}
        />
      )}

      {/* ==================== HEADER ==================== */}
      <header className="relative z-10 shrink-0 border-b border-white/5 bg-[#0a0d14]/80 backdrop-blur-xl">
        <div className="px-3 py-2.5 sm:px-5 sm:py-3">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0 shrink-0">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-purple-500 blur-lg opacity-50" />
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-lg">
                  <Swords size={18} strokeWidth={2.4} />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400 truncate">
                    SOLO MODE
                  </span>
                </div>
                <h1 className="font-heading text-sm sm:text-base font-black text-white leading-tight truncate">
                  {LEVEL_LABELS[solo.level]} · {solo.league.title}
                </h1>
              </div>
            </div>

            {question && (
              <div className="shrink-0">
                <MatchTimer
                  timeLeft={timeLeft}
                  timeLimit={question.timeLimit}
                  variant="inline"
                />
              </div>
            )}

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowAbandonModal(true)}
                className="group inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black text-gray-300 hover:border-rose-400/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <X
                  size={11}
                  className="transition-transform group-hover:rotate-90"
                />
                <span className="hidden sm:inline">انصراف</span>
              </button>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
            <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white shadow-md shrink-0">
                  <Target size={15} strokeWidth={2.3} />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                    سوال
                  </p>
                  <p className="font-heading text-sm font-black text-white tabular-nums leading-tight">
                    {(solo.answeredCount + 1).toLocaleString("fa-IR")}
                    <span className="text-[10px] text-gray-500 mr-0.5">
                      /{solo.totalQuestions.toLocaleString("fa-IR")}
                    </span>
                  </p>
                </div>
              </div>

              <div className="relative flex items-center justify-center shrink-0">
                <div
                  className={`
                    relative flex h-9 w-9 items-center justify-center
                    rounded-full border-2
                    ${
                      solo.livesRemaining >= 2
                        ? "border-emerald-500/60 bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                        : solo.livesRemaining === 1
                          ? "border-amber-500/60 bg-gradient-to-br from-amber-500/20 to-amber-700/20 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                          : "border-rose-500/60 bg-gradient-to-br from-rose-500/20 to-rose-700/20 shadow-[0_0_20px_rgba(244,63,94,0.35)]"
                    }
                    transition-all duration-500
                  `}
                >
                  <Heart
                    size={16}
                    className={`
                      ${
                        solo.livesRemaining >= 2
                          ? "fill-emerald-500 text-emerald-500"
                          : solo.livesRemaining === 1
                            ? "fill-amber-500 text-amber-500"
                            : "fill-rose-500 text-rose-500"
                      }
                    `}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                    جان
                  </p>
                  <div className="flex items-center gap-0.5 mt-0.5 justify-end">
                    {[1, 2, 3].map((i) => (
                      <Heart
                        key={i}
                        size={12}
                        className={
                          i <= solo.livesRemaining
                            ? "fill-rose-500 text-rose-500 drop-shadow-[0_0_4px_rgba(244,63,94,0.6)]"
                            : "text-gray-600"
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== CONTENT ==================== */}
      <section className="relative z-10 flex-1 min-h-0 overflow-hidden">
        {question && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 gap-2 sm:gap-3 overflow-hidden">
              {/* سؤال — با select-none */}
              <div className="flex-1 min-h-0 overflow-hidden select-none">
                <QuestionCard
                  order={question.order}
                  total={solo.totalQuestions}
                  questionText={question.question.questionText}
                  questionImage={question.question.questionImage}
                />
              </div>
            </div>

            <div className="relative shrink-0">
              {answerResult && (
                <div className="absolute -top-2 left-0 right-0 z-20 px-3 sm:px-4 -translate-y-full animate-[slideUp_0.3s_ease-out]">
                  <SoloRoundFeedback
                    isCorrect={answerResult.isCorrect}
                    isTimeout={answerResult.isTimeout}
                    correctAnswer={answerResult.correctAnswer}
                    explanation={answerResult.explanation}
                  />
                </div>
              )}

              {/* گزینه‌ها — با select-none */}
              <div
                key={question.order}
                className="h-[24vh] min-h-[160px] max-h-[220px] sm:h-[32vh] sm:min-h-[200px] sm:max-h-[280px] p-3 sm:p-4 pt-2 animate-[slideUpFromBottom_0.4s_ease-out] select-none"
              >
                <AnswerOptions
                  options={question.question.options}
                  selectedAnswer={selectedAnswer}
                  disabled={answered || timeLeft <= 0 || submitting}
                  onSelect={(index) => void handleSelectAnswer(index)}
                  answerResult={
                    answerResult
                      ? answerResult.isCorrect
                        ? "correct"
                        : "wrong"
                      : null
                  }
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ==================== Modal انصراف ==================== */}
      {showAbandonModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => !abandoning && setShowAbandonModal(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-rose-500/30 bg-[#0a0d14] shadow-2xl animate-[fadeInUp_0.3s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

            <div className="p-6 text-center">
              <div className="inline-flex relative mb-4">
                <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-50" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white shadow-lg">
                  <AlertCircle size={24} />
                </div>
              </div>

              <h3 className="font-heading text-lg font-black text-white mb-2">
                انصراف از بازی؟
              </h3>
              <p className="text-sm text-gray-400 leading-7">
                اگه انصراف بدی، این بازی به‌عنوان{" "}
                <strong className="text-rose-400">باخت</strong> ثبت می‌شه.
              </p>
            </div>

            <div className="p-4 border-t border-white/5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAbandonModal(false)}
                disabled={abandoning}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs font-black text-gray-400 hover:border-white/20 hover:text-white disabled:opacity-40 transition-colors"
              >
                ادامه بازی
              </button>
              <button
                type="button"
                onClick={() => void handleAbandon()}
                disabled={abandoning}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-rose-500 to-rose-700 px-4 py-3 font-heading font-black text-white text-xs shadow-lg shadow-rose-500/40 hover:shadow-xl disabled:opacity-40 transition-all"
              >
                {abandoning ? (
                  <>
                    <LoaderCircle size={13} className="animate-spin" />
                    در حال انصراف...
                  </>
                ) : (
                  <>
                    <X size={13} />
                    انصراف
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

// ==================== SoloRoundFeedback ====================
interface SoloRoundFeedbackProps {
  isCorrect: boolean;
  isTimeout: boolean;
  correctAnswer: number;
  explanation: string;
}

const SoloRoundFeedback = ({
  isCorrect,
  isTimeout,
  correctAnswer,
  explanation,
}: SoloRoundFeedbackProps) => {
  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden border-2
        animate-[slideUp_0.3s_ease-out]
        ${
          isCorrect
            ? "border-emerald-500/60 bg-emerald-500/15"
            : "border-rose-500/60 bg-rose-500/15"
        }
      `}
    >
      <div className="flex items-center gap-3 p-3">
        <div
          className={`
            w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${
              isCorrect
                ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                : "bg-gradient-to-br from-rose-500 to-rose-700"
            }
            text-white shadow-lg
          `}
        >
          {isCorrect ? (
            <CheckCircle2 size={20} strokeWidth={2.5} />
          ) : (
            <XCircle size={20} strokeWidth={2.5} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`
              font-heading text-sm font-black
              ${isCorrect ? "text-emerald-300" : "text-rose-300"}
            `}
          >
            {isCorrect ? "درست!" : isTimeout ? "زمان تموم شد!" : "اشتباه بود"}
          </p>
          {!isCorrect && (
            <p className="text-[10px] text-white/70 mt-0.5">
              پاسخ درست: گزینه {(correctAnswer + 1).toLocaleString("fa-IR")}
            </p>
          )}
          {/* 🆕 توضیحات با MathText */}
          {explanation && (
            <div className="text-[10px] text-white/60 mt-0.5 line-clamp-1">
              <MathText content={explanation} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SoloMatch;
