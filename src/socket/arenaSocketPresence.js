const userSockets = new Map();
const socketMatches = new Map();

const addSocket = (userId, socketId) => {
  const sockets = userSockets.get(userId) ?? new Set();
  sockets.add(socketId);
  userSockets.set(userId, sockets);
};

const removeSocket = (userId, socketId) => {
  const sockets = userSockets.get(userId);
  if (!sockets) return;

  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(userId);
  }
};

const trackMatch = (socketId, matchId) => {
  const matches = socketMatches.get(socketId) ?? new Set();
  matches.add(matchId);
  socketMatches.set(socketId, matches);
};

const untrackMatch = (socketId, matchId) => {
  const matches = socketMatches.get(socketId);
  if (!matches) return;

  matches.delete(matchId);
  if (matches.size === 0) {
    socketMatches.delete(socketId);
  }
};

const getSocketMatches = (socketId) => {
  return [...(socketMatches.get(socketId) ?? [])];
};

const isUserInMatch = (userId, matchId) => {
  for (const [socketId, matches] of socketMatches.entries()) {
    if (!matches.has(matchId)) continue;

    const sockets = userSockets.get(userId);
    if (sockets?.has(socketId)) return true;
  }

  return false;
};

const isUserOnline = (userId) => (userSockets.get(userId)?.size ?? 0) > 0;

const removeSocketCompletely = (userId, socketId) => {
  const matches = getSocketMatches(socketId);
  socketMatches.delete(socketId);
  removeSocket(userId, socketId);
  return matches;
};

module.exports = {
  addSocket,
  removeSocket,
  trackMatch,
  untrackMatch,
  getSocketMatches,
  isUserInMatch,
  isUserOnline,
  removeSocketCompletely,
};
