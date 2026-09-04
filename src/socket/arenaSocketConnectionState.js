// Socket.IO user rooms are the source of truth for player connections.
// This module is kept as a compatibility shim for older imports.

const getPlayerRoomName = (userId) => {
  return `arena:user:${userId}`;
};

const getPlayerMatchRoomName = (matchId, userId) => {
  return `arena:match:${matchId}:player:${userId}`;
};

module.exports = {
  getPlayerRoomName,
  getPlayerMatchRoomName,
};
