import { useEffect, useRef, useState } from "react";
import { LogOut, Radio, Shield, Swords, Wifi, WifiOff } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { socket } from "../../socket/socket";
import { useAuth } from "../../context/AuthContext";
import MatchHeader from "./components/MatchHeader";
import QuestionCard from "./components/QuestionCard";
import AnswerOptions from "./components/AnswerOptions";
import MatchTimer from "./components/MatchTimer";
import RoundFeedback from "./components/RoundFeedback";
import MatchResult from "./components/MatchResult";
import OpponentConnectionBanner from "./components/OpponentConnectionBanner";
import { type NetworkQuality } from "./components/NetworkStatus";
import ArenaStickerPanel from "./components/ArenaStickerPanel";
import { type ArenaSticker } from "./components/arenaStickerConstants";
import ArenaStickerOverlay, {
  type ArenaStickerEvent,
} from "./components/ArenaStickerOverlay";
import MatchTransition from "./components/MatchTransition";
// 🆕 امنیت
import { useExamSecurity } from "../../hooks/useExamSecurity";
import SecurityWatermark from "../../components/security/SecurityWatermark";

// ==================== Timing Constants ====================
const FEEDBACK_DISPLAY_BEFORE_TRANSITION = 1400;
const TRANSITION_DISPLAY_DURATION = 1200;

// ==================== Types ====================
interface MatchQuestion {
  matchQuestionId: string;
  questionId: string;
  order: number;
  timeLimit: number;
  startedAt: string | null;
  remainingTime?: number | null;
  question: {
    id: string;
    questionText: string;
    questionImage?: string | null;
    options: string[];
  };
}

interface ArenaPlayer {
  userId: string;
  lives: number;
  status?: string;
  isWinner?: boolean;
  firstName?: string;
  lastName?: string;
  online?: boolean;
}

interface ArenaMatch {
  id: string;
  leagueId?: string;
  status: string;
  winnerId?: string | null;
  startedAt: string | null;
  finishedAt?: string | null;
  players: ArenaPlayer[];
  currentQuestion: MatchQuestion | null;
}

interface AnswerResult {
  playerId: string;
  result: "correct" | "wrong" | "timeout";
  isCorrect: boolean;
  selectedAnswer: number | null;
  responseTimeMs: number | null;
  questionFinished: boolean;
  playerLives: number | null;
  opponentLives: number | null;
  match: {
    finished: boolean;
    winnerId: string | null;
    isDraw: boolean;
  } | null;
}

const Match = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 🆕 امنیت آزمون
  useExamSecurity();

  const [match, setMatch] = useState<ArenaMatch | null>(null);
  const matchRef = useRef<ArenaMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [transitionRound, setTransitionRound] = useState<number | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);
  const [networkQuality, setNetworkQuality] =
    useState<NetworkQuality>("unknown");
  const [opponentNetwork, setOpponentNetwork] = useState<{
    latencyMs: number | null;
    quality: NetworkQuality;
  }>({ latencyMs: null, quality: "unknown" });
  const [stickerEvent, setStickerEvent] = useState<ArenaStickerEvent | null>(
    null,
  );

  // 🆕 Refs برای مدیریت timeout
  const feedbackTimeoutRef = useRef<number | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    matchRef.current = match;
  }, [match]);

  // ==================== Cleanup Timeouts ====================
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // ==================== Load match ====================
  useEffect(() => {
    if (!matchId) return;

    const loadMatch = async () => {
      try {
        const response = await api.get(`/arena/matches/${matchId}`);
        setMatch(response.data.match ?? response.data);
      } catch (requestError: unknown) {
        console.error("Failed to load match:", requestError);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "اطلاعات مسابقه دریافت نشد.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadMatch();
  }, [matchId]);

  // ==================== Socket handlers ====================
  useEffect(() => {
    if (!matchId) return;

    const clearAllTimeouts = () => {
      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };

    const joinMatch = () => {
      setReconnecting(false);
      clearAllTimeouts();
      setSelectedAnswer(null);
      setAnswerResult(null);
      setTransitionRound(null);

      socket.emit(
        "arena:join-match",
        matchId,
        (response: { success?: boolean; message?: string }) => {
          if (!response?.success) {
            console.error("Join match failed:", response);
          }
        },
      );
    };

    const handleMatchState = (state: ArenaMatch) => {
      setReconnecting(false);
      setMatch(state);
    };

    const handleDisconnect = () => setReconnecting(true);
    const handleConnectError = () => setReconnecting(true);

    const handleNetworkQuality = (data: {
      userId: string;
      latencyMs: number;
      quality: NetworkQuality;
    }) => {
      if (data.userId === user?.id) {
        setNetworkLatency(data.latencyMs);
        setNetworkQuality(data.quality);
        return;
      }
      setOpponentNetwork({ latencyMs: data.latencyMs, quality: data.quality });
    };

    const handlePlayerPresence = (data: {
      userId: string;
      online: boolean;
    }) => {
      setMatch((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          players: previous.players.map((player) =>
            player.userId === data.userId
              ? { ...player, online: data.online }
              : player,
          ),
        };
      });
    };

    const handleMatchStarted = () => {
      setMatch((previous) =>
        previous ? { ...previous, status: "playing" } : previous,
      );
    };

    const handleQuestionStarted = (question: MatchQuestion) => {
      const previousRound = matchRef.current?.currentQuestion?.order ?? 0;
      const nextRound = question.order;
      const shouldTransition = previousRound > 0 && nextRound > previousRound;

      clearAllTimeouts();

      if (shouldTransition) {
        feedbackTimeoutRef.current = window.setTimeout(() => {
          setTransitionRound(nextRound);

          transitionTimeoutRef.current = window.setTimeout(() => {
            setSelectedAnswer(null);
            setAnswerResult(null);
            setMatch((previous) =>
              previous
                ? {
                    ...previous,
                    status: "playing",
                    currentQuestion: question,
                  }
                : previous,
            );
            setTransitionRound(null);
          }, TRANSITION_DISPLAY_DURATION);
        }, FEEDBACK_DISPLAY_BEFORE_TRANSITION);
        return;
      }

      setSelectedAnswer(null);
      setAnswerResult(null);
      setMatch((previous) =>
        previous
          ? { ...previous, status: "playing", currentQuestion: question }
          : previous,
      );
    };

    const handleAnswerResult = (data: AnswerResult) => {
      setAnswerResult(data);

      setMatch((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          players: previous.players.map((player) => {
            if (player.userId === data.playerId && data.playerLives !== null) {
              return { ...player, lives: data.playerLives };
            }
            if (
              player.userId !== data.playerId &&
              data.opponentLives !== null
            ) {
              return { ...player, lives: data.opponentLives };
            }
            return player;
          }),
        };
      });

      if (data.match?.finished) {
        clearAllTimeouts();
        setMatch((previous) =>
          previous
            ? {
                ...previous,
                status: "finished",
                winnerId: data.match?.winnerId ?? null,
                finishedAt: new Date().toISOString(),
                currentQuestion: null,
              }
            : previous,
        );
      }
    };

    const handleSticker = (data: ArenaStickerEvent) => {
      if (data.matchId !== matchId) return;
      setStickerEvent(data);
    };

    const handleMatchFinished = (data: { winnerId?: string | null }) => {
      clearAllTimeouts();
      setMatch((previous) =>
        previous
          ? {
              ...previous,
              status: "finished",
              winnerId: data.winnerId ?? null,
              finishedAt: new Date().toISOString(),
              currentQuestion: null,
            }
          : previous,
      );
      setSelectedAnswer(null);
    };

    socket.on("connect", joinMatch);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("arena:match-state", handleMatchState);
    socket.on("arena:player-presence", handlePlayerPresence);
    socket.on("arena:network-quality", handleNetworkQuality);
    socket.on("arena:match-started", handleMatchStarted);
    socket.on("arena:question-started", handleQuestionStarted);
    socket.on("arena:answer-result", handleAnswerResult);
    socket.on("arena:match-finished", handleMatchFinished);
    socket.on("arena:sticker", handleSticker);

    if (socket.connected) joinMatch();

    return () => {
      if (socket.connected) {
        socket.emit("arena:leave-match", matchId);
      }

      clearAllTimeouts();

      socket.off("connect", joinMatch);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("arena:match-state", handleMatchState);
      socket.off("arena:player-presence", handlePlayerPresence);
      socket.off("arena:network-quality", handleNetworkQuality);
      socket.off("arena:match-started", handleMatchStarted);
      socket.off("arena:question-started", handleQuestionStarted);
      socket.off("arena:answer-result", handleAnswerResult);
      socket.off("arena:match-finished", handleMatchFinished);
      socket.off("arena:sticker", handleSticker);
    };
  }, [matchId, user?.id]);

  // ==================== Timer ====================
  useEffect(() => {
    const question = match?.currentQuestion;

    if (!question?.startedAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const elapsed =
        (Date.now() - new Date(question.startedAt!).getTime()) / 1000;
      setTimeLeft(Math.max(0, Math.ceil(question.timeLimit - elapsed)));
    };

    updateTimer();
    const intervalId = window.setInterval(updateTimer, 250);

    return () => window.clearInterval(intervalId);
  }, [
    match?.currentQuestion,
    match?.currentQuestion?.matchQuestionId,
    match?.currentQuestion?.startedAt,
    match?.currentQuestion?.timeLimit,
  ]);

  // ==================== Network ping ====================
  const matchStatus = match?.status;

  useEffect(() => {
    if (
      !matchId ||
      !matchStatus ||
      matchStatus === "finished" ||
      !socket.connected
    )
      return;

    let active = true;

    const measure = () => {
      const startedAt = performance.now();
      socket.emit(
        "arena:network-ping",
        {},
        (response: { success?: boolean }) => {
          if (!active || !response?.success) return;
          const latency = Math.max(
            0,
            Math.round(performance.now() - startedAt),
          );
          const quality: NetworkQuality =
            latency <= 80 ? "good" : latency <= 180 ? "fair" : "poor";
          setNetworkLatency(latency);
          setNetworkQuality(quality);
          socket.emit("arena:network-quality", { matchId, latencyMs: latency });
        },
      );
    };

    measure();
    const intervalId = window.setInterval(measure, 5000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [matchId, matchStatus]);

  // ==================== Actions ====================
  const leaveMatch = () => {
    if (!matchId) return;

    const confirmed = window.confirm(
      "از صفحه نبرد خارج می‌شوی. خود Match روی سرور ادامه پیدا می‌کند و بعداً می‌توانی با ورود دوباره به آن همگام شوی. ادامه می‌دهی؟",
    );

    if (!confirmed) return;

    socket.emit(
      "arena:leave-match",
      matchId,
      (response: { success?: boolean; message?: string }) => {
        if (!response?.success) {
          console.error("Leave match failed:", response);
        }
        navigate("/arena");
      },
    );
  };

  const startMatch = () => {
    if (!matchId) return;
    socket.emit(
      "arena:start-match",
      matchId,
      (response: { success?: boolean; message?: string }) => {
        if (!response?.success) console.error("Start match failed:", response);
      },
    );
  };

  const sendSticker = (sticker: ArenaSticker) => {
    if (!matchId || match?.status === "finished" || !socket.connected) return;

    socket.emit(
      "arena:send-sticker",
      { matchId, stickerId: sticker.id },
      (response: { success?: boolean; message?: string }) => {
        if (!response?.success) {
          console.error("Send sticker failed:", response);
        }
      },
    );
  };

  const submitAnswer = (answerIndex: number) => {
    if (
      !matchId ||
      !match?.currentQuestion ||
      selectedAnswer !== null ||
      timeLeft <= 0
    )
      return;

    const matchQuestionId = match.currentQuestion.matchQuestionId;
    setSelectedAnswer(answerIndex);

    socket.emit(
      "arena:submit-answer",
      { matchId, matchQuestionId, selectedAnswer: answerIndex },
      (response: { success?: boolean; message?: string }) => {
        if (!response?.success) {
          console.error("Submit answer failed:", response);
          setSelectedAnswer(null);
        }
      },
    );
  };

  // ==================== Loading ====================
  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center">
              <Swords size={28} className="text-white animate-pulse" />
            </div>
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
            در حال ورود به میدان نبرد...
          </p>
        </div>
      </main>
    );
  }

  // ==================== Error ====================
  if (error) {
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Shield size={28} className="text-red-500" />
          </div>
          <p className="font-bold text-red-500">{error}</p>
          <button
            onClick={() => navigate("/arena")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--griffin-gold)] text-white text-sm font-bold hover:opacity-90 transition"
          >
            بازگشت به Arena
          </button>
        </div>
      </main>
    );
  }

  // ==================== Not Found ====================
  if (!match) {
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
            <Swords size={28} className="text-red-500" />
          </div>
          <p className="font-bold text-red-500">مسابقه پیدا نشد.</p>
          <button
            onClick={() => navigate("/arena")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--griffin-gold)] text-white text-sm font-bold hover:opacity-90 transition"
          >
            بازگشت به Arena
          </button>
        </div>
      </main>
    );
  }

  // ==================== Computed Values ====================
  const question = match.currentQuestion;
  const waiting = match.status === "waiting";
  const finished = match.status === "finished";
  const answered = selectedAnswer !== null;
  const opponent = match.players.find((p) => p.userId !== user?.id);
  const isConnected = socket.connected && !reconnecting;

  // ==================== Main Render ====================
  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-br from-[#080B12] via-[#0a0d14] to-[#080B12] text-white">
      {/* پس‌زمینه تزئینی */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--griffin-gold)]/15 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px]" />
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

      {/* استیکر Overlay */}
      <ArenaStickerOverlay
        event={stickerEvent}
        currentUserId={user?.id}
        onDone={() => setStickerEvent(null)}
      />

      {/* ==================== HEADER ==================== */}
      <header className="relative z-10 shrink-0 border-b border-white/5 bg-[#0a0d14]/80 backdrop-blur-xl">
        <div className="px-3 py-2.5 sm:px-5 sm:py-3">
          {/* ردیف بالا */}
          <div className="flex items-center justify-between gap-3 mb-2.5">
            {/* === برند === */}
            <div className="flex items-center gap-2.5 min-w-0 shrink-0">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-lg opacity-50" />
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center text-white shadow-lg">
                  <Swords size={18} strokeWidth={2.4} />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_8px_var(--griffin-gold)] animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--griffin-gold)] truncate">
                    GRIFFIN ARENA
                  </span>
                </div>
                <h1 className="font-heading text-sm sm:text-base font-black text-white leading-tight truncate">
                  Battle Arena
                </h1>
              </div>
            </div>

            {/* === تایمر inline === */}
            {question && !finished && (
              <div className="shrink-0">
                <MatchTimer
                  timeLeft={timeLeft}
                  timeLimit={question.timeLimit}
                  variant="inline"
                />
              </div>
            )}

            {/* === اتصال + خروج === */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`
                  inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg
                  border text-[10px] font-black transition-all
                  ${
                    isConnected
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  }
                `}
              >
                {isConnected ? (
                  <>
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" />
                      <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <Wifi size={11} />
                    <span className="hidden sm:inline">اتصال پایدار</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={11} />
                    <span className="hidden sm:inline">در حال اتصال</span>
                  </>
                )}
              </div>

              {!finished && (
                <button
                  type="button"
                  onClick={leaveMatch}
                  className="group inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black text-gray-300 hover:border-rose-400/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <LogOut
                    size={11}
                    className="transition-transform group-hover:-translate-x-0.5"
                  />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              )}
            </div>
          </div>

          <MatchHeader players={match.players ?? []} currentUserId={user?.id} />
        </div>
      </header>

      {/* ==================== CONTENT ==================== */}
      <section className="relative z-10 flex-1 min-h-0 overflow-hidden">
        {/* ==================== Waiting ==================== */}
        {waiting && (
          <div className="h-full flex items-center justify-center p-4">
            <div className="relative max-w-md w-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-[var(--griffin-gold)]/15 via-transparent to-purple-600/15 backdrop-blur-xl border border-white/10 p-6 sm:p-8 text-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-64 h-64 rounded-full border-2 border-dashed border-[var(--griffin-gold)]/20 animate-spin"
                  style={{ animationDuration: "30s" }}
                />
              </div>

              <div className="relative space-y-5">
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-[var(--griffin-gold)] blur-3xl opacity-60 animate-pulse" />
                  <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--griffin-gold)] to-amber-700 flex items-center justify-center shadow-2xl shadow-[var(--griffin-gold)]/50 rotate-3">
                    <span className="font-heading text-2xl font-black text-white">
                      VS
                    </span>
                  </div>
                </div>

                <h2 className="font-heading text-2xl sm:text-3xl font-black">
                  حریف آماده است!
                </h2>
                <p className="text-sm text-gray-300">
                  ۵ سؤال · ۳ Life · یک برنده
                </p>

                <button
                  type="button"
                  onClick={startMatch}
                  className="group relative inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[var(--griffin-gold)] to-amber-500 px-8 py-3.5 font-heading font-black text-white shadow-2xl shadow-[var(--griffin-gold)]/50 hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Swords size={20} />
                    شروع نبرد
                  </span>
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== Question ==================== */}
        {question && !finished && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 gap-2 sm:gap-3 overflow-hidden">
              <div className="shrink-0">
                <OpponentConnectionBanner
                  online={opponent?.online ?? true}
                  timeLeft={timeLeft}
                  hasOpponent={match.players.some((p) => p.userId !== user?.id)}
                />
              </div>

              {/* 🆕 سؤال — با select-none */}
              <div className="flex-1 min-h-0 overflow-hidden select-none">
                <QuestionCard
                  order={question.order}
                  total={5}
                  questionText={question.question.questionText}
                  questionImage={question.question.questionImage}
                />
              </div>
            </div>

            <div className="relative shrink-0">
              {answerResult && answerResult.playerId === user?.id && (
                <div className="absolute -top-2 left-0 right-0 z-20 px-3 sm:px-4 -translate-y-full animate-[slideUp_0.3s_ease-out]">
                  <RoundFeedback
                    isCorrect={answerResult.isCorrect}
                    result={answerResult.result}
                    questionFinished={answerResult.questionFinished}
                  />
                </div>
              )}

              {/* 🆕 گزینه‌ها — با select-none */}
              <div
                key={question.matchQuestionId}
                className="h-[24vh] min-h-[160px] max-h-[220px] sm:h-[32vh] sm:min-h-[200px] sm:max-h-[280px] p-3 sm:p-4 pt-2 animate-[slideUpFromBottom_0.4s_ease-out] select-none"
              >
                <AnswerOptions
                  options={question.question.options}
                  selectedAnswer={selectedAnswer}
                  disabled={answered || timeLeft <= 0}
                  onSelect={submitAnswer}
                  answerResult={
                    answerResult?.playerId === user?.id
                      ? answerResult?.result === "correct"
                        ? "correct"
                        : answerResult?.result === "wrong"
                          ? "wrong"
                          : null
                      : null
                  }
                />
              </div>
            </div>

            {transitionRound !== null && (
              <MatchTransition round={transitionRound} />
            )}
          </div>
        )}

        {/* ==================== Finished ==================== */}
        {finished && (
          <div className="h-full overflow-y-auto bg-[#080B12] text-white">
            <div className="p-3 sm:p-4">
              <MatchResult
                matchId={match.id}
                winnerId={match.winnerId}
                currentUserId={user?.id}
              />
            </div>
          </div>
        )}
      </section>

      {/* ==================== استیکر پنل ==================== */}
      {!finished && question && (
        <div className="relative z-20 shrink-0">
          <ArenaStickerPanel
            disabled={!socket.connected || reconnecting}
            onSend={sendSticker}
          />
        </div>
      )}

      {/* ==================== Reconnecting Banner ==================== */}
      {reconnecting && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 backdrop-blur-md flex items-center gap-2 shadow-xl">
          <Radio size={14} className="text-amber-500 animate-pulse" />
          <p className="text-xs font-bold text-amber-400">
            در حال اتصال مجدد...
          </p>
        </div>
      )}
    </main>
  );
};

export default Match;
