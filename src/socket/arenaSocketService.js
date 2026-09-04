const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const arenaSocketConnectionState = require("./arenaSocketConnectionState");
const arenaSocketPresence = require("./arenaSocketPresence");

const getArenaRoomName = (matchId) => {
  return `arena:match:${matchId}`;
};

const joinMatchRoom = async (socket, matchId) => {
  const player = await prisma.arenaMatchPlayer.findUnique({
    where: {
      matchId_userId: {
        matchId,
        userId: socket.user.id,
      },
    },

    include: {
      match: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!player) {
    throw new AppError("You are not a player in this match", 403);
  }

  const roomName = getArenaRoomName(matchId);

  await socket.join(roomName);
  await socket.join(
    arenaSocketConnectionState.getPlayerMatchRoomName(matchId, socket.user.id),
  );

  arenaSocketPresence.trackMatch(socket.id, matchId);

  return {
    roomName,
    matchId,
    playerId: player.userId,
    matchStatus: player.match.status,
  };
};

const leaveMatchRoom = async (socket, matchId) => {
  const roomName = getArenaRoomName(matchId);
  const playerRoomName = arenaSocketConnectionState.getPlayerMatchRoomName(
    matchId,
    socket.user.id,
  );

  await socket.leave(roomName);
  await socket.leave(playerRoomName);
  arenaSocketPresence.untrackMatch(socket.id, matchId);

  return {
    roomName,
    matchId,
  };
};

const emitToPlayer = (userId, event, payload) => {
  const io = global.io;

  if (!io) {
    return false;
  }

  io.to(arenaSocketConnectionState.getPlayerRoomName(userId)).emit(
    event,
    payload,
  );

  return true;
};

const emitToMatchPlayer = (matchId, userId, event, payload) => {
  const io = global.io;

  if (!io) {
    return false;
  }

  io.to(
    arenaSocketConnectionState.getPlayerMatchRoomName(matchId, userId),
  ).emit(event, payload);

  return true;
};

module.exports = {
  getArenaRoomName,
  joinMatchRoom,
  leaveMatchRoom,
  emitToPlayer,
  emitToMatchPlayer,
};
