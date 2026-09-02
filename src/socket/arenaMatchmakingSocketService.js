const arenaSocketService = require("./arenaSocketService");

const notifyMatchFound = (match) => {
  if (!match || !match.players) {
    return;
  }

  const payload = {
    matchId: match.id,
    leagueId: match.leagueId,
  };

  for (const player of match.players) {
    arenaSocketService.emitToPlayer(
      player.userId,
      "arena:match-found",
      payload,
    );
  }
};

module.exports = {
  notifyMatchFound,
};
