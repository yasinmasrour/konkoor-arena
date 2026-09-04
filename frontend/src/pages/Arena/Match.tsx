import { useEffect, useRef, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
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
import RoundProgress from "./components/RoundProgress";
import MatchTransition from "./components/MatchTransition";
import OpponentConnectionBanner from "./components/OpponentConnectionBanner";
import NetworkStatus, { type NetworkQuality } from "./components/NetworkStatus";
import ArenaStickerPanel from "./components/ArenaStickerPanel";
import { type ArenaSticker } from "./components/arenaStickerConstants";
import ArenaStickerOverlay, { type ArenaStickerEvent } from "./components/ArenaStickerOverlay";

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
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>("unknown");
  const [opponentNetwork, setOpponentNetwork] = useState<{ latencyMs: number | null; quality: NetworkQuality }>({ latencyMs: null, quality: "unknown" });
  const [stickerEvent, setStickerEvent] = useState<ArenaStickerEvent | null>(null);

  useEffect(() => {
    matchRef.current = match;
  }, [match]);

  useEffect(() => {
    if (!matchId) return;

    const loadMatch = async () => {
      try {
        const response = await api.get(`/arena/matches/${matchId}`);
        setMatch(response.data.match ?? response.data);
      } catch (requestError: unknown) {
        console.error("Failed to load match:", requestError);
        setError(requestError instanceof Error ? requestError.message : "اطلاعات مسابقه دریافت نشد.");
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;

    const joinMatch = () => {
      setReconnecting(false);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setTransitionRound(null);

      socket.emit("arena:join-match", matchId, (response: { success?: boolean; message?: string }) => {
        if (!response?.success) {
          console.error("Join match failed:", response);
        }
      });
    };

    const handleMatchState = (state: ArenaMatch) => {
      setReconnecting(false);
      setMatch(state);
    };

    const handleDisconnect = () => {
      setReconnecting(true);
    };

    const handleConnectError = () => {
      setReconnecting(true);
    };

    const handleNetworkQuality = (data: { userId: string; latencyMs: number; quality: NetworkQuality }) => {
      if (data.userId === user?.id) {
        setNetworkLatency(data.latencyMs);
        setNetworkQuality(data.quality);
        return;
      }

      setOpponentNetwork({ latencyMs: data.latencyMs, quality: data.quality });
    };

    const handlePlayerPresence = (data: { userId: string; online: boolean }) => {
      setMatch((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          players: previous.players.map((player) =>
            player.userId === data.userId ? { ...player, online: data.online } : player,
          ),
        };
      });
    };

    const handleMatchStarted = () => {
      setMatch((previous) => (previous ? { ...previous, status: "playing" } : previous));
    };

    const handleQuestionStarted = (question: MatchQuestion) => {
      const previousRound = matchRef.current?.currentQuestion?.order ?? 0;
      const nextRound = question.order;
      const shouldTransition = previousRound > 0 && nextRound > previousRound;

      if (shouldTransition) {
        setTransitionRound(nextRound);
        window.setTimeout(() => {
          setSelectedAnswer(null);
          setAnswerResult(null);
          setMatch((previous) =>
            previous
              ? { ...previous, status: "playing", currentQuestion: question }
              : previous,
          );
          setTransitionRound(null);
        }, 650);
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

            if (player.userId !== data.playerId && data.opponentLives !== null) {
              return { ...player, lives: data.opponentLives };
            }

            return player;
          }),
        };
      });

      if (data.match?.finished) {
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

  useEffect(() => {
    const question = match?.currentQuestion;

    if (!question?.startedAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const elapsed = (Date.now() - new Date(question.startedAt!).getTime()) / 1000;
      setTimeLeft(Math.max(0, Math.ceil(question.timeLimit - elapsed)));
    };

    updateTimer();
    const intervalId = window.setInterval(updateTimer, 250);

    return () => window.clearInterval(intervalId);
  }, [match?.currentQuestion, match?.currentQuestion?.matchQuestionId, match?.currentQuestion?.startedAt, match?.currentQuestion?.timeLimit]);

  const matchStatus = match?.status;

  useEffect(() => {
    if (!matchId || !matchStatus || matchStatus === "finished" || !socket.connected) return;

    let active = true;

    const measure = () => {
      const startedAt = performance.now();
      socket.emit("arena:network-ping", {}, (response: { success?: boolean }) => {
        if (!active || !response?.success) return;
        const latency = Math.max(0, Math.round(performance.now() - startedAt));
        const quality: NetworkQuality = latency <= 80 ? "good" : latency <= 180 ? "fair" : "poor";
        setNetworkLatency(latency);
        setNetworkQuality(quality);
        socket.emit("arena:network-quality", { matchId, latencyMs: latency });
      });
    };

    measure();
    const intervalId = window.setInterval(measure, 5000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [matchId, matchStatus]);

  const leaveMatch = () => {
    if (!matchId) return;

    const confirmed = window.confirm(
      "از صفحه نبرد خارج می‌شوی. خود Match روی سرور ادامه پیدا می‌کند و بعداً می‌توانی با ورود دوباره به آن همگام شوی. ادامه می‌دهی؟",
    );

    if (!confirmed) return;

    socket.emit("arena:leave-match", matchId, (response: { success?: boolean; message?: string }) => {
      if (!response?.success) {
        console.error("Leave match failed:", response);
      }
      navigate("/arena");
    });
  };

  const startMatch = () => {
    if (!matchId) return;
    socket.emit("arena:start-match", matchId, (response: { success?: boolean; message?: string }) => {
      if (!response?.success) console.error("Start match failed:", response);
    });
  };

  const sendSticker = (sticker: ArenaSticker) => {
    if (!matchId || finished || !socket.connected) return;

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
    if (!matchId || !match?.currentQuestion || selectedAnswer !== null || timeLeft <= 0) return;

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

  if (loading) {
    return <main className="arena-battle min-h-[calc(100vh-80px)] p-6"><div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center"><div className="rounded-3xl border border-slate-200 bg-white/80 px-8 py-6 text-center shadow-xl dark:border-white/10 dark:bg-white/[0.04]">در حال ورود به میدان نبرد...</div></div></main>;
  }

  if (error) {
    return <main className="arena-battle min-h-[calc(100vh-80px)] p-6"><div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center"><div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 px-8 py-6 text-center text-rose-600 dark:text-rose-400">{error}</div></div></main>;
  }

  if (!match) {
    return <main className="arena-battle min-h-[calc(100vh-80px)] p-6"><div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">مسابقه پیدا نشد.</div></main>;
  }

  const question = match.currentQuestion;
  const waiting = match.status === "waiting";
  const finished = match.status === "finished";
  const answered = selectedAnswer !== null;

  return (
    <main className="arena-battle relative min-h-[calc(100vh-80px)] overflow-hidden px-3 py-5 sm:px-5 md:py-8">
      <ArenaStickerOverlay event={stickerEvent} currentUserId={user?.id} onDone={() => setStickerEvent(null)} />
      <div className="arena-orb arena-orb-one" />
      <div className="arena-orb arena-orb-two" />
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-3 px-1">
          <div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[var(--griffin-gold)] shadow-[0_0_12px_var(--griffin-gold)]" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--griffin-gold)]">GRIFFIN ARENA</span></div>
            <h1 className="mt-1 text-xl font-black md:text-2xl">Battle Arena</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/65 px-3 py-1.5 text-[10px] font-bold text-slate-500 backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
              {socket.connected && !reconnecting ? <Wifi className="h-3.5 w-3.5 text-emerald-500" /> : <WifiOff className="h-3.5 w-3.5 text-rose-500" />}
              {socket.connected && !reconnecting ? "اتصال پایدار" : "در حال اتصال مجدد"}
            </div>
            {!finished && (
              <button
                type="button"
                onClick={leaveMatch}
                className="rounded-full border border-slate-200/80 bg-white/65 px-3 py-1.5 text-[10px] font-black text-slate-600 backdrop-blur-md transition hover:border-rose-300 hover:text-rose-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-rose-400/40 dark:hover:text-rose-300"
              >
                خروج از نبرد
              </button>
            )}
          </div>
        </div>

        <MatchHeader players={match.players ?? []} currentUserId={user?.id} />

        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <NetworkStatus latencyMs={networkLatency} quality={networkQuality} label="اتصال شما" />
          {match.players.some((player) => player.userId !== user?.id && player.online) && (
            <NetworkStatus latencyMs={opponentNetwork.latencyMs} quality={opponentNetwork.quality} label="اتصال حریف" />
          )}
        </div>

        {reconnecting && (
          <div className="mb-4 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-center text-xs font-bold text-amber-700 dark:text-amber-300">
            اتصال لحظه‌ای قطع شد؛ در حال اتصال مجدد و همگام‌سازی وضعیت نبرد...
          </div>
        )}

        {waiting && (
          <section className="arena-panel relative overflow-hidden rounded-[30px] p-8 text-center md:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--griffin-gold)]/10 text-3xl font-black text-[var(--griffin-gold)]">VS</div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-[var(--griffin-gold)]">MATCH READY</p>
            <h2 className="mt-2 text-3xl font-black">حریف آماده است</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">پنج سؤال، سه Life و یک برنده. وقتی آماده‌ای وارد نبرد شو.</p>
            <button type="button" onClick={startMatch} className="mt-7 rounded-2xl bg-[var(--griffin-gold)] px-10 py-3.5 font-black text-white shadow-[0_12px_35px_rgba(197,139,42,0.25)] transition hover:-translate-y-0.5 hover:brightness-105">شروع نبرد</button>
          </section>
        )}

        {question && !finished && (
          <section className="relative">
            <div className="mb-3 flex justify-end">
              <ArenaStickerPanel disabled={finished || !socket.connected || reconnecting} onSend={sendSticker} />
            </div>
            <OpponentConnectionBanner
              online={match.players.find((player) => player.userId !== user?.id)?.online ?? true}
              timeLeft={timeLeft}
              hasOpponent={match.players.some((player) => player.userId !== user?.id)}
            />
            <RoundProgress current={question.order} total={5} />
            <div className="my-5 flex items-center justify-center">
              <MatchTimer timeLeft={timeLeft} timeLimit={question.timeLimit} />
            </div>
            <div className="relative">
              <div key={question.matchQuestionId} className="arena-question-enter">
                <QuestionCard order={question.order} total={5} questionText={question.question.questionText} questionImage={question.question.questionImage} />
                <AnswerOptions
                  options={question.question.options}
                  selectedAnswer={selectedAnswer}
                  disabled={answered || timeLeft <= 0}
                  onSelect={submitAnswer}
                  answerResult={answerResult?.playerId === user?.id ? (answerResult?.result === "correct" ? "correct" : answerResult?.result === "wrong" ? "wrong" : null) : null}
                />
                {answerResult && answerResult.playerId === user?.id && (
                  <RoundFeedback
                    isCorrect={answerResult.isCorrect}
                    result={answerResult.result}
                    questionFinished={answerResult.questionFinished}
                  />
                )}
              </div>
              {transitionRound !== null && <MatchTransition round={transitionRound} />}
            </div>
          </section>
        )}

        {finished && <MatchResult matchId={match.id} winnerId={match.winnerId} currentUserId={user?.id} />}
      </div>
    </main>
  );
};

export default Match;
