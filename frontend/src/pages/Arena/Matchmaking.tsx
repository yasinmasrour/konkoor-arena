import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { joinArenaQueue, leaveArenaQueue } from "../../api/arenaApi";
import { socket } from "../../socket/socket";

const Matchmaking = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();

  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleMatchFound = (data: { matchId: string; leagueId: string }) => {
      console.log("Match found:", data);

      if (data.leagueId === leagueId) {
        navigate(`/arena/match/${data.matchId}`);
      }
    };

    socket.on("arena:match-found", handleMatchFound);

    return () => {
      socket.off("arena:match-found", handleMatchFound);
    };
  }, [leagueId, navigate]);

  const startMatchmaking = async () => {
    if (!leagueId) return;

    try {
      setError("");
      setSearching(true);

      const result = await joinArenaQueue(leagueId);

      console.log("Queue result:", result);

      if (result.matched && result.match) {
        navigate(`/arena/match/${result.match.id}`);
      }
    } catch (error: any) {
      console.error("Matchmaking error:", error);

      setSearching(false);

      setError(
        error.response?.data?.message || "خطایی در پیدا کردن حریف رخ داد.",
      );
    }
  };

  const cancelMatchmaking = async () => {
    if (!leagueId) return;

    try {
      await leaveArenaQueue(leagueId);
      setSearching(false);
    } catch (error) {
      console.error("Cancel matchmaking error:", error);
    }
  };

  return (
    <div>
      <h1>Matchmaking</h1>

      {error && <p>{error}</p>}

      {!searching ? (
        <button onClick={startMatchmaking}>شروع مسابقه</button>
      ) : (
        <div>
          <p>در حال پیدا کردن حریف...</p>

          <button onClick={cancelMatchmaking}>لغو جستجو</button>
        </div>
      )}
    </div>
  );
};

export default Matchmaking;
