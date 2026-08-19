const playerSockets = new Map();

const addPlayerSocket = (userId, socketId) => {
  playerSockets.set(userId, socketId);
};

const removePlayerSocket = (userId, socketId) => {
  const currentSocketId = playerSockets.get(userId);

  if (currentSocketId === socketId) {
    playerSockets.delete(userId);
  }
};

const getPlayerSocket = (userId) => {
  return playerSockets.get(userId) || null;
};

module.exports = {
  addPlayerSocket,
  removePlayerSocket,
  getPlayerSocket,
};
