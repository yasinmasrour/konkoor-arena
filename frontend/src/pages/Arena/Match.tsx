import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { socket } from "../../socket/socket";

interface MatchQuestion {
  matchQuestionId: string;
  questionId: string;
  order: number;
  timeLimit: number;
  startedAt: string | null;
  question: {
    id: string;
    questionText: string;
    questionImage?: string | null;
    options: string[];
  };
}

interface ArenaMatch {
  id: string;
  leagueId: string;
  status: string;
  startedAt: string | null;
  players: {
    userId: string;
    lives: number;
  }[];
  currentQuestion: MatchQuestion | null;
}

interface AnswerResult {
  correct: boolean;
  selectedAnswer: number;
  correctAnswer?: number;
}

const Match = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  const [match, setMatch] = useState<ArenaMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);

  /*
   * دریافت اطلاعات اولیه Match
   */
  useEffect(() => {
    if (!matchId) return;

    const loadMatch = async () => {
      try {
        const response = await api.get(`/arena/matches/${matchId}`);

        setMatch(response.data);
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

    const handleAnswerResult = (data: {
      playerId: string;
      result: AnswerResult;
    }) => {
      console.log("Answer result:", data);

      setAnswerResult(data.result);
    };

    const handleMatchFinished = (data: any) => {
      console.log("Match finished:", data);

      setMatch((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          status: "finished",
        };
      });
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
            <p>User: {player.userId}</p>
            <p>Lives: {player.lives}</p>
          </div>
        ))}
      </div>

      {match.status === "waiting" && (
        <button onClick={startMatch}>شروع مسابقه</button>
      )}

      {match.currentQuestion && (
        <div>
          <h2>{match.currentQuestion.question.questionText}</h2>

          {match.currentQuestion.question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;

            return (
              <button
                key={index}
                onClick={() => submitAnswer(index)}
                disabled={selectedAnswer !== null}
              >
                {String.fromCharCode(65 + index)}. {option}
                {isSelected && " ← انتخاب شد"}
              </button>
            );
          })}

          {answerResult && (
            <div>
              {answerResult.correct ? "پاسخ صحیح بود." : "پاسخ اشتباه بود."}
            </div>
          )}
        </div>
      )}

      {match.status === "finished" && (
        <div>
          <h2>مسابقه تمام شد.</h2>

          <button onClick={() => navigate("/arena")}>بازگشت به Arena</button>
        </div>
      )}
    </div>
  );
};

export default Match;
