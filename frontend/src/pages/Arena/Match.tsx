import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { socket } from "../../socket/socket";
import { useAuth } from "../../context/AuthContext";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  /*
   * دریافت اطلاعات اولیه Match
   */
  useEffect(() => {
    if (!matchId) return;

    const loadMatch = async () => {
      try {
        const response = await api.get(`/arena/matches/${matchId}`);

        setMatch(response.data.match ?? response.data);
      } catch (error: any) {
        console.error("Failed to load match:", error);

        setError(error.response?.data?.message || "اطلاعات مسابقه دریافت نشد.");
      } finally {
        setLoading(false);
      }
    };

    loadMatch();
  }, [matchId]);

  /*
   * Socket
   */
  useEffect(() => {
    if (!matchId) return;

    const handleConnect = () => {
      console.log("Joining match room:", matchId);

      socket.emit("arena:join-match", matchId, (response: any) => {
        console.log("Join match response:", response);
      });
    };

    const handleMatchState = (state: ArenaMatch) => {
      console.log("Match state:", state);

      setMatch((previous) => {
        if (!previous) {
          return state;
        }

        return {
          ...previous,
          ...state,
        };
      });
    };

    const handleMatchStarted = (data: any) => {
      console.log("Match started:", data);

      setMatch((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          status: "playing",
        };
      });
    };

    const handleQuestionStarted = (question: any) => {
      console.log("Question started FULL OBJECT:", question);
      console.log("Question ID:", question?.id);
      console.log("Question matchQuestionId:", question?.matchQuestionId);
      console.log("Question questionId:", question?.questionId);

      setSelectedAnswer(null);
      setAnswerResult(null);

      setMatch((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          status: "playing",
          currentQuestion: question,
        };
      });
    };

    const handleAnswerResult = (data: AnswerResult) => {
      console.log("Answer result:", data);

      setAnswerResult(data);
    };

    const handleMatchFinished = (data: any) => {
      console.log("Match finished:", data);

      setMatch((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          status: "finished",
          winnerId: data.winnerId ?? null,
          finishedAt: new Date().toISOString(),
          currentQuestion: null,
        };
      });

      setSelectedAnswer(null);
    };

    socket.on("connect", handleConnect);
    socket.on("arena:match-state", handleMatchState);
    socket.on("arena:match-started", handleMatchStarted);
    socket.on("arena:question-started", handleQuestionStarted);
    socket.on("arena:answer-result", handleAnswerResult);
    socket.on("arena:match-finished", handleMatchFinished);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("arena:match-state", handleMatchState);
      socket.off("arena:match-started", handleMatchStarted);
      socket.off("arena:question-started", handleQuestionStarted);
      socket.off("arena:answer-result", handleAnswerResult);
      socket.off("arena:match-finished", handleMatchFinished);
    };
  }, [matchId]);

  /*
   * Question timer
   */
  useEffect(() => {
    const question = match?.currentQuestion;

    if (!question?.startedAt) {
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
  }, [match?.currentQuestion?.matchQuestionId, match?.currentQuestion?.startedAt, match?.currentQuestion?.timeLimit]);

  /*
   * شروع مسابقه
   */
  const startMatch = () => {
    if (!matchId) return;

    socket.emit("arena:start-match", matchId, (response: any) => {
      console.log("Start match response:", response);
    });
  };

  /*
   * ارسال پاسخ
   */
  const submitAnswer = (answerIndex: number) => {
    if (!matchId) return;
    if (!match?.currentQuestion) return;

    // جلوگیری از پاسخ دوباره
    if (selectedAnswer !== null) return;

    const matchQuestionId = match.currentQuestion.matchQuestionId;

    setSelectedAnswer(answerIndex);

    console.log("Submitting answer:", {
      matchId,
      matchQuestionId,
      selectedAnswer: answerIndex,
    });

    socket.emit(
      "arena:submit-answer",
      {
        matchId,
        matchQuestionId,
        selectedAnswer: answerIndex,
      },
      (response: any) => {
        console.log("Submit answer response:", response);

        if (!response?.success) {
          console.error("Submit answer failed:", response?.message);

          setSelectedAnswer(null);
        }
      },
    );
  };

  if (loading) {
    return <div>در حال دریافت اطلاعات مسابقه...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!match) {
    return <div>مسابقه پیدا نشد.</div>;
  }

  return (
    <div>
      <h1>Griffin Arena</h1>

      <p>Match ID: {match.id}</p>
      <p>Status: {match.status}</p>

      <div>
        <h2>Players</h2>

        {(match.players ?? []).map((player) => (
          <div key={player.userId}>
            <p>User: {player.firstName || player.lastName ? `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim() : player.userId}</p>
            <p>Lives: {player.lives}</p>
            {player.isWinner && <p>Winner</p>}
          </div>
        ))}
      </div>

      {match.status === "waiting" && (
        <button onClick={startMatch}>شروع مسابقه</button>
      )}

      {match.currentQuestion && (
        <div>
          <p>سؤال {match.currentQuestion.order} از ۵</p>
          <p>زمان باقی‌مانده: {timeLeft} ثانیه</p>

          <h2>{match.currentQuestion.question.questionText}</h2>

          {match.currentQuestion.question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;

            return (
              <button
                key={index}
                onClick={() => submitAnswer(index)}
                disabled={selectedAnswer !== null || timeLeft <= 0}
              >
                {String.fromCharCode(65 + index)}. {option}
                {isSelected && " ← انتخاب شد"}
              </button>
            );
          })}

          {answerResult && (
            <div>
              {answerResult.isCorrect ? "پاسخ صحیح بود." : "پاسخ اشتباه بود."}
            </div>
          )}
        </div>
      )}

      {match.status === "finished" && (
        <div>
          <h2>مسابقه تمام شد.</h2>

          <p>
            {match.winnerId
              ? match.winnerId === user?.id
                ? "تبریک! شما برنده شدید."
                : "این مسابقه را واگذار کردید."
              : "مسابقه مساوی شد."}
          </p>

          <button onClick={() => navigate("/arena")}>بازگشت به Arena</button>
        </div>
      )}
    </div>
  );
};

export default Match;
